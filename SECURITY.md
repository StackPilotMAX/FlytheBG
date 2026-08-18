# Security Policy

## Reporting a security issue

Please report security issues privately by email to `stackpilotfe@outlook.com`.

Do not open a public GitHub issue containing passwords, tokens, cookies, recovery codes, private connection strings, personal data, or sensitive images.

When reporting an image-processing problem, start with a written description. Do not attach a sensitive photo unless it is genuinely necessary to reproduce the issue.

## Secrets

FlytheBG's public repository must not contain private credentials. Never commit:

- passwords or one-time passwords
- API secrets or private API keys
- database passwords or private connection strings
- Supabase service-role keys
- hosting access tokens
- session cookies
- recovery codes
- private signing keys or certificates

`NEXT_PUBLIC_*` values are compiled into browser code and therefore must be safe for public exposure.

## Production image architecture

The current production image tools are intentionally browser-only. Source images and generated image blobs should not be added to a server upload API, database, object store, analytics payload, error report, or advertising request without a deliberate privacy/security review and corresponding policy update.

## Supported versions

Security fixes are applied to the current `main` branch. CI runs a blocking production dependency audit, tests, TypeScript checks, and the static production build before changes should be promoted.
