import { Uploader } from "@/components/Uploader";
import { ScrollWorld } from "@/components/ScrollWorld";
import { appConfig } from "@/lib/config";

const faqs = [
  ["What file types are supported?", "PNG, JPEG, and WebP are accepted. Files are validated on both the public web boundary and the private inference service."],
  ["How long does FlytheBG keep my image?", "Raw uploads and results are not intentionally written to a permanent image database. Processing happens in memory, and temporary run identifiers used for feedback expire within one hour."],
  ["Does the AI learn from my photos?", "Not by storing your raw photos. If you choose to rate a result, FlytheBG uses that explicit feedback to adjust small aggregate mask-calibration values. The uploaded image is not retained as a training sample."],
  ["Can I download transparent images?", "Yes. The default output is a PNG with an alpha channel. You can also preview and export it against white, black, or a custom color."],
  ["What happens when I rate a result?", "Your rating is linked to a short-lived anonymous run token. It can nudge edge calibration for future requests; the token expires within one hour and does not identify you."],
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: appConfig.name, url: appConfig.siteUrl },
      { "@type": "SoftwareApplication", name: `${appConfig.name} Background Remover`, applicationCategory: "MultimediaApplication", operatingSystem: "Web", url: appConfig.siteUrl, description: "Remove an image background and download a transparent PNG." },
      { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <ScrollWorld />

      <section className="toolSection" id="remove">
        <div className="shell toolSectionGrid">
          <div className="toolIntro" data-reveal>
            <span className="eyebrow"><i /> The tool, without the detour</span>
            <h2>Drop it. Cut it. Ship it.</h2>
            <p>Upload once. FlytheBG validates the file, sends it over Railway’s private service network, runs the segmentation model, strips source metadata through re-encoding, and returns a transparent PNG.</p>
            <div className="metricRow">
              <div><strong>1</strong><span>focused workflow</span></div>
              <div><strong>0</strong><span>accounts required</span></div>
              <div><strong>≤1h</strong><span>feedback token life</span></div>
            </div>
          </div>
          <Uploader />
        </div>
      </section>

      <section className="marqueeBand" aria-hidden="true"><div>REMOVE · REFINE · RELEASE · REMOVE · REFINE · RELEASE ·</div></section>

      <section className="section storySection" id="story">
        <div className="shell">
          <div className="sectionHeading wide" data-reveal>
            <span className="eyebrow"><i /> Built like a product, not a demo</span>
            <h2>Motion with a job to do.</h2>
            <p>The page uses depth and movement to explain the product. The upload action stays obvious, the reading order survives without animation, and reduced-motion users get a calm version automatically.</p>
          </div>
          <div className="bentoGrid">
            <article className="bentoCard bentoLarge" data-reveal><span className="cardIndex">01</span><div className="miniScene"><i/><i/><i/></div><h3>Scroll becomes the camera</h3><p>A sticky 3D stage ties separation, refinement, and release to scroll progress. No autoplay video, no heavy external model asset.</p></article>
            <article className="bentoCard" data-reveal><span className="cardIndex">02</span><div className="pulseOrb"/><h3>Pointer-aware depth</h3><p>Subtle perspective follows the cursor on capable devices without blocking input or navigation.</p></article>
            <article className="bentoCard darkCard" data-reveal><span className="cardIndex">03</span><div className="fpsMeter"><i/><i/><i/><i/><i/></div><h3>Performance tiers</h3><p>CSS transforms, passive listeners, requestAnimationFrame and reduced-motion fallbacks keep the spectacle bounded.</p></article>
            <article className="bentoCard bentoWide" data-reveal><span className="cardIndex">04</span><div className="typeRail"><span>SUBJECT</span><span>→</span><span>ALPHA</span></div><h3>Spatial typography, clear hierarchy</h3><p>Big type supplies the hook; small technical labels reward the scroll without competing with the core task.</p></article>
          </div>
        </div>
      </section>

      <section className="section privacySection" id="privacy">
        <div className="shell privacyGrid">
          <div className="privacyVisual" data-reveal aria-hidden="true">
            <div className="retentionClock"><span>60</span><small>MIN MAX</small><i/></div>
            <div className="privacyTag tagA">Raw image: not training data</div>
            <div className="privacyTag tagB">Run token: auto-expiring</div>
            <div className="privacyTag tagC">Feedback: aggregate only</div>
          </div>
          <div data-reveal>
            <span className="eyebrow"><i /> Privacy that matches the code</span>
            <h2>Learn from the result.<br/>Not from keeping your photo.</h2>
            <p className="sectionText">The background-removal model does not silently collect uploads for weight training. When you explicitly rate an output, a short-lived anonymous run token lets the inference service adjust aggregate mask calibration. The raw image is not required for that learning loop.</p>
            <ul className="checkList">
              <li><span>01</span><div><strong>No permanent image database by default</strong><p>Upload and output bytes are processed in memory. A one-hour ceiling applies to temporary run identifiers; raw images are released sooner.</p></div></li>
              <li><span>02</span><div><strong>Adaptive, versioned calibration</strong><p>Feedback can nudge a bounded alpha-mask gamma value. It cannot execute arbitrary code or rewrite the model checkpoint.</p></div></li>
              <li><span>03</span><div><strong>Explicit feedback only</strong><p>No feedback is submitted until you tap a quality option after seeing your result.</p></div></li>
            </ul>
            <a className="inlineLink" href="/privacy">Read the retention & AI policy <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="section processSection" id="how-it-works">
        <div className="shell">
          <div className="sectionHeading compact" data-reveal><span className="eyebrow"><i /> Under the hood</span><h2>Four boundaries. One clean output.</h2></div>
          <div className="processRail">
            <article data-reveal><b>01</b><h3>Validate</h3><p>Format, declared MIME, magic bytes, file size and decoded pixel count are checked.</p></article>
            <article data-reveal><b>02</b><h3>Infer</h3><p>The web tier sends bytes to a private FastAPI service protected by an internal secret.</p></article>
            <article data-reveal><b>03</b><h3>Calibrate</h3><p>IS-Net creates the alpha mask and applies a bounded adaptive gamma learned from explicit quality feedback.</p></article>
            <article data-reveal><b>04</b><h3>Release</h3><p>The PNG returns with no-store headers; raw request objects fall out of scope after the response.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="shell faqWrap">
          <div className="sectionHeading compact" data-reveal><span className="eyebrow"><i /> FAQ</span><h2>The questions that matter before upload.</h2></div>
          <div className="faqList">
            {faqs.map(([q,a]) => <details key={q} data-reveal><summary>{q}<span>+</span></summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="closingCta">
        <div className="closingGlow" aria-hidden="true"/>
        <div className="shell closingInner" data-reveal>
          <div><span className="eyebrow light"><i /> One less background</span><h2>Make the subject impossible to ignore.</h2><p>Transparent PNG. Private inference. A learning loop that doesn’t need your photo archive.</p></div>
          <a href="#remove" className="primaryButton lightButton">Try FlytheBG <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
