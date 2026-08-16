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
ISNET_INPUT_SIZE = 1024
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
    request = urllib.request.Request(url, headers={"User-Agent": "FlytheBG-Inference/1.5"})
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
    """Rescue fine hair/fabric boundaries at the uploaded image's full resolution.

    The semantic model decides foreground/background. This local refinement only
    touches the uncertain border band: it expands support by at most one pixel,
    uses source luminance edges to recover thin strands, and gently softens the
    alpha transition. Solid foreground/background remains locked.
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


def _subject_bbox(mask: Image.Image) -> tuple[int, int, int, int] | None:
    """Return a padded box around likely foreground, or None for near-full-frame subjects."""
    import numpy as np

    alpha = np.asarray(mask.convert("L"), dtype=np.uint8)
    ys, xs = np.where(alpha >= 24)
    if len(xs) == 0 or len(ys) == 0:
        return None

    width, height = mask.size
    left, right = int(xs.min()), int(xs.max()) + 1
    top, bottom = int(ys.min()), int(ys.max()) + 1
    box_w = right - left
    box_h = bottom - top

    pad_x = max(10, int(box_w * 0.14))
    pad_y = max(10, int(box_h * 0.14))
    left = max(0, left - pad_x)
    top = max(0, top - pad_y)
    right = min(width, right + pad_x)
    bottom = min(height, bottom + pad_y)

    coverage = ((right - left) * (bottom - top)) / max(1, width * height)
    if coverage >= 0.90 or right - left < 48 or bottom - top < 48:
        return None
    return left, top, right, bottom


class ISNetPrecisionProvider(BackgroundRemovalProvider):
    """Production-safe two-pass IS-Net with full-resolution alpha refinement.

    Pass 1 finds the complete subject. When the subject occupies less than most of
    the frame, pass 2 re-runs the same 1024 model on a padded subject crop. That
    allocates substantially more model pixels to hair, sleeves, fabric edges, fur,
    fingers, straps and other thin structures without increasing model RAM.
    """

    def __init__(self, model_dir: str, intra_op_threads: int = 1) -> None:
        self.model_path = Path(model_dir) / ISNET_MODEL_FILENAME
        self.calibration_path = Path(model_dir) / CALIBRATION_FILENAME
        self.intra_op_threads = max(1, intra_op_threads)
        self.session = None
        self.input_name: str | None = None
        self.ready = False
        self._calibration_lock = threading.Lock()
        self._mask_gamma = 0.97
        self._feedback_counts = {"great": 0, "too_much_removed": 0, "background_left": 0}

    def _load_calibration(self) -> None:
        try:
            payload = json.loads(self.calibration_path.read_text())
            gamma = float(payload.get("mask_gamma", 0.97))
            counts = payload.get("feedback_counts", {})
            self._mask_gamma = min(1.16, max(0.80, gamma))
            for key in self._feedback_counts:
                self._feedback_counts[key] = max(0, int(counts.get(key, 0)))
            logger.info("calibration_loaded provider=isnet_precision gamma=%.4f", self._mask_gamma)
        except FileNotFoundError:
            logger.info("calibration_default provider=isnet_precision gamma=0.9700")
        except Exception:
            logger.exception("calibration_load_failed provider=isnet_precision")

    def _persist_calibration(self) -> None:
        self.calibration_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema": 2,
            "model": "isnet-general-use-two-pass-precision",
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
        logger.info("model_session_loading provider=isnet_precision variant=general-use-precision")
        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=_session_options(self.intra_op_threads),
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name
        logger.info(
            "model_session_loaded provider=isnet_precision input=%s shape=%s",
            self.input_name,
            self.session.get_inputs()[0].shape,
        )
        self._infer_single(Image.new("RGB", (96, 72), "white"))
        self.ready = True
        logger.info("model_warmup_complete provider=isnet_precision")

    def _infer_single(self, image: Image.Image) -> Image.Image:
        if self.session is None or self.input_name is None:
            raise RuntimeError("Model is not initialized")
        import numpy as np

        source = image.convert("RGB")
        src_w, src_h = source.size
        scale = min(ISNET_INPUT_SIZE / max(src_w, 1), ISNET_INPUT_SIZE / max(src_h, 1))
        resized_w = max(1, int(round(src_w * scale)))
        resized_h = max(1, int(round(src_h * scale)))
        resized = source.resize((resized_w, resized_h), Image.Resampling.LANCZOS)

        canvas = Image.new("RGB", (ISNET_INPUT_SIZE, ISNET_INPUT_SIZE), (127, 127, 127))
        offset_x = (ISNET_INPUT_SIZE - resized_w) // 2
        offset_y = (ISNET_INPUT_SIZE - resized_h) // 2
        canvas.paste(resized, (offset_x, offset_y))

        array = np.asarray(canvas, dtype=np.float32)
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
        normalized = Image.fromarray((alpha * 255.0).clip(0, 255).astype(np.uint8), mode="L")
        content = normalized.crop((offset_x, offset_y, offset_x + resized_w, offset_y + resized_h))
        return content.resize(source.size, Image.Resampling.LANCZOS)

    def _predict_mask(self, image: Image.Image) -> Image.Image:
        import numpy as np

        coarse = self._infer_single(image)
        box = _subject_bbox(coarse)
        working = coarse

        if box is not None:
            left, top, right, bottom = box
            detail_crop = image.crop(box)
            detail_mask = self._infer_single(detail_crop)

            coarse_crop = np.asarray(coarse.crop(box), dtype=np.float32) / 255.0
            detail = np.asarray(detail_mask, dtype=np.float32) / 255.0
            # Preserve strong coarse foreground so the detail pass cannot punch
            # holes through clothes/body mass, while letting its sharper boundary win.
            protected = np.where(coarse_crop >= 0.60, np.maximum(detail, coarse_crop * 0.90), detail)
            merged_crop = Image.fromarray((np.clip(protected, 0.0, 1.0) * 255.0).astype(np.uint8), mode="L")
            working = coarse.copy()
            working.paste(merged_crop, (left, top))
            logger.info(
                "precision_second_pass applied=true crop=%dx%d source=%dx%d",
                right - left,
                bottom - top,
                image.width,
                image.height,
            )
        else:
            logger.info("precision_second_pass applied=false source=%dx%d", image.width, image.height)

        refined = _precision_refine_mask(image, working)
        with self._calibration_lock:
            gamma = self._mask_gamma
        values = np.asarray(refined, dtype=np.float32) / 255.0
        values = np.power(values, gamma).astype(np.float32, copy=False)
        return Image.fromarray((values * 255.0).clip(0, 255).astype(np.uint8), mode="L")

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
                self._mask_gamma = min(1.16, self._mask_gamma + 0.005)
            elif feedback == "too_much_removed":
                self._mask_gamma = max(0.80, self._mask_gamma - 0.005)
            self._persist_calibration()
            snapshot = {
                "mask_gamma": round(self._mask_gamma, 6),
                "feedback_total": sum(self._feedback_counts.values()),
            }
        logger.info(
            "calibration_feedback provider=isnet_precision category=%s gamma=%.4f total=%d",
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
    if name in {"isnet_precision", "isnet_onnx"}:
        if variant not in {"general-use-precision", "general-use"}:
            raise ValueError(f"Unsupported IS-Net precision variant: {variant}")
        return ISNetPrecisionProvider(model_dir=model_dir, intra_op_threads=intra_op_threads)
    raise ValueError(f"Unsupported model provider: {name}")
