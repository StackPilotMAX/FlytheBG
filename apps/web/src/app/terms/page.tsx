import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return <LegalPage title="Terms of Use" updated="16 August 2026">
    <h2>1. Service</h2>
    <p>FlytheBG provides automated image tools including background removal, image cropping, and print-sheet creation. Machine-learning results can vary with image quality, lighting, hair, transparency, motion blur, fine objects, and other visual conditions.</p>

    <h2>2. Your content and limited processing permission</h2>
    <p>You keep your rights in content you upload. You give FlytheBG only the limited permission necessary to receive, validate, process, transmit where required by the selected tool, and return the requested result. You must have the rights or other lawful authority needed to upload and process the content.</p>

    <h2>3. Two background-removal engines</h2>
    <p>The Remove Background tool can produce one result using FlytheBG Precision on the private inference service and another using browser-side IMG.LY background-removal software. Results may differ. You are responsible for choosing and reviewing the output you use.</p>

    <h2>4. Passport and ID photo tools</h2>
    <p>FlytheBG can size and arrange photos using measurements you enter, but document-photo rules vary by issuing authority. FlytheBG does not guarantee that a generated photo satisfies a particular passport, visa, licence, or identity-document standard. Check the current official requirements before printing or submitting a photo.</p>

    <h2>5. Retention</h2>
    <p>The current production flow does not intentionally place raw uploads or generated results in a permanent image database. Temporary anonymous run identifiers used for optional FlytheBG Precision feedback expire within one hour.</p>

    <h2>6. Optional quality feedback</h2>
    <p>If you choose to rate a FlytheBG Precision result, you allow FlytheBG to use that category to improve aggregate mask calibration. This does not grant permission to keep your raw uploaded image as a training sample.</p>

    <h2>7. Prohibited use</h2>
    <p>Do not use FlytheBG to violate law, infringe intellectual-property, publicity, or privacy rights, process content you are not authorized to use, exploit or attack the service, bypass technical safeguards, distribute malware, or overload infrastructure.</p>

    <h2>8. Availability, third-party software, and advertising</h2>
    <p>The service may rely on hosting, networking, model distribution, open-source software, and advertising providers. Features may be modified, rate-limited, suspended, or discontinued. Third-party availability and terms can affect related functionality.</p>

    <h2>9. Automated output</h2>
    <p>You are responsible for reviewing generated output before relying on it. FlytheBG does not guarantee that every edge, transparent region, crop, physical print setup, or foreground object will be identified or rendered perfectly.</p>

    <h2>10. Contact</h2>
    <p>Questions about these terms may be sent to <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a>.</p>
  </LegalPage>;
}
