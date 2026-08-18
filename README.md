# FlytheBG

FlytheBG is a privacy-focused, browser-only image toolkit for removing backgrounds, cropping transparent PNGs, and creating print-ready passport-photo sheets.

## Live tools

- **Remove Background** — runs IMG.LY IS-Net in the visitor's browser. The quantized model is tried first and FP16 is used automatically if the first attempt fails.
- **Crop** — crops the generated transparent PNG locally in the browser.
- **Passport Photo Maker** — optional browser background removal, exact physical sizing, framing, background color, multiple copies, A4/4×6/US Letter/custom paper, and memory-safe PNG export.
- **Galaxy landing experience** — a lightweight Canvas 2D visual that never sits above or intercepts the image-tool controls.

## Privacy architecture

The current production image flow has no image-processing API and no image database. Selected photos and generated image blobs stay in the browser while the tool is being used.

FlytheBG does **not intentionally upload image bytes** to Render, Supabase, or a FlytheBG image database. IMG.LY model/runtime assets are downloaded so browser inference can run; those asset requests do not intentionally contain the selected photo.

After a download starts or the tool is reset, FlytheBG releases its working image URLs and in-page image state. A downloaded file, browser/OS caches, extensions, screenshots, or other copies outside the page are outside the application's control.

## Technology

- Next.js 15.5.x static export
- React 19
- `@imgly/background-removal` 1.7.0
- IMG.LY `isnet_quint8` first, `isnet_fp16` fallback
- `onnxruntime-web` version pinned to the version required by IMG.LY 1.7.0
- Canvas 2D for the decorative galaxy
- No server-side image inference service

The application is exported as static HTML/CSS/JavaScript, so a static host can serve it without paying for image-inference compute.

## Requirements

- Node.js 22
- A modern browser with WebAssembly support for background removal

The first background-removal run downloads model/runtime assets and can take noticeably longer than later runs. Speed depends on the user's device and connection.

## Local development

From the repository root:

```bash
npm install
npm run dev:web
```

Production checks:

```bash
npm run test:web
npm run typecheck:web
npm run build:web
```

The static production output is generated in `apps/web/out`.

## Public configuration

Copy `.env.example` to a local environment file if configuration is needed. Only browser-safe public values belong in `NEXT_PUBLIC_*` variables.

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
NEXT_PUBLIC_ADSENSE_CLIENT=
```

`NEXT_PUBLIC_ADSENSE_CLIENT` is a public AdSense publisher identifier, not a secret credential. This repository intentionally does not hard-code the production identifier. `apps/web/scripts/prepare-public.mjs` generates `public/ads.txt` during a configured production build.

**Never commit passwords, private API keys, database passwords, service-role keys, access tokens, session cookies, OTPs, recovery codes, private connection strings, or hosting credentials.** Environment files are ignored except for `.env.example`.

## Static deployment

Any static host that can run Node.js 22 during the build can deploy the site.

- Build command: `npm install && npm run build:web`
- Publish directory: `apps/web/out`
- Set the production `NEXT_PUBLIC_SITE_URL` in the hosting environment.
- Set `NEXT_PUBLIC_ADSENSE_CLIENT` only if AdSense is being used.

No database, background-removal server, GPU instance, Python service, or model API key is required for the current image tools.

## Passport-photo note

FlytheBG provides sizing and print-layout utilities. It does not guarantee that an image will be accepted by a passport, visa, government, school, employer, or other authority. Always verify the official photo specification for the intended document.

## Third-party licensing

FlytheBG integrates `@imgly/background-removal`. IMG.LY publishes that package under its upstream licence. Review and comply with the upstream licence and terms before redistributing, modifying, or operating covered software. This README is not legal advice.

## Contact

`stackpilotfe@outlook.com`
