# Analytics and advertising readiness

The initial build does not load analytics or advertising scripts. This is intentional: background removal does not need them, and a cookie banner should not be shown merely for decoration.

If analytics is enabled later:

- never send image bytes, private image URLs, source filenames, or embedded image metadata;
- restrict events to operational/product actions such as upload started, validation failed, processing completed, processing failed, and download clicked;
- update the Privacy and Cookie pages to match the exact provider and retention behavior;
- add consent gating before loading non-essential scripts where applicable.

If Google Ads or another advertising system is enabled later, implement it only after the consent/legal requirements for the actual operating jurisdictions are established. Do not pre-load advertising tags before required consent.

Google Search Console verification is already prepared through the optional `GOOGLE_SITE_VERIFICATION` environment variable, plus `/robots.txt` and `/sitemap.xml`.
