import type { Metadata } from "next";
import Link from "next/link";
import { HoverFaqList } from "@/components/HoverFaqList";
import { LocalAISimulator } from "@/components/LocalAISimulator";
import { appConfig } from "@/lib/config";

const homeTitle = "FlytheBG — Free Local AI Background Remover & Passport Photo Maker";
const homeDescription = "Remove image backgrounds locally in your browser with FlytheBG. Keep portrait, landscape, square, vertical, and panoramic aspect ratios, export transparent PNGs, and make printable passport-photo sheets.";

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
  ["Is FlytheBG really 100% browser-side for image processing?", "Yes. The current remover and passport-photo workflow process the working image in browser memory. The browser still downloads application code, the AI model, and runtime assets, but FlytheBG does not intentionally upload your source photo to an image-processing server."],
  ["Can FlytheBG remove backgrounds on a 3 GB RAM phone?", "FlytheBG now uses a low-memory guard that reduces the working image size before inference on constrained devices and defaults to the smaller quantized model. Very old browsers or extremely large photos can still hit device limits, but the path is designed to fail less often on budget phones."],
  ["Does FlytheBG use a higher-quality model on powerful devices?", "On devices with enough reported memory and WebGPU support, FlytheBG can try the FP16 model for a higher-quality mask. If it cannot finish, the app automatically falls back to the smaller quantized model."],
  ["Can FlytheBG remove backgrounds from different image ratios?", "Yes. Portrait, landscape, square, vertical, and panoramic browser-decodable raster images are accepted without forcing a square crop. Low-memory devices may use a smaller working resolution while preserving the aspect ratio."],
  ["Why can the first background removal take longer?", "The browser must download the local model and runtime assets on the first run. Later runs can be faster because the browser may cache those assets."],
  ["What if WebGPU does not work?", "FlytheBG automatically retries using CPU/WASM. The runtime also has a browser-safe ESM fallback for common bundled WASM or worker initialization failures."],
  ["How are difficult edges handled?", "Hair, fur, glass, smoke, motion blur, and low-contrast boundaries remain difficult for any automatic segmentation model. Powerful devices can try the FP16 path for a better mask, while low-memory devices prioritize reliability."],
  ["Can I manually move and zoom a passport photo?", "Yes. In the Passport Photo Maker, drag the person to reposition, scroll or use the slider to zoom, choose the background color, set exact dimensions, and preview the final print sheet."],
  ["Can I print passport photos directly?", "Yes. Build the sheet and choose Print at 100%. FlytheBG opens a print-ready page sized to your selected paper. In the print dialog, keep scaling at Actual Size or 100%."],
  ["Are passport-photo sizes guaranteed to be accepted?", "No. Authorities can have requirements beyond width and height, including head size, eye position, expression, lighting, clothing, and background rules. Always verify the official requirements for your document."],
  ["Why might Google show FlytheBG without the logo for a while?", "Google controls when a favicon is refreshed in search results. FlytheBG exposes a square favicon and structured site information, but Google must recrawl and process the homepage before the search appearance changes."],
] as const;

