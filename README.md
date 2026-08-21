# FlytheBG

FlytheBG is a privacy-focused, browser-only image toolkit for removing backgrounds, cropping transparent PNGs, and creating print-ready passport-photo sheets. The production image-processing path is designed to run locally on the visitor's device without a FlytheBG inference backend.

## Live tools

- **Remove Background** — runs IMG.LY IS-Net locally in the browser. Low-memory devices use the smaller quantized model; capable WebGPU devices can try FP16 for a higher-quality mask and automatically fall back if needed.
- **Local alpha-matte refinement** — eligible cutouts receive a lightweight transparency cleanup pass that reduces isolated faint speckles, fills tiny pinholes inside opaque foreground regions, and modestly increases boundary contrast while preserving semi-transparent pixels.
- **Source-detail restoration** — when inference used a reduced working image and the device has enough memory, FlytheBG can reapply the refined segmentation mask to the higher-resolution source image. Constrained devices skip this extra memory-heavy step.
- **Low-memory mobile guard** — oversized working images are reduced before inference on constrained devices while preserving their aspect ratio. This lowers browser memory pressure on budget phones and older laptops.
- **Crop** — crops the generated transparent PNG locally in the browser.
- **Passport Photo Maker** — optional local background removal, manual drag-to-position framing, zoom, exact physical sizing, background color, multiple copies, A4/4×6/US Letter/custom paper, PNG export, and direct printing at 100% / Actual Size.
- **Interactive 3D local-AI simulator** — a Three.js/WebGL layered scene with background and foreground planes, orbit controls, multiple demo themes, Front View, 3D Exploded View, and an interactive Separation Depth control.
- **Before/after samples** — public-domain / CC0 subject images are used for illustrative transparent-cutout demos.

## Browser-only privacy architecture

The current production image flow has no FlytheBG image-processing API and no image database. Selected photos and generated image blobs stay in browser memory while the tool is being used.

FlytheBG does **not intentionally upload the selected image bytes** to Render, Supabase, or a FlytheBG inference server. The browser still downloads the application, model, and runtime assets required for local inference. Those asset requests do not need the user's selected photo attached to them.

The model/runtime path can use:

1. the bundled `@imgly/background-removal` package;
2. WebGPU when supported and available in a secure context;
3. CPU/WASM as the compute fallback;
4. a browser-safe ESM runtime fallback if a bundled WASM/worker initialization path cannot start correctly.

After a download starts or the tool is reset, FlytheBG releases its working image URLs and in-page image state. A downloaded file, browser/OS caches, extensions, screenshots, or other copies outside the page are outside the application's control.

## Smart model selection and refinement

FlytheBG uses browser capability signals to balance accuracy and reliability:

- reported device memory **8 GB or higher + WebGPU**: try `isnet_fp16` first;
- other devices: use `isnet_quint8` first;
- if FP16 fails: retry with the quantized model;
- if WebGPU fails: retry with CPU/WASM;
- successful cutouts up to the refinement pixel guard can receive local alpha-matte cleanup;
- resized inference masks can be reapplied to higher-resolution source imagery when the device-memory guard permits it.

The low-memory working-edge guard currently uses approximately:

- 2 GB or less: 1400 px maximum working edge;
- 4 GB or less: 1800 px;
- 6 GB or less: 2400 px;
- higher-memory devices: no automatic edge reduction from this guard.

The source-detail restoration guard is deliberately stricter than normal inference. Devices reporting 4 GB or less skip full-resolution restoration, while higher-memory devices can restore source detail only up to bounded pixel counts. This avoids turning an optional quality enhancement into a mobile memory crash.

Alpha refinement is conservative post-processing, not a second AI model. It improves the presentation of the model's transparency mask but cannot recreate foreground detail that the segmentation model did not detect.

This is a reliability strategy, not a guarantee that every image will process successfully on every 3 GB phone. Browser memory limits, other open tabs, browser versions, image dimensions, and device GPU/CPU capabilities still matter.

## Technology

- Next.js 15.5.x static export
- React 19
- Three.js 0.185.x + OrbitControls
- `@imgly/background-removal` 1.7.0
- IMG.LY `isnet_quint8` for the lightweight path and `isnet_fp16` for capable WebGPU devices
- `onnxruntime-web` pinned for the IMG.LY runtime
- Canvas APIs for local previews, alpha cleanup, cropping, passport framing, and print-sheet generation
- No server-side image inference service

The application is exported as static HTML/CSS/JavaScript, so a static host can serve it without paying for image-inference compute.

