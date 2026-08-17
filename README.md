# FlytheBG

FlytheBG is a privacy-focused browser image toolkit for removing image backgrounds, cropping transparent PNGs, and creating print-ready passport-photo sheets.

## What the public site does

- **Browser background removal** — IMG.LY IS-Net runs on the visitor's device.
- **Automatic fallback** — the quantized IMG.LY model is tried first; FP16 is used if the first result fails validation.
- **Passport Photo Maker** — optional browser background removal, exact cm/mm/in sizing, photo background color, multiple copies, A4/4×6/US Letter/custom paper, and memory-safe PNG export.
- **Crop tool** — crop a generated transparent PNG before download.
- **Privacy-first image lifecycle** — the current production image workflow does not intentionally send image bytes to FlytheBG, Render, Supabase, or an image database.

## Image privacy

The current production image tools are designed to keep source images in the browser. IMG.LY model/runtime assets are downloaded so local inference can run, but FlytheBG does not intentionally include the selected photo in those model-asset requests.

Working image data is held temporarily by the page while the user edits. After a download starts, FlytheBG releases the working source, cutout, previews, object URLs, and generated passport sheet held by the page. The downloaded file remains on the user's device.

See the in-site **Privacy & AI Policy** for the precise description and limitations.

## Browser compatibility

Background removal requires a modern browser with WebAssembly support. Current Chrome, Edge, Firefox, and other modern Chromium-based browsers are the main target. Model download and processing speed depend on the device and network connection.

## Passport-photo note

FlytheBG provides sizing and print-layout tools but does not guarantee acceptance by any passport, visa, government, school, or employer authority. Always check the applicable photo specification before printing or submitting an image.

## Public configuration

The frontend may use public build-time values such as the site URL, app name, upload-size limit, and Google AdSense publisher ID. These are not private credentials.

**Never commit passwords, API secrets, database passwords, service-role keys, access tokens, cookies, OTPs, recovery codes, or private connection strings to this repository.**

## Third-party software

FlytheBG currently integrates `@imgly/background-removal`. Third-party components remain subject to their upstream licences and terms. Review those obligations before redistributing or modifying covered software.

## Contact

`stackpilotfe@outlook.com`
