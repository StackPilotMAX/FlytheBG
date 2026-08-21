import type { Metadata } from "next";
import Link from "next/link";
import { HoverFaqList } from "@/components/HoverFaqList";
import { LocalAISimulator } from "@/components/LocalAISimulator";
import { appConfig } from "@/lib/config";

const homeTitle = "FlytheBG — Free AI Background Remover in Your Browser";
const homeDescription = "Remove image backgrounds online for free with FlytheBG. Local browser AI keeps photos on your device, preserves any aspect ratio, refines transparent PNG edges, and includes a passport photo maker.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "FlytheBG",
    "Fly the BG",
    "free background remover",
    "remove background online",
    "AI background remover",
    "remove image background",
    "background eraser online",
    "transparent background maker",
    "transparent PNG maker",
    "local AI background remover",
    "private background remover",
    "no upload background remover",
    "passport photo maker online",
  ],
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
  ["Is FlytheBG really browser-side?", "Yes. Your working image is processed in browser memory. The site still downloads application code, the AI model, and runtime assets, but FlytheBG does not intentionally upload your source photo to an image-processing backend."],
  ["Is FlytheBG a free background remover?", "The current browser background-removal workflow can be used without creating an account. The site may add optional paid features later, but the current local remover does not require a backend inference subscription."],
  ["Can it remove a background on a 3 GB or 4 GB RAM phone?", "FlytheBG uses a smaller quantized model and a reduced working resolution on constrained devices. This lowers memory pressure substantially, although extremely large photos or old browsers can still exceed device limits."],
  ["How does FlytheBG improve the cutout edges?", "After the segmentation model produces transparency, FlytheBG can run lightweight local alpha-matte cleanup to reduce isolated low-alpha speckles, fill tiny pinholes, and slightly improve boundary contrast without sending the image to a server."],
  ["Does FlytheBG restore image detail after low-memory processing?", "When a device has enough memory, FlytheBG can reapply the refined segmentation mask to the higher-resolution source image. On constrained phones it skips that extra memory-heavy step and prioritizes a stable result."],
  ["Does FlytheBG use a higher-quality model on powerful devices?", "On devices with enough reported memory and WebGPU support, FlytheBG can try the FP16 model. If it cannot finish, the app automatically falls back to the smaller quantized model."],
  ["Can I remove backgrounds from portrait, landscape, square, or panoramic images?", "Yes. FlytheBG does not force a square crop. The browser workflow keeps the input proportions for portrait, landscape, square, vertical, and panoramic images."],
  ["What happens if WebGPU does not work?", "FlytheBG retries using CPU/WASM. It also includes a browser-safe ESM runtime fallback for common bundled WASM or worker initialization failures."],
  ["Can I manually move and zoom a passport photo?", "Yes. In the Passport Photo Maker you can drag the person, zoom, choose a background color, set exact physical dimensions, choose paper, fill the sheet, download PNG, and print at 100%."],
  ["Why can hair, fur, glass, smoke, or motion blur still be difficult?", "Those boundaries contain partially transparent or ambiguous pixels. Local alpha cleanup can improve presentation, but it cannot recover detail that the segmentation model never detected. Important results should still be inspected at full size."],
  ["Why might Google still show an old title or favicon?", "Google controls recrawling and search-result rendering. FlytheBG exposes canonical metadata, structured data, a square favicon, robots.txt, and a sitemap, but search appearance can take time to refresh."],
] as const;

const publicDomainSamples = [
  {
    title: "Portrait",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Eliza_Cook_0S_1860s.png?width=520",
    note: "Public-domain / CC0 transparent portrait from Wikimedia Commons",
  },
  {
    title: "Fine edges",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Danaus_genutia_transparent_background.png?width=520",
    note: "Public-domain / CC0 transparent specimen from Wikimedia Commons",
  },
] as const;

