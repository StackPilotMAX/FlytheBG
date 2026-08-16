import { Uploader } from "@/components/Uploader";
import { GalaxyWorld } from "@/components/GalaxyWorld";
import { appConfig } from "@/lib/config";

const faqs = [
  ["Is the galaxy on the landing page a real animation?", "Yes. It is a permanent full-screen WebGL scene that stays behind the site while you scroll. The upgraded scene uses more than 80,000 stellar particles on larger screens, four spiral arms, dust lanes, nebula haze, a luminous core, deep stars, pointer parallax, and slow camera travel."],
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
      <GalaxyWorld />

      <section className="toolSection" id="remove">
        <div className="shell toolSectionGrid">
          <div className="toolIntro" data-reveal>
            <span className="eyebrow"><i /> From galaxy scale to pixel edge</span>
            <h2>Drop the image.<br />Keep what matters.</h2>
            <p>Upload once. FlytheBG validates the file, sends it over Railway’s private service network, runs the segmentation model, strips source metadata through re-encoding, and returns a transparent PNG.</p>
            <div className="metricRow">
              <div><strong>1</strong><span>focused workflow</span></div>
              <div><strong>0</strong><span>accounts required</span></div>
              <div><strong>≤1h</strong><span>run metadata life</span></div>
            </div>
          </div>
          <Uploader />
        </div>
      </section>

      <section className="marqueeBand" aria-hidden="true"><div>FORM · FLOW · REMOVE · REFINE · RELEASE · FORM · FLOW · REMOVE · REFINE · RELEASE ·</div></section>

      <section className="section storySection" id="story">
        <div className="shell">
          <div className="sectionHeading wide" data-reveal>
            <span className="eyebrow"><i /> Live motion, restrained spectacle</span>
            <h2>A galaxy that feels alive.<br />A product that stays clear.</h2>
            <p>The landing experience is now a permanent full-screen spiral galaxy made from live WebGL particles, dust lanes and nebula haze. It remains behind every major section while the background-removal action stays the main task.</p>
          </div>
          <div className="bentoGrid">
            <article className="bentoCard bentoLarge" data-reveal>
              <span className="cardIndex">01 / PARTICLES</span>
              <div className="miniScene"><i/><i/><i/></div>
              <h3>Tens of thousands of live points</h3>
              <p>The galaxy is generated directly in Three.js with four structured spiral arms, a warm luminous core, blue-white stellar populations, pink nebula regions, dark dust lanes, and a deterministic distribution that stays visually consistent between visits.</p>
            </article>
            <article className="bentoCard" data-reveal>
              <span className="cardIndex">02 / DEPTH</span>
              <div className="pulseOrb"/>
              <h3>Pointer-aware parallax</h3>
              <p>Small camera shifts follow the cursor while scroll changes the viewing depth, giving the scene dimensional motion without getting in the way of navigation.</p>
            </article>
            <article className="bentoCard darkCard" data-reveal>
              <span className="cardIndex">03 / FLOW</span>
              <div className="fpsMeter"><i/><i/><i/><i/><i/></div>
              <h3>Continuous, not prerecorded</h3>
              <p>The spiral rotates and the core breathes in real time. There is no hero-video timeline to scrub and no tutorial text embedded inside the landing visual.</p>
            </article>
            <article className="bentoCard bentoWide" data-reveal>
              <span className="cardIndex">04 / PERFORMANCE</span>
              <div className="typeRail"><span>PARTICLES</span><span>→</span><span>WEBGL</span><span>→</span><span>FOCUS</span></div>
              <h3>High visual density, bounded responsibly</h3>
              <p>Particle count adapts for smaller screens, device pixel ratio is capped, rendering stays client-side, resources are disposed on unmount, and reduced-motion users get a calmer version automatically.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section privacySection" id="privacy">
        <div className="shell privacyGrid">
          <div className="privacyVisual" data-reveal aria-hidden="true">
            <div className="retentionClock"><span>60</span><small>MIN MAX</small><i/></div>
            <div className="privacyTag tagA">Raw image: not training data</div>
            <div className="privacyTag tagB">Run metadata: auto-expiring</div>
            <div className="privacyTag tagC">Feedback: aggregate only</div>
          </div>
          <div data-reveal>
            <span className="eyebrow"><i /> Privacy that matches the architecture</span>
            <h2>Learn from the result.<br/>Not from keeping your photo.</h2>
            <p className="sectionText">The background-removal model does not silently collect uploads for weight training. When you explicitly rate an output, a short-lived anonymous run record lets the inference service adjust aggregate mask calibration. The raw image is not required for that learning loop.</p>
            <ul className="checkList">
              <li><span>01</span><div><strong>No permanent image database by default</strong><p>Upload and output bytes are processed for the request. Short-lived PostgreSQL run metadata expires in under one hour.</p></div></li>
              <li><span>02</span><div><strong>Adaptive, bounded calibration</strong><p>Feedback can nudge a bounded alpha-mask gamma value. It cannot execute arbitrary code or rewrite the model checkpoint.</p></div></li>
              <li><span>03</span><div><strong>Explicit feedback only</strong><p>No quality feedback is submitted until you tap an option after seeing your result.</p></div></li>
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
            <article data-reveal><b>03</b><h3>Calibrate</h3><p>FlytheBG runs a two-pass precision cutout: a full-frame pass finds the complete subject, then a high-resolution subject-crop pass plus original-resolution edge refinement preserves hair, fur and clothing boundaries before bounded feedback calibration.</p></article>
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
          <div><span className="eyebrow light"><i /> Start in the galaxy. Finish with the subject.</span><h2>Make the subject impossible to ignore.</h2><p>Transparent PNG. Private inference. A permanent live galaxy up front, and a two-pass precision cutout pipeline underneath.</p></div>
          <a href="#remove" className="primaryButton lightButton">Try FlytheBG <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
