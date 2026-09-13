import { Client, handle_file } from "@gradio/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const HF_SPACE_ID = process.env.HF_SPACE_ID || "StackPilotMAX/bg-remover-api";

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const token = process.env.HF_TOKEN;
  if (!token) return errorResponse("Background removal service is not configured.");

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
    const client = await Client.connect(HF_SPACE_ID, { token });
    const input = new Blob([await image.arrayBuffer()], { type: image.type });
    const result = await client.predict("/remove_background", {
      image: handle_file(input),
    });

    const output = result.data?.[0] as { url?: string; path?: string } | string | undefined;
    const outputUrl = typeof output === "string" ? output : output?.url;
    if (!outputUrl) {
      throw new Error("The background-removal service returned no downloadable image.");
    }

    const outputResponse = await fetch(outputUrl, { cache: "no-store" });
    if (!outputResponse.ok) throw new Error(`The background-removal result could not be downloaded (${outputResponse.status}).`);

    const resultType = outputResponse.headers.get("content-type") || "image/png";
    if (!resultType.startsWith("image/")) throw new Error("The background-removal service returned an invalid result type.");

    return new Response(await outputResponse.arrayBuffer(), {
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
