import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy & AI Policy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="17 August 2026">
    <h2>1. Scope</h2>
    <p>This policy describes how FlytheBG handles images, short-lived processing metadata, technical data, optional quality feedback, browser-side AI, and Google AdSense advertising.</p>

    <h2>2. FlytheBG Precision processing</h2>
    <p>When you use FlytheBG Precision, the image is sent through the FlytheBG web service to the private inference service only to provide the requested background-removal result. Raw uploads and generated results are not intentionally written to the PostgreSQL run-metadata database or a permanent image store.</p>
    <p>The web service validates only the small file-signature portion needed to confirm the image type and streams the processing result back to the browser rather than intentionally retaining an extra permanent copy. Server-side request and response bytes are released when processing and response delivery complete; FlytheBG does not wait for your later browser download before deleting a server-side image because the production flow is designed not to keep that image in a persistent server image store in the first place.</p>

    <h2>3. Working images in your browser</h2>
    <p>While you are editing, comparing, cropping, or arranging passport photos, the browser must temporarily keep working image data in memory so the tool can function. FlytheBG uses reduced-size preview buffers where practical and releases temporary object URLs and high-resolution export canvases when they are no longer needed.</p>
    <p>In the current background-removal and passport-sheet download flows, after the browser download has been started, FlytheBG clears the working upload, AI result blobs, previews, cutout, and generated sheet held by the FlytheBG page. This cleanup concerns the website tab&apos;s working memory. It does not delete the PNG that you chose to download from your device, and FlytheBG cannot control normal browser, operating-system, network, or security-product caching outside the application&apos;s own working state.</p>

    <h2>4. IMG.LY Browser AI processing</h2>
    <p>The comparison workflow can also run <a href="https://github.com/imgly/background-removal-js" rel="noreferrer">IMG.LY background-removal software</a> in your browser. The source image is processed on your device for this browser-side result. The browser downloads model/runtime assets from IMG.LY&apos;s configured distribution service. Normal network information needed to deliver those assets may be processed by the asset provider, but FlytheBG does not intentionally upload the source image to IMG.LY for this browser-side inference step.</p>
    <p>The integrated IMG.LY package is third-party software and is distributed under its upstream licence. FlytheBG keeps its integration source publicly available in the FlytheBG GitHub repository. Third-party software can have its own terms, privacy practices, availability, and licensing requirements.</p>

    <h2>5. Passport Photo Maker</h2>
    <p>If you choose the direct-photo option, framing, sheet layout, physical-size conversion, background-color compositing, and PNG generation occur in the browser. If you choose “Remove background first”, FlytheBG first attempts FlytheBG Precision. If that service is unavailable or produces an unusable cutout, the passport tool automatically falls back to IMG.LY on the visitor&apos;s device. For the IMG.LY fallback, FlytheBG does not intentionally send the source photo to IMG.LY; the browser processes the image locally while downloading the model/runtime assets required by the browser package.</p>
    <p>Every removed-background candidate is decoded and checked for visible foreground before sheet creation, so a near-empty transparent result is rejected instead of silently producing a blank or color-only sheet. Print-sheet previews and generated sheets are not intentionally stored in the application database. The download flow releases the working source, cutout, preview canvases, and generated sheet from the FlytheBG tab after the browser download starts.</p>

    <h2>6. Short-lived PostgreSQL run metadata</h2>
    <p>FlytheBG may create a cryptographically random run identifier after private inference. The record contains the random run ID, creation and expiry timestamps, the model provider/variant used, and—only if you submit it—one quality-feedback category. It does not contain the uploaded image, generated PNG, source filename, image URL, account identity, or a training copy of the image.</p>
    <p>Run metadata is configured to expire in less than one hour. A recurring cleanup process deletes expired records. A temporary in-memory fallback may be used if the database is unavailable.</p>

    <h2>7. AI improvement and feedback</h2>
    <p>Your raw uploaded image is not silently added to a training dataset. Optional quality feedback can adjust a small bounded aggregate alpha-mask calibration value for FlytheBG Precision. The production model checkpoint is not automatically retrained from individual uploads.</p>

    <h2>8. Google AdSense advertising</h2>
    <p>FlytheBG is configured to use Google AdSense to support the service. The public AdSense publisher identifier and the authorized-seller record in <code>/ads.txt</code> are intentionally public and are not passwords or private API credentials.</p>
    <p>When AdSense is active, Google and advertising partners may process information such as device and browser information, IP/network information, cookies or similar local-storage identifiers, ad interactions, approximate location inferred from network data, and other information used for ad delivery, measurement, fraud prevention, frequency controls, and—where permitted—personalization. FlytheBG does not intentionally include uploaded image bytes, generated image files, private image URLs, or source filenames in advertising requests.</p>
    <p>Google&apos;s own privacy information is available at <a href="https://policies.google.com/privacy" rel="noreferrer">Google Privacy Policy</a> and <a href="https://policies.google.com/technologies/ads" rel="noreferrer">How Google uses information for advertising</a>.</p>

    <h2>9. Consent and privacy choices</h2>
    <p>For regions where consent or opt-out controls are required, FlytheBG uses or intends to use a Google-certified consent management platform associated with the AdSense account. Visitors may be shown choices for personalized advertising, non-personalized advertising, cookies/local storage, and other data uses depending on their region and the configuration available through Google Privacy &amp; messaging.</p>
    <p>Where required, advertising-related consent choices should be honored without preventing access to the core background-removal, cropping, and passport-photo tools.</p>

    <h2>10. Technical and security data</h2>
    <p>Infrastructure may process limited operational information such as request timing, status codes, error categories, resource usage, and security events. Application logging is designed not to include image binary data or private image URLs.</p>

    <h2>11. Metadata and output</h2>
    <p>Processed image outputs are re-encoded. Source EXIF and other unnecessary image metadata are not intentionally copied into generated PNG results.</p>

    <h2>12. Your choices and rights</h2>
    <p>Quality feedback is optional. You can use the tools and download results without sending a feedback rating. You can also choose “New image” or leave the page to end the current editing session. Where applicable law gives you rights to access, correction, erasure, restriction, objection, withdrawal of consent, or grievance redressal, contact FlytheBG by email. Advertising choices may also be available through the Google consent message shown for your region and Google&apos;s own ad/privacy controls.</p>

    <h2>13. Security</h2>
    <p>The service uses server-side file validation, MIME and magic-byte checks, bounded image sizes and pixel counts, private service communication, internal authentication, request timeouts, rate limiting, bounded inference concurrency, no-store response headers, and short-lived run metadata. No internet service can guarantee absolute security.</p>

    <h2>14. Contact</h2>
    <p>The official contact channel for privacy questions, deletion requests, complaints, security reports, and legal notices is <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a>.</p>
  </LegalPage>;
}
