# Railway production deployment

FlytheBG uses one public web service, one private inference service, and PostgreSQL in the same Railway project.

## 1. Private inference service

- Root Directory: `services/inference`
- Dockerfile: `Dockerfile`
- Health check: `/ready`
- Recommended persistent model-cache volume: `/models`
- No public domain required

```text
INFERENCE_API_SECRET=<long-random-secret-shared-with-web>
MODEL_PROVIDER=isnet_precision
MODEL_VARIANT=general-use-precision
MODEL_DIR=/models
DATABASE_URL=<Railway private PostgreSQL URL>
ONNX_INTRA_OP_THREADS=1
UPLOAD_MAX_MB=12
MAX_IMAGE_PIXELS=40000000
INFERENCE_CONCURRENCY=1
PORT=8000
```

`/ready` returns 200 only after the checkpoint is present/verified, ONNX Runtime has initialized, and model warm-up succeeds.

## 2. Public web service

- Root Directory: `apps/web`
- Dockerfile: `Dockerfile`
- Health check: `/`
- Attach your production custom domain when available

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_ADSENSE_CLIENT=

INFERENCE_SERVICE_URL=http://${{inference-live.RAILWAY_PRIVATE_DOMAIN}}:${{inference-live.PORT}}
INFERENCE_API_SECRET=<same-secret-as-inference>
UPLOAD_MAX_MB=12
INFERENCE_TIMEOUT_MS=180000
RATE_LIMIT_ANONYMOUS=30
RATE_LIMIT_WINDOW_SECONDS=600

COMPANY_TRADING_NAME=FlytheBG
CONTACT_EMAIL=stackpilotfe@outlook.com
LEGAL_EMAIL=stackpilotfe@outlook.com
```

Optional operator fields — fill only if they are real:

```text
COMPANY_LEGAL_NAME=
COMPANY_REGISTRATION_NUMBER=
COMPANY_REGISTERED_ADDRESS=
COMPANY_COUNTRY=
```

The app does not require a fabricated registered-company identity.

## 3. Google AdSense

Leave `NEXT_PUBLIC_ADSENSE_CLIENT` blank until the production site/domain is accepted in AdSense.

After approval, set the real value:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-1234567890123456
```

The web app then loads the AdSense script and `/ads.txt` automatically publishes:

```text
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

Configure required regional privacy/consent messaging before using non-essential advertising technologies where consent is required.

## 4. Browser AI

The Remove Background page also includes `@imgly/background-removal`. Its model/runtime assets are downloaded by the visitor's browser from the package's configured public distribution path. The private server model is independent of this browser result.

Review `docs/open-source-licenses.md` before commercial use because the IMG.LY repository publishes the package under AGPL-3.0.

## 5. Live acceptance checklist

1. Inference deployment is `SUCCESS` and `/ready` returns 200 after warm-up.
2. Web deployment is `SUCCESS` and `/` passes its health check.
3. Landing, `/features`, `/remove-background`, and `/features/passport-photo` load over HTTPS.
4. A real upload returns a FlytheBG Precision PNG.
5. The browser model can load and produce its comparison result in a supported browser.
6. Crop export works by cursor, ratio, and exact pixels.
7. Passport sheet export produces the selected physical size/DPI and the browser print action works.
8. Corrupted, mismatched, unsupported, and oversized files are rejected.
9. `/privacy`, `/terms`, `/cookies`, `/contact`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, manifest, and favicon work.
10. Logs contain no image binary data.
11. If AdSense is enabled, the publisher ID is real and consent/policy requirements for served regions have been configured.
