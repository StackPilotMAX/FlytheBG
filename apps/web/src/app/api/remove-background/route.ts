import { NextResponse } from "next/server";
import { detectedMime, validateUploadBasics } from "@/lib/image-validation";
import { consumeAnonymousRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return errorResponse("Cross-site processing requests are not allowed.", 403);
  }

  const maxMb = positiveNumber(process.env.UPLOAD_MAX_MB, 12);
  const timeoutMs = positiveNumber(process.env.INFERENCE_TIMEOUT_MS, 90_000);
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > (maxMb + 1) * 1024 * 1024) {
    return errorResponse(`Image must be ${maxMb} MB or smaller.`, 413);
  }

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientKey = forwarded || request.headers.get("x-real-ip") || "unknown";
  const rate = consumeAnonymousRateLimit(clientKey);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many processing requests. Try again later." },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } },
    );
  }

  const inferenceUrl = process.env.INFERENCE_SERVICE_URL?.trim();
  const secret = process.env.INFERENCE_API_SECRET?.trim();
  if (!inferenceUrl || !secret) return errorResponse("Image processing is not configured.", 503);

  let form: FormData;
  try { form = await request.formData(); } catch { return errorResponse("Invalid multipart upload.", 400); }

  const file = form.get("image");
  if (!(file instanceof File)) return errorResponse("Select an image to process.", 400);
  const basicProblem = validateUploadBasics(file, maxMb);
  if (basicProblem) return errorResponse(basicProblem, file.size > maxMb * 1024 * 1024 ? 413 : 415);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const actualMime = detectedMime(bytes);
  if (!actualMime || actualMime !== file.type) return errorResponse("The file contents do not match a supported image format.", 415);

  const outbound = new FormData();
  const exactBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  outbound.append("image", new Blob([exactBuffer], { type: actualMime }), "upload");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${inferenceUrl.replace(/\/$/, "")}/v1/remove-background`, {
      method: "POST", headers: { "x-inference-secret": secret }, body: outbound, signal: controller.signal, cache: "no-store",
    });
    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { detail?: string } | null;
      const safe = response.status === 429 ? "The service is busy. Try again shortly." : detail?.detail || "Image processing failed.";
      return errorResponse(safe, response.status >= 400 && response.status < 600 ? response.status : 502);
    }

    const output = await response.arrayBuffer();
    const runId = response.headers.get("x-flythebg-run-id");
    return new Response(output, {
      status: 200,
      headers: {
        "Content-Type": "image/png", "Content-Disposition": "inline; filename=flythebg.png", "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff",
        ...(runId ? { "X-FlytheBG-Run-Id": runId } : {}),
      },
    });
  } catch (reason) {
    if (reason instanceof Error && reason.name === "AbortError") return errorResponse("Image processing timed out. Try a smaller image.", 504);
    return errorResponse("The image processing service is unavailable.", 502);
  } finally { clearTimeout(timer); }
}
