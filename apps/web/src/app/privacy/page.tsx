import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy & AI Policy",
  description: "Learn how FlytheBG handles browser image processing, IMG.LY model assets, working-image cleanup, cookies, advertising, and generated PNG data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy & AI Policy" updated="19 August 2026">
    <h2>1. Browser-first image processing</h2>
    <p>FlytheBG&apos;s current background remover, crop workflow, and Passport Photo Maker process image content in the visitor&apos;s browser. The live image tools do not intentionally upload source image bytes or generated image bytes to FlytheBG, Render, Supabase, or a FlytheBG image database.</p>
    <p>Because the image is not intentionally sent to the application database, there is no server-side image record waiting to be deleted after download. The browser temporarily holds working image data while the tool is open.</p>

    <h2>2. IMG.LY Browser AI</h2>
    <p>Background removal uses the IMG.LY browser package. FlytheBG currently uses the smaller quantized IS-Net browser model directly for automatic removal. The larger FP16 model is not downloaded automatically, reducing the first-run model transfer and browser memory pressure.</p>
    <p>After IMG.LY creates a cutout, FlytheBG may perform a conservative local edge-preservation pass. This rebuilds the foreground from the original browser-held pixels using the generated alpha mask and a very small boundary expansion to reduce aggressive clipping around fine hair, sleeves, collars, and similar edges. This does not retrain or modify IMG.LY&apos;s model weights, and it cannot guarantee recovery of foreground regions that the model completely misclassifies.</p>
    <p>The browser may download model, runtime, WebAssembly, or related assets from IMG.LY&apos;s configured distribution infrastructure. Normal network information needed to deliver those assets may therefore be processed by the asset provider. FlytheBG does not intentionally include the source image in those model-asset requests.</p>

    <h2>3. Working-image deletion and memory cleanup</h2>
    <p>While you edit, preview, crop, position a passport photo, or generate a print sheet, the browser must temporarily keep the source and generated image data in working memory. After a download starts, FlytheBG releases the working source, cutout, previews, object URLs, and generated sheet held by the page. Choosing a new image or leaving/reloading the page also ends the current in-page working session.</p>
    <p>This cleanup applies to FlytheBG&apos;s own page state. FlytheBG cannot guarantee deletion of copies outside its control, such as the file you downloaded, browser or operating-system caches, screenshots, extensions, network-security products, or backups made by your device.</p>

    <h2>4. Passport Photo Maker</h2>
    <p>If you choose Remove background, the same browser-only IMG.LY quantized model and eligible fine-edge preservation are used before the passport sheet is created. If you keep the original photo, background removal is skipped. Framing, selected photo-background color, physical-size conversion, sheet layout, and PNG export are performed in the browser.</p>
    <p>The selected background color is applied only inside each passport-photo rectangle; the print sheet itself remains white. Generated print sheets are not intentionally written to the FlytheBG database.</p>

    <h2>5. Database use</h2>
    <p>The current public image tools do not require an image database. A Supabase project may be used for future non-image application features, but uploaded photos and generated PNGs are not intentionally stored there by the current production image workflow.</p>

    <h2>6. Google AdSense</h2>
    <p>FlytheBG is configured with a public Google AdSense publisher identifier for site-ownership verification. During the current site-review configuration, FlytheBG uses the supported AdSense account meta tag and generated <code>ads.txt</code> seller record but does not intentionally load the global AdSense/Auto Ads JavaScript or render ad units.</p>
    <p>If advertising is enabled after approval, this policy may be updated as needed and Google or advertising partners may process browser/device information, IP/network data, cookies or similar identifiers, ad interactions, approximate location derived from network data, and related advertising data according to their policies and applicable consent choices. FlytheBG does not intentionally send uploaded image bytes, generated PNG files, private blob URLs, or source filenames to advertising requests.</p>

    <h2>7. Cookies and consent</h2>
    <p>Core image tools do not require advertising cookies to process images. If advertising or other optional technology requiring consent is enabled, applicable consent controls may be presented before the relevant processing where required.</p>

    <h2>8. Image metadata</h2>
    <p>Generated background-removal and passport-sheet PNGs are newly encoded browser outputs. FlytheBG does not intentionally copy source EXIF metadata into those generated PNGs.</p>

    <h2>9. Security and limitations</h2>
    <p>FlytheBG validates supported file types and sizes in the browser and limits large passport-sheet canvases to reduce crashes and memory exhaustion. No website or browser environment can guarantee absolute security, perfect segmentation, or uninterrupted availability.</p>

    <h2>10. Contact</h2>
    <p>For privacy, legal, or security questions, contact <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a>.</p>
  </LegalPage>;
}