## Requirements

- Node.js 22
- npm
- A modern browser with WebAssembly support for background removal
- WebGPU is optional; CPU/WASM is the fallback

The first background-removal run downloads model/runtime assets and can take noticeably longer than later runs. Speed depends on the user's device and connection.

## Run FlytheBG locally from GitHub

Clone the repository and run it from the project root:

```bash
git clone https://github.com/StackPilotMAX/FlytheBG.git
cd FlytheBG
npm install
npm run dev:web
```

Open:

```text
http://localhost:3000
```

`localhost` is treated as a secure context by modern browsers, so supported browsers can expose WebGPU during local development. If WebGPU is unavailable, FlytheBG can use CPU/WASM.

Production checks:

```bash
npm run test:web
npm run typecheck:web
npm run build:web
```

The static production output is generated in:

```text
apps/web/out
```

## Public configuration

Copy `.env.example` to a local environment file if configuration is needed. Only browser-safe public values belong in `NEXT_PUBLIC_*` variables.

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

`NEXT_PUBLIC_ADSENSE_CLIENT` is a public AdSense publisher identifier, not a secret credential. This repository intentionally does not hard-code the production identifier. `apps/web/scripts/prepare-public.mjs` generates `public/ads.txt` during a configured production build.

**Never commit passwords, private API keys, database passwords, service-role keys, access tokens, session cookies, OTPs, recovery codes, private connection strings, or hosting credentials.** Environment files are ignored except for `.env.example`.

## Static deployment

Any static host that can run Node.js 22 during the build can deploy the site.

- Build command: `npm install && npm run build:web`
- Publish directory: `apps/web/out`
- Set production `NEXT_PUBLIC_SITE_URL=https://flythebg.com`.
- Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` if using Search Console HTML-tag verification.
- Set `NEXT_PUBLIC_ADSENSE_CLIENT` only if AdSense verification/ads are being used.

No database, background-removal server, GPU instance, Python service, or model API key is required for the current image tools.

## Google Search Console checklist

After deploying a production build:

1. Verify the `flythebg.com` property in Google Search Console.
2. Inspect `https://flythebg.com/` with URL Inspection and request indexing after important SEO/favicon changes.
3. Submit `https://flythebg.com/sitemap.xml` in the Sitemaps report.
4. Check the Page Indexing report for blocked, duplicate, canonical, or crawl issues.
5. Confirm `https://flythebg.com/icon.svg` and `https://flythebg.com/robots.txt` load publicly.
6. Use `site:flythebg.com` only as a rough spot-check; Search Console's indexing reports are more authoritative.

The homepage and remover route contain focused metadata for natural queries such as `free background remover`, `remove background online`, `AI background remover`, `transparent background maker`, `no upload background remover`, and the brand variants `FlytheBG` / `Fly the BG`. These tags help describe the page but do not guarantee rankings by themselves.

Search ranking for broad phrases such as “remove bg” cannot be forced by Search Console. Ranking depends on crawling, indexing, relevance, competition, content quality, links, page experience, and time.

## AdSense review mode

The current production layout uses the configured AdSense publisher ID only for the supported `google-adsense-account` verification meta tag and generated `ads.txt` record. It intentionally does **not** load the global AdSense/Auto Ads JavaScript while the site is being reviewed, so automated top/side placeholders cannot push the real page content below the fold.

No ad unit IDs are committed or invented. After site approval, manual responsive ad units can be added only in reserved layout slots. `adsense-safety.css` includes safe primitives for reserved ad space and responsive placements.

Keep ads separated from upload, download, crop, print, and other tool controls.

## Passport-photo note

FlytheBG provides sizing, manual framing, background-color, layout, download, and print utilities. It does not guarantee that an image will be accepted by a passport, visa, government, school, employer, or other authority. Always verify the official photo specification for the intended document.

## Demo image licensing

Homepage sample subjects are intentionally sourced from public-domain / CC0 Wikimedia Commons files. The current sample set includes:

- Eliza Cook transparent portrait — Wikimedia Commons, CC0/public domain.
- Danaus genutia transparent-background butterfly — Wikimedia Commons, public domain/CC0.

The synthetic “before” backgrounds are generated by FlytheBG's page styling; they are not presented as original source photographs.

## Third-party licensing

FlytheBG integrates `@imgly/background-removal` and Three.js. Review and comply with upstream licences and terms before redistributing, modifying, or operating covered software. This README is not legal advice.

## Contact

`stackpilotfe@outlook.com`
