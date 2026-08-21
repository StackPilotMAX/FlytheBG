# FlytheBG Production Runbook

This file documents the production setup for the current browser-only FlytheBG application.

## Production source of truth

- Repository: `StackPilotMAX/FlytheBG`
- Production branch: `main`
- Framework: Next.js static export
- Build command: `npm install && npm run build:web`
- Publish directory: `apps/web/out`
- Image inference: browser-side only
- Required paid inference server: none
- Required database: none
- Required GPU service: none

Do not merge old experimental branches back into `main` unless their changes are reviewed against the current production tree. Old branches may contain obsolete architecture or UI and are not production dependencies.

## Render free static-site settings

Use a Render **Static Site**, not a Web Service.

- Git repository: `https://github.com/StackPilotMAX/FlytheBG.git`
- Branch: `main`
- Build command: `npm install && npm run build:web`
- Publish directory: `apps/web/out`
- Auto deploy: enabled
- Plan: free

Recommended public build-time variables:

```text
NEXT_PUBLIC_SITE_URL=https://flythebg.com
NEXT_PUBLIC_APP_NAME=FlytheBG
NEXT_PUBLIC_UPLOAD_MAX_MB=12
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
```

Every `NEXT_PUBLIC_*` value is browser-visible. Never put passwords, private API keys, service-role keys, database credentials, hosting tokens, cookies, OTPs, recovery codes, or other secrets in these variables.

## Domain checklist

After the Render static site is created:

1. Add `flythebg.com` as a custom domain in Render.
2. Add `www.flythebg.com` too if you want the `www` hostname.
3. Copy the DNS records Render displays into the DNS panel at the company where the domain was purchased.
4. Do not invent DNS values; use the exact records Render shows for this site.
5. Wait for Render to verify the domain and issue TLS/HTTPS.
6. Confirm `https://flythebg.com/`, `/robots.txt`, `/sitemap.xml`, and `/icon.svg` all load publicly.

## Google Search Console checklist

Prefer a **Domain property** for `flythebg.com` because it covers HTTPS/HTTP and all subdomains.

1. Open Google Search Console and add property `flythebg.com` using the Domain option.
2. Copy Google's TXT verification record.
3. Add that TXT record at your domain DNS provider exactly as Google shows it.
4. Return to Search Console and click Verify after DNS propagation.
5. Open Sitemaps and submit `https://flythebg.com/sitemap.xml`.
6. Use URL Inspection for `https://flythebg.com/` and request indexing after the production deployment is live.
7. Inspect important routes such as `/remove-background` and `/features/passport-photo` and request indexing when needed.
8. Watch Page Indexing, Core Web Vitals, HTTPS, and Security Issues reports.

Search Console can request crawling and expose indexing problems, but it cannot guarantee rankings for broad search terms.

## Safe release process

1. Make changes on a feature branch.
2. Run GitHub Actions: dependency audit, tests, TypeScript, and production build.
3. Merge only after CI is green.
4. Render auto-deploys `main` when enabled.
5. Verify the production site after deployment.

Merging is not inherently a security threat. The main risks are merging unreviewed code, committing secrets, bypassing CI, or deploying from the wrong branch.
