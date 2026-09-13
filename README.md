<p align="center">
  <img src="apps/web/public/brand/flythebg-lockup.svg" alt="FlyThe BG" width="360" />
</p>

<h1 align="center">FlyThe BG</h1>

<p align="center"><strong>Free, browser-first image tools designed around local processing, privacy, and open collaboration.</strong></p>

<p align="center">
  <a href="https://github.com/StackPilotMAX/FlytheBG"><img alt="GitHub stars" src="https://img.shields.io/github/stars/StackPilotMAX/FlytheBG?style=flat" /></a>
  <a href="LICENSE"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-blue.svg" /></a>
  <img alt="Browser first" src="https://img.shields.io/badge/architecture-browser--first-7c83ff" />
  <img alt="Non-commercial" src="https://img.shields.io/badge/project-non--commercial-2f855a" />
</p>

FlyThe BG is an independent, free, non-commercial open-source web toolkit for useful image and media workflows. It is maintained as a community project and is not a commercial SaaS product.

## What FlyThe BG provides

### Background remover

Remove image backgrounds with browser-side processing using `@imgly/background-removal`, WebGPU where available, and CPU/WASM fallback. The workflow includes adaptive quality selection and conservative edge/detail handling.

### Passport Photo Maker

Create physical-size, DPI-aware passport-photo sheets with crop framing, repeated copies, and direct printing/export. Always check the current requirements of the authority receiving the photo.

### Visible watermark cleanup

The `/ai-watermark-remover` workflow is intentionally limited to supported visible pixel overlays. It provides before/after inspection and browser-side processing for supported media.

It does **not** claim to remove, defeat, score, or falsify invisible provenance systems such as SynthID or other content-authenticity technologies.

## Project principles

FlyThe BG is built around a few simple principles:

- **Free to use:** the public project is intended to remain accessible without subscriptions or paid access.
- **Open source:** the code is published under AGPL-3.0 so others can study, modify, and share it under the license terms.
- **Browser first:** supported editing workflows prefer processing in the user's browser rather than uploading working media to a FlyThe BG processing server.
- **Privacy conscious:** the project avoids unnecessary collection of users' working images.
- **Responsible editing:** tools should not be presented as a way to bypass ownership, licensing, privacy, platform, or provenance requirements.
- **Community driven:** improvements are welcome through issues, documentation, testing, and code contributions.

## Privacy architecture

Supported FlyThe BG editing workflows are designed to keep working media in browser memory rather than sending it to a FlyThe BG image-processing server. The browser still downloads application, model, runtime, font, video, and other assets as needed.

This architecture is not a promise that every browser request is local: external application assets, analytics, search/discovery services, or other integrations may still create network requests. Review the site's Privacy and Model Disclosure pages for current details.

## Responsible use

Use FlyThe BG only with media you own or are authorized to edit. Removing a visible mark does not transfer ownership, erase licensing conditions, eliminate attribution requirements, or override platform rules. Users remain responsible for copyright, privacy, publicity, trademark, licensing, disclosure, contractual, and other applicable obligations.

FlyThe BG does not forge camera EXIF, capture timestamps, camera make/model, or other metadata to make edited media appear to have been camera-captured. A visually cleaned file must not be represented as proof that media originated from a physical camera or was never AI-generated.

## Open source and project status

FlyThe BG is a **non-commercial open-source project** licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See [`LICENSE`](LICENSE) for the full license text.

The repository includes a top-level [Code of Conduct](CODE_OF_CONDUCT.md), [Contributing Guide](CONTRIBUTING.md), and [Security Policy](SECURITY.md).

The project is publicly deployed on Netlify for community use. This site is powered by Netlify.

FlyThe BG does not sell subscriptions, paid hosting, commercial support, or paid access to its open-source software. The project is maintained as a non-commercial community project.

## Community

- **Source code:** https://github.com/StackPilotMAX/FlytheBG
- **Issues:** https://github.com/StackPilotMAX/FlytheBG/issues
- **Discussions:** https://github.com/StackPilotMAX/FlytheBG/discussions
- **Project updates:** https://www.instagram.com/flythebg/
- **Code of Conduct:** [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
- **Contributing:** [`CONTRIBUTING.md`](CONTRIBUTING.md)
- **Security:** [`SECURITY.md`](SECURITY.md)

Please use public issues for normal bugs and feature discussions. Do not publish security vulnerabilities or private user data in public issues.

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

## Contact

For project questions, feedback, collaboration, or responsible disclosure, contact **stackpilotfe@outlook.com**.
