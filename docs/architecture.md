# Architecture

```text
Browser
  -> Next.js web service (public)
     -> POST /api/remove-background
        -> browser-facing size/MIME/magic-byte checks
        -> Railway private network + X-Inference-Secret
           -> FastAPI inference service (private)
              -> authoritative decode/pixel/decompression-bomb validation
              -> bounded inference semaphore
              -> BEN2 Base ONNX provider
              -> ONNX Runtime CPU execution
           <- re-encoded RGBA PNG
     <- private/no-store RGBA PNG
  -> browser preview/editor/download
```

## Service responsibilities

The **web service** owns the public browser boundary, product UI, first-pass upload validation, per-instance anonymous rate limiting, safe error normalization, timeout handling, SEO/legal pages, and the private inference credential.

The **inference service** owns authoritative decoded-image validation, the model lifecycle, verified model acquisition/cache, warmup/readiness, inference concurrency, and alpha-PNG generation. The model checkpoint is loaded once per service process rather than once per request.

## Model lifecycle

```text
service process starts
  -> /health becomes available
  -> ensure BEN2_Base.onnx exists in MODEL_DIR
  -> verify pinned SHA-256 (download + verify when missing)
  -> create ONNX Runtime session
  -> run warmup inference
  -> /ready returns 200
```

## Persistence

No database, Redis, queue, or image object storage is required for the initial synchronous flow. Image bytes are processed in memory and returned directly. A Railway volume mounted at `/models` stores only the public model checkpoint cache, not user uploads.

A queue and temporary private object storage should be introduced only when processing duration, retries, batch work, or horizontal scaling justify asynchronous jobs. At that point, retention/cleanup behavior and the legal text must be updated together.
