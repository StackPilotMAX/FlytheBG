import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return <LegalPage title="Terms of Use" updated="17 August 2026">
    <h2>1. Service</h2>
    <p>FlytheBG provides automated image tools including background removal, image cropping, and print-sheet creation. Machine-learning results can vary with image quality, lighting, hair, transparency, motion blur, fine objects, and other visual conditions.</p>

    <h2>2. Your content and limited processing permission</h2>
    <p>You keep your rights in content you upload. You give FlytheBG only the limited permission necessary to receive, validate, process, transmit where required by the selected tool, and return the requested result. You must have the rights or other lawful authority needed to upload and process the content.</p>

    <h2>3. Two background-removal engines</h2>
    <p>The Remove Background tool can produce one result using FlytheBG Precision on the private inference service and another using browser-side IMG.LY background-removal software. Results may differ. You are responsible for choosing and reviewing the output you use.</p>

    <h2>4. IMG.LY third-party software</h2>
    <p>The browser-side comparison feature integrates <a href="https://github.com/imgly/background-removal-js" rel="noreferrer">IMG.LY background-removal software</a>. The upstream package is distributed under its own licence, currently the GNU Affero General Public License v3 in the upstream repository. FlytheBG&apos;s integration source is publicly available in the FlytheBG GitHub repository. Third-party software, model assets, distribution infrastructure, terms, licensing, and availability may change independently of FlytheBG.</p>
    <p>If you copy, modify, redistribute, host, or commercially reuse this repository, you are responsible for reviewing and complying with the licences that apply to the components you use. This page is not a substitute for legal advice.</p>

    <h2>5. Passport and ID photo tools</h2>
    <p>FlytheBG can size and arrange photos using measurements you enter, but document-photo rules vary by issuing authority. FlytheBG does not guarantee that a generated photo satisfies a particular passport, visa, licence, or identity-document standard. Check the current official requirements before printing or submitting a photo.</p>
    <p>When “Remove background first” is selected, FlytheBG validates that the processed image contains a usable visible foreground before creating the sheet. The selected color is intended to be composited behind each passport-photo cell rather than used as the paper color. To reduce browser memory pressure, very large high-DPI sheet requests may be exported at a lower memory-safe DPI than requested; the interface shows the actual export DPI before download.</p>

    <h2>6. Image retention and download cleanup</h2>
    <p>The current production flow does not intentionally place raw uploads or generated results in a permanent image database. Server-side request and response bytes are used to perform and deliver the requested processing and are released when that work completes.</p>
    <p>During editing, the browser temporarily holds working image data. In the current background-removal and passport-sheet download flows, FlytheBG clears its working upload/result/previews from the page after the browser download starts. This cleanup does not delete the downloaded file from your device and cannot control normal caching performed outside FlytheBG&apos;s own application state.</p>
    <p>Temporary anonymous run identifiers used for optional FlytheBG Precision feedback expire within one hour and do not contain the uploaded image or generated PNG.</p>

    <h2>7. Optional quality feedback</h2>
    <p>If you choose to rate a FlytheBG Precision result, you allow FlytheBG to use that category to improve aggregate mask calibration. This does not grant permission to keep your raw uploaded image as a training sample.</p>

    <h2>8. Google AdSense and third-party advertising</h2>
    <p>FlytheBG may display advertising through Google AdSense. Advertising content is supplied and selected through third-party advertising systems, not authored or endorsed by FlytheBG merely because it appears on the site. Ad availability, personalization, measurement, consent requirements, and advertising policies are subject to Google&apos;s systems and applicable law.</p>
    <p>Do not treat an advertisement as a FlytheBG recommendation. Interactions with advertisers, external websites, purchases, or third-party offers are between you and the relevant third party.</p>

    <h2>9. Prohibited use</h2>
    <p>Do not use FlytheBG to violate law, infringe intellectual-property, publicity, or privacy rights, process content you are not authorized to use, exploit or attack the service, bypass technical safeguards, distribute malware, or overload infrastructure.</p>

    <h2>10. Availability and automated output</h2>
    <p>The service may rely on hosting, networking, model distribution, open-source software, databases, and advertising providers. Features may be modified, rate-limited, suspended, or discontinued. Third-party availability and terms can affect related functionality.</p>
    <p>You are responsible for reviewing generated output before relying on it. FlytheBG does not guarantee that every edge, transparent region, crop, physical print setup, or foreground object will be identified or rendered perfectly.</p>

    <h2>11. Contact</h2>
    <p>Questions about these terms may be sent to <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a>.</p>
  </LegalPage>;
}
