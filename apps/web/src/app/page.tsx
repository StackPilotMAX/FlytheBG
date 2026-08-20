import type { Metadata } from "next";
import Link from "next/link";
import { BeforeAfterSamples } from "@/components/BeforeAfterSamples";
import { HoverFaqList } from "@/components/HoverFaqList";
import { LocalAISeparation3D } from "@/components/LocalAISeparation3D";
import { appConfig } from "@/lib/config";

const homeTitle = "FlytheBG — Free Background Remover | Remove Image Background Online";
const homeDescription = "Free browser background remover for portraits, products, cars, passport photos, landscapes, vertical images, and panoramas. Remove image backgrounds locally and download a transparent PNG.";

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
    images: [{ url: "/brand/icon-512.png", width: 512, height: 512, alt: "FlytheBG background remover logo" }],
  },
  twitter: { card: "summary", title: homeTitle, description: homeDescription, images: ["/brand/icon-512.png"] },
};

const faqs = [
  ["What is FlytheBG?", "FlytheBG, also written as Fly the BG, is a browser-based image background remover and passport-photo tool. Its current background-removal workflow runs locally on the visitor's device."],
  ["Can I search for Fly the BG or FlytheBG?", "Yes. FlytheBG is the product name and Fly the BG is a natural spaced version of the same name. The site uses both names in descriptive and structured metadata so search engines can learn the relationship over time."],
  ["Can FlytheBG remove backgrounds from different image ratios?", "Yes. Normal portrait, landscape, square, vertical, and panoramic raster images keep their original aspect ratio. The inference copy is scaled without stretching, and the resulting transparency mask is applied back to the source frame."],
  ["Does FlytheBG upload my photo?", "The current background remover and Passport Photo Maker do not intentionally send selected image bytes to a FlytheBG background-removal server. Model and runtime files are downloaded by the browser when local AI is requested."],
  ["Why does FlytheBG resize the image before AI runs?", "Large camera photos can consume a lot of mobile RAM. FlytheBG creates a smaller aspect-ratio-preserving inference copy so the local model has fewer pixels to process, then applies the alpha mask back to the source dimensions."],
  ["Will FlytheBG work on a low-end phone?", "FlytheBG detects a conservative local device profile and reduces inference resolution on memory-constrained or touch devices. This improves the chance of success, but no browser-only ML tool can guarantee identical results on every phone, browser, and image."],
  ["What happens if WebGPU fails?", "The same small quantized model automatically retries on CPU/WASM. If that still fails for a non-network reason, FlytheBG makes one lighter local inference copy and retries again without downloading a second large ML model."],
  ["Does downscaling make the downloaded photo blurry?", "The model estimates transparency on the optimized copy, but FlytheBG reapplies that mask to the original source pixels. The source color/detail pixels are not replaced by the lower-resolution inference image."],
  ["Can every background be removed perfectly?", "No automatic segmentation model is perfect for every image. Fine hair, fur, glass, smoke, reflections, motion blur, and low-contrast boundaries can remain difficult and should be checked before final use."],
  ["Why can the first background removal take longer?", "The browser may need to download the IMG.LY model and runtime files before the first removal. Later runs can be faster when those software assets remain in browser cache."],
  ["Can I create passport-size photos manually?", "Yes. The Passport Photo Maker lets you drag the photo, nudge it with directional controls, adjust horizontal and vertical position, zoom, choose the printed size, choose paper, fill a sheet, download it, or open the browser print dialog."],
  ["Do I need an account or backend server?", "No account or FlytheBG image-inference backend is required for the current browser workflow. Static hosting serves the app while the visitor's browser performs image processing."],
] as const;

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appConfig.siteUrl}/#website`,
        name: "FlytheBG",
        alternateName: ["Fly the BG", "FlytheBG Background Remover", "Fly the BG Remove Background", "flythebg.com"],
        url: appConfig.siteUrl,
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${appConfig.siteUrl}/#publisher`,
        name: "FlytheBG",
        alternateName: "Fly the BG",
        url: appConfig.siteUrl,
        logo: { "@type": "ImageObject", url: `${appConfig.siteUrl}/brand/icon-512.png`, width: 512, height: 512 },
        email: appConfig.contactEmail,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${appConfig.siteUrl}/#app`,
        name: "FlytheBG Background Remover",
        alternateName: ["Fly the BG", "FlytheBG"],
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Background remover",
        operatingSystem: "Web",
        url: `${appConfig.siteUrl}/remove-background`,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Free browser-based image background remover with transparent PNG export and original aspect-ratio preservation.",
        featureList: ["Remove image background", "Local browser AI", "Adaptive low-memory inference", "Original aspect-ratio preservation", "Transparent PNG export", "Passport photo sizing", "Print-sheet generation"],
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
      <LocalAISeparation3D />

      <BeforeAfterSamples />

      <section className="section showcaseSection">
        <div className="shell showcaseGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Any normal image ratio</span><h2>Your frame stays your frame.</h2><p>The browser model receives a lighter inference copy without changing the source proportions. A portrait stays tall, a landscape stays wide, and a panorama keeps its full canvas.</p><div className="ratioCloud" aria-label="Example supported aspect ratios"><span>1:1 square</span><span>4:3</span><span>3:4</span><span>16:9</span><span>9:16</span><span>3:2</span><span>2:3</span><span>21:9</span><span>custom</span></div></div>
          <div className="demoFrame" aria-label="Background removal workflow visualization"><div className="demoToolbar"><span><i/> local background removal</span><span>source → mask → PNG</span></div><div className="demoCanvas"><div className="demoSubjectCutout"/><div className="demoDivider"><span>↔</span></div><div className="demoLabels"><span>Source frame</span><span>Transparent PNG</span></div></div></div>
        </div>
      </section>

      <section className="section trustSection">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Browser-first reliability</span><h2>Less work for the model. More breathing room for your phone.</h2><p>The local pipeline preprocesses a smaller inference image instead of forcing the ML runtime to segment every source pixel.</p></div>
          <div className="trustGrid">
            <article><span>01 · Adaptive</span><h3>Inference size follows the device.</h3><p>Memory-constrained and touch devices use a lighter profile. More capable desktop devices can use a larger inference copy for extra mask detail.</p></article>
            <article><span>02 · Retry</span><h3>WebGPU → CPU/WASM → lighter retry.</h3><p>FlytheBG uses the same small quantized model for automatic attempts. It does not silently download the much larger FP16 model after a failure.</p></article>
            <article><span>03 · Restore</span><h3>Original source pixels stay sharp.</h3><p>The local model estimates transparency. FlytheBG then applies the refined alpha mask to the source frame rather than enlarging the low-resolution inference colors.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolsSection" id="tools">
        <div className="shell">
          <div className="sectionHeading splitHeading"><div><span className="eyebrow"><i/> Free image tools</span><h2>Remove a background or build a passport-photo sheet.</h2></div><Link className="textLink" href="/features">View all features ↗</Link></div>
          <div className="toolCards">
            <Link href="/remove-background" className="toolFeatureCard primaryFeature"><span className="featureIndex">01</span><div className="featureMark">✦</div><h3>Free Background Remover</h3><p>Choose, drag, drop, or paste an image. Local browser AI estimates the foreground and exports a transparent PNG while preserving the source aspect ratio.</p><span className="featureCta">Remove image background <b>↗</b></span></Link>
            <Link href="/features/passport-photo" className="toolFeatureCard"><span className="featureIndex">02</span><div className="featureMark">▣</div><h3>Passport Photo Maker</h3><p>Remove the background locally or keep the original, manually move and zoom the subject, set exact physical dimensions, fill a print sheet, and print at 100%.</p><span className="featureCta">Make passport photos <b>↗</b></span></Link>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> How it works</span><h2>Remove an image background without a FlytheBG image server.</h2><p>The current production workflow keeps the selected image in browser memory while local inference runs.</p></div>
          <ol className="workflowSteps">
            <li><span>01</span><div><strong>Select the image</strong><p>Use the file picker, drag and drop, or paste an image where supported.</p></div></li>
            <li><span>02</span><div><strong>Create an optimized inference copy</strong><p>The browser preserves the source ratio while reducing the pixels the model has to process.</p></div></li>
            <li><span>03</span><div><strong>Run local AI</strong><p>WebGPU is preferred on compatible devices. CPU/WASM and a lighter recovery path are automatic fallbacks.</p></div></li>
            <li><span>04</span><div><strong>Refine alpha and restore</strong><p>Near-transparent/near-opaque mask pixels are cleaned conservatively before the mask is applied to the original source pixels.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> FlytheBG FAQ</span><h2>Hover a question. It opens. Move away. It closes.</h2><p>On touch devices, tap a question instead. The answers describe the real current browser architecture rather than promising perfect output on every photo.</p></div>
          <HoverFaqList items={faqs}/>
        </div>
      </section>

      <section className="finalCta"><div className="shell finalCtaInner"><div><span className="eyebrow"><i/> No account required</span><h2>Drop a photo. Keep it local.</h2><p>Portrait, product, car, square, vertical, landscape, or panorama.</p></div><div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link><Link className="buttonSecondary" href="/features/passport-photo">Make passport photos</Link></div></div></section>
    </main>
  );
}
