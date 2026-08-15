from __future__ import annotations
import asyncio
import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from .config import settings
from .provider import build_provider
from .security import check_secret, validate_and_decode

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("flythebg.inference")
provider = build_provider(
    settings.model_provider,
    settings.model_variant,
    model_dir=settings.model_dir,
    intra_op_threads=settings.onnx_threads,
)
semaphore = asyncio.Semaphore(settings.concurrency)
startup_error: str | None = None

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

app = FastAPI(title="FlytheBG Inference", version="1.0.0", docs_url=None, redoc_url=None, lifespan=lifespan)

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

    # Avoid unbounded waiting. If the inference slot is busy, return overload quickly.
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

    logger.info("inference_completed duration_ms=%d input_bytes=%d width=%d height=%d", int((time.perf_counter()-started)*1000), len(data), decoded.width, decoded.height)
    return Response(content=output, media_type="image/png", headers={"Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff"})
