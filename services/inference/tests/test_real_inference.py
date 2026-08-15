import io
import os

import pytest
from PIL import Image

pytestmark = pytest.mark.skipif(
    os.getenv("RUN_REAL_INFERENCE") != "1",
    reason="Set RUN_REAL_INFERENCE=1 to download/load the real IS-Net general-use ONNX model",
)


def test_real_isnet_inference_produces_alpha_png(tmp_path):
    from app.provider import ISNetOnnxProvider

    provider = ISNetOnnxProvider(str(tmp_path), intra_op_threads=1)
    provider.start()

    image = Image.new("RGB", (256, 256), "white")
    for x in range(72, 184):
        for y in range(52, 220):
            image.putpixel((x, y), (25, 85, 180))

    output = provider.remove_background(image)
    result = Image.open(io.BytesIO(output))
    assert result.format == "PNG"
    assert result.mode == "RGBA"
    assert result.size == image.size
    assert result.getchannel("A").getextrema()[0] < 255
