# Open-source and model licensing review

Re-check this document whenever a model, checkpoint, runtime, or redistributed weight changes.

## Production server model: IS-Net general-use ONNX

- Purpose: general-purpose foreground/background segmentation.
- Upstream research/code: `xuebinqin/DIS` (IS-Net / Highly Accurate Dichotomous Image Segmentation).
- Upstream code license: Apache-2.0.
- ONNX checkpoint source used by FlytheBG: `jellybox/isnet-general-use` on Hugging Face.
- Checkpoint repository license metadata: Apache-2.0.
- File: `isnet-general-use_1024.onnx`.
- Pinned SHA-256: `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`.
- FlytheBG verifies this digest before loading the model.
- Production provider: `isnet_precision`, which adds aspect-preserving preprocessing, a subject-focused second pass when useful, full-resolution edge refinement, and bounded calibration around the immutable checkpoint.

## Browser comparison model: IMG.LY background-removal

- npm package: `@imgly/background-removal` 1.7.0.
- Runtime peer: `onnxruntime-web` 1.21.0.
- FlytheBG calls the browser `removeBackground()` API from a client component.
- The uploaded image is supplied to the browser API as a `File`/`Blob` and inference is performed in the visitor's browser.
- The package's default configuration downloads model/runtime assets from IMG.LY's configured distribution path.
- IMG.LY's public repository includes the **GNU Affero General Public License v3 (AGPL-3.0)** as `LICENSE.md`.

### Commercial-use warning

AGPL-3.0 is a strong copyleft license. Depending on how software is combined, modified, distributed, or offered over a network, source-availability obligations can apply. FlytheBG keeps this integration source visible in the public repository, but that fact alone is not a substitute for reviewing the AGPL requirements for your exact use case.

Before commercial deployment, either:

1. confirm that the deployment complies with the applicable AGPL obligations, or
2. obtain suitable commercial/licensing terms from the relevant rights holder, or
3. disable/remove the Browser AI integration and use only components whose licensing fits the intended deployment.

This document records engineering facts and is not legal advice.

## Runtime libraries

- ONNX Runtime / ONNX Runtime Web: MIT.
- NumPy: BSD-family license expression published by NumPy.
- Pillow: HPND.
- FastAPI: MIT.
- Next.js / React / Three.js: see their respective upstream licenses.

## Models intentionally not enabled on the production server

- BiRefNet Lite trials were not left enabled because their inference memory envelope was not stable on the current ~1 GB Railway inference allocation.
- BRIA RMBG self-hosted weights remain blocked unless licensing appropriate for the intended commercial use is obtained.
- BEN2 Base remains a candidate, but the tested ONNX graph exceeded the current production memory envelope during initialization.

## Distribution

The IS-Net checkpoint is not committed to this GitHub repository. The private inference service downloads the pinned checkpoint into `MODEL_DIR`, verifies SHA-256, and initializes ONNX Runtime. A persistent Railway model volume is recommended.
