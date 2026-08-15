import { Uploader } from "@/components/Uploader";
import { appConfig } from "@/lib/config";

const faqs = [
  ["What file types are supported?", "PNG, JPEG, and WebP are accepted. Files are validated again on the server before AI processing."],
  ["Does FlytheBG store my images forever?", "No. The current architecture processes images in memory and does not intentionally persist uploads or outputs. Infrastructure logs are configured not to contain image data."],
  ["Can I download a transparent image?", "Yes. The default result is a PNG with an alpha channel. You can also preview and download it on white, black, or a custom solid background."],
  ["Does the website use my photos to train AI?", "No. This implementation does not use uploaded images for model training."],
  ["Are accounts required?", "No. The initial product works without an account. Account-based features can be added later without changing the core removal workflow."],
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: appConfig.name, url: appConfig.siteUrl },
      {
        "@type": "SoftwareApplication",
        name: `${appConfig.name} Background Remover`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        url: appConfig.siteUrl,
        description: "Remove an image background and download a transparent PNG.",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="hero" id="remove">
        <div className="heroOrb orbOne" aria-hidden="true" />
        <div className="heroOrb orbTwo" aria-hidden="true" />
        <div className="shell heroGrid">
          <div className="heroCopy">
            <span className="eyebrow"><i /> Fast, private image cleanup</span>
            <h1>Remove the background.<br/><span>Keep what matters.</span></h1>
            <p className="heroLead">Upload a photo and get a clean transparent PNG. Edit the backdrop and download the finished image from one focused workspace.</p>
            <div className="heroTrust">
              <span><b>01</b> No account required</span>
              <span><b>02</b> Server-side validation</span>
              <span><b>03</b> No training on uploads</span>
            </div>
          </div>
          <Uploader />
        </div>
      </section>

      <section className="proofStrip" aria-label="Product strengths">
        <div className="shell proofGrid">
          <div><strong>Transparent PNG</strong><span>True alpha output</span></div>
          <div><strong>Fine edges</strong><span>AI segmentation</span></div>
          <div><strong>Private flow</strong><span>Internal inference service</span></div>
          <div><strong>Responsive editor</strong><span>Desktop to mobile</span></div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="shell">
          <div className="sectionHeading">
            <span className="eyebrow"><i /> Three simple steps</span>
            <h2>From photo to clean cutout.</h2>
            <p>The technical work stays behind the scenes. The product experience stays straightforward.</p>
          </div>
          <div className="stepsGrid">
            <article className="stepCard"><span>01</span><h3>Upload</h3><p>Choose or drop a supported image. File type, size, and decoded pixels are checked before inference.</p></article>
            <article className="stepCard featured"><span>02</span><h3>Remove</h3><p>The web server sends the image to a private AI service. The model returns a foreground cutout with transparency.</p></article>
            <article className="stepCard"><span>03</span><h3>Finish</h3><p>Preview transparency, choose a solid background if needed, then download the result as PNG.</p></article>
          </div>
        </div>
      </section>

      <section className="section privacySection" id="privacy">
        <div className="shell privacyGrid">
          <div className="privacyVisual" aria-hidden="true">
            <div className="lockRing"><div className="lockIcon">✓</div></div>
            <div className="privacyTag tagA">No training</div>
            <div className="privacyTag tagB">Private service</div>
            <div className="privacyTag tagC">Metadata stripped</div>
          </div>
          <div>
            <span className="eyebrow"><i /> Privacy by architecture</span>
            <h2>Your photo is input, not inventory.</h2>
            <p className="sectionText">The initial architecture avoids permanent image storage. Upload bytes move through the public web service to a private inference service, and output is returned directly to the browser.</p>
            <ul className="checkList">
              <li><span>✓</span><div><strong>Minimal retention</strong><p>Images are processed in memory by default rather than silently archived.</p></div></li>
              <li><span>✓</span><div><strong>No model training</strong><p>User uploads are not collected to train the background-removal model.</p></div></li>
              <li><span>✓</span><div><strong>Defensive validation</strong><p>Malformed, oversized, and unsupported files are rejected before expensive inference.</p></div></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="shell faqWrap">
          <div className="sectionHeading compact"><span className="eyebrow"><i /> FAQ</span><h2>Useful answers, without the fine print maze.</h2></div>
          <div className="faqList">
            {faqs.map(([q,a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="closingCta">
        <div className="shell closingInner">
          <div><span className="eyebrow light"><i /> Ready when you are</span><h2>Give your next image a cleaner canvas.</h2></div>
          <a href="#remove" className="primaryButton lightButton">Remove a background <span>→</span></a>
        </div>
      </section>
    </main>
  );
}
