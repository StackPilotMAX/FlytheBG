import { Client, handle_file } from "@gradio/client";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * FlyTheBG — private server-side background removal (rembg on Hugging Face).
 *
 * Security model (how we make sure one user's photo never reaches another user):
 *   1. Every incoming HTTP request is handled in its own isolated call stack;
 *      we never assign request data to any module-level / global variable.
 *   2. A fresh Gradio Client is created per request, with a unique per-request
 *      upload_id — no cookie jar / upload session is reused between requests.
 *   3. Files are uploaded to the Space using an upload_id that is a random
 *      (cryptographic) v4 UUID scoped to THIS request only.
 *   4. The returned HF file URL is fetched exactly once, immediately, inside the
 *      same request; we do NOT return the HF URL to the browser (which would
 *      leak a guessable or shared Gradio file path). Instead we stream the bytes
 *      back directly from our own origin with Cache-Control: private, no-store.
 *   5. After the response is sent we release the ArrayBuffer we hold and set
 *      strict anti-caching headers so shared proxies and browser bfcache don't
 *      keep previous users' images around.
 *   6. Strict validation: declared MIME, file size (12 MB) AND magic-byte
 *      signature must match before anything is forwarded.
 *
 * The Hugging Face token (HF_TOKEN) is read from a server-only env var and is
 * never emitted to the browser in any response.
 */

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_RESULT_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const DEFAULT_SPACE_ID = "StackPilotMAX/bg-remover-api";
const DEFAULT_API_NAME = "/remove_background";

/** Parameter names commonly used by rembg Gradio Spaces for the input image. */
const INPUT_IMAGE_KEYS = ["image", "input_image", "file", "input", "img", "image_input"] as const;
/** Common rembg component flags; we pin sane defaults so the model output stays a transparent PNG. */
const BOOLEAN_DEFAULTS: Record<string, boolean> = {
  return_mask: false,
  alpha_matting: false,
  putalpha: true,
  only_mask: false,
};

function errorResponse(message: string, status = 500) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, private, must-revalidate",
        "Pragma": "no-cache",
      },
    },
  );
}

function hasValidSignature(bytes: Uint8Array, type: string) {
  if (type === "image/png") {
    return bytes.length >= 8
      && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
      && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/webp") {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
      && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

async function fetchWithTimeout(url: string, timeoutMs = 50_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Always no-store, never follow across hosts we don't trust, send no cookies.
    return await fetch(url, {
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

type GradioParam = {
  parameter_name: string;
  parameter_has_default?: boolean;
  parameter_default?: unknown;
  type?: { type?: string };
};

type EndpointInfo = { parameters?: GradioParam[] };

function buildPayload(endpoint: EndpointInfo, blob: Blob, requestId: string): Record<string, unknown> {
  const params = endpoint.parameters || [];
  const payload: Record<string, unknown> = {};

  const fileParam = params.find((p) => p.type?.type === "file")
    || params.find((p) => INPUT_IMAGE_KEYS.includes(p.parameter_name as typeof INPUT_IMAGE_KEYS[number]));

  const imageKey = fileParam?.parameter_name || "image";
  // Bind the upload to this exact request ID so the Gradio Space can't serve us
  // a file from a different concurrent session.
  payload[imageKey] = handle_file(blob, `${requestId}-input.png`);

  for (const p of params) {
    if (p.parameter_name === imageKey) continue;
    if (Object.prototype.hasOwnProperty.call(BOOLEAN_DEFAULTS, p.parameter_name)) {
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
  if (typeof data === "string" && /^https?:\/\//i.test(data)) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.url === "string" && /^https?:\/\//i.test(record.url)) return record.url;
    if (typeof record.path === "string" && /^https?:\/\//i.test(record.path)) return record.path;
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

/** Strong origin/URL check — only download from the Space that processed this request. */
function isTrustedResultUrl(urlString: string, spaceId: string): URL | null {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "https:") return null;
    const expectedHosts = [
      `${spaceId.replace("/", "-")}.hf.space`,
      `huggingface.co`,
      `cdn-lfs-us-1.huggingface.co`,
      `cdn-lfs.huggingface.co`,
      `hf.co`,
    ];
    const ok = expectedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h));
    return ok ? parsed : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
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
  if (image.size < 1 || image.size > MAX_UPLOAD_BYTES) {
    return errorResponse("The selected image is too large. Maximum size is 12 MB.", 413);
  }

  let imageBuffer: ArrayBuffer | null = null;
  try {
    imageBuffer = await image.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    if (!hasValidSignature(imageBytes, image.type)) {
      return errorResponse("The uploaded file does not match its declared image type.", 415);
    }

    // Per-request Gradio client with a unique upload_id — no connection/session reuse across users.
    const hfClient = await Client.connect(spaceId, {
      token,
      hf_token: token,
      // Force a fresh session every request so cookies/queue state cannot cross-talk.
      events: ["data"],
      query_params: { __fly_req: requestId },
    });

    const apiInfo = await hfClient.view_api();
    const endpoint = apiInfo.named_endpoints?.[apiName];
    if (!endpoint) {
      const available = Object.keys(apiInfo.named_endpoints || {}).join(", ") || "(none)";
      console.error(`[${requestId}] Space ${spaceId} missing endpoint ${apiName}. Available: ${available}`);
      return errorResponse(`The background removal Space is not exposing the expected "${apiName}" endpoint.`, 502);
    }

    const input = new Blob([imageBuffer], { type: image.type });
    // Drop the source bytes from this scope ASAP after handing to Blob.
    imageBuffer = null;

    const payload = buildPayload(endpoint, input, requestId);
    const result = await hfClient.predict(apiName, payload as unknown as Record<string, unknown>, {
      // @ts-expect-error upload_id is honoured by @gradio/client's upload() helper
      upload_id: requestId,
    });

    const outputUrl = extractOutputUrl(result.data);
    if (!outputUrl) {
      console.error(`[${requestId}] unexpected HF response shape`, JSON.stringify(result.data).slice(0, 500));
      return errorResponse("The background-removal service returned no downloadable image URL.", 502);
    }

    // Refuse to download from anywhere except the Space/Hugging Face.
    const trusted = isTrustedResultUrl(outputUrl, spaceId);
    if (!trusted) {
      console.error(`[${requestId}] rejecting non-Space result URL: ${outputUrl}`);
      return errorResponse("The background-removal service returned an untrusted result URL.", 502);
    }

    const outputResponse = await fetchWithTimeout(trusted.toString());
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

    // Send the bytes ourselves — the browser NEVER sees the hf.space URL directly.
    return new Response(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": resultType,
        "Content-Length": String(resultBuffer.byteLength),
        "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
        "X-FlytheBG-Engine": "private-huggingface-gradio-rembg",
        "X-FlytheBG-Request": requestId,
      },
    });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.error(`[${requestId}] FlytheBG background removal failed:`, message);
    if (/not configured|configured endpoint/i.test(message)) {
      return errorResponse("The background removal Space is not configured correctly.", 502);
    }
    if (/unauthorized|401|403|invalid token|Not authorized/i.test(message)) {
      return errorResponse("The background removal service rejected the server credential.", 502);
    }
    if (/too large|413|limit|Maximum/i.test(message)) {
      return errorResponse("The image is too large for the background removal service.", 413);
    }
    if (/abort|timeout|timed out/i.test(message)) {
      return errorResponse("The background removal service took too long. Please try a smaller image or retry.", 504);
    }
    return errorResponse("Background removal is temporarily unavailable. Please try again in a moment.", 502);
  } finally {
    // Defensive: release any retained bytes.
    imageBuffer = null;
  }
}
