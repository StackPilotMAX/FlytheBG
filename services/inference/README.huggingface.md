---
title: FlytheBG Inference
emoji: ✂️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# FlytheBG Inference

Private API backend for FlytheBG background removal. This Space is intended to be called by the FlytheBG web application, not used as a public upload UI.

## Required Space secrets

Set these in **Space → Settings → Variables and secrets → Secrets**:

- `INFERENCE_API_SECRET` — a long random value. The web frontend must use the exact same value server-side.
- `DATABASE_URL` — optional Supabase PostgreSQL connection string. If omitted, short-lived feedback tokens fall back to process memory.

## Space variables

Set these as normal variables:

```text
MODEL_PROVIDER=isnet_precision
MODEL_VARIANT=general-use-precision
MODEL_DIR=/home/user/models
ONNX_INTRA_OP_THREADS=1
INFERENCE_CONCURRENCY=1
UPLOAD_MAX_MB=12
MAX_IMAGE_PIXELS=40000000
```

## Files to copy to the Space root

Copy these files/directories from `services/inference` in the FlytheBG GitHub repository into the root of the Hugging Face Space:

- `app/`
- `requirements.txt`
- `Dockerfile.huggingface` → rename to `Dockerfile`
- `README.huggingface.md` → rename to `README.md`

The Docker image uses Hugging Face's required UID `1000`, runs FastAPI on port `7860`, and uses a writable model directory under `/home/user/models`.

## Health endpoints

- `/health` — process is alive
- `/ready` — model is loaded and reports whether run metadata is using PostgreSQL or the in-memory fallback

## Web configuration after deployment

Set the FlytheBG web service's server-only variables to:

```text
INFERENCE_SERVICE_URL=https://<your-space-subdomain>.hf.space
INFERENCE_API_SECRET=<same secret used in the Space>
```

Do not expose `INFERENCE_API_SECRET` through any `NEXT_PUBLIC_` variable.
