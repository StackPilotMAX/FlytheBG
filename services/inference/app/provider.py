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

ISNET_MODEL_URL = "https://huggingface.co/jellybox/isnet-general-use/resolve/main/isnet-general-use_1024.onnx"
ISNET_MODEL_SHA256 = "60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a"
ISNET_MODEL_FILENAME = "isnet-general-use_1024.onnx"
ISNET_INPUT_SIZE = (1024, 1024)


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


def _download_verified_model(url: str, expected_sha256: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        if _sha256(destination) == expected_sha256:
            logger.info("model_cache_hit path=%s", destination)
            return
        logger.warning("cached_model_checksum_mismatch path=%s", destination)
        destination.unlink()

    logger.info("model_download_started url=%s", url)
    request = urllib.request.Request(url, headers={"User-Agent": "FlytheBG-Inference/1.0"})
    fd, temporary_name = tempfile.mkstemp(prefix=f"{destination.name}.", suffix=".part", dir=destination.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        digest = hashlib.sha256()
        with urllib.request.urlopen(request, timeout=180) as response, temporary.open("wb") as output:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
                output.write(chunk)
        actual = digest.hexdigest()
        if actual != expected_sha256:
            raise RuntimeError(f"Model checksum mismatch: expected {expected_sha256}, got {actual}")
        os.replace(temporary, destination)
        logger.info("model_download_verified path=%s", destination)
    finally:
        if temporary.exists():
            temporary.unlink(missing_ok=True)


class ISNetOnnxProvider(BackgroundRemovalProvider):
    """IS-Net general-use inference through ONNX Runtime.

    Pre/post-processing follows rembg's current IS-Net general-use session:
    RGB -> 1024x1024 LANCZOS -> scale by image maximum -> subtract 0.5 per channel,
    then min/max-normalize the first output channel and resize the mask to source size.
    """

    def __init__(self, model_dir: str, intra_op_threads: int = 1) -> None:
        self.model_path = Path(model_dir) / ISNET_MODEL_FILENAME
        self.intra_op_threads = max(1, intra_op_threads)
        self.session = None
        self.input_name: str | None = None
        self.ready = False

    def start(self) -> None:
        import onnxruntime as ort

        _download_verified_model(ISNET_MODEL_URL, ISNET_MODEL_SHA256, self.model_path)
        logger.info("model_session_loading provider=isnet_onnx")

        options = ort.SessionOptions()
        options.intra_op_num_threads = self.intra_op_threads
        options.inter_op_num_threads = 1
        options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        # Reduce transient/cached memory on small Railway instances.
        options.enable_cpu_mem_arena = False
        options.enable_mem_pattern = False
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC

        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=options,
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name
        logger.info("model_session_loaded input=%s shape=%s", self.input_name, self.session.get_inputs()[0].shape)

        # A provider is ready only after a real graph execution succeeds.
        warmup = Image.new("RGB", (64, 64), "white")
        self._predict_mask(warmup)
        self.ready = True
        logger.info("model_warmup_complete provider=isnet_onnx")

    def _predict_mask(self, image: Image.Image) -> Image.Image:
        if self.session is None or self.input_name is None:
            raise RuntimeError("Model is not initialized")

        import numpy as np

        resized = image.convert("RGB").resize(ISNET_INPUT_SIZE, Image.Resampling.LANCZOS)
        array = np.asarray(resized, dtype=np.float32)
        array = array / max(float(array.max()), 1e-6)
        array = array - np.asarray([0.5, 0.5, 0.5], dtype=np.float32)
        input_tensor = np.transpose(array, (2, 0, 1))[None, ...].astype(np.float32, copy=False)

        outputs = self.session.run(None, {self.input_name: input_tensor})
        if not outputs:
            raise RuntimeError("IS-Net returned no outputs")

        pred = outputs[0][:, 0, :, :]
        minimum = float(pred.min())
        maximum = float(pred.max())
        if maximum - minimum <= 1e-8:
            normalized = np.zeros_like(np.squeeze(pred), dtype=np.uint8)
        else:
            normalized = ((np.squeeze(pred) - minimum) / (maximum - minimum) * 255.0).clip(0, 255).astype(np.uint8)

        return Image.fromarray(normalized, mode="L").resize(image.size, Image.Resampling.LANCZOS)

    def remove_background(self, image: Image.Image) -> bytes:
        if not self.ready:
            raise RuntimeError("Model is not ready")
        mask = self._predict_mask(image)
        result = image.convert("RGBA")
        result.putalpha(mask)
        buffer = io.BytesIO()
        result.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()


def build_provider(name: str, variant: str, model_dir: str = "./.models", intra_op_threads: int = 1) -> BackgroundRemovalProvider:
    if name == "isnet_onnx":
        if variant != "general-use":
            raise ValueError(f"Unsupported IS-Net variant: {variant}")
        return ISNetOnnxProvider(model_dir=model_dir, intra_op_threads=intra_op_threads)
    raise ValueError(f"Unsupported model provider: {name}")
