# Open-source and model licensing review

This document records the model/license decision for this revision. Re-check it whenever a model, checkpoint, backbone, runtime, or redistributed weight changes.

## Production selection

### BEN2 Base ONNX
- Role: default background-removal model.
- Official project: `PramaLLC/BEN2`.
- Official model repository: `PramaLLC/BEN2` on Hugging Face.
- Repository/model-card license: MIT.
- Checkpoint used: `BEN2_Base.onnx`.
- Model SHA-256 pinned by this application: `22cea62108ff53b7ccc20f7a008bf30494228d84b1687f29ecbe76936a998101`.
- The official BEN/BEN2 materials describe the Base model as the open/public model and point users to the Hugging Face weights. The upstream BEN repository explicitly describes the base model as free for commercial use.
- The inference service downloads this exact ONNX checkpoint, verifies its SHA-256 before loading it, and caches it in `MODEL_DIR`.

### ONNX Runtime
- Role: CPU inference runtime for the BEN2 ONNX graph.
- Package: `onnxruntime`.
- License: MIT.

### NumPy
- Role: model input/output tensor conversion and mask normalization.
- License: BSD-family/SPDX expression published by NumPy.

### Pillow
- Role: image decoding, orientation normalization, resizing, and PNG output.
- License: HPND.

## Explicitly blocked from the default commercial build

### BiRefNet official weights
The official BiRefNet project describes its official weights as non-commercial. Those weights are not enabled by this application. Do not switch production to an official BiRefNet checkpoint unless separate commercial rights are obtained and documented.

### BRIA RMBG 2.0 self-hosted weights
The official model card publishes non-commercial terms for the self-hosted weights and directs commercial users to a commercial agreement. Those weights are not enabled here.

### U²-Net via rembg
The U²-Net source repository is permissively licensed and rembg itself is MIT, but this project's license policy requires checkpoint-level provenance to be explicit enough for commercial use. Because the exact downloaded rembg checkpoint provenance was not strong enough for that hard gate during this review, it is not the production default in this revision.

## Redistribution note

The Docker image does not embed the 223 MB BEN2 checkpoint. The inference service downloads the official model at startup into `MODEL_DIR`, verifies the pinned SHA-256, and reuses it from the mounted Railway volume on subsequent starts. If you later redistribute the checkpoint directly, re-review all applicable license and notice obligations first.
