import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy & AI Policy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="15 August 2026">
    <h2>1. Scope</h2>
    <p>This policy describes how FlytheBG handles images, technical data, and optional quality feedback when you use the background-removal service.</p>

    <h2>2. Uploaded and processed images</h2>
    <p>Images are processed only to provide the background-removal feature you request. The production application is designed so raw uploads and generated results are not intentionally written to a permanent application image database. Request bytes are handled in memory by the web and inference services and are released after the request completes.</p>
    <p>FlytheBG applies a one-hour maximum retention window to temporary feedback run identifiers. If temporary image storage is introduced in the future for reliability or queued processing, it must use an automated deletion policy of no more than one hour unless a different period is clearly disclosed and separately justified before collection.</p>

    <h2>3. AI improvement and learning</h2>
    <p>Your raw uploaded image is not silently added to a model-training dataset and is not used to retrain the IS-Net checkpoint. After a result is shown, you may optionally choose a quality response such as “Looks great”, “Too much removed”, or “Background left”.</p>
    <p>That feedback is linked to a random, short-lived run token that expires within one hour. The inference service uses accepted feedback only to adjust a small bounded aggregate alpha-mask calibration value. The feedback store does not need the uploaded image, output image, filename, account identity, or IP address. The underlying model checkpoint remains immutable at runtime.</p>

    <h2>4. Technical and security data</h2>
    <p>Infrastructure may process limited operational information such as request timing, status codes, error categories, resource usage, and security events. Application logging is designed not to include image binary data or private image URLs.</p>

    <h2>5. Metadata and output</h2>
    <p>Processed output is re-encoded as PNG. Source EXIF and other unnecessary image metadata are not intentionally copied into the generated output.</p>

    <h2>6. Retention and deletion</h2>
    <p>FlytheBG follows a data-minimisation approach: information is kept only for the product or security purpose for which it is needed. Anonymous feedback run tokens expire automatically after no more than one hour. Aggregate calibration values may be retained because they do not contain the source image or a user identifier.</p>

    <h2>7. Your choices</h2>
    <p>Quality feedback is optional. You can use background removal and download the result without sending a feedback rating. Where applicable law gives you rights to access, correction, erasure, withdrawal of consent, or grievance redressal, use the contact information below to make a request.</p>

    <h2>8. Security</h2>
    <p>The service uses server-side file validation, MIME and magic-byte checks, bounded image sizes and pixel counts, private service communication, internal authentication, request timeouts, rate limiting, and bounded inference concurrency. No internet service can guarantee absolute security.</p>

    <h2>9. International processing and service providers</h2>
    <p>FlytheBG may rely on hosting and infrastructure providers that process data in the regions where the service is operated. Before adding analytics, advertising, authentication, databases, or new processors, this policy must be updated to describe those technologies accurately.</p>

    <h2>10. Legal framework</h2>
    <p>This policy is written around transparency, purpose limitation, data minimisation, security, and storage-limitation principles. It is not a claim that every privacy law applies in the same way in every country. The operator should obtain jurisdiction-specific legal review before a broad commercial launch.</p>

    <h2>11. Contact</h2>
    <p>Use the operator contact information shown below for privacy questions, deletion requests, or complaints. Real operator details must be configured before public launch.</p>
  </LegalPage>;
}
