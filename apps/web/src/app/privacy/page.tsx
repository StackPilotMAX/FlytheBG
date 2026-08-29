import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "FlytheBG Privacy & AI Policy",
  description: "Learn how FlytheBG handles browser image processing, IMG.LY model assets, adaptive model selection, working-image cleanup, cookies, optional advertising, and generated PNG data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="22 August 2026">
    <h2>1. Browser-first image processing</h2>
    <p>FlytheBG&apos;s current background remover, crop workflow, and Passport Photo Maker process image content in the visitor&apos;s browser. The live image tools do not intentionally upload source image bytes or generated image bytes to a FlytheBG image-processing server or image database.</p>
    <p>The browser temporarily holds working image data while the tool is open. Leaving or reloading the page ends the current in-page working session, subject to normal browser, operating-system, cache, download, screenshot, extension, and device behavior outside FlytheBG&apos;s control.</p>

    <h2>2. IMG.LY browser AI, model variants, and attribution</h2>
    <p>Background removal currently integrates <code>@imgly/background-removal</code> version <strong>1.7.0</strong>. The production workflow starts with IMG.LY&apos;s smaller IS-Net quantized model for the faster common path. On suitable WebGPU devices, FlytheBG can retry with the FP16 model when a local result check indicates greater preservation risk around pale subject regions or fine semi-transparent edges. Supported execution paths can fall back to CPU/WASM when needed.</p>
    <p>IMG.LY is the author/provider of the third-party background-removal package. FlytheBG does not claim ownership, authorship, or exclusive rights over IMG.LY&apos;s library, IS-Net model variants, runtime assets, or other third-party dependencies. IMG.LY&apos;s published package documentation states that its background-removal software is available under the AGPL license and directs users to IMG.LY for other licensing options. Model/runtime assets and other dependencies may also carry their own accompanying notices or terms.</p>
    <p>FlytheBG may use bounded working-image dimensions to reduce inference time and memory pressure, perform conservative local alpha-edge protection, apply limited pale-foreground recovery only where lighter pixels are substantially surrounded by detected foreground, and, when memory permits, reapply a protected mask to higher-resolution source detail. These steps do not retrain IMG.LY&apos;s model weights and cannot guarantee that hair, clothing, or other foreground detail will always be preserved. FlytheBG does not use a visitor&apos;s selected image to train or fine-tune the IMG.LY model.</p>
    <p>The browser may download model, runtime, WebAssembly, or related assets from configured distribution infrastructure. Normal network information needed to deliver those assets may therefore be processed by the asset provider. FlytheBG does not intentionally include the source image in those model-asset requests.</p>
    <p>See the <a href="/model-disclosure">Model &amp; Open Source Disclosure</a> for the product-level attribution, processing role, and limitations.</p>

    <h2>3. Working-image cleanup</h2>
    <p>While you edit, preview, crop, move a passport crop frame, or generate a print sheet, the browser must temporarily keep source and generated image data in working memory. FlytheBG releases page-managed object URLs and working state when a workflow is cleared or replaced. Downloaded files remain on your device until you delete them.</p>

    <h2>4. Passport Photo Maker</h2>
    <p>If you choose background removal, the same browser-side background-removal workflow is used before the passport sheet is created. If you keep the original photo, background removal is skipped. The source photo remains the stationary crop source while the user can move the crop frame over it. Crop-frame positioning, selected photo-background color, physical-size conversion, per-copy crop choices, sheet layout, printing, and PNG export are performed in the browser.</p>

    <h2>5. Database use</h2>
    <p>The current public image tools do not require an image database for uploaded photos or generated PNGs. Future non-image application features may use additional services, in which case this policy should be updated before those features are enabled.</p>

    <h2>6. Optional advertising: Google AdSense and Monetag</h2>
    <p>FlytheBG contains disabled-by-default configuration for Google AdSense and Monetag. Verification metadata, seller records, or ad scripts are only included when the corresponding public/build settings are intentionally configured. The site is designed so that uploaded image bytes, generated PNG files, private browser blob URLs, and source filenames are not intentionally attached to advertising requests.</p>
    <p>If advertising is enabled, Google, Monetag, their advertising partners, and related service providers may process browser/device information, IP or network data, cookies or similar identifiers, ad interactions, approximate location derived from network information, fraud-prevention signals, and advertising measurement data according to their own policies and the consent choices available to the visitor.</p>
    <p>When AdSense and Monetag are used together, FlytheBG&apos;s configuration is intended for non-pop-under Monetag formats. Monetag OnClick/pop-under behavior should not be enabled alongside AdSense. Reserved ad locations are labelled <strong>Advertisement</strong> and are kept separate from upload, download, editing, and navigation controls.</p>

    <h2>7. Cookies, storage, and consent</h2>
    <p>Core image tools do not require advertising cookies to process images. The October 2026 feature announcement stores only a local dismissal flag in the browser so a dismissed notice does not keep reappearing.</p>
    <p>If advertising or other optional technology requiring consent is enabled, applicable consent controls must be configured where required. For personalized AdSense advertising in the EEA, UK, or Switzerland, publishers are responsible for using a Google-certified consent management platform that integrates with the IAB TCF.</p>

    <h2>8. Image metadata</h2>
    <p>Generated background-removal and passport-sheet PNGs are newly encoded browser outputs. FlytheBG does not intentionally copy source EXIF metadata into those generated PNGs.</p>

    <h2>9. Security and limitations</h2>
    <p>FlytheBG validates supported file types and sizes in the browser and limits large working canvases to reduce crashes and memory exhaustion. No website or browser environment can guarantee absolute security, perfect segmentation, perfect hair or clothing retention, or uninterrupted availability.</p>

    <h2>10. Contact</h2>
    {appConfig.contactEmail ? <p>For privacy, legal, or security questions, contact <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>For privacy, legal, or security questions, use the contact page. A public contact email is shown only when one is intentionally configured for the production site.</p>}
  </LegalPage>;
}
