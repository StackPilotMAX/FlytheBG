<p align="center"><img src="apps/web/public/brand/flythebg-lockup.svg" alt="FlyThe BG" width="360" /></p>
<h1 align="center">FlyThe BG</h1>
<p align="center"><strong>Browser-first image and media tools for background removal, passport photos, and authorized media-editing workflows.</strong></p>
<p align="center"><a href="https://github.com/StackPilotMAX/FlytheBG"><img alt="GitHub stars" src="https://img.shields.io/github/stars/StackPilotMAX/FlytheBG?style=flat" /></a> <img alt="Browser AI" src="https://img.shields.io/badge/AI-browser--first-7c83ff" /> <img alt="Backend" src="https://img.shields.io/badge/image%20processing-local-69d39b" /></p>

FlyThe BG is a user-focused web toolkit. The live product includes a local AI background remover, a measured passport-photo maker, and browser-first image/media cleanup for supported, authorized workflows. The project is independent of Google and other third-party brands.

## User tools

### Gemini visible watermark remover
The `/ai-watermark-remover` page focuses on the **visible Gemini sparkle**. The current workflow automatically locates a supported visible watermark candidate from the uploaded media, reconstructs only that small region using the Gemini-specific reverse-alpha method, and provides a before/after inspection before download. The user does not need to enter X/Y coordinates, guess watermark dimensions, paint a blur mask, or tune hidden detection controls.

For video, the first frame establishes the fixed visible watermark region and the same region is reconstructed frame-by-frame in the browser. Video export is WebM where the browser supports local recording.

### Background remover
The background-removal workflow uses `@imgly/background-removal` with browser-side model/runtime processing, WebGPU where available, CPU/WASM fallback, adaptive quality selection, conservative edge protection, and an additional interior-detail pass intended to protect likely face and clothing pixels without restoring the outside background.

### Passport Photo Maker
Create physical-size, DPI-aware passport-photo sheets with crop framing, repeated copies, and direct printing/export. Always check the current rules of the authority receiving the photo.

## Visible watermark vs. invisible provenance

The watermark-removal workflow is intentionally limited to **visible pixel overlays**. It does not claim to remove, defeat, score, or falsify invisible provenance technologies such as SynthID or other content-authenticity systems.

FlyThe BG does **not** forge camera EXIF, capture timestamps, camera make/model, or other metadata to make edited media appear to have been camera-captured. A visually cleaned file must not be represented as proof that the media originated from a physical camera or was never AI-generated.

## Privacy architecture
Supported FlyThe BG editing workflows are designed to keep the working media in browser memory rather than sending it to a FlyThe BG image-processing server. The browser still downloads application, model, runtime, font, video, and optional advertising assets as needed.

## Responsible use and legal notice

Use FlyThe BG only with media you own or are authorized to edit. Removing a visible mark does not transfer ownership, erase licensing conditions, eliminate attribution requirements, or override platform rules. Users remain responsible for copyright, privacy, publicity, trademark, licensing, disclosure, contractual, and other applicable obligations.

**Output disclaimer:** FlyThe BG provides automated editing software on an as-available basis and does not warrant that an output will be accurate, complete, artifact-free, fit for a particular purpose, accepted by a platform or authority, or legally suitable for a user's intended use. Users are solely responsible for reviewing every output and for deciding whether and how it may be published, distributed, submitted, or otherwise used. To the fullest extent permitted by applicable law, FlyThe BG and its contributors disclaim responsibility for claims, losses, disputes, takedowns, intellectual-property complaints, regulatory consequences, contractual disputes, or other damages arising from a user's source media, edited output, publication, distribution, or representation of an output. Nothing in this repository or website constitutes legal advice; users should obtain qualified professional advice when the intended use presents material legal, copyright, privacy, licensing, contractual, or platform-policy risk.

Google, Gemini, Veo, and other third-party names, marks, and product assets belong to their respective owners. FlyThe BG is an independent project and does not imply sponsorship, partnership, endorsement, or ownership of those brands or assets.

## Links
- Project: https://github.com/StackPilotMAX/FlytheBG
- GitHub profile: https://github.com/StackPilotMAX
- Instagram: https://www.instagram.com/flythebg/
- User dashboard: `/dashboard`
- Visible watermark remover: `/ai-watermark-remover`
- FAQ: `/faq`
- Terms: `/terms`
- Privacy: `/privacy`

## Local development

Requirements: Node.js 22, npm, and a modern WebAssembly-capable browser. WebGPU is optional.

```bash
git clone https://github.com/StackPilotMAX/FlytheBG.git
cd FlytheBG
npm install
npm run dev:web
```

Production checks:

```bash
npm run test:web
npm run typecheck:web
npm run build:web
```

The static production output is `apps/web/out`.

## Third-party software
FlyThe BG integrates `@imgly/background-removal`, `@pilio/gemini-watermark-remover`, ONNX Runtime Web, Next.js, React, Three.js, Instrument Serif, and Inter. Review the upstream licences and notices before redistributing or operating the project.
