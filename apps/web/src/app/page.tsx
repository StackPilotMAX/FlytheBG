import type { Metadata } from "next";
import Link from "next/link";
import { GalaxyWorld } from "@/components/GalaxyWorld";
import { appConfig } from "@/lib/config";

const homeTitle = "FlytheBG — Free Background Remover & Passport Photo Maker";
const homeDescription = "Remove backgrounds from portraits, products, landscapes, squares, vertical images, and panoramas while preserving the original aspect ratio with FlytheBG.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
    siteName: appConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

const faqs = [
  ["Can FlytheBG remove backgrounds from different image ratios?", "Yes. The remover accepts normal portrait, landscape, square, vertical, and panoramic raster images that the browser can decode. FlytheBG preserves the image's aspect ratio instead of forcing a square crop."],
  ["Does FlytheBG upload my photo?", "The current background remover, crop tool, and Passport Photo Maker process image content in your browser. FlytheBG does not intentionally send image bytes to Render, Supabase, or an image database."],
  ["Why can the first background removal take longer?", "The browser must download the smaller IMG.LY quantized model and runtime assets on the first run. Later runs can be faster because the browser may cache those software assets."],
  ["Which background-removal model does FlytheBG use?", "FlytheBG uses IMG.LY's smaller quantized IS-Net model. Compatible browsers try WebGPU first for faster inference and automatically fall back to CPU/WASM if the GPU path is unavailable."],
  ["How are difficult edges handled?", "FlytheBG returns the model's transparent cutout directly and validates that meaningful transparency was produced. Hair, fur, glass, smoke, blur, and low-contrast edges can still be difficult for automatic segmentation and should be reviewed at full size."],
  ["Can I make a full passport-photo sheet?", "Yes. Set exact physical dimensions, frame the person, choose a photo background, select paper and copies, fill the sheet, then download or print it at Actual Size / 100%."],
  ["Are the passport-photo sizes guaranteed to be accepted?", "No. Document rules vary by authority. FlytheBG provides measurement and layout tools, but you should verify the official specification for the document you are applying for."],
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appConfig.siteUrl}/#website`,
        name: appConfig.name,
        alternateName: ["Fly the BG", "FlytheBG Image Tools"],
        url: appConfig.siteUrl,
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${appConfig.siteUrl}/#publisher`,
        name: appConfig.name,
        url: appConfig.siteUrl,
        logo: `${appConfig.siteUrl}/brand/flythebg-mark.svg`,
        email: appConfig.contactEmail,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${appConfig.siteUrl}/#app`,
        name: `${appConfig.name} Image Tools`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        url: appConfig.siteUrl,
        isAccessibleForFree: true,
        description: "Browser background removal, transparent PNG cropping, and passport-photo sheet generation with original aspect-ratio preservation.",
        featureList: ["Background removal", "Original aspect-ratio preservation", "Transparent PNG export", "Image cropping", "Passport photo sizing", "Print-sheet generation"],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
      },
    ],
  };

  return (
    <main className="homePage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>
      <GalaxyWorld />

      <section className="section showcaseSection">
        <div className="shell showcaseGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> Every frame stays yours</span>
            <h2>No forced square. No stretched subject.</h2>
            <p>FlytheBG preserves the source aspect ratio. A tall portrait stays tall, a landscape stays wide, and a panorama keeps its full canvas while the model estimates transparency around the subject.</p>
            <div className="ratioCloud" aria-label="Supported example aspect ratios">
              <span>1:1 square</span><span>4:3</span><span>3:4</span><span>16:9</span><span>9:16</span><span>3:2</span><span>2:3</span><span>21:9</span><span>custom</span>
            </div>
          </div>
          <div className="demoFrame" aria-label="Animated before and after design preview">
            <div className="demoToolbar"><span><i/> background removal preview</span><span>drag · drop · paste</span></div>
            <div className="demoCanvas">
              <div className="demoSubjectCutout" />
              <div className="demoDivider"><span>↔</span></div>
              <div className="demoLabels"><span>Original</span><span>Transparent</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section trustSection">
        <div className="shell">
          <div className="sectionHeading">
            <span className="eyebrow"><i/> Built to feel fast</span>
            <h2>Cinematic outside. Focused where the work happens.</h2>
            <p>The homepage uses lightweight canvas and CSS motion inspired by modern 3D landing-page techniques, while the actual image workspace stays readable, responsive, and task-first.</p>
          </div>
          <div className="trustGrid">
            <article><span>01 · Flexible input</span><h3>Portrait to panorama.</h3><p>Most browser-decodable raster formats can enter the same workflow, with non-standard raster inputs normalized locally when the browser can decode them.</p></article>
            <article><span>02 · Faster compute</span><h3>WebGPU first, CPU fallback.</h3><p>Compatible browsers try accelerated WebGPU inference first. If that path cannot initialize or finish, FlytheBG retries the same small quantized model on CPU/WASM.</p></article>
            <article><span>03 · Clean output</span><h3>The model cutout goes straight to PNG.</h3><p>The current flow avoids the old full-resolution edge-expansion pass and validates that the model produced useful transparency before presenting the result.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolsSection" id="tools">
        <div className="shell">
          <div className="sectionHeading splitHeading"><div><span className="eyebrow"><i/> Live tools</span><h2>Two focused workflows. One visual system.</h2></div><Link className="textLink" href="/features">View all features ↗</Link></div>
          <div className="toolCards">
            <Link href="/remove-background" className="toolFeatureCard primaryFeature">
              <span className="featureIndex">01</span><div className="featureMark">✦</div><h3>Remove Background</h3><p>Choose, drag, drop, or paste an image. FlytheBG keeps the original aspect ratio, tries accelerated browser inference where available, and exports a transparent PNG.</p><span className="featureCta">Open remover <b>↗</b></span>
            </Link>
            <Link href="/features/passport-photo" className="toolFeatureCard">
              <span className="featureIndex">02</span><div className="featureMark">▣</div><h3>Passport Photo Maker</h3><p>Remove the background or keep the original, frame the subject, set exact physical dimensions, choose a background color, and fill a print-ready sheet.</p><span className="featureCta">Open passport maker <b>↗</b></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Simple by design</span><h2>From source image to transparent output.</h2><p>The current production path runs on the visitor's device and keeps the working flow compact.</p></div>
          <ol className="workflowSteps">
            <li><span>01</span><div><strong>Select any normal frame</strong><p>Portrait, landscape, square, vertical, panorama, drag and drop, file picker, or paste where supported.</p></div></li>
            <li><span>02</span><div><strong>Normalize only when needed</strong><p>PNG, JPEG, and WebP can go straight through; other browser-decodable raster formats can be converted locally before inference.</p></div></li>
            <li><span>03</span><div><strong>Run the small model</strong><p>WebGPU is preferred on supported browsers, with an automatic CPU/WASM retry using the same quantized model.</p></div></li>
            <li><span>04</span><div><strong>Download and clear</strong><p>The cutout is validated, encoded as transparent PNG, downloaded, and working page references can then be released.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> FAQ</span><h2>What FlytheBG handles—and where AI still has limits.</h2></div>
          <div className="faqList">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="finalCta">
        <div className="shell finalCtaInner"><div><span className="eyebrow"><i/> No account required</span><h2>Start with the image you already have.</h2><p>Square, portrait, landscape, or panorama—the frame stays yours.</p></div><div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link><Link className="buttonSecondary" href="/features/passport-photo">Make passport photos</Link></div></div>
      </section>
    </main>
  );
}
