<p align="center"><img src="apps/web/public/brand/flythebg-lockup.svg" alt="FlytheBG" width="360" /></p>
<h1 align="center">FlytheBG</h1>
<p align="center"><strong>Browser-first image and media tools for background removal, passport photos, and AI watermark workflows.</strong></p>
<p align="center"><a href="https://github.com/StackPilotMAX/FlytheBG"><img alt="GitHub stars" src="https://img.shields.io/github/stars/StackPilotMAX/FlytheBG?style=flat" /></a> <img alt="Browser AI" src="https://img.shields.io/badge/AI-browser--first-7c83ff" /> <img alt="Backend" src="https://img.shields.io/badge/image%20processing-local-69d39b" /></p>

FlytheBG is a user-focused web toolkit. The live product includes a local AI background remover, a measured passport-photo maker, and an AI watermark-removal workspace that is explicitly labelled for **Gemini**, **Meta AI**, or **Both / Other**. The project is independent of Google and Meta.

## User tools

### Gemini Watermark Remover
The `/ai-watermark-remover` page is intentionally optimized for the search intent **Gemini watermark remover** while keeping the provider label clear. Visitors can select an image or video, choose Gemini or Meta AI, choose a common watermark location, and reconstruct the selected region locally in the browser. Video currently uses a conservative preview-frame workflow because full frame-by-frame reconstruction can be very memory-intensive on phones and laptops.

### Meta AI watermark remover
Meta AI is available in the same workspace, but it is labelled separately. Google/Gemini and Meta/Meta AI names, marks, and product assets belong to their respective owners. FlytheBG does not claim affiliation or endorsement.

### Background remover
The background-removal workflow uses `@imgly/background-removal` with browser-side model/runtime processing, WebGPU where available, and CPU/WASM fallback.

### Passport Photo Maker
Create physical-size, DPI-aware passport-photo sheets with crop framing, repeated copies, and direct printing/export. Always check the current rules of the authority receiving the photo.

## If you don't like a watermark-removal result
Keep the original. Try a more accurate watermark-area preset, or do not publish the reconstructed output. Detailed backgrounds, gradients, text, faces, reflections, and moving scenes can produce artifacts because the local utility reconstructs pixels from surrounding content. FlytheBG does not promise perfect removal.

## Prevent future Gemini visible watermarks
If Google Gemini on the web provides a visible Media watermark control for your account, you can check Gemini Settings and turn the visible option off for future image generations. This does **not** remove watermarks from files already saved, and provider settings can change over time.

## Privacy architecture
Supported FlytheBG editing workflows are designed to keep the working media in browser memory rather than sending it to a FlytheBG image-processing server. The browser still downloads application, model, runtime, font, video, and optional advertising assets as needed.

## Legal and ownership
Google, Gemini, Meta, and Meta AI are trademarks and/or product names of their respective owners. FlytheBG is an independent project and does not imply sponsorship, partnership, endorsement, or ownership of those brands or their assets. Removing a visible mark does not grant ownership or usage rights to the underlying media. Users are responsible for copyright, licensing, privacy, attribution, and platform-rule compliance.

## Links
- Project: https://github.com/StackPilotMAX/FlytheBG
- GitHub profile: https://github.com/StackPilotMAX
- Instagram: https://instagram.com/@flythebg
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
FlytheBG integrates `@imgly/background-removal`, ONNX Runtime Web, Next.js, React, Three.js, Instrument Serif, and Inter. Review the upstream licences and notices before redistributing or operating the project.
