# Browser-only architecture

FlytheBG's current public image workflow is intentionally simple:

1. A visitor selects an image in the browser.
2. IMG.LY's quantized IS-Net model is tried on the device.
3. If that result fails validation, IMG.LY FP16 is tried on the same device.
4. The user can crop the result or use it in Passport Photo Maker.
5. The browser creates the downloadable PNG or print sheet.
6. After download starts, FlytheBG releases the working source, cutout, previews, object URLs, and generated sheet held by the page.

The current production image tools do not intentionally upload image bytes to Render, Supabase, or a FlytheBG image database.

## Important limits

Browser and operating-system caches, downloaded files, screenshots, extensions, and copies created outside the FlytheBG page are outside the application's control.

Browser AI requires modern WebAssembly-capable browsers and downloads third-party model/runtime assets from IMG.LY infrastructure.

## Secrets

This public repository must never contain passwords, API secrets, database passwords, Supabase service-role keys, private connection strings, access tokens, session cookies, OTPs, or recovery codes.
