# Railway deployment

Create one Railway project with two services from the same repository.

## 1. Inference service

- Root Directory: `services/inference`
- Dockerfile: `Dockerfile`
- Health check: `/health`
- Recommended volume mount: `/models`
- Keep the service private; it does not require a public domain for normal operation.

Variables:

```text
INFERENCE_API_SECRET=<same long random value as web>
MODEL_PROVIDER=ben2_onnx
MODEL_VARIANT=base
MODEL_DIR=/models
ONNX_INTRA_OP_THREADS=1
UPLOAD_MAX_MB=12
MAX_IMAGE_PIXELS=40000000
INFERENCE_CONCURRENCY=1
PORT=8000
```

On the first start, the service downloads the official BEN2 Base ONNX checkpoint and verifies its pinned SHA-256 before loading it. The `/models` volume avoids downloading the checkpoint again when the ephemeral container filesystem is replaced.

`/health` reports process health. `/ready` returns 200 only after the model has loaded and completed a warmup inference.

## 2. Web service

- Root Directory: `apps/web`
- Dockerfile: `Dockerfile`
- Public domain: use a Railway-generated domain first, then attach your real custom domain.

Variables:

```text
NEXT_PUBLIC_SITE_URL=https://your-real-domain.example
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
INFERENCE_SERVICE_URL=http://${{inference.RAILWAY_PRIVATE_DOMAIN}}:${{inference.PORT}}
INFERENCE_API_SECRET=<same long random value as inference>
UPLOAD_MAX_MB=12
INFERENCE_TIMEOUT_MS=90000
RATE_LIMIT_ANONYMOUS=30
RATE_LIMIT_WINDOW_SECONDS=600
GOOGLE_SITE_VERIFICATION=<only after Search Console provides it>
COMPANY_LEGAL_NAME=<real value>
COMPANY_TRADING_NAME=<real value>
COMPANY_REGISTRATION_NUMBER=<real value if applicable>
COMPANY_REGISTERED_ADDRESS=<real value if appropriate>
COMPANY_COUNTRY=<real value>
CONTACT_EMAIL=<real value>
LEGAL_EMAIL=<real value>
```

Name the inference Railway service `inference` (or adjust the reference namespace to its real service name). Railway reference variables can resolve the other service's `RAILWAY_PRIVATE_DOMAIN`; set the inference service's `PORT` variable explicitly so `${{inference.PORT}}` resolves. Railway private networking uses the internal HTTP address; the browser never receives it.

## 3. Verification after deployment

1. Check inference `/health` returns 200.
2. Check inference `/ready` returns 200 after model warmup.
3. Confirm the inference service has no public domain unless you intentionally need one.
4. Load the web homepage over HTTPS.
5. Upload a valid test image and confirm a real transparent PNG result.
6. Verify invalid, corrupted, MIME-mismatched, and oversized uploads are rejected.
7. Confirm legal pages contain only the real company data you supplied.
8. Check `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, and the favicon.
9. Inspect web/inference logs and confirm no image bytes, object contents, or sensitive filenames are logged.
10. Verify processing again after an inference-service restart to confirm the model volume/cache works.

Do not call the deployment production-verified until the real-model test and these live Railway checks have passed.
