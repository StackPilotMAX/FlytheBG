<div align="center">

# ✦ FlytheBG

### Dark, privacy-focused AI image tools for the web

**Remove backgrounds · compare two AI engines · crop precisely · build print-ready passport photo sheets**

[Live app](https://flythebg.up.railway.app) · [Features](https://flythebg.up.railway.app/features) · [Privacy](https://flythebg.up.railway.app/privacy)

</div>

---

## What FlytheBG includes

FlytheBG is a production-oriented monorepo built around dedicated image-tool pages instead of one oversized editor.

### 🌌 Product experience

- Permanent dark visual language with a live WebGL galaxy landing experience.
- Dedicated **Landing**, **Features**, **Remove Background**, and **Passport Photo Maker** pages.
- Responsive dark UI, dark FAQs, dark legal pages, favicon, metadata, sitemap, robots, and Search Console hook.
- No account required for the current tools.

### ✂️ Remove Background

One upload can produce two independent results:

1. **FlytheBG Precision** — private FastAPI + ONNX Runtime service using a two-pass IS-Net precision pipeline with edge refinement.
2. **Browser AI** — `@imgly/background-removal` running locally in the visitor's browser.

Users can compare both results and download either PNG.

The result editor also supports:

- cursor crop
- common aspect ratios
- exact X / Y / width / height pixel crop
- transparent PNG export
- optional result-quality feedback for FlytheBG Precision

### 🪪 Passport Photo Maker

Two workflows are available:

- **Use my photo** — keep the existing background and build the sheet directly.
- **Remove background first** — run FlytheBG Precision, then build the print sheet from the transparent result.

Print controls include:

- exact final printed width/height in **cm, mm, or inches**
- **300 DPI** high-quality or **600 DPI** ultra-quality export
- A4, 4×6 inch, US Letter, or custom paper size
- configurable copy count, margins, and gaps
- cursor repositioning and zoom inside the passport frame
- custom print background color
- automatic grid layout or manual copy placement by cursor
- PNG sheet download and browser print action

> Passport and ID requirements differ by country/document. Enter the current dimensions required by the issuing authority.

---

## Architecture

```text
Browser
  ├─ Landing / Features / Passport layout / Crop UI
  ├─ Browser AI (@imgly/background-removal)
  │    └─ model/runtime assets downloaded by the browser
  │
  └─ Next.js web service (public)
       └─ /api/remove-background
            └─ private service URL + internal secret
                 └─ FastAPI inference service (private)
                      └─ IS-Net Precision / ONNX Runtime CPU
                           └─ transparent PNG

PostgreSQL
  └─ short-lived anonymous processing/feedback metadata only
```

The browser never receives the private Railway inference URL or `INFERENCE_API_SECRET`.

---

## Repository layout

```text
apps/web/                    Next.js 16 + React 19 web app
  src/app/                   routes, legal pages, API proxy
  src/components/            Galaxy, remover, cropper, passport maker
services/inference/          FastAPI + ONNX Runtime inference
docs/                        deployment, privacy, security, licenses, ads
.github/workflows/           CI
.env.example                 complete environment template
```

---

# Run from GitHub / locally

## Requirements

You need:

- **Node.js 22+**
- **npm**
- **Python 3.11+**
- internet access for the first model downloads

PostgreSQL is optional for local testing. If `DATABASE_URL` is empty, the service can use its temporary fallback behavior for short-lived run metadata.

## 1. Clone the repository

```bash
git clone https://github.com/StackPilotMAX/FlytheBG.git
cd FlytheBG
```

## 2. Create your environment file

macOS / Linux:

```bash
cp .env.example apps/web/.env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example apps/web/.env.local
```

Use the **same long random value** for `INFERENCE_API_SECRET` in the web environment and inference environment.

For local development, these values are enough to start:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
INFERENCE_SERVICE_URL=http://localhost:8000
INFERENCE_API_SECRET=replace-with-your-own-long-random-secret
UPLOAD_MAX_MB=12
INFERENCE_TIMEOUT_MS=180000
MODEL_PROVIDER=isnet_precision
MODEL_VARIANT=general-use-precision
MODEL_DIR=./.models
ONNX_INTRA_OP_THREADS=1
MAX_IMAGE_PIXELS=40000000
INFERENCE_CONCURRENCY=1
```

Leave `NEXT_PUBLIC_ADSENSE_CLIENT` blank locally.

## 3. Start the inference service

macOS / Linux:

```bash
cd services/inference
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export INFERENCE_API_SECRET=replace-with-your-own-long-random-secret
export MODEL_PROVIDER=isnet_precision
export MODEL_VARIANT=general-use-precision
export MODEL_DIR=./.models
uvicorn app.main:app --reload --port 8000
```

Windows PowerShell:

```powershell
cd services/inference
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:INFERENCE_API_SECRET="replace-with-your-own-long-random-secret"
$env:MODEL_PROVIDER="isnet_precision"
$env:MODEL_VARIANT="general-use-precision"
$env:MODEL_DIR="./.models"
uvicorn app.main:app --reload --port 8000
```

The first start downloads the pinned IS-Net ONNX checkpoint. `/ready` becomes healthy only after the model is loaded and warmed.

## 4. Start the web app

Open a second terminal from the repository root:

```bash
npm install
npm run dev:web
```

Then open:

```text
http://localhost:3000
```

Useful local pages:

```text
/                         landing page
/features                 feature hub
/remove-background        dual-model remover
/features/passport-photo  passport photo maker
/privacy                  privacy & AI policy
/terms                    terms
/cookies                  cookie policy
```

### Browser AI note

The second result uses `@imgly/background-removal`. By default its browser runtime/model assets are fetched from IMG.LY's configured distribution service, so this result needs network access even when the Next.js app is running locally. FlytheBG Precision is independent of that browser model.

---

# Production environment variables

Copy `.env.example` and fill only real values.

## Web service

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_ADSENSE_CLIENT=

INFERENCE_SERVICE_URL=http://<private-inference-host>:8000
INFERENCE_API_SECRET=<same-long-random-secret-as-inference>
UPLOAD_MAX_MB=12
INFERENCE_TIMEOUT_MS=180000
RATE_LIMIT_ANONYMOUS=30
RATE_LIMIT_WINDOW_SECONDS=600

COMPANY_TRADING_NAME=FlytheBG
CONTACT_EMAIL=stackpilotfe@outlook.com
LEGAL_EMAIL=stackpilotfe@outlook.com
```

These operator fields are optional unless they are true for you:

```text
COMPANY_LEGAL_NAME=
COMPANY_REGISTRATION_NUMBER=
COMPANY_REGISTERED_ADDRESS=
COMPANY_COUNTRY=
```

Do **not** invent a registration number, company name, or address just to fill the variables.

## Inference service

```text
INFERENCE_API_SECRET=<same-long-random-secret-as-web>
MODEL_PROVIDER=isnet_precision
MODEL_VARIANT=general-use-precision
MODEL_DIR=/models
DATABASE_URL=<private PostgreSQL URL in production>
ONNX_INTRA_OP_THREADS=1
UPLOAD_MAX_MB=12
MAX_IMAGE_PIXELS=40000000
INFERENCE_CONCURRENCY=1
PORT=8000
```

---

# Google AdSense

FlytheBG is **AdSense-ready but ads are disabled by default**.

After Google approves the site:

1. Create/verify your AdSense account and add the production domain.
2. In AdSense, enable Auto ads or create the ad units you want.
3. Set:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-YOUR_16_DIGIT_PUBLISHER_ID
```

4. Redeploy the **web** service.
5. Check `/ads.txt`. FlytheBG generates the Google publisher record automatically from that environment variable.
6. Configure Google's required privacy/consent messaging for the regions you serve before loading non-essential personalized advertising where consent is required.
7. Keep ads away from upload/download/crop controls to reduce accidental clicks and policy risk.

Never put a test/fake publisher ID into production.

More detail: `docs/analytics-and-ads.md`.

---

# Privacy model

- Raw uploaded images are not intentionally stored in the PostgreSQL run-metadata database.
- FlytheBG Precision processes request bytes through the private inference service.
- Browser AI processes the uploaded image on the user's device for that second result.
- Passport layout/export is browser-side unless the user chooses **Remove background first**.
- Optional FlytheBG Precision feedback uses a random short-lived run identifier.
- Run metadata expires in under one hour.
- Source EXIF is not intentionally copied into generated PNG results.

See `docs/privacy-architecture.md` and `docs/adaptive-learning-and-retention.md`.

---

# Licensing ⚠️

The private FlytheBG Precision pipeline uses the Apache-2.0 IS-Net model/code lineage documented in `docs/open-source-licenses.md`.

The optional browser comparison integrates **IMG.LY `@imgly/background-removal`**, whose repository publishes the software under **GNU AGPL v3**. AGPL is a strong copyleft license and can impose source-availability obligations for covered/combined works. This repository keeps the integration source visible, but you should review the actual license and your distribution/deployment model before commercial use.

If AGPL obligations do not fit your intended business model, disable/remove the Browser AI integration or obtain licensing terms that fit your use case before commercial launch.

This README is not legal advice.

---

## Official contact

`stackpilotfe@outlook.com`

Use this address for support, privacy, security, copyright/legal correspondence, and other official written requests.
