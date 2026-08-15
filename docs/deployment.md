# Railway deployment

Create one Railway project with a public web service and a private inference service from the same repository.

## Inference

- Root Directory: `services/inference`
- Dockerfile: `Dockerfile`
- Health check: `/health`
- Recommended model-cache volume: `/models`
- No public domain required.

```text
INFERENCE_API_SECRET=<same long random value as web>
MODEL_PROVIDER=isnet_onnx
MODEL_VARIANT=general-use
MODEL_DIR=/models
ONNX_INTRA_OP_THREADS=1
UPLOAD_MAX_MB=12
MAX_IMAGE_PIXELS=40000000
INFERENCE_CONCURRENCY=1
PORT=8000
```

`/health` reports process health. `/ready` returns 200 only after the checkpoint is verified, ONNX Runtime initializes, and a real warm-up graph execution succeeds.

## Web

- Root Directory: `apps/web`
- Dockerfile: `Dockerfile`
- Public Railway domain first; attach a real custom domain later.

```text
NEXT_PUBLIC_SITE_URL=https://your-real-domain.example
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
INFERENCE_SERVICE_URL=http://${{inference-live.RAILWAY_PRIVATE_DOMAIN}}:${{inference-live.PORT}}
INFERENCE_API_SECRET=<same value as inference>
UPLOAD_MAX_MB=12
INFERENCE_TIMEOUT_MS=90000
RATE_LIMIT_ANONYMOUS=30
RATE_LIMIT_WINDOW_SECONDS=600
```

Before public launch, also set only verified real company/contact/legal values.

## Live acceptance

1. Inference deployment succeeds and `/ready` is healthy after model warm-up.
2. Web deployment succeeds and the public HTTPS page loads.
3. A real image upload returns a transparent PNG.
4. Corrupted, mismatched, unsupported, and oversized files are rejected.
5. Legal pages contain only real operator information.
6. `/robots.txt`, `/sitemap.xml`, manifest and favicon work.
7. Logs contain no image binary data.
