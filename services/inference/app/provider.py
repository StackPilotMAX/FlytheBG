from __future__ import annotations

import hashlib
import io
import json
import logging
import os
import tempfile
import threading
import urllib.request
from abc import ABC, abstractmethod
from pathlib import Path

from PIL import Image

logger = logging.getLogger("flythebg.inference.provider")

ISNET_MODEL_URL = "https://huggingface.co/jellybox/isnet-general-use/resolve/main/isnet-general-use_1024.onnx"
ISNET_MODEL_SHA256 = "60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a"
ISNET_MODEL_FILENAME = "isnet-general-use_1024.onnx"
ISNET_INPUT_SIZE = (1024, 1024)
CALIBRATION_FILENAME = "flythebg-calibration.json"


class BackgroundRemovalProvider(ABC):
    ready: bool = False

    @abstractmethod
    def start(self) -> None: ...

    @abstractmethod
    def remove_background(self, image: Image.Image) -> bytes: ...

    def record_feedback(self, feedback: str) -> dict[str, float | int]:
        raise NotImplementedError("Provider does not support adaptive feedback")


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
    request = urllib.request.Request(url, headers={"User-Agent": "FlytheBG-Inference/1.1"})
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
    """IS-Net general-use inference with bounded aggregate mask calibration.

    Explicit user feedback changes only a small alpha-mask gamma value. It never
    stores input images, output images, filenames, IP addresses, or user IDs.
    The model checkpoint itself is immutable at runtime.
    """

    def __init__(self, model_dir: str, intra_op_threads: int = 1) -> None:
        self.model_path = Path(model_dir) / ISNET_MODEL_FILENAME
        self.calibration_path = Path(model_dir) / CALIBRATION_FILENAME
        self.intra_op_threads = max(1, intra_op_threads)
        self.session = None
        self.input_name: str | None = None
        self.ready = False
        self._calibration_lock = threading.Lock()
        self._mask_gamma = 1.0
        self._feedback_counts = {"great": 0, "too_much_removed": 0, "background_left": 0}

    def _load_calibration(self) -> None:
        try:
            payload = json.loads(self.calibration_path.read_text())
            gamma = float(payload.get("mask_gamma", 1.0))
            counts = payload.get("feedback_counts", {})
            self._mask_gamma = min(1.18, max(0.82, gamma))
            for key in self._feedback_counts:
                self._feedback_counts[key] = max(0, int(counts.get(key, 0)))
            logger.info("calibration_loaded gamma=%.4f", self._mask_gamma)
        except FileNotFoundError:
            logger.info("calibration_default gamma=1.0000")
        except Exception:
            logger.exception("calibration_load_failed")

    def _persist_calibration(self) -> None:
        self.calibration_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema": 1,
            "model": "isnet-general-use",
            "mask_gamma": round(self._mask_gamma, 6),
            "feedback_counts": self._feedback_counts,
        }
        fd, temporary_name = tempfile.mkstemp(prefix="calibration.", suffix=".json.part", dir=self.calibration_path.parent)
        os.close(fd)
        temporary = Path(temporary_name)
        try:
            temporary.write_text(json.dumps(payload, separators=(",", ":")))
            os.replace(temporary, self.calibration_path)
        finally:
            if temporary.exists():
                temporary.unlink(missing_ok=True)

    def start(self) -> None:
        import onnxruntime as ort

        _download_verified_model(ISNET_MODEL_URL, ISNET_MODEL_SHA256, self.model_path)
        self._load_calibration()
        logger.info("model_session_loading provider=isnet_onnx")

        options = ort.SessionOptions()
        options.intra_op_num_threads = self.intra_op_threads
        options.inter_op_num_threads = 1
        options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        options.enable_cpu_mem_arena = False
        options.enable_mem_pattern = False
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC

        self.session = ort.InferenceSession(str(self.model_path), sess_options=options, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        logger.info("model_session_loaded input=%s shape=%s", self.input_name, self.session.get_inputs()[0].shape)

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
            alpha = np.zeros_like(np.squeeze(pred), dtype=np.float32)
        else:
            alpha = ((np.squeeze(pred) - minimum) / (maximum - minimum)).clip(0.0, 1.0).astype(np.float32, copy=False)

        with self._calibration_lock:
            gamma = self._mask_gamma
        if abs(gamma - 1.0) > 1e-6:
            alpha = np.power(alpha, gamma).astype(np.float32, copy=False)
        normalized = (alpha * 255.0).clip(0, 255).astype(np.uint8)
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

    def record_feedback(self, feedback: str) -> dict[str, float | int]:
        if feedback not in self._feedback_counts:
            raise ValueError("Unsupported feedback category")
        with self._calibration_lock:
            self._feedback_counts[feedback] += 1
            if feedback == "background_left":
                self._mask_gamma = min(1.18, self._mask_gamma + 0.006)
            elif feedback == "too_much_removed":
                self._mask_gamma = max(0.82, self._mask_gamma - 0.006)
            self._persist_calibration()
            snapshot = {"mask_gamma": round(self._mask_gamma, 6), "feedback_total": sum(self._feedback_counts.values())}
        logger.info("calibration_feedback category=%s gamma=%.4f total=%d", feedback, snapshot["mask_gamma"], snapshot["feedback_total"])
        return snapshot


def build_provider(name: str, variant: str, model_dir: str = "./.models", intra_op_threads: int = 1) -> BackgroundRemovalProvider:
    if name == "isnet_onnx":
        if variant != "general-use":
            raise ValueError(f"Unsupported IS-Net variant: {variant}")
        return ISNetOnnxProvider(model_dir=model_dir, intra_op_threads=intra_op_threads)
    raise ValueError(f"Unsupported model provider: {name}")
