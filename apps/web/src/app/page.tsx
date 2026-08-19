import type { Metadata } from "next";
import Link from "next/link";
import { GalaxyWorld } from "@/components/GalaxyWorld";
import { appConfig } from "@/lib/config";

const homeTitle = "FlytheBG — Free Background Remover & Passport Photo Maker";
const homeDescription = "Remove backgrounds, create transparent PNGs, crop images, and make print-ready passport photo sheets directly in your browser with FlytheBG.";

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
  ["Does FlytheBG upload my photo?", "The current background remover, crop tool, and Passport Photo Maker process image content in your browser. FlytheBG does not intentionally send image bytes to Render, Supabase, or an image database."],
  ["Why can the first background removal take longer?", "The browser must download the smaller IMG.LY quantized model and runtime assets on the first run. Later runs can be faster because the browser may cache those software assets."],
  ["Which background-removal model does FlytheBG use?", "FlytheBG now uses IMG.LY's smaller quantized IS-Net model directly for the automatic browser workflow. The larger FP16 model is not downloaded automatically, which reduces startup bandwidth and memory pressure."],
  ["How does FlytheBG protect hair and clothing edges?", "FlytheBG cannot retrain IMG.LY's pretrained model in your browser. Instead, after removal it can conservatively rebuild fine foreground boundaries from the original image pixels when browser memory allows."],
  ["Can I make a full passport-photo sheet?", "Yes. Set exact physical dimensions, frame the person, choose a photo background, select paper and copies, fill the sheet, then download or print it at Actual Size / 100%."],
  ["Are the passport-photo sizes guaranteed to be accepted?", "No. Document rules vary by authority. FlytheBG provides measurement and layout tools, but you should verify the official specification for the document you are applying for."],
  ["What is cleared after download?", "FlytheBG releases the working image references and generated in-page data it controls. The downloaded file and copies outside the page remain on your device."],
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
        description: "Browser background removal, transparent PNG cropping, and passport-photo sheet generation.",
        featureList: ["Background removal", "Transparent PNG export", "Image cropping", "Passport photo sizing", "Print-sheet generation"],
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

      <section className="section trustSection">
        <div className="shell">
          <div className="sectionHeading">
            <span className="eyebrow"><i/> Built for useful work</span>
            <h2>The visual stays cinematic. The tools stay readable.</h2>
            <p>Decorative motion is isolated to the landing hero. Every image workspace uses solid surfaces, clear states, native file selection, and responsive controls.</p>
          </div>
          <div className="trustGrid">
            <article><span>01</span><h3>Browser-only image flow</h3><p>No Python inference server, GPU service, image-processing API, or image database is required for the current tools.</p></article>
            <article><span>02</span><h3>Smaller model download</h3><p>Background removal uses IMG.LY’s quantized IS-Net model directly, avoiding the much larger automatic FP16 download.</p></article>
            <article><span>03</span><h3>Static-host friendly</h3><p>The production app exports to static HTML, CSS, and JavaScript so hosting cost stays focused on serving files and bandwidth.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolsSection" id="tools">
        <div className="shell">
          <div className="sectionHeading splitHeading"><div><span className="eyebrow"><i/> Live tools</span><h2>Two workflows. One private browser architecture.</h2></div><Link className="textLink" href="/features">View all features ↗</Link></div>
          <div className="toolCards">
            <Link href="/remove-background" className="toolFeatureCard primaryFeature">
              <span className="featureIndex">01</span><div className="featureMark">✦</div><h3>Remove Background</h3><p>Choose, drag, drop, or paste a photo. The smaller quantized model runs directly in the browser, and a conservative edge pass helps retain fine hair and clothing boundaries.</p><span className="featureCta">Open remover <b>↗</b></span>
            </Link>
            <Link href="/features/passport-photo" className="toolFeatureCard">
              <span className="featureIndex">02</span><div className="featureMark">▣</div><h3>Passport Photo Maker</h3><p>Remove the background locally with the same smaller browser model or keep the original. Set exact size, frame the subject, fill a print sheet, and export at measured DPI.</p><span className="featureCta">Open passport maker <b>↗</b></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Simple by design</span><h2>From photo to output without a server round-trip.</h2><p>The browser owns the image lifecycle from selection through download.</p></div>
          <ol className="workflowSteps"><li><span>01</span><div><strong>Select locally</strong><p>Native file input, drag and drop, or paste where supported.</p></div></li><li><span>02</span><div><strong>Process locally</strong><p>The smaller IMG.LY quantized model/runtime assets load into the browser only when background removal is requested.</p></div></li><li><span>03</span><div><strong>Edit locally</strong><p>Crop, frame, resize, color, and sheet composition happen with browser APIs.</p></div></li><li><span>04</span><div><strong>Download and clear</strong><p>Start the download, then release working data controlled by the page.</p></div></li></ol>
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
