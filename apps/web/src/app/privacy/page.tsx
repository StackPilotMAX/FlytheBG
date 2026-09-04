import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "FlyThe BG Privacy & AI Policy",
  description: "Learn how FlyThe BG handles browser image processing, model assets, working-image cleanup, cookies, optional advertising, and AI-media utilities.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="4 September 2026">
    <h2>1. Browser-first processing</h2>
    <p>FlyThe BG&apos;s background remover, crop workflow, Passport Photo Maker, and supported watermark-editing workspace are designed to process working media in the visitor&apos;s browser. The public image tools do not intentionally send source image bytes to a FlyThe BG image-processing database.</p>
    <p>The browser temporarily holds working data while a tool is open. Leaving or reloading a page clears page-managed working state, subject to normal browser, operating-system, cache, download, screenshot, extension, and device behavior outside FlyThe BG&apos;s control.</p>

    <h2>2. Models and third-party assets</h2>
    <p>Background removal currently integrates <code>@imgly/background-removal</code>. Model, WebAssembly, runtime, and other third-party assets may be downloaded or cached by the browser from configured distribution infrastructure. Normal network information needed to deliver those assets may therefore be processed by the asset provider.</p>
    <p>FlyThe BG does not use a visitor&apos;s selected image to train or fine-tune third-party model weights. Third-party software and model assets remain subject to their own licences, notices, and terms. See <a href="/model-disclosure">Model &amp; Open Source Disclosure</a>.</p>

    <h2>3. Visible watermark editing</h2>
    <p>The Gemini/Veo visible watermark workspace uses calibrated reference assets and reverse-alpha reconstruction adapted from the MIT-licensed <a href="https://github.com/ishara-madu/gemini-watermark-remover">ishara-madu/gemini-watermark-remover</a>. This edits a visible pixel region only. It does not claim to remove invisible provenance systems such as Google SynthID or Meta Content Seal.</p>

    <h2>4. Working-image cleanup</h2>
    <p>While you edit, preview, crop, or export, the browser must temporarily keep source and generated media in working memory. FlyThe BG releases page-managed object URLs and working state when a workflow is cleared or replaced. Downloaded files remain on your device until you delete them.</p>

    <h2>5. Optional advertising</h2>
    <p>FlyThe BG can be configured for Google AdSense and Monetag. If enabled, those providers and their partners may process browser/device information, network information, cookies or similar identifiers, ad interactions, fraud-prevention signals, and advertising measurement data according to their policies and applicable consent choices. Uploaded image bytes and private browser blob URLs are not intentionally attached to advertising requests.</p>

    <h2>6. Cookies and local storage</h2>
    <p>Core editing workflows do not require advertising cookies. FlyThe BG may use local browser storage for non-image preferences such as interface state or dismissed product messages. See the <a href="/cookies">Cookie &amp; Storage Policy</a>.</p>

    <h2>7. Metadata and provenance</h2>
    <p>Generated background-removal and passport-sheet PNGs are newly encoded browser outputs. FlyThe BG does not intentionally copy source EXIF metadata into those generated PNGs. AI provenance systems are a separate matter: Google states that Gemini media can contain invisible SynthID and Content Credentials, while Meta uses its own provenance systems for newer AI media.</p>

    <h2>8. Security and limitations</h2>
    <p>FlyThe BG validates supported file types and sizes in the browser and limits large working canvases to reduce crashes and memory exhaustion. No browser environment can guarantee absolute security, perfect segmentation, perfect watermark reconstruction, or uninterrupted availability.</p>

    <h2>9. Changes</h2>
    <p>This policy may be updated when the product, model/runtime assets, analytics, advertising, or legal requirements change. The effective date above identifies the current version.</p>

    <h2>10. Contact</h2>
    {appConfig.contactEmail ? <p>For privacy, legal, or security questions, contact <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>For privacy, legal, or security questions, use the contact page. A public contact email is shown only when one is intentionally configured.</p>}
  </LegalPage>;
}
