import io
import pytest
from fastapi import HTTPException
from PIL import Image
from app.security import detect_mime, validate_and_decode


def png_bytes(size=(32, 24)):
    image = Image.new("RGB", size, (120, 160, 200))
    buf = io.BytesIO(); image.save(buf, "PNG"); return buf.getvalue()


def test_magic_detection():
    assert detect_mime(png_bytes()) == "image/png"
    assert detect_mime(b"not an image") is None


def test_valid_png_decodes_rgba():
    image = validate_and_decode(png_bytes(), "image/png")
    assert image.mode == "RGBA"
    assert image.size == (32, 24)


def test_mime_mismatch_is_rejected():
    with pytest.raises(HTTPException) as exc:
        validate_and_decode(png_bytes(), "image/jpeg")
    assert exc.value.status_code == 415


def test_corrupt_png_is_rejected():
    with pytest.raises(HTTPException) as exc:
        validate_and_decode(b"\x89PNG\r\n\x1a\n" + b"bad", "image/png")
    assert exc.value.status_code == 400
