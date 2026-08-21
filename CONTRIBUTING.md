# Contributing to FlytheBG

Thanks for helping improve FlytheBG. 💜

Contributions are welcome for browser compatibility, performance, accessibility, image quality, passport-photo workflows, documentation, tests, and UI polish.

## Development setup

Use Node.js 22.

```bash
npm install
npm run dev:web
```

Before submitting a change:

```bash
npm audit --omit=dev --audit-level=high
npm run test:web
npm run typecheck:web
npm run build:web
```

The production application must continue to export successfully to `apps/web/out`.

## Architecture rules

FlytheBG's existing production image tools are intentionally browser-first. Preserve these constraints unless a proposal explicitly redesigns the product architecture and receives careful privacy/cost review:

- do not add a mandatory server-side background-removal model;
- do not upload source images or generated image blobs to a FlytheBG database or object store;
- do not require a paid GPU service or inference API for the existing tools;
- use the small quantized browser model for constrained devices;
- allow the FP16 path only when device capability makes it reasonable, with quantized fallback;
- keep WebGPU → CPU/WASM runtime recovery;
- keep image editing, alpha refinement, cropping, passport framing, per-copy sheet positioning, print, and export in the browser;
- keep decorative WebGL/canvas visuals isolated from operational controls.

## Low-memory devices matter

A change that looks good on a desktop can still break the product on a budget phone. Avoid unbounded canvases, unnecessary full-resolution copies, giant textures, and multiple simultaneous model instances.

When adding image-quality improvements, provide a memory guard or safe fallback whenever practical.

## UI and accessibility

Operational clarity comes before decorative complexity. New UI should:

- remain responsive at narrow widths;
- avoid horizontal overflow;
- provide visible keyboard focus;
- use native controls where practical;
- preserve touch interaction;
- respect `prefers-reduced-motion`;
- never place decorative layers above clickable tool controls;
- avoid hover-only functionality when a touch/keyboard alternative is required.

The shared FAQ behavior intentionally adds hover-open animation for fine-pointer desktop users while preserving native `<details>` interaction for touch and keyboard users.

## Public repository safety

Never commit or paste into issues/PRs:

- passwords, OTPs, or recovery codes;
- private API keys or bearer tokens;
- service-role/database credentials;
- hosting/deployment tokens;
- cookies/session headers;
- private signing keys/certificates;
- sensitive personal photos or identity documents;
- private addresses or other personal information that was not intentionally made public.

Every `NEXT_PUBLIC_*` variable is browser-visible and must be safe to publish.

Use fake/example values in documentation and tests. Review staged changes before committing.

## Bug reports and test images

Prefer public-domain, CC0, synthetic, or otherwise non-sensitive images for reproduction cases. Do not require contributors to upload private photos to demonstrate an image-processing problem.

See [SUPPORT.md](SUPPORT.md) and [SECURITY.md](SECURITY.md).

## Third-party software

Changes involving `@imgly/background-removal`, `onnxruntime-web`, Three.js, Next.js, React, Josefin Sans, or other dependencies must remain compatible with upstream package requirements and licences.

Do not bypass dependency conflicts with `--force` or `--legacy-peer-deps` merely to make CI pass.
