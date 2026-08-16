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

from PIL import Image, ImageFilter

logger = logging.getLogger("flythebg.inference.provider")

ISNET_MODEL_URL = "https://huggingface.co/jellybox/isnet-general-use/resolve/main/isnet-general-use_1024.onnx"
ISNET_MODEL_SHA256 = "60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a"
ISNET_MODEL_FILENAME = "isnet-general-use_1024.onnx"
ISNET_INPUT_SIZE = (1024, 1024)
CALIBRATION_FILENAME = "flythebg-calibration.json"

BIREFNET_MODEL_URL = "https://huggingface.co/studioludens/birefnet-lite-512/resolve/main/onnx/model_fp16.onnx"
BIREFNET_MODEL_SHA256 = "eff9216bb2f9d3f023d9c2b7196845a7485739ab1f231593633e4d2344ffc516"
BIREFNET_MODEL_FILENAME = "birefnet-lite-512-fp16.onnx"
BIREFNET_INPUT_SIZE = (512, 512)
BIREFNET_CALIBRATION_FILENAME = "flythebg-birefnet-calibration.json"
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


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
    request = urllib.request.Request(url, headers={"User-Agent": "FlytheBG-Inference/1.4"})
    fd, temporary_name = tempfile.mkstemp(prefix=f"{destination.name}.", suffix=".part", dir=destination.parent)
    os.close(fd)
    temporary = Path(temporary_name)
    try:
        digest = hashlib.sha256()
        with urllib.request.urlopen(request, timeout=300) as response, temporary.open("wb") as output:
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


def _session_options(intra_op_threads: int):
    import onnxruntime as ort

    options = ort.SessionOptions()
    options.intra_op_num_threads = max(1, intra_op_threads)
    options.inter_op_num_threads = 1
    options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
    options.enable_cpu_mem_arena = False
    options.enable_mem_pattern = False
    options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
    return options


def _sigmoid(values):
    import numpy as np

    clipped = np.clip(values, -30.0, 30.0)
    return (1.0 / (1.0 + np.exp(-clipped))).astype(np.float32, copy=False)


def _as_2d_prediction(outputs):
    import numpy as np

    for candidate in reversed(outputs):
        array = np.asarray(candidate)
        if array.ndim < 2:
            continue
        while array.ndim > 2:
            array = array[0]
        if array.ndim == 2:
            return array.astype(np.float32, copy=False)
    raise RuntimeError("Segmentation model returned no usable mask output")


def _precision_refine_mask(image: Image.Image, mask: Image.Image) -> Image.Image:
    """Preserve wispy boundaries without turning the matte into a hard mask.

    BiRefNet supplies the semantic matte. This pass works only in a narrow local
    boundary band at the uploaded image's original resolution: a one-pixel support
    expansion is combined with source luminance edges and a tiny softening pass.
    High-confidence foreground and background are left untouched.
    """
    import numpy as np

    base_image = mask.convert("L")
    base = np.asarray(base_image, dtype=np.float32) / 255.0
    dilated = np.asarray(base_image.filter(ImageFilter.MaxFilter(3)), dtype=np.float32) / 255.0
    eroded = np.asarray(base_image.filter(ImageFilter.MinFilter(3)), dtype=np.float32) / 255.0
    soft = np.asarray(base_image.filter(ImageFilter.GaussianBlur(radius=0.45)), dtype=np.float32) / 255.0

    rgb = np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0
    gray = rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722
    gx = np.zeros_like(gray)
    gy = np.zeros_like(gray)
    gx[:, 1:] = np.abs(gray[:, 1:] - gray[:, :-1])
    gy[1:, :] = np.abs(gray[1:, :] - gray[:-1, :])
    source_edge = np.clip((gx + gy) * 2.35, 0.0, 1.0)

    boundary = np.clip(dilated - eroded, 0.0, 1.0)
    uncertain = (dilated > 0.015) & (eroded < 0.985)
    support = base + (dilated - base) * (0.16 + source_edge * 0.14)
    edge_rescue = dilated * boundary * source_edge * 0.28
    refined = np.maximum(support, edge_rescue)
    refined = np.where(uncertain, refined * 0.78 + soft * 0.22, base)
    refined = np.where(base >= 0.992, 1.0, refined)
    refined = np.where(dilated <= 0.003, 0.0, refined)

    return Image.fromarray((np.clip(refined, 0.0, 1.0) * 255.0).astype(np.uint8), mode="L")


