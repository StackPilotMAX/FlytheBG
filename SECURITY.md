# Security Policy

FlytheBG is a public, browser-first project. Protecting user images, credentials, and contributor data is a design requirement, not an optional deployment setting.

## Reporting a security issue

Do **not** post exploit details, credentials, sensitive images, personal data, private URLs, or access tokens in a public GitHub issue.

Preferred reporting flow:

1. Check the repository **Security** tab for GitHub's private vulnerability-reporting option and use it when available.
2. If private reporting is not available, open a minimal public issue that says you need a private security contact channel **without including the vulnerability details or any secrets**.
3. A deployer may intentionally publish a public support/security address through `NEXT_PUBLIC_CONTACT_EMAIL`; remember that this value is public browser configuration, not a secret.

When reporting an image-processing problem, begin with a written reproduction description. Do not attach a sensitive personal photo unless it is genuinely required and you have a private, appropriate channel.

## Secrets: never commit them

FlytheBG's public repository must never contain:

- passwords or one-time passwords;
- private API keys, bearer tokens, or OAuth secrets;
- database passwords or private connection strings;
- Supabase service-role keys or equivalent privileged credentials;
- hosting/deployment access tokens;
- session cookies or authentication headers;
- recovery codes;
- private signing keys or certificates;
- cloud provider credentials;
- private addresses, identity documents, or other personal data that was not intentionally made public.

### `NEXT_PUBLIC_*` is public

Next.js embeds `NEXT_PUBLIC_*` values into browser-visible code. They **must never contain secrets**.

Safe examples include a deliberately public site URL, public application name, public publisher identifier, or an email address the owner explicitly intends to publish.

Unsafe examples include API secrets, private keys, database credentials, private contact information, or anything that should remain confidential.

## Repository protections

The repository intentionally ignores local environment/configuration and common private-key formats, including `.env*`, `*.pem`, `*.key`, `*.p12`, and `*.pfx` (with `.env.example` retained as public documentation).

Contributors should also:

- inspect `git diff --staged` before every commit;
- never paste production credentials into issues, PR descriptions, screenshots, or logs;
- use fake/example values in tests and documentation;
- rotate a credential immediately if it is accidentally exposed;
- remember that deleting a secret from the latest commit does not automatically erase it from Git history.

If a real secret has been committed, treat it as compromised first. Rotate/revoke it before considering any history-rewrite cleanup.

## Browser-only production image architecture

The intended production image path runs on the visitor's device. Source images and generated image blobs should not be added to a server upload API, database, storage bucket, analytics payload, telemetry event, error report, advertising request, or third-party AI endpoint without an explicit privacy/security review and corresponding policy update.

The current architecture does not require a paid FlytheBG inference server, GPU service, image database, or model API credential.

## Third-party assets

The browser downloads application/model/runtime assets required for local inference. Dependency upgrades should be reviewed carefully and CI should continue to audit production dependencies.

Do not silently add remote scripts, trackers, image-upload endpoints, or credentialed APIs to the image-processing path.

## Supported version

Security fixes are applied to the current `main` branch. Before promotion, CI should pass:

- production dependency audit;
- regression tests;
- TypeScript typecheck;
- production static build.
