# FlytheBG AI Background Remover

Production-oriented monorepo for a privacy-first background-removal web application.

## What is included

- Real upload → server validation → private inference → transparent PNG → edit/download workflow.
- Next.js App Router web app with TypeScript and Tailwind CSS.
- FastAPI inference service with BEN2 Base ONNX inference through ONNX Runtime.
- Independent validation in both the web proxy and the ML service.
- Internal service secret, bounded inference concurrency, request timeouts, and anonymous per-instance rate limiting.
- In-memory image processing by default: no image database or permanent archive.
- Responsive result editor with transparency preview, original/result comparison, background color preview, and PNG download.
- Privacy, Terms, Cookies, and Contact pages wired to centralized real-company configuration.
- SEO metadata, sitemap, robots, manifest, favicon, JSON-LD, and Search Console verification hook.
- Railway Dockerfiles, private-network deployment instructions, CI, tests, and security/privacy/license documentation.

## Architecture

```text
Browser
  -> Next.js web service (public)
  -> server-side /api/remove-background
  -> Railway private network + internal secret
  -> FastAPI inference service (private)
  -> BEN2 Base ONNX / ONNX Runtime
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

Python 3.11 is used by the production container.

```bash
cd services/inference
python -m venv .venv
source .venv/bin/activate   # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
export INFERENCE_API_SECRET=replace-with-a-long-random-secret
export MODEL_DIR=./.models
uvicorn app.main:app --reload --port 8000
```

On the first startup, the inference service downloads the official `BEN2_Base.onnx` checkpoint from the official model repository, verifies its pinned SHA-256, and caches it under `MODEL_DIR`. In Railway, mount a persistent volume at `/models` and set `MODEL_DIR=/models`.

## Environment variables

Copy `.env.example`. Keep `INFERENCE_API_SECRET`, private service URLs, and future storage/database secrets server-only. Only variables prefixed with `NEXT_PUBLIC_` are intentionally exposed to the browser.

Company/legal values are blank by default. Fill them with verified facts before public launch; the project deliberately does not invent registration numbers, addresses, jurisdiction, or compliance claims.

## Validation

```bash
cd services/inference
pip install -r requirements-dev.txt
pytest -q

cd ../../apps/web
npm install
npm run typecheck
npm run build
```

A real-model integration test is opt-in because it downloads the 223 MB model and executes ONNX inference:

```bash
cd services/inference
RUN_REAL_INFERENCE=1 pytest -q tests/test_real_inference.py
```

## Railway

See `docs/deployment.md` for the exact two-service setup and environment variables.

## Brand assets

Reusable FlytheBG logo assets live in `apps/web/public/brand/`:

- `flythebg-mark.svg` — primary color mark for product UI, favicon, app icon, and social use.
- `flythebg-mark-mono.svg` — single-color mark for dark/light/print applications.
- `flythebg-lockup.svg` — horizontal mark + wordmark lockup.

The mark is intentionally simple enough to remain legible at small sizes and independent enough to be used without the wordmark.

## Documentation

- `docs/architecture.md`
- `docs/deployment.md`
- `docs/security.md`
- `docs/privacy-architecture.md`
- `docs/open-source-licenses.md`
- `docs/analytics-and-ads.md`
