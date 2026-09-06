import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Privacy Policy | FlyThe BG",
  description:
    "Learn how FlyThe BG handles browser-based image and media processing, working files, cookies, advertising technologies, model assets, and contact information.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | FlyThe BG",
    description:
      "Understand FlyThe BG's browser-first processing model, working-media handling, cookies, advertising, and privacy boundaries.",
    url: "/privacy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | FlyThe BG",
    description:
      "Understand how FlyThe BG handles browser-based media processing, cookies, advertising, and privacy.",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="6 September 2026">
      <p>
        FlyThe BG is a browser-first collection of image and media utilities. This policy explains what information may be processed when you use the website, how working media is handled, how browser storage and advertising technologies may operate, and the limits of our privacy commitments.
      </p>

      <h2>1. Browser-first processing</h2>
      <p>
        FlyThe BG is designed so that supported image workflows can perform processing in the visitor&apos;s browser. Background removal, photo preparation, and supported editing workflows are designed around browser-side processing rather than intentionally sending source image bytes to a FlyThe BG image-processing database.
      </p>
      <p>
        Browser-first does not mean that every feature is guaranteed to be completely local. Processing can depend on the selected feature, browser, device, codec, model/runtime requirements, and third-party services. Where a feature explicitly requires an external service, information necessary to provide that feature may be transmitted to that service.
      </p>

      <h2>2. Images, videos, and uploaded media</h2>
      <p>
        When you select an image, video, or other supported file, the browser makes that file available to the selected workflow. For supported local workflows, the working media is processed in browser memory and is not intentionally uploaded to a FlyThe BG image-processing server.
      </p>
      <p>
        While a workflow is active, source and generated media may temporarily exist in browser memory, object URLs, canvas buffers, or other browser-managed state. Clearing or replacing a workflow releases page-managed resources, subject to normal browser, operating-system, cache, download, screenshot, extension, and device behavior outside FlyThe BG&apos;s control.
      </p>
      <p>
        Downloaded files remain on your device until you delete them. Users should avoid uploading confidential or highly sensitive material unless they have determined that the selected workflow is appropriate for it.
      </p>

      <h2>3. Models, runtime assets, and third-party infrastructure</h2>
      <p>
        Some FlyThe BG tools use third-party software, model weights, WebAssembly, JavaScript runtimes, or other assets. For example, background removal integrates <code>@imgly/background-removal</code>. These resources may be downloaded or cached by the browser from configured distribution infrastructure.
      </p>
      <p>
        Delivering these resources can involve normal network information such as an IP address, browser information, request metadata, and other information ordinarily required by the relevant hosting or distribution provider. FlyThe BG does not use a visitor&apos;s selected image to train or fine-tune third-party model weights.
      </p>
      <p>
        Third-party software and model assets remain subject to their applicable licences, notices, and terms. See the <a href="/model-disclosure">Model &amp; Open Source Disclosure</a> for feature-specific information.
      </p>

      <h2>4. AI-assisted image and watermark editing</h2>
      <p>
        The Gemini/Veo visible watermark workspace uses calibrated reference assets and reverse-alpha reconstruction adapted from an MIT-licensed open-source project. It is intended for supported and authorized media. It edits visible pixel regions and does not claim to remove invisible provenance systems such as Google SynthID or other content-authenticity mechanisms.
      </p>
      <p>
        Automated image processing can produce imperfect results. Users are responsible for ensuring that they have the rights and permissions necessary to edit and use the media they provide.
      </p>

      <h2>5. Information you voluntarily provide</h2>
      <p>
        Core FlyThe BG workflows do not require an account simply to use the public tools. If you contact FlyThe BG, the information you choose to provide may include your name, email address, message, screenshots or other information needed to understand your request.
      </p>
      <p>
        Contact information is used to respond to support, privacy, legal, security, feedback, or product-related requests. We do not sell contact information as a product.
      </p>

      <h2>6. Technical information</h2>
      <p>
        Like most websites, FlyThe BG and its infrastructure providers may process technical information associated with ordinary web requests. Depending on the service involved, this may include browser and operating-system information, device characteristics, approximate network or geographic information, requested pages and resources, referring information, security signals, and performance or diagnostic data.
      </p>
      <p>
        This information can be used for security, abuse prevention, reliability, troubleshooting, aggregate measurement, and service improvement.
      </p>

      <h2>7. Cookies and similar technologies</h2>
      <p>
        FlyThe BG may use cookies, local storage, session storage, pixels, or similar technologies for essential functionality, security, consent management, preferences, analytics, advertising, and advertising measurement where applicable.
      </p>
      <p>
        Core editing workflows do not require advertising cookies. Browser storage may also be used for non-image preferences such as interface state or dismissed product messages. See the <a href="/cookies">Cookie &amp; Storage Policy</a> for additional information.
      </p>
      <p>
        You can control cookies through your browser settings. Blocking some cookies or storage mechanisms can affect website functionality.
      </p>

      <h2>8. Google AdSense and advertising cookies</h2>
      <p>
        FlyThe BG may use Google AdSense or other advertising providers to support operation and development of the website. If advertising is enabled, Google and its advertising partners may use cookies or similar technologies to deliver, measure, personalize, and report advertising, subject to applicable settings, policies, and consent requirements.
      </p>
      <p>
        Third-party vendors, including Google, may use advertising cookies to serve ads based on a user&apos;s prior visits to FlyThe BG or other websites. Depending on the applicable configuration, advertising providers may process browser or device information, network information, advertising identifiers, ad interactions, fraud-prevention signals, and measurement data.
      </p>
      <p>
        Uploaded image bytes and private browser blob URLs are not intentionally attached to advertising requests by FlyThe BG. Advertising providers operate their own systems and are responsible for their own processing under their applicable policies.
      </p>
      <p>
        Users can review and manage Google advertising personalization choices through Google&apos;s advertising settings and other available privacy controls. Available choices can vary by location, browser, account, and advertising configuration.
      </p>

      <h2>9. Consent and regional advertising requirements</h2>
      <p>
        Where applicable law or Google&apos;s publisher requirements require consent before certain advertising cookies, personalized advertising, or similar technologies are used, FlyThe BG may use a consent-management mechanism to obtain and respect the visitor&apos;s choices.
      </p>
      <p>
        Visitors in the European Economic Area, the United Kingdom, and Switzerland may be presented with additional consent choices where required for Google advertising products. Users should use the available privacy controls to accept, reject, or modify optional advertising choices.
      </p>
      <p>
        Consent and advertising behavior can change as the site&apos;s advertising configuration or applicable requirements change. The implementation on the live site should always be treated as the source of truth for the technologies currently enabled.
      </p>

      <h2>10. Third-party services</h2>
      <p>
        FlyThe BG may rely on third-party providers for hosting, content delivery, model/runtime assets, security, analytics, advertising, consent management, communications, or feature-specific processing. A provider may receive information necessary to deliver the service it provides.
      </p>
      <p>
        Third-party providers maintain their own privacy policies and terms. FlyThe BG does not control independent processing performed by those providers outside the instructions and technical boundaries of the relevant integration.
      </p>

      <h2>11. Security and privacy limitations</h2>
      <p>
        FlyThe BG uses reasonable technical measures appropriate to a browser-based web application. Supported file types and sizes are validated in the browser, and large working canvases are constrained where appropriate to reduce crashes and memory exhaustion.
      </p>
      <p>
        No website, browser, network, or Internet transmission can guarantee absolute security. FlyThe BG also cannot control browser caches, downloads, extensions, screenshots, operating-system behavior, malware, or other software on a visitor&apos;s device.
      </p>

      <h2>12. Data retention</h2>
      <p>
        FlyThe BG aims to minimize unnecessary retention of user information. Browser-local working data is governed by the browser and device environment. Downloaded files remain under the visitor&apos;s control until removed from the device.
      </p>
      <p>
        Where an external service is required, information may be processed or retained according to that service&apos;s technical operation, terms, privacy policy, and applicable legal obligations. Contact information may be retained for as long as reasonably necessary to respond to a request, prevent abuse, resolve disputes, maintain appropriate support records, or meet legal requirements.
      </p>

      <h2>13. Children&apos;s privacy</h2>
      <p>
        FlyThe BG is a general-purpose web service and is not specifically directed toward children. We do not intentionally request personal information from children through ordinary tool workflows.
      </p>

      <h2>14. Changes to this Privacy Policy</h2>
      <p>
        This policy may be updated when FlyThe BG adds or changes tools, model/runtime assets, hosting or analytics services, advertising providers, consent mechanisms, or legal requirements. The effective date at the top of this page identifies the current version.
      </p>

      <h2>15. Contact</h2>
      {appConfig.contactEmail ? (
        <p>
          For privacy, legal, or security questions, contact <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a> or use the <a href="/contact">FlyThe BG Contact page</a>.
        </p>
      ) : (
        <p>
          For privacy, legal, or security questions, use the <a href="/contact">FlyThe BG Contact page</a>. A public support email is shown only when one is intentionally configured.
        </p>
      )}

      <p>
        Please do not send passwords, payment-card information, government identification documents, or other unnecessary sensitive information through a general support request.
      </p>
    </LegalPage>
  );
}
