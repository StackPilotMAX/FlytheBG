import Link from "next/link";
import { GalaxyWorld } from "@/components/GalaxyWorld";
import { PublisherAds } from "@/components/PublisherAds";
import { appConfig } from "@/lib/config";

const faqs = [
  ["Does FlytheBG upload my photo?", "The current background remover, crop tool, and Passport Photo Maker process image content in your browser. FlytheBG does not intentionally send image bytes to Render, Supabase, or an image database."],
  ["Why can the first background removal take longer?", "The browser must download IMG.LY model/runtime assets on the first run. Later runs can be faster because the browser may cache those software assets."],
  ["What happens when the fast model fails?", "FlytheBG automatically retries with the IMG.LY FP16 browser model. Both models run on the visitor's device."],
  ["Can I make a full passport-photo sheet?", "Yes. Set exact physical dimensions, frame the person, choose a photo background, select paper and copies, fill the sheet, then download or print it at Actual Size / 100%."],
  ["Are the passport-photo sizes guaranteed to be accepted?", "No. Document rules vary by authority. FlytheBG provides measurement and layout tools, but you should verify the official specification for the document you are applying for."],
  ["What is cleared after download?", "FlytheBG releases the working image references and generated in-page data it controls. The downloaded file and copies outside the page remain on your device."],
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: appConfig.name, url: appConfig.siteUrl },
      { "@type": "SoftwareApplication", name: `${appConfig.name} Image Tools`, applicationCategory: "MultimediaApplication", operatingSystem: "Web", url: appConfig.siteUrl, description: "Browser background removal, cropping, and passport-photo sheet generation." },
      { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };

  return (
    <main className="homePage">
      <PublisherAds />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>
      <GalaxyWorld />

      <section className="section trustSection">
        <div className="shell">
          <div className="sectionHeading">
            <span className="eyebrow"><i/> Built for useful work</span>
            <h2>Private image tools with clear browser behaviour.</h2>
            <p>FlytheBG keeps decorative motion in the landing hero while the actual image workspaces use solid surfaces, native file controls, visible processing states, and responsive layouts.</p>
          </div>
          <div className="trustGrid">
            <article><span>01</span><h3>Browser-only image flow</h3><p>No Python inference server, GPU service, image-processing API, or image database is required for the current tools.</p></article>
            <article><span>02</span><h3>Automatic model fallback</h3><p>IMG.LY quantized runs first. If it cannot produce a usable cutout, FP16 retries automatically in the same browser.</p></article>
            <article><span>03</span><h3>Static-host friendly</h3><p>The production app exports to static HTML, CSS, and JavaScript so hosting cost is mainly file delivery and bandwidth rather than per-image compute.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolsSection" id="tools">
        <div className="shell">
          <div className="sectionHeading splitHeading"><div><span className="eyebrow"><i/> Live tools</span><h2>Two complete workflows. One browser-first architecture.</h2></div><Link className="textLink" href="/features">View all features ↗</Link></div>
          <div className="toolCards">
            <Link href="/remove-background" className="toolFeatureCard primaryFeature">
              <span className="featureIndex">01</span><div className="featureMark">✦</div><h3>Remove Background</h3><p>Choose, drag, drop, or paste a photo. Get a transparent PNG with automatic browser-model fallback, then crop or download.</p><span className="featureCta">Open remover <b>↗</b></span>
            </Link>
            <Link href="/features/passport-photo" className="toolFeatureCard">
              <span className="featureIndex">02</span><div className="featureMark">▣</div><h3>Passport Photo Maker</h3><p>Remove the background locally or keep the original. Set exact size, frame the subject, fill a print sheet, and export at measured DPI.</p><span className="featureCta">Open passport maker <b>↗</b></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Simple by design</span><h2>From photo to output without a server round-trip.</h2><p>The browser owns the image lifecycle from selection through download.</p></div>
          <ol className="workflowSteps"><li><span>01</span><div><strong>Select locally</strong><p>Native file input, drag and drop, or paste where supported.</p></div></li><li><span>02</span><div><strong>Process locally</strong><p>IMG.LY model assets load into the browser only when background removal is requested.</p></div></li><li><span>03</span><div><strong>Edit locally</strong><p>Crop, frame, resize, color, and sheet composition happen with browser APIs.</p></div></li><li><span>04</span><div><strong>Download and clear</strong><p>Start the download, then release working data controlled by the page.</p></div></li></ol>
        </div>
      </section>

      <section className="section toolsSection">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Original guides</span><h2>Understand the workflow before you depend on the output.</h2><p>FlytheBG's guides explain how the browser models behave, how to prepare difficult images, how physical photo sizing becomes a print sheet, and what browser-only privacy does and does not mean.</p></div>
          <div className="trustGrid">
            <article><span>Guide 01</span><h3>Cleaner background removal</h3><p>Source-photo quality, difficult edges, model downloads, quantized-to-FP16 fallback, and result validation.</p><p style={{marginTop:18}}><Link className="textLink" href="/guides/background-removal">Read guide ↗</Link></p></article>
            <article><span>Guide 02</span><h3>Passport-photo printing</h3><p>Physical dimensions, DPI, framing, paper capacity, background color, and Actual Size / 100% printing.</p><p style={{marginTop:18}}><Link className="textLink" href="/guides/passport-photo">Read guide ↗</Link></p></article>
            <article><span>Guide 03</span><h3>Browser image privacy</h3><p>What stays on the device, which model assets use the network, and what FlytheBG clears after download.</p><p style={{marginTop:18}}><Link className="textLink" href="/guides/browser-privacy">Read guide ↗</Link></p></article>
          </div>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> FAQ</span><h2>What the browser does—and what it does not.</h2></div>
          <div className="faqList">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="finalCta">
        <div className="shell finalCtaInner"><div><span className="eyebrow"><i/> No account required</span><h2>Start with one photo.</h2><p>Use the production browser tools without sending the image to a FlytheBG inference server.</p></div><div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link><Link className="buttonSecondary" href="/features/passport-photo">Make passport photos</Link></div></div>
      </section>
    </main>
  );
}
