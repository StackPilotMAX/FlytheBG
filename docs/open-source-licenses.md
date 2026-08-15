# Open-source and model licensing review

Re-check this document whenever a model, checkpoint, runtime, or redistributed weight changes.

## Production selection: IS-Net general-use ONNX

- Purpose: general-purpose foreground/background segmentation.
- Upstream research/code: `xuebinqin/DIS` (IS-Net / Highly Accurate Dichotomous Image Segmentation).
- Upstream code license: Apache-2.0.
- ONNX checkpoint source used by FlytheBG: `jellybox/isnet-general-use` on Hugging Face.
- Checkpoint repository license metadata: Apache-2.0.
- File: `isnet-general-use_1024.onnx`.
- Pinned SHA-256: `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`.
- FlytheBG verifies this digest before loading the model.
- Pre/post-processing follows the current rembg `isnet-general-use` session behavior, but FlytheBG calls ONNX Runtime directly rather than exposing rembg's CLI/custom-model surface.

## Runtime libraries

- ONNX Runtime: MIT.
- NumPy: BSD-family license expression published by NumPy.
- Pillow: HPND.
- FastAPI: MIT.

## Models intentionally not enabled

- Official BiRefNet weights remain blocked because their published terms are not suitable for this project's commercial production requirement without separate rights.
- BRIA RMBG self-hosted weights remain blocked unless a commercial agreement is obtained.
- BEN2 Base remains a commercially permissive candidate, but the 223 MB ONNX graph exceeded the memory envelope of the current 1 GB Railway inference service during initialization, so it is not the production default on this deployment.

## Distribution

The model checkpoint is not committed to this GitHub repository. The inference service downloads the pinned checkpoint into `MODEL_DIR`, verifies SHA-256, and then initializes ONNX Runtime. A persistent Railway model volume is recommended to avoid re-downloading after container replacement.
