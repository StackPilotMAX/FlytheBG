# FlytheBG

Production-oriented monorepo for a privacy-first AI background-removal web application.

## Current product

- Next.js App Router frontend with a scroll-scrubbed landing demo using the operator-provided source clip.
- FlytheBG UI is layered around the source clip; source attribution/watermarks are preserved rather than hidden or altered.
- Floating **Ask FlytheBG** product-guide control that rises with hero scroll, docks back, and expands on click.
- FastAPI + IS-Net general-use ONNX private inference backend.
- Raw uploads/results are not intentionally stored in the application database.
- PostgreSQL stores only short-lived anonymous processing-run metadata and optional feedback; records expire in under one hour.
- Optional feedback can adjust bounded aggregate alpha-mask calibration without turning uploaded photos into a training-image archive.
- Official contact: `stackpilotfe@outlook.com` (email only).

## Architecture

```text
Browser
  -> Next.js /api/remove-background
  -> Railway private network + internal secret
  -> FastAPI inference service
  -> IS-Net general-use ONNX / ONNX Runtime
  -> transparent PNG

FastAPI inference service
  -> PostgreSQL: random run ID + created/expiry time + model version + optional feedback only
  -> no image bytes, image filenames, or output-image URLs
```

## Landing demo media

The web build materializes `public/media/flythebg-car-demo.mp4` from small base64 source chunks in `apps/web/media-src/` via `apps/web/scripts/materialize-media.mjs`. This keeps the demo deterministic in deploy builds without modifying the source clip's attribution.

## Brand assets

Reusable FlytheBG logo assets live in `apps/web/public/brand/`.

## Contact

FlytheBG currently uses one official written contact channel for product support, privacy requests, security reports, copyright/legal correspondence, and other official notices:

`stackpilotfe@outlook.com`

Email-only contact keeps requests in one auditable written channel, avoids collecting phone numbers for support, and keeps sensitive requests out of public social-media messages.
