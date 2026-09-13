import { Client, handle_file } from "@gradio/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_RESULT_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const DEFAULT_SPACE_ID = "StackPilotMAX/bg-remover-api";
const DEFAULT_API_NAME = "/remove_background";

/** Parameter names commonly used by rembg Gradio Spaces for the input image. */
const INPUT_IMAGE_KEYS = ["image", "input_image", "file", "input", "img", "image_input"] as const;
/** Common rembg component mode/alpha-matting parameter names; we keep defaults if absent. */
const BOOLEAN_DEFAULTS: Record<string, boolean> = {
  return_mask: false,
  alpha_matting: false,
  putalpha: true,
  only_mask: false,
};

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function hasValidSignature(bytes: Uint8Array, type: string) {
  if (type === "image/png") {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/webp") {
    return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

async function fetchWithTimeout(url: string, timeoutMs = 45_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

type EndpointParams = Record<string, unknown>;

function buildPayload(endpoint: { parameters?: Array<{ parameter_name: string; parameter_has_default?: boolean; parameter_default?: unknown; type?: { type?: string } }> }, blob: Blob): EndpointParams {
  const params = endpoint.parameters || [];
  const payload: EndpointParams = {};

  // Find the image-file parameter (first file-type param, else first known image key, else first param).
  const fileParam = params.find((p) => p.type?.type === "file") ||
    params.find((p) => INPUT_IMAGE_KEYS.includes(p.parameter_name as typeof INPUT_IMAGE_KEYS[number]));

  let imageKey = fileParam?.parameter_name || "image";
  payload[imageKey] = handle_file(blob);

  // Fill in boolean/default params so we don't omit required Gradio inputs.
  for (const p of params) {
    if (p.parameter_name === imageKey) continue;
    if (p.parameter_name in BOOLEAN_DEFAULTS) {
      payload[p.parameter_name] = BOOLEAN_DEFAULTS[p.parameter_name];
    } else if (p.parameter_has_default) {
      payload[p.parameter_name] = p.parameter_default ?? null;
    } else {
      payload[p.parameter_name] = null;
    }
  }
  return payload;
}

function extractOutputUrl(data: unknown): string | null {
  // Gradio can return a single file, a file dict, or an array of them. Walk the result
  // recursively to find the first http(s) URL or {url,path} dict.
  if (typeof data === "string" && /^https?:\/\//i.test(data)) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.url === "string" && /^https?:\/\//i.test(record.url)) return record.url;
    if (typeof record.path === "string" && /^https?:\/\//i.test(record.path)) return record.path;
    // gradio sometimes returns {image: {url:...}} wrapper
    for (const key of ["image", "output", "result", "file"]) {
      if (key in record) {
        const nested = extractOutputUrl(record[key]);
        if (nested) return nested;
      }
    }
    if (Array.isArray(record.data)) {
      for (const item of record.data) {
        const nested = extractOutputUrl(item);
        if (nested) return nested;
      }
    }
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      const nested = extractOutputUrl(item);
      if (nested) return nested;
    }
  }
  return null;
}

export async function POST(request: Request) {
  const token = process.env.HF_TOKEN;
  const spaceId = process.env.HF_SPACE_ID || DEFAULT_SPACE_ID;
  const apiName = process.env.HF_API_NAME || DEFAULT_API_NAME;

  if (!token) return errorResponse("Background removal service is not configured.", 503);
  if (!spaceId) return errorResponse("Background removal Space is not configured.", 503);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return errorResponse("The selected image is too large. Maximum size is 12 MB.", 413);
  }

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof File)) return errorResponse("Please upload an image.", 400);
  if (!ALLOWED_TYPES.has(image.type)) return errorResponse("Only PNG, JPEG, and WebP images are supported.", 415);
  if (image.size < 1 || image.size > MAX_UPLOAD_BYTES) return errorResponse("The selected image is too large. Maximum size is 12 MB.", 413);

  let imageBuffer: ArrayBuffer | null = null;
  try {
    imageBuffer = await image.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    if (!hasValidSignature(imageBytes, image.type)) {
      return errorResponse("The uploaded file does not match its declared image type.", 415);
    }

    const hfClient = await Client.connect(spaceId, {
      token,
      hf_token: token,
    });
    const apiInfo = await hfClient.view_api();
    const endpoint = apiInfo.named_endpoints?.[apiName];
    if (!endpoint) {
      const available = Object.keys(apiInfo.named_endpoints || {}).join(", ") || "(none)";
      console.error(`FlytheBG: Space ${spaceId} does not expose endpoint ${apiName}. Available: ${available}`);
      return errorResponse(`The background removal Space is not exposing the expected "${apiName}" endpoint.`, 502);
    }

    const input = new Blob([imageBuffer], { type: image.type });
    const payload = buildPayload(endpoint, input);
    const result = await hfClient.predict(apiName, payload);

    const outputUrl = extractOutputUrl(result.data);
    if (!outputUrl) {
      console.error("FlytheBG: unexpected HF response shape", JSON.stringify(result.data).slice(0, 500));
      return errorResponse("The background-removal service returned no downloadable image URL.", 502);
    }

    const outputResponse = await fetchWithTimeout(outputUrl);
    if (!outputResponse.ok) {
      return errorResponse(`The background-removal result could not be downloaded (${outputResponse.status}).`, 502);
    }

    const resultType = outputResponse.headers.get("content-type") || "image/png";
    if (!resultType.startsWith("image/")) {
      return errorResponse("The background-removal service returned an invalid result type.", 502);
    }

    const resultBuffer = await outputResponse.arrayBuffer();
    if (resultBuffer.byteLength < 32 || resultBuffer.byteLength > MAX_RESULT_BYTES) {
      return errorResponse("The background-removal service returned an invalid result size.", 502);
    }

    return new Response(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": resultType,
        "Cache-Control": "no-store, private",
        "X-FlytheBG-Engine": "private-huggingface-gradio-rembg",
      },
    });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.error("FlytheBG background removal failed:", message);
    if (/not configured|configured endpoint/i.test(message)) {
      return errorResponse("The background removal Space is not configured correctly.", 502);
    }
    if (/unauthorized|401|403|invalid token/i.test(message)) {
      return errorResponse("The background removal service rejected the server credential.", 502);
    }
    if (/too large|413|limit/i.test(message)) {
      return errorResponse("The image is too large for the background removal service.", 413);
    }
    return errorResponse("Background removal is temporarily unavailable. Please try again in a moment.", 502);
  }
}
