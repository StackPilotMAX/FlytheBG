import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Privacy & AI Policy",
  description: "Learn how FlytheBG handles browser image processing, IMG.LY model assets, working-image cleanup, cookies, optional AdSense and Monetag advertising, and generated PNG data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="21 August 2026">
    <h2>1. Browser-first image processing</h2>
    <p>FlytheBG&apos;s current background remover, crop workflow, and Passport Photo Maker process image content in the visitor&apos;s browser. The live image tools do not intentionally upload source image bytes or generated image bytes to a FlytheBG image-processing server or image database.</p>
    <p>The browser temporarily holds working image data while the tool is open. Leaving or reloading the page ends the current in-page working session, subject to normal browser, operating-system, cache, download, screenshot, extension, and device behavior outside FlytheBG&apos;s control.</p>

    <h2>2. IMG.LY Browser AI</h2>
    <p>Background removal uses IMG.LY browser software and model/runtime assets. FlytheBG selects a browser-side path based on device capability, including the smaller quantized model on constrained devices and an FP16 path on suitable higher-memory WebGPU devices, with CPU/WASM fallback when needed.</p>
    <p>FlytheBG may perform conservative local alpha-matte cleanup and, when memory permits, reapply a refined mask to higher-resolution source detail. This post-processing does not retrain IMG.LY&apos;s model weights and cannot recreate foreground detail the segmentation model never detected.</p>
    <p>The browser may download model, runtime, WebAssembly, or related assets from configured distribution infrastructure. Normal network information needed to deliver those assets may therefore be processed by the asset provider. FlytheBG does not intentionally include the source image in those model-asset requests.</p>

    <h2>3. Working-image cleanup</h2>
    <p>While you edit, preview, crop, position a passport photo, or generate a print sheet, the browser must temporarily keep source and generated image data in working memory. FlytheBG releases page-managed object URLs and working state when a workflow is cleared or replaced. Downloaded files remain on your device until you delete them.</p>

    <h2>4. Passport Photo Maker</h2>
    <p>If you choose background removal, the same browser-side background-removal workflow is used before the passport sheet is created. If you keep the original photo, background removal is skipped. Framing, selected photo-background color, physical-size conversion, per-copy positioning, sheet layout, printing, and PNG export are performed in the browser.</p>

    <h2>5. Database use</h2>
    <p>The current public image tools do not require an image database for uploaded photos or generated PNGs. Future non-image application features may use additional services, in which case this policy should be updated before those features are enabled.</p>

    <h2>6. Optional advertising: Google AdSense and Monetag</h2>
    <p>FlytheBG contains disabled-by-default configuration for Google AdSense and Monetag. Verification metadata, seller records, or ad scripts are only included when the corresponding public/build settings are intentionally configured. The site is designed so that uploaded image bytes, generated PNG files, private browser blob URLs, and source filenames are not intentionally attached to advertising requests.</p>
    <p>If advertising is enabled, Google, Monetag, their advertising partners, and related service providers may process browser/device information, IP or network data, cookies or similar identifiers, ad interactions, approximate location derived from network information, fraud-prevention signals, and advertising measurement data according to their own policies and the consent choices available to the visitor.</p>
    <p>When AdSense and Monetag are used together, FlytheBG&apos;s configuration is intended for non-pop-under Monetag formats. Monetag OnClick/pop-under behavior should not be enabled alongside AdSense.</p>

    <h2>7. Cookies, storage, and consent</h2>
    <p>Core image tools do not require advertising cookies to process images. The October 2026 feature announcement stores only a local dismissal flag in the browser so a dismissed notice does not keep reappearing.</p>
    <p>If advertising or other optional technology requiring consent is enabled, applicable consent controls must be configured where required. For personalized AdSense advertising in the EEA, UK, or Switzerland, publishers are responsible for using a Google-certified consent management platform that integrates with the IAB TCF.</p>

    <h2>8. Image metadata</h2>
    <p>Generated background-removal and passport-sheet PNGs are newly encoded browser outputs. FlytheBG does not intentionally copy source EXIF metadata into those generated PNGs.</p>

    <h2>9. Security and limitations</h2>
    <p>FlytheBG validates supported file types and sizes in the browser and limits large working canvases to reduce crashes and memory exhaustion. No website or browser environment can guarantee absolute security, perfect segmentation, or uninterrupted availability.</p>

    <h2>10. Contact</h2>
    {appConfig.contactEmail ? <p>For privacy, legal, or security questions, contact <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>For privacy, legal, or security questions, use the contact page. A public contact email is shown only when one is intentionally configured for the production site.</p>}
  </LegalPage>;
}
