import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowed = new Set(["great", "too_much_removed", "background_left"]);

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Cross-site feedback is not allowed." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const inferenceUrl = process.env.INFERENCE_SERVICE_URL?.trim();
  const secret = process.env.INFERENCE_API_SECRET?.trim();
  if (!inferenceUrl || !secret) return NextResponse.json({ error: "Feedback is not configured." }, { status: 503 });

  let body: { runId?: unknown; feedback?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
  }

  if (typeof body.runId !== "string" || body.runId.length < 16 || body.runId.length > 128 || typeof body.feedback !== "string" || !allowed.has(body.feedback)) {
    return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const response = await fetch(`${inferenceUrl.replace(/\/$/, "")}/v1/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-inference-secret": secret },
      body: JSON.stringify({ run_id: body.runId, feedback: body.feedback }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Feedback service unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