const useCases = [
  ["Product photos", "Create clean transparent product PNGs for stores, marketplaces, catalogs, and social posts."],
  ["Portraits", "Remove distracting backgrounds from headshots, profile photos, thumbnails, and personal images."],
  ["Passport photos", "Remove the background, reposition the person manually, set exact dimensions, and build a print sheet."],
  ["Creative assets", "Turn subjects into transparent layers for posters, presentations, memes, stickers, and design work."],
] as const;

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appConfig.siteUrl}/#website`,
        name: appConfig.name,
        alternateName: ["Fly the BG", "Fly The BG", "Flythebg", "FlytheBG.com", "FlytheBG Image Tools"],
        url: appConfig.siteUrl,
        inLanguage: "en",
        description: homeDescription,
      },
      {
        "@type": "Organization",
        "@id": `${appConfig.siteUrl}/#publisher`,
        name: appConfig.name,
        alternateName: ["Fly the BG", "Fly The BG"],
        url: appConfig.siteUrl,
        logo: `${appConfig.siteUrl}/icon.svg`,
        email: appConfig.contactEmail,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${appConfig.siteUrl}/#app`,
        name: `${appConfig.name} AI Background Remover`,
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Background remover and image editing tool",
        operatingSystem: "Web",
        browserRequirements: "JavaScript and WebAssembly; WebGPU optional",
        url: appConfig.siteUrl,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: homeDescription,
        featureList: [
          "Browser-side AI background removal",
          "Transparent PNG export",
          "Alpha-edge refinement",
          "WebGPU and CPU/WASM inference",
          "Low-memory mobile processing",
          "Original aspect-ratio preservation",
          "Image cropping",
          "Passport photo positioning and print sheets",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
      },
    ],
  };

  return (
    <main className="homePage landingHome">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>
      <LocalAISimulator />

      <section className="landingProofStrip" aria-label="FlytheBG benefits">
        <div className="shell landingProofInner">
          <span><i>01</i><strong>Browser-side AI</strong><small>No image-processing server</small></span>
          <span><i>02</i><strong>Cleaner alpha edges</strong><small>Local matte refinement</small></span>
          <span><i>03</i><strong>Low-RAM aware</strong><small>Adaptive working resolution</small></span>
          <span><i>04</i><strong>Useful output</strong><small>PNG, crop, passport print</small></span>
        </div>
      </section>

      <section className="section landingBentoSection">
        <div className="shell">
          <div className="landingSectionHeading">
            <span className="eyebrow"><i/> Made for the browser you already have</span>
            <h2>Private by default.<br/><em>Polished on purpose.</em></h2>
            <p>A lightweight local workflow that adapts model size, memory use, edge cleanup, and output detail to the device in front of it.</p>
          </div>

          <div className="landingBento">
            <article className="bentoCard bentoPrivacy">
              <span className="bentoIndex">01 · Privacy</span>
              <h3>Your image does not need a round trip.</h3>
              <p>The AI model runs in the browser. FlytheBG serves the app and model assets; the working photo stays in local browser memory.</p>
              <div className="privacyDiagram"><span>YOUR PHOTO</span><b>→</b><span>LOCAL AI</span><b>→</b><span>PNG</span></div>
            </article>

            <article className="bentoCard bentoAccuracy">
              <span className="bentoIndex">02 · Accuracy</span>
              <h3>A better finish after segmentation.</h3>
              <p>FlytheBG now runs lightweight alpha cleanup after the model to reduce faint speckles, fill tiny pinholes, and improve boundary contrast.</p>
              <div className="maskVisual" aria-hidden="true"><i/><i/><i/><span>refined alpha</span></div>
            </article>

            <article className="bentoCard bentoMobile">
              <span className="bentoIndex">03 · Low memory</span>
              <h3>Budget phone? Use a smaller working frame.</h3>
              <p>Constrained devices reduce inference resolution and keep the quantized model. Stronger devices can spend more memory on image detail.</p>
              <div className="memoryMeter"><span>2 GB</span><i/><i/><i/><i className="active"/><b>8 GB+</b></div>
            </article>

            <Link href="/features/passport-photo" className="bentoCard bentoPassport">
              <span className="bentoIndex">04 · Passport tool</span>
              <h3>Remove. Reposition. Size. Print.</h3>
              <p>Build 35 × 45 mm, 2 × 2 inch, and custom photo sheets with manual positioning, zoom, paper controls, and print at 100%.</p>
              <span className="bentoLink">Open Passport Photo Maker ↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section publicDomainSamples landingSamples">
        <div className="shell">
          <div className="landingSectionHeading splitLandingHeading">
            <div><span className="eyebrow"><i/> See the idea instantly</span><h2>From scene to <em>transparent layer.</em></h2><p>Real public-domain / CC0 subjects demonstrate the before-and-after presentation without using copyrighted commercial samples.</p></div>
            <Link className="textLink" href="/remove-background">Try your own photo ↗</Link>
          </div>
          <div className="sampleComparisonGrid">
            {publicDomainSamples.map((sample) => (
              <article className="sampleComparison" key={sample.title}>
                <div className="sampleTop"><strong>{sample.title}</strong><span>Public-domain demo</span></div>
                <div className="sampleBeforeAfter">
                  <div className="samplePane"><label>Before</label><img src={sample.image} alt={`${sample.title} subject placed over a sample background`} loading="lazy" /></div>
                  <div className="samplePane after"><label>After</label><img src={sample.image} alt={`${sample.title} subject on a transparent checkerboard`} loading="lazy" /></div>
                </div>
                <div className="sampleLicense">{sample.note}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section landingUseCases">
        <div className="shell">
          <div className="landingSectionHeading centeredHeading">
            <span className="eyebrow"><i/> One remover, lots of everyday jobs</span>
            <h2>A free background remover for <em>real images.</em></h2>
            <p>Use FlytheBG for product photos, portraits, passport-photo preparation, and transparent creative assets without forcing every image into the same ratio.</p>
          </div>
          <div className="useCaseGrid">
            {useCases.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section landingWorkflow">
        <div className="shell">
          <div className="landingSectionHeading centeredHeading"><span className="eyebrow"><i/> Three steps</span><h2>Drop it. Separate it. <em>Use it.</em></h2></div>
          <ol className="landingSteps">
            <li><span>01</span><div><strong>Choose any normal image</strong><p>Drag, drop, paste, or browse. Portrait, landscape, square, vertical, and panoramic frames keep their proportions.</p></div></li>
            <li><span>02</span><div><strong>Local AI adapts to the device</strong><p>WebGPU is preferred where available. Lower-memory hardware uses a smaller working frame and quantized model; stronger devices can try FP16.</p></div></li>
            <li><span>03</span><div><strong>Refine and export</strong><p>The result is validated, eligible masks receive local alpha cleanup, and the transparent PNG can be downloaded, cropped, or used for passport sheets.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section faqSection landingFaq" id="faq">
        <div className="shell faqGrid">
          <div className="landingSectionHeading faqHeading"><span className="eyebrow"><i/> FAQ</span><h2>Questions before your first <em>cutout.</em></h2><p>Hover to preview answers on desktop. Tap or use the keyboard to keep the normal accessible details behavior.</p></div>
          <HoverFaqList items={faqs} />
        </div>
      </section>

      <section className="finalCta landingFinalCta">
        <div className="shell landingFinalInner">
          <span className="heroBadge"><i/> No signup needed</span>
          <h2>Your next transparent PNG<br/><em>can stay on your device.</em></h2>
          <p>Open the remover, choose a photo, and let the browser do the work.</p>
          <div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link><Link className="buttonSecondary" href="/features/passport-photo">Passport photo maker</Link></div>
        </div>
      </section>
    </main>
  );
}
