import Link from "next/link";
import { PublisherAds } from "@/components/PublisherAds";

export const metadata = {
  title: "Background Removal Guide",
  description: "How to prepare a photo for cleaner browser background removal and understand FlytheBG's IMG.LY fallback workflow.",
};

export default function BackgroundRemovalGuide() {
  return (
    <main className="featurePage">
      <PublisherAds />
      <section className="pageHero">
        <div className="shell narrowHero">
          <span className="eyebrow"><i/> Guide · Background removal</span>
          <h1>How to get a cleaner browser background cutout.</h1>
          <p>Good segmentation starts with a usable source photo. FlytheBG can retry with a heavier browser model, but lighting, edge contrast, hair detail, motion blur, and transparency in the original image still affect the result.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 01 · Source photo</span>
            <h2>Give the model a clear subject boundary.</h2>
            <p>The easiest photos have a subject that is visually distinguishable from the background. That does not require a studio wall, but clear edges reduce ambiguity.</p>
          </div>
          <div className="principleList">
            <article><strong>Prefer sharp edges</strong><p>Heavy motion blur, missed focus, very low resolution, and aggressive compression make hair, clothing, fingers, and object edges harder to classify. When possible, start from the original camera file rather than a repeatedly forwarded screenshot.</p></article>
            <article><strong>Watch low-contrast areas</strong><p>Dark hair against a dark wall, a white shirt against a bright sky, glass, smoke, fine fur, and semi-transparent fabric are naturally difficult segmentation cases. A different source photo can improve the result more than repeatedly processing the same difficult image.</p></article>
            <article><strong>Use supported formats</strong><p>FlytheBG accepts PNG, JPEG, and WebP in the current production interface. The page validates basic file type and size before starting browser inference.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 02 · Browser models</span>
            <h2>Why the first run can take longer.</h2>
            <p>FlytheBG uses IMG.LY on the visitor's device. The browser has to obtain model and WebAssembly/runtime assets before local inference can begin.</p>
          </div>
          <div className="principleList">
            <article><strong>Quantized first</strong><p>The smaller quantized IS-Net variant is attempted first because it reduces the initial model download and memory demand. For many ordinary portraits and product photos it is sufficient.</p></article>
            <article><strong>FP16 fallback</strong><p>If the first model throws an error or the returned PNG fails FlytheBG's cutout checks, the page automatically retries with IMG.LY's FP16 model. The fallback is still browser-side; it does not send the photo to a FlytheBG inference server.</p></article>
            <article><strong>Later runs may be faster</strong><p>Browsers can cache downloaded model/runtime software assets. Cache behaviour depends on the browser, storage settings, private-browsing mode, available disk space, and later cache eviction.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 03 · Result checks</span>
            <h2>A PNG is not accepted just because a model returned one.</h2>
            <p>FlytheBG decodes the returned image and samples its alpha channel. This catches several common failure modes before the result is shown as successful.</p>
          </div>
          <div className="principleList">
            <article><strong>Visible foreground required</strong><p>A completely or almost completely transparent output is treated as a failed cutout rather than a valid result. This is important because an empty PNG can otherwise look like a successful blank checkerboard.</p></article>
            <article><strong>Visible transparency required</strong><p>If the returned image contains effectively no transparent area, the page treats it as a failed background-removal attempt and can move to the fallback model.</p></article>
            <article><strong>Inspect difficult edges</strong><p>After processing, zoom in around hair, ears, shoulders, fingers, product handles, and transparent objects. Automatic segmentation is useful, but a generated cutout should still be visually reviewed before professional or document use.</p></article>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <div className="shell finalCtaInner">
          <div><span className="eyebrow"><i/> Try the workflow</span><h2>Process one photo in your browser.</h2><p>The live remover uses the same quantized-to-FP16 fallback described above.</p></div>
          <div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Open remover <span>↗</span></Link><Link className="buttonSecondary" href="/guides">All guides</Link></div>
        </div>
      </section>
    </main>
  );
}
