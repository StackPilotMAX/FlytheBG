# Adaptive learning and retention

FlytheBG does not treat user uploads as a training-image inventory.

## Production image lifecycle

1. The browser posts an image to the Next.js route.
2. The web service validates declared MIME, size, and magic bytes.
3. Bytes are forwarded over the private Railway service network.
4. The inference service decodes and validates the image, runs IS-Net, and returns a re-encoded RGBA PNG.
5. The web route returns the PNG with `Cache-Control: private, no-store`.
6. Raw input/output image bytes are not intentionally written to a permanent application database or object store.

The one-hour retention ceiling applies to the anonymous feedback run token. If temporary image object storage is introduced later for queues/retries, its lifecycle policy must delete objects no later than one hour unless the product and legal text are explicitly changed first.

## Adaptive quality loop

Every successful inference receives a cryptographically random run token stored only in inference-process memory for at most 3600 seconds. It contains no image bytes and no user identity.

A user may optionally submit one of three result-quality categories:

- `great`
- `too_much_removed`
- `background_left`

Accepted feedback can move a bounded `mask_gamma` calibration parameter between 0.82 and 1.18. The IS-Net ONNX checkpoint is immutable at runtime; FlytheBG is calibrating post-processing rather than silently fine-tuning neural-network weights from user uploads.

Calibration state contains only the model name, bounded gamma value, and aggregate feedback counters. It is written atomically to `MODEL_DIR/flythebg-calibration.json`. A persistent Railway `/models` volume is recommended so aggregate learning survives container replacement.

## Privacy invariants

Do not change these without updating the code, Privacy & AI Policy, Terms, and this document together:

- Do not log image binaries.
- Do not persist raw uploads/results for model training by default.
- Do not associate feedback with account, IP address, filename, or image URL.
- Do not accept feedback after the one-hour token window.
- Do not allow feedback to set arbitrary model parameters; use hard bounds.
- Do not automatically replace the production model checkpoint from online feedback.
