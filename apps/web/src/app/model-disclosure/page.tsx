import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FlyThe BG Model & Open Source",
  description:
    "See which third-party AI and open-source components FlyThe BG uses — including rembg on Hugging Face — how private server-side processing works, and the relevant licensing and limitations.",
  alternates: { canonical: "/model-disclosure" },
};

export default function ModelDisclosurePage() {
  return (
    <main className="featurePage modelDisclosurePage">
      <section className="pageHero compactHero">
        <div className="shell narrowHero landingReveal">
          <span className="eyebrow"><i /> Model &amp; open source disclosure</span>
          <h1>Clear attribution for the software behind FlyThe BG.</h1>
          <p>
            FlyThe BG does not present third-party software, model assets, or reference watermark assets as its own. This page separates FlyThe BG interface code from the external processing components it uses.
          </p>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell"><div className="infoCards">
          <article><span>Background removal</span><h2>rembg on Hugging Face</h2><p>FlyThe BG removes backgrounds through its own server route (<code>/api/remove-background</code>), which authenticates to a private Hugging Face Gradio Space running <code>rembg</code>. The Hugging Face token (<code>HF_TOKEN</code>) is stored in server-only environment variables and is never sent to the browser.</p></article>
          <article><span>Visible watermark cleanup</span><h2>Conservative AI-assisted cleanup</h2><p>The visible-watermark workflow provides a targeted, preview-first UI for cleaning text/logo overlays using third-party generative AI. Output should always be inspected before reuse.</p></article>
          <article><span>FlyThe BG processing</span><h2>Validation, preview, export</h2><p>FlyThe BG adds server-side file validation (type, size, magic-byte checks), client-side preview and cropping, bounded canvas exports for passport sheets, local video compression, and transparent PNG download — all without requiring accounts.</p></article>
        </div></div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact landingReveal">
            <span className="eyebrow"><i /> Licensing &amp; attribution</span>
            <h2>Third-party licences stay separate.</h2>
            <p>Third-party packages, models, and runtimes retain their own licences and notices. This notably includes <code>rembg</code> (MIT License) and its underlying model weights used on the private Hugging Face Space, plus other OSS dependencies in <code>package.json</code>. Review each upstream project before redistributing or modifying the relevant component.</p>
          </div>
          <div className="principleList">
            <article><strong>No ownership claim</strong><p>FlyThe BG does not claim copyright, trademark rights, authorship, or exclusive ownership over third-party libraries, models, reference masks, or provider marks. Third-party software remains subject to its own notices, including applicable MIT License terms.</p></article>
            <article><strong>No training claim</strong><p>FlyThe BG does not train or fine-tune third-party models using a visitor&apos;s selected media.</p></article>
            <article><strong>Visible vs invisible marks</strong><p>The watermark workflow targets visible pixel overlays. Invisible provenance systems such as SynthID are outside this workflow and are not removed or falsified.</p></article>
            <article><strong>Results still need review</strong><p>Exact reverse-alpha reconstruction can be very clean when the calibrated mark and geometry match. Provider changes, rescaling, compression, different watermark variants, or unsupported layouts can produce artifacts.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Network behavior</span><h2>Software assets can be downloaded separately.</h2><p>For background removal, the browser sends the selected image only to FlyThe BG's <code>/api/remove-background</code> route over HTTPS. That server route connects to the configured Hugging Face Space with a secret token; the token itself is never returned to the browser. Other tools (e.g., the local video compressor and crop previews) run entirely in the browser and do not upload media.</p></article>
          <article><span>Legal policies</span><h2>Keep the documentation together.</h2><p>This disclosure is informational and does not replace third-party licences or terms.</p><Link className="textLink" href="/privacy">Privacy Policy ↗</Link><br /><Link className="textLink" href="/terms">Terms of Use ↗</Link></article>
          <article><span>Questions</span><h2>Need the simpler explanation?</h2><p>The FAQ covers browser processing, visible-watermark limitations, advertising separation, and common workflows.</p><Link className="textLink" href="/faq">Open FAQ ↗</Link></article>
        </div>
      </section>
    </main>
  );
}
