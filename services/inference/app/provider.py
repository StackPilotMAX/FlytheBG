from __future__ import annotations

import hashlib
import io
import logging
import os
import tempfile
import urllib.request
from abc import ABC, abstractmethod
from pathlib import Path

from PIL import Image

logger = logging.getLogger("flythebg.inference.provider")

BEN2_MODEL_URL = "https://huggingface.co/PramaLLC/BEN2/resolve/main/BEN2_Base.onnx"
BEN2_MODEL_SHA256 = "22cea62108ff53b7ccc20f7a008bf30494228d84b1687f29ecbe76936a998101"
BEN2_MODEL_FILENAME = "BEN2_Base.onnx"
BEN2_INPUT_SIZE = (1024, 1024)


class BackgroundRemovalProvider(ABC):
    ready: bool = False

    @abstractmethod
    def start(self) -> None: ...

    @abstractmethod
    def remove_background(self, image: Image.Image) -> bytes: ...


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _download_verified_model(destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.exists():
        if _sha256(destination) == BEN2_MODEL_SHA256:
            return
        logger.warning("cached_model_checksum_mismatch path=%s", destination)
        destination.unlink()

    request = urllib.request.Request(
        BEN2_MODEL_URL,
        headers={"User-Agent": "FlytheBG-Inference/1.0"},
    )

    fd, temporary_name = tempfile.mkstemp(
        prefix=f"{BEN2_MODEL_FILENAME}.", suffix=".part", dir=destination.parent
    )
    os.close(fd)
    temporary = Path(temporary_name)

    try:
        digest = hashlib.sha256()
        with urllib.request.urlopen(request, timeout=120) as response, temporary.open("wb") as output:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
                output.write(chunk)

        actual = digest.hexdigest()
        if actual != BEN2_MODEL_SHA256:
            raise RuntimeError(
                f"BEN2 model checksum mismatch: expected {BEN2_MODEL_SHA256}, got {actual}"
            )
        os.replace(temporary, destination)
    finally:
        if temporary.exists():
            temporary.unlink(missing_ok=True)


class BEN2OnnxProvider(BackgroundRemovalProvider):
    """BEN2 Base inference using the official ONNX checkpoint.

    The preprocessing/postprocessing follows the official BEN2 ONNX example while
    using Pillow/NumPy for resizing rather than pulling PyTorch into the serving image.
    """

    def __init__(self, model_dir: str, intra_op_threads: int = 1) -> None:
        self.model_path = Path(model_dir) / BEN2_MODEL_FILENAME
        self.intra_op_threads = max(1, intra_op_threads)
        self.session = None
        self.input_name: str | None = None
        self.ready = False

    def start(self) -> None:
        import onnxruntime as ort

        _download_verified_model(self.model_path)

        options = ort.SessionOptions()
        options.intra_op_num_threads = self.intra_op_threads
        options.inter_op_num_threads = 1
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=options,
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name

        # Readiness means the model has completed a real warmup inference.
        warmup = Image.new("RGB", (64, 64), "white")
        self._predict_mask(warmup)
        self.ready = True

    def _predict_mask(self, image: Image.Image) -> Image.Image:
        if self.session is None or self.input_name is None:
            raise RuntimeError("Model is not initialized")

        import numpy as np

        rgb = image.convert("RGB")
        resized = rgb.resize(BEN2_INPUT_SIZE, Image.Resampling.BILINEAR)
        input_array = np.asarray(resized, dtype=np.float32) / 255.0
        input_array = np.transpose(input_array, (2, 0, 1))[None, ...]

        outputs = self.session.run(None, {self.input_name: input_array})
        if not outputs:
            raise RuntimeError("BEN2 returned no outputs")

        mask = np.squeeze(outputs[0]).astype(np.float32)
        if mask.ndim != 2:
            raise RuntimeError(f"Unexpected BEN2 output shape: {outputs[0].shape}")

        minimum = float(mask.min())
        maximum = float(mask.max())
        if maximum - minimum <= 1e-8:
            normalized = np.zeros_like(mask, dtype=np.uint8)
        else:
            normalized = ((mask - minimum) / (maximum - minimum) * 255.0).clip(0, 255).astype(np.uint8)

        return Image.fromarray(normalized, mode="L").resize(image.size, Image.Resampling.BILINEAR)

    def remove_background(self, image: Image.Image) -> bytes:
        if not self.ready:
            raise RuntimeError("Model is not ready")

        mask = self._predict_mask(image)
        result = image.convert("RGBA")
        result.putalpha(mask)

        buffer = io.BytesIO()
        result.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()


def build_provider(
    name: str,
    variant: str,
    model_dir: str = "./.models",
    intra_op_threads: int = 1,
) -> BackgroundRemovalProvider:
    if name == "ben2_onnx":
        if variant != "base":
            raise ValueError(f"Unsupported BEN2 model variant: {variant}")
        return BEN2OnnxProvider(model_dir=model_dir, intra_op_threads=intra_op_threads)
    raise ValueError(f"Unsupported model provider: {name}")