class ISNetOnnxProvider(BackgroundRemovalProvider):
    """Legacy IS-Net general-use inference kept as a rollback provider."""

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
            logger.info("calibration_loaded provider=isnet_onnx gamma=%.4f", self._mask_gamma)
        except FileNotFoundError:
            logger.info("calibration_default provider=isnet_onnx gamma=1.0000")
        except Exception:
            logger.exception("calibration_load_failed provider=isnet_onnx")

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
        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=_session_options(self.intra_op_threads),
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name
        logger.info(
            "model_session_loaded provider=isnet_onnx input=%s shape=%s",
            self.input_name,
            self.session.get_inputs()[0].shape,
        )
        self._predict_mask(Image.new("RGB", (64, 64), "white"))
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
        tensor = np.transpose(array, (2, 0, 1))[None, ...].astype(np.float32, copy=False)
        outputs = self.session.run(None, {self.input_name: tensor})
        pred = _as_2d_prediction(outputs)
        minimum = float(pred.min())
        maximum = float(pred.max())
        alpha = (
            np.zeros_like(pred, dtype=np.float32)
            if maximum - minimum <= 1e-8
            else ((pred - minimum) / (maximum - minimum)).clip(0.0, 1.0)
        )
        with self._calibration_lock:
            gamma = self._mask_gamma
        alpha = np.power(alpha, gamma).astype(np.float32, copy=False)
        normalized = (alpha * 255.0).clip(0, 255).astype(np.uint8)
        return Image.fromarray(normalized, mode="L").resize(image.size, Image.Resampling.LANCZOS)

    def remove_background(self, image: Image.Image) -> bytes:
        if not self.ready:
            raise RuntimeError("Model is not ready")
        result = image.convert("RGBA")
        result.putalpha(self._predict_mask(image))
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
            snapshot = {
                "mask_gamma": round(self._mask_gamma, 6),
                "feedback_total": sum(self._feedback_counts.values()),
            }
        return snapshot


