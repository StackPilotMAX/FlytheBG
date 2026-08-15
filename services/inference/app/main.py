from __future__ import annotations

import asyncio
import logging
import secrets
import time
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from .config import settings
from .provider import build_provider
from .security import check_secret, validate_and_decode

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("flythebg.inference")
provider = build_provider(settings.model_provider, settings.model_variant, model_dir=settings.model_dir, intra_op_threads=settings.onnx_threads)
semaphore = asyncio.Semaphore(settings.concurrency)
startup_error: str | None = None
RUN_TTL_SECONDS = 3600
MAX_RECENT_RUNS = 4000
recent_runs: dict[str, float] = {}


class FeedbackPayload(BaseModel):
    run_id: str
    feedback: Literal["great", "too_much_removed", "background_left"]


def prune_runs(now: float | None = None) -> None:
    current = now if now is not None else time.time()
    expired = [key for key, expires_at in recent_runs.items() if expires_at <= current]
    for key in expired:
        recent_runs.pop(key, None)
    if len(recent_runs) > MAX_RECENT_RUNS:
        for key, _ in sorted(recent_runs.items(), key=lambda item: item[1])[: len(recent_runs) - MAX_RECENT_RUNS]:
            recent_runs.pop(key, None)


async def load_provider() -> None:
    global startup_error
    try:
        started = time.perf_counter()
        await asyncio.to_thread(provider.start)
        logger.info("model_ready provider=%s variant=%s duration_ms=%d", settings.model_provider, settings.model_variant, int((time.perf_counter()-started)*1000))
    except Exception as exc:
        startup_error = type(exc).__name__
        logger.exception("model_startup_failed provider=%s variant=%s", settings.model_provider, settings.model_variant)


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(load_provider())
    yield
    if not task.done():
        task.cancel()


app = FastAPI(title="FlytheBG Inference", version="1.1.0", docs_url=None, redoc_url=None, lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    if not provider.ready:
        detail = "Model failed to initialize." if startup_error else "Model is warming up."
        raise HTTPException(status_code=503, detail=detail)
    return {"status": "ready", "provider": settings.model_provider, "variant": settings.model_variant}


@app.post("/v1/remove-background")
async def remove_background(image: UploadFile = File(...), x_inference_secret: str | None = Header(default=None)):
    check_secret(x_inference_secret)
    if not provider.ready:
        raise HTTPException(status_code=503, detail="Image model is warming up.")

    data = await image.read(settings.upload_max_mb * 1024 * 1024 + 1)
    decoded = validate_and_decode(data, image.content_type)
    started = time.perf_counter()

    try:
        await asyncio.wait_for(semaphore.acquire(), timeout=2.0)
    except TimeoutError:
        raise HTTPException(status_code=429, detail="Inference capacity is busy. Try again shortly.")
    try:
        output = await asyncio.to_thread(provider.remove_background, decoded)
    except Exception:
        logger.exception("inference_failed")
        raise HTTPException(status_code=500, detail="Background removal failed.")
    finally:
        semaphore.release()

    now = time.time()
    prune_runs(now)
    run_id = secrets.token_urlsafe(24)
    recent_runs[run_id] = now + RUN_TTL_SECONDS

    logger.info("inference_completed duration_ms=%d", int((time.perf_counter()-started)*1000))
    return Response(
        content=output,
        media_type="image/png",
        headers={
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
            "X-FlytheBG-Run-Id": run_id,
            "X-FlytheBG-Retention": "raw-image-not-persisted; run-token-max-age=3600",
        },
    )


@app.post("/v1/feedback")
async def feedback(payload: FeedbackPayload, x_inference_secret: str | None = Header(default=None)):
    check_secret(x_inference_secret)
    now = time.time()
    prune_runs(now)
    expires_at = recent_runs.pop(payload.run_id, None)
    if expires_at is None or expires_at <= now:
        raise HTTPException(status_code=410, detail="Feedback token expired.")
    try:
        snapshot = await asyncio.to_thread(provider.record_feedback, payload.feedback)
    except ValueError:
        raise HTTPException(status_code=400, detail="Unsupported feedback category.")
    return {"status": "accepted", "calibration": snapshot}
