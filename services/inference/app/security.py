from __future__ import annotations
import hmac
import io
import warnings
from PIL import Image, ImageOps
from fastapi import HTTPException
from .config import settings

ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp"}

def detect_mime(data: bytes) -> str | None:
    if data.startswith(b"\x89PNG\r\n\x1a\n"): return "image/png"
    if data.startswith(b"\xff\xd8\xff"): return "image/jpeg"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP": return "image/webp"
    return None

def check_secret(received: str | None) -> None:
    expected = settings.api_secret
    if not expected:
        raise HTTPException(status_code=503, detail="Inference authentication is not configured.")
    if not received or not hmac.compare_digest(received, expected):
        raise HTTPException(status_code=401, detail="Unauthorized.")

def validate_and_decode(data: bytes, declared_mime: str | None) -> Image.Image:
    if not data: raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(data) > settings.upload_max_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image must be {settings.upload_max_mb} MB or smaller.")
    actual = detect_mime(data)
    if actual not in ALLOWED_MIME or declared_mime != actual:
        raise HTTPException(status_code=415, detail="Unsupported or mismatched image format.")

    old_limit = Image.MAX_IMAGE_PIXELS
    Image.MAX_IMAGE_PIXELS = settings.max_image_pixels
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            image = Image.open(io.BytesIO(data))
            image.verify()
            image = Image.open(io.BytesIO(data))
            image.load()
        if image.width * image.height > settings.max_image_pixels:
            raise HTTPException(status_code=413, detail="Image dimensions are too large.")
        return ImageOps.exif_transpose(image).convert("RGBA")
    except HTTPException:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(status_code=413, detail="Image dimensions are too large.")
    except Exception:
        raise HTTPException(status_code=400, detail="The uploaded image is corrupted or unreadable.")
    finally:
        Image.MAX_IMAGE_PIXELS = old_limit