class BiRefNetLiteOnnxProvider(BackgroundRemovalProvider):
    """Memory-bounded BiRefNet Lite matte plus original-resolution edge refinement."""

    def __init__(self, model_dir: str, intra_op_threads: int = 1) -> None:
        self.model_path = Path(model_dir) / BIREFNET_MODEL_FILENAME
        self.calibration_path = Path(model_dir) / BIREFNET_CALIBRATION_FILENAME
        self.intra_op_threads = max(1, intra_op_threads)
        self.session = None
        self.input_name: str | None = None
        self.input_dtype = "float32"
        self.ready = False
        self._calibration_lock = threading.Lock()
        self._mask_gamma = 0.96
        self._feedback_counts = {"great": 0, "too_much_removed": 0, "background_left": 0}

    def _load_calibration(self) -> None:
        try:
            payload = json.loads(self.calibration_path.read_text())
            gamma = float(payload.get("mask_gamma", 0.96))
            counts = payload.get("feedback_counts", {})
            self._mask_gamma = min(1.16, max(0.78, gamma))
            for key in self._feedback_counts:
                self._feedback_counts[key] = max(0, int(counts.get(key, 0)))
            logger.info("calibration_loaded provider=birefnet_onnx gamma=%.4f", self._mask_gamma)
        except FileNotFoundError:
            logger.info("calibration_default provider=birefnet_onnx gamma=0.9600")
        except Exception:
            logger.exception("calibration_load_failed provider=birefnet_onnx")

    def _persist_calibration(self) -> None:
        self.calibration_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema": 1,
            "model": "birefnet-lite-512-onnx-fp16",
            "mask_gamma": round(self._mask_gamma, 6),
            "feedback_counts": self._feedback_counts,
        }
        fd, temporary_name = tempfile.mkstemp(
            prefix="birefnet-calibration.", suffix=".json.part", dir=self.calibration_path.parent
        )
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

        _download_verified_model(BIREFNET_MODEL_URL, BIREFNET_MODEL_SHA256, self.model_path)
        self._load_calibration()
        logger.info("model_session_loading provider=birefnet_onnx variant=lite-512-fp16")
        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=_session_options(self.intra_op_threads),
            providers=["CPUExecutionProvider"],
        )
        model_input = self.session.get_inputs()[0]
        self.input_name = model_input.name
        self.input_dtype = "float16" if "float16" in model_input.type else "float32"
        logger.info(
            "model_session_loaded provider=birefnet_onnx input=%s shape=%s dtype=%s outputs=%s",
            self.input_name,
            model_input.shape,
            self.input_dtype,
            [output.name for output in self.session.get_outputs()],
        )
        self._predict_mask(Image.new("RGB", (96, 96), "white"))
        self.ready = True
        logger.info("model_warmup_complete provider=birefnet_onnx")

    def _predict_mask(self, image: Image.Image) -> Image.Image:
        if self.session is None or self.input_name is None:
            raise RuntimeError("Model is not initialized")
        import numpy as np

        resized = image.convert("RGB").resize(BIREFNET_INPUT_SIZE, Image.Resampling.LANCZOS)
        array = np.asarray(resized, dtype=np.float32) / 255.0
        mean = np.asarray(IMAGENET_MEAN, dtype=np.float32)
        std = np.asarray(IMAGENET_STD, dtype=np.float32)
        array = (array - mean) / std
        tensor_dtype = np.float16 if self.input_dtype == "float16" else np.float32
        tensor = np.transpose(array, (2, 0, 1))[None, ...].astype(tensor_dtype, copy=False)
        outputs = self.session.run(None, {self.input_name: tensor})
        logits = _as_2d_prediction(outputs)
        alpha = _sigmoid(logits)
        base_mask = Image.fromarray(
            (alpha * 255.0).clip(0, 255).astype(np.uint8), mode="L"
        ).resize(image.size, Image.Resampling.LANCZOS)
        refined = _precision_refine_mask(image, base_mask)

        with self._calibration_lock:
            gamma = self._mask_gamma
        if abs(gamma - 1.0) <= 1e-6:
            return refined
        values = np.asarray(refined, dtype=np.float32) / 255.0
        values = np.power(values, gamma).astype(np.float32, copy=False)
        return Image.fromarray((values * 255.0).clip(0, 255).astype(np.uint8), mode="L")

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
                self._mask_gamma = min(1.16, self._mask_gamma + 0.005)
            elif feedback == "too_much_removed":
                self._mask_gamma = max(0.78, self._mask_gamma - 0.005)
            self._persist_calibration()
            snapshot = {
                "mask_gamma": round(self._mask_gamma, 6),
                "feedback_total": sum(self._feedback_counts.values()),
            }
        logger.info(
            "calibration_feedback provider=birefnet_onnx category=%s gamma=%.4f total=%d",
            feedback,
            snapshot["mask_gamma"],
            snapshot["feedback_total"],
        )
        return snapshot


def build_provider(
    name: str,
    variant: str,
    model_dir: str = "./.models",
    intra_op_threads: int = 1,
) -> BackgroundRemovalProvider:
    if name == "birefnet_onnx":
        if variant not in {"lite-512-fp16", "lite-512", "lite"}:
            raise ValueError(f"Unsupported BiRefNet variant: {variant}")
        return BiRefNetLiteOnnxProvider(model_dir=model_dir, intra_op_threads=intra_op_threads)
    if name == "isnet_onnx":
        if variant != "general-use":
            raise ValueError(f"Unsupported IS-Net variant: {variant}")
        return ISNetOnnxProvider(model_dir=model_dir, intra_op_threads=intra_op_threads)
    raise ValueError(f"Unsupported model provider: {name}")
