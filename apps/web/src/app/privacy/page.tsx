import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy & AI Policy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="16 August 2026">
    <h2>1. Scope</h2>
    <p>This policy describes how FlytheBG handles images, short-lived processing metadata, technical data, optional quality feedback, browser-side AI, and advertising if advertising is enabled.</p>

    <h2>2. FlytheBG Precision processing</h2>
    <p>When you use FlytheBG Precision, the image is sent through the FlytheBG web service to the private inference service to provide the requested background-removal result. Raw uploads and generated results are not intentionally written to the PostgreSQL run-metadata database. Request bytes are released after processing completes.</p>

    <h2>3. Browser AI processing</h2>
    <p>The comparison workflow can also run a second background-removal model in your browser. The source image is processed on your device for this result. The browser downloads the required model/runtime assets from the configured IMG.LY distribution service. Normal network metadata required to deliver those assets may be processed by that provider, but FlytheBG does not intentionally send the uploaded image to IMG.LY for the browser-side inference step.</p>

    <h2>4. Passport Photo Maker</h2>
    <p>If you choose the direct-photo option, framing, sheet layout, physical-size conversion, and PNG generation occur in the browser. If you choose “Remove background first”, FlytheBG Precision processes the image before the browser creates the print sheet. Print-sheet previews and generated sheets are not intentionally stored in the application database.</p>

    <h2>5. Short-lived PostgreSQL run metadata</h2>
    <p>FlytheBG may create a cryptographically random run identifier after private inference. The record contains the random run ID, creation and expiry timestamps, the model provider/variant used, and—only if you submit it—one quality-feedback category. It does not contain the uploaded image, generated PNG, source filename, image URL, account identity, or a training copy of the image.</p>
    <p>Run metadata is configured to expire in less than one hour. A recurring cleanup process deletes expired records. A temporary in-memory fallback may be used if the database is unavailable.</p>

    <h2>6. AI improvement and feedback</h2>
    <p>Your raw uploaded image is not silently added to a training dataset. Optional quality feedback can adjust a small bounded aggregate alpha-mask calibration value for FlytheBG Precision. The production model checkpoint is not automatically retrained from individual uploads.</p>

    <h2>7. Advertising and consent</h2>
    <p>FlytheBG can be configured to load Google AdSense only after the operator supplies a real AdSense publisher ID. When advertising is enabled, Google and its partners may process device, network, cookie, or similar information for ad delivery, measurement, fraud prevention, and—where permitted—personalization. FlytheBG should use any consent controls required for the visitor’s region before enabling non-essential advertising technologies.</p>

    <h2>8. Technical and security data</h2>
    <p>Infrastructure may process limited operational information such as request timing, status codes, error categories, resource usage, and security events. Application logging is designed not to include image binary data or private image URLs.</p>

    <h2>9. Metadata and output</h2>
    <p>Processed image outputs are re-encoded. Source EXIF and other unnecessary image metadata are not intentionally copied into generated PNG results.</p>

    <h2>10. Your choices</h2>
    <p>Quality feedback is optional. You can use the tools and download results without sending a feedback rating. Where applicable law gives you rights to access, correction, erasure, withdrawal of consent, or grievance redressal, contact FlytheBG by email.</p>

    <h2>11. Security</h2>
    <p>The service uses server-side file validation, MIME and magic-byte checks, bounded image sizes and pixel counts, private service communication, internal authentication, request timeouts, rate limiting, bounded inference concurrency, and short-lived run metadata. No internet service can guarantee absolute security.</p>

    <h2>12. Contact</h2>
    <p>The official contact channel for privacy questions, deletion requests, complaints, security reports, and legal notices is <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a>.</p>
  </LegalPage>;
}
