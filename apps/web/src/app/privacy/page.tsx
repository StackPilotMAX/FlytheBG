import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy & AI Policy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="15 August 2026">
    <h2>1. Scope</h2>
    <p>This policy describes how FlytheBG handles images, short-lived processing metadata, technical data, and optional quality feedback when you use the background-removal service.</p>

    <h2>2. Uploaded and processed images</h2>
    <p>Images are processed only to provide the background-removal feature you request. Raw uploads and generated results are not intentionally written to the PostgreSQL run-metadata database. Request bytes are handled by the web and private inference services for processing and are released after the request completes.</p>
    <p>If temporary image object storage is introduced later for queues, retries, or batch processing, it must use an automated deletion lifecycle of no more than one hour unless a different period is clearly disclosed before collection.</p>

    <h2>3. Short-lived PostgreSQL run metadata</h2>
    <p>FlytheBG may create a cryptographically random run identifier after processing. The database record contains the random run ID, creation and expiry timestamps, the model provider/variant used, and—only if you submit it—one quality-feedback category. It does not contain the uploaded image, generated PNG, source filename, image URL, account identity, or a training copy of the image.</p>
    <p>Run metadata is configured to expire in less than one hour. The service also runs a recurring cleanup process to delete expired records. A temporary in-memory fallback may be used if the database is unavailable.</p>

    <h2>4. AI improvement and learning</h2>
    <p>Your raw uploaded image is not silently added to a model-training dataset and is not used to retrain the IS-Net checkpoint. After a result is shown, you may optionally choose a quality response such as “Looks great”, “Too much removed”, or “Background left”.</p>
    <p>Accepted feedback can adjust a small bounded aggregate alpha-mask calibration value. The underlying model checkpoint remains immutable at runtime. Aggregate calibration values may persist because they do not contain the source image or a user identifier.</p>

    <h2>5. Technical and security data</h2>
    <p>Infrastructure may process limited operational information such as request timing, status codes, error categories, resource usage, and security events. Application logging is designed not to include image binary data or private image URLs.</p>

    <h2>6. Metadata and output</h2>
    <p>Processed output is re-encoded as PNG. Source EXIF and other unnecessary image metadata are not intentionally copied into the generated output.</p>

    <h2>7. Your choices</h2>
    <p>Quality feedback is optional. You can use background removal and download the result without sending a feedback rating. Where applicable law gives you rights to access, correction, erasure, withdrawal of consent, or grievance redressal, contact FlytheBG by email.</p>

    <h2>8. Security</h2>
    <p>The service uses server-side file validation, MIME and magic-byte checks, bounded image sizes and pixel counts, private service communication, internal authentication, request timeouts, rate limiting, bounded inference concurrency, and short-lived run metadata. No internet service can guarantee absolute security.</p>

    <h2>9. Service providers and international processing</h2>
    <p>FlytheBG relies on hosting and infrastructure providers that may process limited service data in the regions where the service is operated. This policy must be updated before materially new analytics, advertising, authentication, storage, or processing technologies are enabled.</p>

    <h2>10. Contact</h2>
    <p>The official contact channel for privacy questions, deletion requests, complaints, security reports, and legal notices is <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a>. Email is used as the single official channel so requests remain written, centralized, and auditable and so FlytheBG does not need to collect phone numbers for support.</p>
  </LegalPage>;
}
