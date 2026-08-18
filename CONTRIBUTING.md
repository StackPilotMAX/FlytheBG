# Contributing to FlytheBG

Thanks for helping improve FlytheBG.

## Development setup

Use Node.js 22.

From the repository root:

```bash
npm install
npm run dev:web
```

Before submitting a change, run:

```bash
npm --workspace apps/web audit --omit=dev --audit-level=high
npm run test:web
npm run typecheck:web
npm run build:web
```

The production application must continue to export successfully to `apps/web/out`.

## Architecture rules

FlytheBG's current production image tools are browser-only. Please preserve these constraints unless a change explicitly redesigns the product architecture:

- do not add a server-side background-removal model
- do not upload source images or generated image blobs to a FlytheBG database or object store
- do not require a GPU service or paid inference API for the existing tools
- keep IMG.LY quantized as the first browser attempt and FP16 as the fallback
- keep image editing, cropping, passport framing, layout, and export in the browser
- keep decorative visuals isolated from operational controls

## UI and accessibility

Operational clarity comes before decorative complexity. New UI should remain responsive at narrow widths, avoid horizontal overflow, provide visible keyboard focus, use native controls where practical, respect reduced-motion preferences, and never place decorative canvas layers above clickable tool controls.

## Public repository safety

Do not commit passwords, private API keys, service-role keys, database credentials, hosting tokens, cookies, OTPs, recovery codes, or private connection strings. Browser-exposed `NEXT_PUBLIC_*` configuration must be safe to publish.

The production AdSense publisher identifier is a public identifier required by Google on an active site, but the repository intentionally keeps the production value out of committed source and generates `ads.txt` from the hosting environment during the build.

## Third-party software

Changes involving `@imgly/background-removal`, `onnxruntime-web`, Next.js, or other dependencies must remain compatible with their published package requirements and upstream licences. Do not bypass dependency conflicts with `--force` or `--legacy-peer-deps` merely to make CI pass.
