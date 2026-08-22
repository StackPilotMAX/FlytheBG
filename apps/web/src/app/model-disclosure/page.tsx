import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Model & Open Source Disclosure",
  description: "See which third-party browser AI package and model variants FlytheBG uses, how adaptive model selection and local subject-protection processing work, licensing information, and important limitations.",
  alternates: { canonical: "/model-disclosure" },
};

export default function ModelDisclosurePage() {
  return (
    <main className="featurePage modelDisclosurePage">
      <section className="pageHero compactHero">
        <div className="shell narrowHero landingReveal">
          <span className="eyebrow"><i/> Model & open source disclosure</span>
          <h1>Clear attribution for the browser AI behind background removal.</h1>
          <p>FlytheBG does not present third-party AI software or model assets as its own. This page describes the current production integration and separates FlytheBG&apos;s interface/post-processing code from the third-party background-removal stack.</p>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell">
          <div className="infoCards">
            <article><span>Third-party package</span><h2>IMG.LY background removal</h2><p>FlytheBG currently integrates <code>@imgly/background-removal</code> version <strong>1.7.0</strong> for browser-side segmentation. IMG.LY is the author/provider of that package; FlytheBG does not claim ownership of it.</p></article>
            <article><span>Model variants</span><h2>IS-Net quantized first, adaptive FP16 when useful</h2><p>The production workflow starts with <code>isnet_quint8</code> for the faster common path. On suitable WebGPU devices, FlytheBG can automatically retry with <code>isnet_fp16</code> when a local mask check detects higher preservation risk around pale subject regions or fine semi-transparent edges. If WebGPU cannot finish, supported paths can fall back to CPU/WASM.</p></article>
            <article><span>FlytheBG processing</span><h2>Validation, bounded inference, and conservative subject protection</h2><p>FlytheBG adds browser-side input validation, bounded working-image sizes for faster inference, output validation, conservative alpha-edge protection, limited pale-foreground recovery for pixels surrounded by detected foreground, optional source-detail restoration, UI controls, and export workflows around the third-party segmentation result.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact landingReveal"><span className="eyebrow"><i/> Licensing & attribution</span><h2>What the current package documentation says.</h2><p>IMG.LY&apos;s published package documentation states that its background-removal software is available under the AGPL license and directs users to IMG.LY for other licensing options. Model/runtime assets and other dependencies may also carry their own accompanying notices or terms.</p></div>
          <div className="principleList">
            <article><strong>No ownership claim</strong><p>FlytheBG does not claim copyright, trademark rights, authorship, or exclusive ownership over IMG.LY&apos;s library, IS-Net model variants, runtime assets, or other third-party dependencies.</p></article>
            <article><strong>No training claim</strong><p>FlytheBG does not train or fine-tune the IMG.LY model with a visitor&apos;s selected photo. The current workflow uses the image as an inference input in the browser.</p></article>
            <article><strong>Your image rights remain your responsibility</strong><p>Using FlytheBG does not transfer ownership of your photo to FlytheBG. You remain responsible for having the rights and permissions needed to process, edit, download, print, or publish the image.</p></article>
            <article><strong>Automated output still has limits</strong><p>Segmentation and FlytheBG&apos;s local preservation heuristics are estimates. Fine hair, fur, white or pale clothing against a similar background, transparent objects, smoke, blur, reflections, low contrast, compression artifacts, and unusual scenes can still produce imperfect masks. Review important output before relying on it.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Network behavior</span><h2>Model/runtime assets are downloaded separately.</h2><p>The browser may contact IMG.LY-configured distribution infrastructure or a runtime fallback source to retrieve software/model assets. FlytheBG does not intentionally attach the selected source image to those asset-download requests.</p></article>
          <article><span>Legal policies</span><h2>Read the site policies too.</h2><p>This disclosure is informational and is not a substitute for the applicable third-party licenses or terms.</p><Link className="textLink" href="/privacy">Privacy & AI Policy ↗</Link><br/><Link className="textLink" href="/terms">Terms of Use ↗</Link></article>
          <article><span>Questions</span><h2>Need the product-level explanation?</h2><p>The FAQ explains model choice, browser processing, advertising separation, and common workflow questions in simpler language.</p><Link className="textLink" href="/faq">Open FAQ ↗</Link></article>
        </div>
      </section>
    </main>
  );
}
