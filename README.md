<p align="center"><img src="apps/web/public/brand/flythebg-lockup.svg" alt="FlyThe BG" width="360" /></p>
<h1 align="center">FlyThe BG</h1>
<p align="center"><strong>Browser-first image and media tools for background removal, passport photos, and authorized AI-media workflows.</strong></p>
<p align="center"><a href="https://github.com/StackPilotMAX/FlytheBG"><img alt="GitHub stars" src="https://img.shields.io/github/stars/StackPilotMAX/FlytheBG?style=flat" /></a> <img alt="Browser AI" src="https://img.shields.io/badge/AI-browser--first-7c83ff" /> <img alt="Backend" src="https://img.shields.io/badge/image%20processing-local-69d39b" /></p>

FlyThe BG is a user-focused web toolkit. The live product includes a local AI background remover, a measured passport-photo maker, and an AI media-cleanup workspace explicitly labelled for supported Gemini/Veo or other authorized media. The project is independent of Google and Meta.

## User tools

### Gemini Watermark Remover
The `/ai-watermark-remover` page is optimized for the search intent **Gemini watermark remover**. Visitors can select an image or video, choose a supported provider label, use **Auto-detect** to find a likely fixed watermark candidate, inspect the highlighted region, or choose a common corner manually. Image cleanup is local in the browser. Video cleanup is frame-by-frame and exports WebM where the browser supports local recording.

### Background remover
The background-removal workflow uses `@imgly/background-removal` with browser-side model/runtime processing, WebGPU where available, CPU/WASM fallback, adaptive quality selection, conservative edge protection, and an additional interior-detail pass intended to protect likely face and clothing pixels without restoring the outside background.

### Passport Photo Maker
Create physical-size, DPI-aware passport-photo sheets with crop framing, repeated copies, and direct printing/export. Always check the current rules of the authority receiving the photo.

## Privacy architecture
Supported FlyThe BG editing workflows are designed to keep the working media in browser memory rather than sending it to a FlyThe BG image-processing server. The browser still downloads application, model, runtime, font, video, and optional advertising assets as needed.

## Legal and ownership
Google, Gemini, Meta, and Meta AI are trademarks and/or product names of their respective owners. FlyThe BG is an independent project and does not imply sponsorship, partnership, endorsement, or ownership of those brands or their assets. Removing a visible mark does not grant ownership or usage rights to the underlying media. Users are responsible for copyright, licensing, privacy, attribution, and platform-rule compliance. FlyThe BG's automatic detector is a candidate finder, not an official Google or Meta recognition system.

## Links
- Project: https://github.com/StackPilotMAX/FlytheBG
- GitHub profile: https://github.com/StackPilotMAX
- Instagram: https://www.instagram.com/flythebg/
- User dashboard: `/dashboard`
- Watermark remover: `/ai-watermark-remover`
- FAQ: `/faq`
- Terms: `/terms`

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
FlyThe BG integrates `@imgly/background-removal`, ONNX Runtime Web, Next.js, React, Three.js, Instrument Serif, and Inter. Review the upstream licences and notices before redistributing or operating the project.
