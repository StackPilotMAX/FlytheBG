# FlytheBG AI Background Remover

Production-oriented monorepo for a privacy-first background-removal web application.

## What is included

- Real upload → server validation → private inference → transparent PNG → edit/download workflow.
- Next.js App Router web app with TypeScript and Tailwind CSS.
- FastAPI inference service with IS-Net general-use ONNX inference through ONNX Runtime.
- Independent validation in both the web proxy and the ML service.
- Internal service secret, bounded inference concurrency, request timeouts, and anonymous per-instance rate limiting.
- In-memory image processing by default: no image database or permanent archive.
- Short-lived anonymous feedback tokens with bounded adaptive mask calibration.
- Responsive result editor with transparency preview, original/result comparison, background color preview, and PNG download.
- Ultra-animated scroll-world landing experience with an original, unbranded animated vehicle illustration.
- Privacy, Terms, Cookies, and Contact pages wired to centralized real-company configuration.
- Official support/privacy/legal contact: stackpilotfe@outlook.com (email only).
- SEO metadata, sitemap, robots, manifest, favicon, JSON-LD, and Search Console verification hook.
- Railway Dockerfiles, private-network deployment instructions, CI, tests, and security/privacy/license documentation.

## Architecture

```text
Browser
  -> Next.js web service (public)
  -> server-side /api/remove-background
  -> Railway private network + internal secret
  -> FastAPI inference service (private)
  -> IS-Net general-use ONNX / ONNX Runtime
  -> transparent PNG
  -> browser editor/download
```

The browser never receives the internal inference URL or internal secret.

## Repository

```text
apps/web/             Next.js application
services/inference/   FastAPI + ONNX inference
docs/                 architecture, deployment, security, privacy, licenses
.github/workflows/    CI
```

## Local development

### Web

```bash
cd apps/web
npm install
cp ../../.env.example .env.local
npm run dev
```

### Inference

```bash
cd services/inference
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export INFERENCE_API_SECRET=replace-with-a-long-random-secret
export MODEL_DIR=./.models
uvicorn app.main:app --reload --port 8000
```

## Brand assets

Reusable FlytheBG logo assets live in `apps/web/public/brand/`. The landing-page vehicle artwork is authored directly in the app as a generic unbranded SVG with no manufacturer marks, badges, or copied third-party vehicle asset.

## Contact

FlytheBG currently uses one official written contact channel for product support, privacy requests, security reports, copyright/legal correspondence, and other official notices:

`stackpilotfe@outlook.com`

Email-only contact keeps requests in a single auditable written channel, avoids collecting phone numbers for support, and keeps sensitive requests out of public social-media messages.

## Railway

See `docs/deployment.md` for the two-service setup and environment variables.