const publicDomainSamples = [
  {
    title: "Historic portrait cutout",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Eliza_Cook_0S_1860s.png?width=520",
    note: "Public-domain/CC0 transparent portrait from Wikimedia Commons",
  },
  {
    title: "Butterfly cutout",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Danaus_genutia_transparent_background.png?width=520",
    note: "Public-domain/CC0 transparent specimen from Wikimedia Commons",
  },
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
        name: `${appConfig.name} Local AI Image Tools`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        url: appConfig.siteUrl,
        isAccessibleForFree: true,
        description: "Browser-only background removal, transparent PNG cropping, and passport-photo sheet generation with aspect-ratio preservation and local AI inference.",
        featureList: ["Browser-only background removal", "WebGPU and CPU/WASM inference", "Low-memory mobile mode", "Transparent PNG export", "Image cropping", "Passport photo positioning", "Print-sheet generation"],
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
      <LocalAISimulator />

      <section className="section publicDomainSamples">
        <div className="shell">
          <div className="sectionHeading splitHeading">
            <div><span className="eyebrow"><i/> Real sample subjects</span><h2>Before vs. transparent cutout.</h2><p>These sample subjects use public-domain / CC0 transparent images. The “before” panel places the same real subject over a synthetic background; the “after” panel shows the transparent cutout on a checkerboard.</p></div>
            <Link className="textLink" href="/remove-background">Try your own photo ↗</Link>
          </div>
          <div className="sampleComparisonGrid">
            {publicDomainSamples.map((sample) => (
              <article className="sampleComparison" key={sample.title}>
                <div className="sampleTop"><strong>{sample.title}</strong><span>Public-domain demo</span></div>
                <div className="sampleBeforeAfter">
                  <div className="samplePane"><label>Before</label><img src={sample.image} alt={`${sample.title} placed over a sample background`} loading="lazy" /></div>
                  <div className="samplePane after"><label>After</label><img src={sample.image} alt={`${sample.title} on a transparent checkerboard`} loading="lazy" /></div>
                </div>
                <div className="sampleLicense">{sample.note}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section trustSection">
        <div className="shell">
          <div className="sectionHeading">
            <span className="eyebrow"><i/> Local AI, tuned for real devices</span>
            <h2>One browser workflow, two quality levels.</h2>
            <p>FlytheBG prioritizes a smaller model and reduced working resolution on constrained devices, while stronger WebGPU devices can try the FP16 path before falling back automatically.</p>
          </div>
          <div className="trustGrid">
            <article><span>01 · Low-memory mode</span><h3>Budget-phone friendly.</h3><p>On low-RAM devices, oversized images are reduced to a safer working edge before inference. The image ratio is preserved and the UI clearly reports the model path being used.</p></article>
            <article><span>02 · Smart quality</span><h3>FP16 when the device can handle it.</h3><p>Higher-memory WebGPU devices can try the larger FP16 mask model. If it fails, FlytheBG drops back to the smaller quantized model rather than requiring a backend.</p></article>
            <article><span>03 · Runtime recovery</span><h3>GPU → CPU → browser-safe ESM.</h3><p>WebGPU remains the fast path. CPU/WASM is the compute fallback, and the app can recover from common bundled runtime initialization failures using a browser-safe ESM loader.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolsSection" id="tools">
        <div className="shell">
          <div className="sectionHeading splitHeading"><div><span className="eyebrow"><i/> Live tools</span><h2>Remove the BG. Then make the output useful.</h2></div><Link className="textLink" href="/features">View all features ↗</Link></div>
          <div className="toolCards">
            <Link href="/remove-background" className="toolFeatureCard primaryFeature">
              <span className="featureIndex">01</span><div className="featureMark">✦</div><h3>Remove Background</h3><p>Choose, drag, drop, or paste an image. FlytheBG preserves its ratio, selects a browser model based on device capability, and exports a transparent PNG.</p><span className="featureCta">Open remover <b>↗</b></span>
            </Link>
            <Link href="/features/passport-photo" className="toolFeatureCard">
              <span className="featureIndex">02</span><div className="featureMark">▣</div><h3>Passport Photo Maker</h3><p>Remove the background or keep the original, manually move and zoom the person, set exact physical dimensions, choose a background, fill a print sheet, and print at 100%.</p><span className="featureCta">Open passport maker <b>↗</b></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Simple by design</span><h2>From source image to transparent PNG.</h2><p>The current production path remains on the visitor’s device and adapts to the hardware it finds.</p></div>
          <ol className="workflowSteps">
            <li><span>01</span><div><strong>Select any normal frame</strong><p>Portrait, landscape, square, vertical, panorama, drag and drop, file picker, or paste where supported.</p></div></li>
            <li><span>02</span><div><strong>Protect low-memory devices</strong><p>Large working images are reduced only when the device is likely to struggle. The aspect ratio remains unchanged.</p></div></li>
            <li><span>03</span><div><strong>Run local AI</strong><p>Strong WebGPU devices can try FP16. Constrained devices use the smaller quantized model. CPU/WASM remains available when WebGPU is unavailable.</p></div></li>
            <li><span>04</span><div><strong>Download, crop, or print</strong><p>Use the transparent result directly, crop it, or move into the Passport Photo Maker for exact physical sizing and print layout.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> FAQ</span><h2>Hover to peek. Tap to keep it open.</h2><p>Desktop pointer users get automatic open/close behavior. Touch and keyboard users keep the normal accessible details interaction.</p></div>
          <HoverFaqList items={faqs} />
        </div>
      </section>

      <section className="finalCta">
        <div className="shell finalCtaInner"><div><span className="eyebrow"><i/> No account required</span><h2>Try the image already on your device.</h2><p>Keep your frame, remove the background, and stay browser-side.</p></div><div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link><Link className="buttonSecondary" href="/features/passport-photo">Make passport photos</Link></div></div>
      </section>
    </main>
  );
}
