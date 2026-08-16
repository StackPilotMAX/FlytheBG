<div align="center">

# ✦ FlytheBG

### Dark, privacy-focused AI image tools for the web

**Remove backgrounds · compare two AI engines · crop precisely · build print-ready passport photo sheets**

[Live app](https://flythebg.up.railway.app) · [Features](https://flythebg.up.railway.app/features) · [Remove Background](https://flythebg.up.railway.app/remove-background) · [Passport Photo Maker](https://flythebg.up.railway.app/features/passport-photo)

</div>

---

## ✨ What FlytheBG includes

FlytheBG is a production-oriented monorepo with dedicated image-tool pages rather than one oversized editor.

### 🌌 Product experience

- Permanent dark visual language with a live WebGL galaxy landing experience.
- Dedicated **Landing**, **Features**, **Remove Background**, and **Passport Photo Maker** pages.
- Dark FAQ, dark legal pages, dark editors, responsive navigation, metadata, sitemap, robots and Search Console support.
- No account required for the current tools.

### ✂️ Dual-model Remove Background

One upload can produce two independently processed outputs:

1. **FlytheBG Precision** — private FastAPI + ONNX Runtime service using a two-pass IS-Net precision pipeline with full-resolution boundary refinement.
2. **Browser AI** — `@imgly/background-removal` running locally in the visitor's browser.

Both currently use IS-Net-family segmentation, but they run through different runtimes/configurations. The browser path starts with the quantized IMG.LY model and can retry its FP16 model when the first pass produces a degenerate foreground.

Before FlytheBG displays a result it now:

- decodes the returned image successfully;
- verifies non-zero image dimensions;
- checks that the alpha channel contains a usable foreground;
- generates a stable decoded PNG preview;
- rejects blank/degenerate cutouts instead of displaying an unexplained white or black card.

Users can then download either original-resolution PNG or crop either result using:

- free cursor selection;
- common aspect ratios;
- exact X / Y / width / height pixel values.

### 🪪 Passport Photo Maker

Two workflows are available:

- **Use my photo** — keep the existing background and build the sheet directly.
- **Remove background first** — run FlytheBG Precision, then build the print sheet from the transparent result.

Print controls include:

- exact final printed width/height in **cm, mm, or inches**;
- **300 DPI** high-quality or **600 DPI** ultra-quality export;
- A4, 4×6 inch, US Letter, or custom paper size;
- configurable copy count, margins, and gaps;
- cursor repositioning and zoom inside the passport frame;
- custom print background color;
- automatic grid layout or manual copy placement by cursor;
- PNG sheet download and browser print action.

> Passport and ID requirements differ by country/document. Enter the current dimensions required by the issuing authority. For physical-size accuracy, print at **Actual Size / 100%**, not “Fit to page”.

---

## 🧩 Architecture

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

## 📁 Repository layout

```text
apps/web/                    Next.js 16 + React 19 web app
  src/app/                   routes, legal pages, API proxy
  src/components/            Galaxy, remover, cropper, passport maker
services/inference/          FastAPI + ONNX Runtime inference
docs/                        deployment, privacy, security, licenses, ads
.github/workflows/           web + inference CI
.env.example                 local/production environment template
```

---

# Run from GitHub / locally

## Requirements

- **Node.js 22+**
- **npm**
- **Python 3.11+**
- internet access for first-time model/runtime downloads

PostgreSQL is optional for local testing. If `DATABASE_URL` is empty, the inference service uses its temporary fallback for short-lived run metadata.

## 1. Clone

```bash
git clone https://github.com/StackPilotMAX/FlytheBG.git
cd FlytheBG
```

## 2. Create the web environment file

macOS / Linux:

```bash
cp .env.example apps/web/.env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example apps/web/.env.local
```

Use the **same long random value** for `INFERENCE_API_SECRET` in web and inference.

For local development, the important values are:

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

Keep `NEXT_PUBLIC_ADSENSE_CLIENT` empty locally.

## 3. Start inference

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

The first start downloads the pinned IS-Net ONNX checkpoint. `/ready` becomes 200 only after the model has loaded and warmed.

## 4. Start web

From a second terminal at repository root:

```bash
npm install
npm run dev:web
```

Open `http://localhost:3000`.

Useful routes:

```text
/                         landing page
/features                 feature hub
/remove-background        dual-model remover
/features/passport-photo  passport photo maker
/privacy                  privacy & AI policy
/terms                    terms
/cookies                  cookie policy
/contact                  support/legal contact
```

### Browser AI note

The second output uses `@imgly/background-removal`. Its runtime/model resources normally come from IMG.LY's configured asset distribution, so that result needs access to those assets even when FlytheBG runs locally. If Browser AI cannot load, the private FlytheBG Precision path remains independent.

---

# Production environment variables

Fill only real values. Never invent legal/company details to satisfy a form.

## Web service

```text
NEXT_PUBLIC_SITE_URL=https://your-real-domain.example
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

Optional — leave blank unless actually true:

```text
COMPANY_LEGAL_NAME=
COMPANY_REGISTRATION_NUMBER=
COMPANY_REGISTERED_ADDRESS=
COMPANY_COUNTRY=
```

## Inference service

```text
INFERENCE_API_SECRET=<same-long-random-secret-as-web>
MODEL_PROVIDER=isnet_precision
MODEL_VARIANT=general-use-precision
MODEL_DIR=/models
DATABASE_URL=<private PostgreSQL URL>
ONNX_INTRA_OP_THREADS=1
UPLOAD_MAX_MB=12
MAX_IMAGE_PIXELS=40000000
INFERENCE_CONCURRENCY=1
PORT=8000
```

---

# 💰 Google AdSense

FlytheBG is **AdSense-ready but ads are disabled by default**.

After your production site is stable and Google approves it:

1. Add/verify the real production domain in AdSense.
2. Complete the site/privacy review requested by Google.
3. Configure the required consent/privacy messaging for the regions you serve.
4. Set the approved publisher value:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-YOUR_16_DIGIT_PUBLISHER_ID
```

5. Redeploy only the web service.
6. Check `/ads.txt`; FlytheBG generates the Google publisher line from the configured publisher ID.
7. Use Auto ads or create deliberate placements away from upload, crop, download, passport-positioning and print buttons.
8. Never use a fake/test publisher ID in production.

See `docs/analytics-and-ads.md` for the longer checklist.

---

# 🔒 Privacy model

- Raw uploaded images are not intentionally stored in the PostgreSQL run-metadata database.
- FlytheBG Precision processes request bytes through the private inference service.
- Browser AI processes its second result on the user's device.
- Passport layout/export is browser-side unless **Remove background first** is chosen.
- Optional FlytheBG Precision feedback uses a random short-lived run identifier.
- Run metadata expires in under one hour.
- Source EXIF is not intentionally copied into generated PNG results.

See `docs/privacy-architecture.md` and `docs/adaptive-learning-and-retention.md`.

---

# ⚠️ IMG.LY licensing

The optional browser comparison integrates `@imgly/background-removal`. The upstream project publishes this package under **GNU AGPL v3** and offers separate licensing routes. AGPL can create source-availability obligations depending on how covered software is modified, combined, distributed or served.

If those obligations do not fit your intended commercial model, remove/disable Browser AI or obtain licensing terms that fit the business before monetizing that integration.

This README is not legal advice.

---

# ✅ Final production checklist

Before treating a deployment as the public monetized version:

- [ ] Attach a real custom domain and set `NEXT_PUBLIC_SITE_URL` to it.
- [ ] Verify the domain in Google Search Console and set `GOOGLE_SITE_VERIFICATION`.
- [ ] Test `/remove-background` with people, hair, clothes, products and difficult backgrounds.
- [ ] Confirm **both model cards show decoded subjects**, not blank checker/white/black panels.
- [ ] Test Download and all three crop modes on both result cards.
- [ ] Test Passport Photo Maker at 300 and 600 DPI and print one known dimension at **Actual Size / 100%**.
- [ ] Keep company-registration/address variables blank until those statements are true.
- [ ] Apply to AdSense only after the site/domain/legal/content experience is stable.
- [ ] Add the real `ca-pub-…` ID only after approval.
- [ ] Review IMG.LY AGPL/commercial licensing before monetizing Browser AI.
- [ ] Require the latest GitHub Actions **web** and **inference** jobs to be green.
- [ ] Require Railway web, inference and PostgreSQL services to be healthy.

---

## Troubleshooting

### Result card looks empty

Current FlytheBG validates decode, dimensions and alpha coverage before showing a model result. A degenerate transparent output should now produce an explicit model error instead of an unexplained blank card. Browser AI also retries its FP16 model when its first quantized cutout is effectively empty.

### Browser AI cannot start

Check that the browser/network can reach IMG.LY's model/runtime asset host. FlytheBG Precision does not use that browser download path.

### `/api/remove-background` works but preview does not

Check browser console/CSP errors and verify the returned response is an image. Current production code builds previews from decoded image pixels and keeps the original result Blob separately for full-resolution download/crop.

### Inference CI cannot import `app`

The CI workflow sets `PYTHONPATH=.` while running from `services/inference`. Do the same when invoking tests from unusual shells/directories.

---

## CI

Every pushed commit runs:

**Web**

```text
npm install
npm run test
npm run typecheck
npm run build
```

**Inference**

```text
pip install -r requirements-dev.txt
pytest -q
```

Only promote a production revision after both jobs pass.

---

## Official contact

`stackpilotfe@outlook.com`

Use this address for support, privacy, security, copyright/legal correspondence and other official written requests.
