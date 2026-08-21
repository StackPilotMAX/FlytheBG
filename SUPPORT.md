# FlytheBG Support

Thanks for helping improve FlytheBG. 💜

## Before opening an issue

Please check:

- the README setup instructions;
- existing open/closed GitHub issues;
- whether the problem reproduces in a current browser;
- whether a browser extension, strict blocker, or private-network policy is preventing model/runtime downloads.

For local development, run:

```bash
npm install
npm run test:web
npm run typecheck:web
npm run build:web
```

## Bug reports

Useful information to include publicly:

- browser name/version;
- operating system/device class;
- approximate device RAM if known;
- whether WebGPU is available;
- the visible error message;
- whether the issue affects background removal, passport editing, print, PNG export, UI, or SEO;
- reproducible steps that do not require sharing a private photo.

## Do not post sensitive information

Never put these in a public issue, PR, screenshot, or log:

- API keys or tokens;
- passwords/OTPs;
- cookies/session headers;
- database credentials;
- hosting credentials;
- identity documents;
- private addresses;
- sensitive personal photographs.

If the problem requires a security-sensitive report, follow [SECURITY.md](SECURITY.md).

## Image problems

Use a non-sensitive/public-domain test image whenever possible. If an issue occurs only with a private image, first describe its properties (dimensions, format, subject/background characteristics) instead of uploading it.

## Feature requests

Feature requests are welcome when they preserve the project's core principles:

- browser-first processing;
- strong privacy defaults;
- no mandatory paid inference backend;
- low-memory mobile support;
- accessible controls;
- transparent behavior about AI limits.

## Public contact

A support email is intentionally not hard-coded into this public repository. A deployer can publish one using `NEXT_PUBLIC_CONTACT_EMAIL`, which is browser-visible by design.
