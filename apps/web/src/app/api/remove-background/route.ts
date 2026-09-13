import { Client, handle_file } from "@gradio/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_RESULT_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

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

async function fetchWithTimeout(url: string, timeoutMs = 30_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const token = process.env.HF_TOKEN;
  const spaceId = process.env.HF_SPACE_ID || "StackPilotMAX/bg-remover-api";

  if (!token) return errorResponse("Background removal service is not configured.");
  if (!spaceId) return errorResponse("Background removal Space is not configured.");

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return errorResponse("The selected image is too large. Maximum size is 12 MB.", 413);
  }

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof File)) return errorResponse("Please upload an image.", 400);
  if (!ALLOWED_TYPES.has(image.type)) return errorResponse("Only PNG, JPEG, and WebP images are supported.", 415);
  if (image.size < 1 || image.size > MAX_UPLOAD_BYTES) return errorResponse("The selected image is too large. Maximum size is 12 MB.", 413);

  try {
    const imageBytes = new Uint8Array(await image.arrayBuffer());
    if (!hasValidSignature(imageBytes, image.type)) {
      return errorResponse("The uploaded file does not match its declared image type.", 415);
    }

    const client = await Client.connect(spaceId, { token });
    const input = new Blob([imageBytes], { type: image.type });
    const result = await client.predict("/remove_background", {
      image: handle_file(input),
    });

    const output = result.data?.[0] as { url?: string; path?: string } | string | undefined;
    const outputUrl = typeof output === "string" ? output : output?.url;
    if (!outputUrl || !/^https?:\/\//i.test(outputUrl)) {
      throw new Error("The background-removal service returned no downloadable image URL.");
    }

    const outputResponse = await fetchWithTimeout(outputUrl);
    if (!outputResponse.ok) {
      throw new Error(`The background-removal result could not be downloaded (${outputResponse.status}).`);
    }

    const resultType = outputResponse.headers.get("content-type") || "image/png";
    if (!resultType.startsWith("image/")) throw new Error("The background-removal service returned an invalid result type.");

    const resultBuffer = await outputResponse.arrayBuffer();
    if (resultBuffer.byteLength < 32 || resultBuffer.byteLength > MAX_RESULT_BYTES) {
      throw new Error("The background-removal service returned an invalid result size.");
    }

    return new Response(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": resultType,
        "Cache-Control": "no-store, private",
        "X-FlytheBG-Engine": "private-huggingface-gradio",
      },
    });
  } catch (reason) {
    console.error("FlytheBG background removal failed", reason instanceof Error ? reason.message : reason);
    return errorResponse("Background removal is temporarily unavailable. Please try again.", 502);
  }
}
