from dataclasses import dataclass
import os


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    api_secret: str = os.getenv("INFERENCE_API_SECRET", "")
    model_provider: str = os.getenv("MODEL_PROVIDER", "birefnet_onnx")
    model_variant: str = os.getenv("MODEL_VARIANT", "lite-1024")
    model_dir: str = os.getenv("MODEL_DIR", "./.models")
    database_url: str = os.getenv("DATABASE_URL", "")
    onnx_threads: int = max(1, _int("ONNX_INTRA_OP_THREADS", 1))
    upload_max_mb: int = _int("UPLOAD_MAX_MB", 12)
    max_image_pixels: int = _int("MAX_IMAGE_PIXELS", 40_000_000)
    concurrency: int = max(1, _int("INFERENCE_CONCURRENCY", 1))


settings = Settings()
