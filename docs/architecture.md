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
              -> IS-Net general-use ONNX provider
              -> ONNX Runtime CPU execution
           <- re-encoded RGBA PNG
     <- private/no-store RGBA PNG
  -> browser editor/download
```

The web service owns the public browser boundary, product UI, first-pass upload validation, per-instance anonymous rate limiting, safe error normalization, timeout handling, SEO/legal pages, and private inference credential.

The inference service owns decoded-image validation, verified model acquisition/cache, warm-up/readiness, concurrency, and alpha-PNG generation. The checkpoint is loaded once per service process.

No database, Redis, queue, or user-image object storage is required for the initial synchronous flow. Image bytes are processed in memory and returned directly. A Railway volume mounted at `/models` should store only the public model checkpoint cache, not user uploads.
