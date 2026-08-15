# Security design

- Browser upload types are limited to PNG/JPEG/WebP.
- Web service checks MIME, byte size, and magic bytes before forwarding.
- Inference service repeats magic-byte validation and performs the authoritative Pillow decode.
- Pillow decompression-bomb protections and an explicit maximum pixel count are enforced.
- EXIF orientation is normalized and output is re-encoded as RGBA PNG without intentionally copying source metadata.
- The inference service expects `X-Inference-Secret`; the secret stays server-side.
- The web service applies a configurable per-instance anonymous request limit and rejects cross-site processing posts.
- Inference concurrency is bounded and overload returns HTTP 429.
- Upload/result responses use `Cache-Control: private, no-store`.
- Browser URL import is not implemented, avoiding an SSRF surface.
- Application logs include operational metadata only, never image bytes.

The built-in web rate limiter is per process. Before horizontally scaling to multiple web instances, use a shared/edge rate limit appropriate to the Railway architecture so limits remain globally consistent.
