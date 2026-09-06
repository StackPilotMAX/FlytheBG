import Link from "next/link";

export const metadata = {
  title: "About FlyThe BG | Browser-First Image & Media Tools",
  description:
    "Learn how FlyThe BG works, which browser-first image and media tools are live, how privacy is handled, and what the product does and does not promise.",
  keywords: [
    "FlyThe BG",
    "browser-first image tools",
    "background remover",
    "passport photo maker",
    "visa photo maker",
    "video compressor",
    "browser privacy",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About FlyThe BG | Browser-First Image & Media Tools",
    description:
      "Explore FlyThe BG's browser-first image and media tools, processing architecture, privacy boundary, and product principles.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About FlyThe BG | Browser-First Image & Media Tools",
    description:
      "Learn how FlyThe BG's browser-first tools work and what the product does and does not promise.",
  },
};

export default function AboutPage() {
  return (
    <main className="featurePage">
      <section className="pageHero">
        <div className="shell narrowHero">
          <span className="eyebrow"><i /> About FlyThe BG</span>
          <h1>A browser-first media toolkit built around useful, explainable workflows.</h1>
          <p>
            FlyThe BG is a production web application for practical image and media tasks: background removal, image cleanup, measured passport and visa photo preparation, and browser-based video compression. The product focuses on complete workflows, clear limitations, and privacy-aware processing rather than a large catalog of unfinished utilities.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i /> What is live</span>
            <h2>Focused tools that solve specific media problems.</h2>
            <p>
              The public product catalog is intentionally limited to workflows that have a usable interface, supporting guidance, and a clear processing path.
            </p>
          </div>
          <div className="principleList">
            <article>
              <strong>Background removal</strong>
              <p>A browser-first AI workflow for creating transparent cutouts. Where supported, model inference runs on the device with browser capabilities such as WebGPU and CPU/WASM fallback.</p>
              <Link className="textLink" href="/remove-background">Open Background Remover ↗</Link>
            </article>
            <article>
              <strong>Passport &amp; Visa Photo Maker</strong>
              <p>One measured photo workspace supports passport and visa preparation, including physical dimensions, crop framing, repeated copies, printable sheets, and DPI-aware output. Official authority requirements remain the source of truth.</p>
              <Link className="textLink" href="/features/passport-photo">Open Passport &amp; Visa Photo Maker ↗</Link>
            </article>
            <article>
              <strong>AI image and media cleanup</strong>
              <p>The watermark-removal workspace is explicitly presented for supported and authorized media. Automatic detection is a candidate-finding aid, not an official recognition system, and users remain responsible for rights and platform rules.</p>
              <Link className="textLink" href="/ai-watermark-remover">Open Media Cleanup ↗</Link>
            </article>
            <article>
              <strong>Browser video compressor</strong>
              <p>Video compression uses browser-compatible media processing with quality presets, source-aware bitrate handling, resolution controls, target-size logic, progress reporting, and decoder capability checks where supported.</p>
              <Link className="textLink" href="/tools/video-compressor">Open Video Compressor ↗</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell">
          <div className="sectionHeading">
            <span className="eyebrow"><i /> How the product works</span>
            <h2>A modern web application with browser-first processing where the selected tool supports it.</h2>
            <p>
              FlyThe BG is maintained as a structured Next.js application with React and TypeScript, managed in GitHub and built for production as a static web output. The browser downloads the application and any model or runtime assets required by the selected workflow; supported editing work is then performed in the browser rather than by a FlyThe BG image-processing server.
            </p>
          </div>
          <div className="infoCards">
            <article>
              <span>1 · Select</span>
              <h2>Your file enters the selected browser workflow.</h2>
              <p>File selection, drag-and-drop, and supported paste flows provide the source media to the page. The application validates the input before starting the more expensive processing step.</p>
            </article>
            <article>
              <span>2 · Process</span>
              <h2>The browser uses the capabilities required by the tool.</h2>
              <p>Image workflows can use local model/runtime processing, while video compression uses browser media APIs and supported codecs. Some capabilities vary by browser, device, file format, and available hardware.</p>
            </article>
            <article>
              <span>3 · Export</span>
              <h2>The browser prepares the result for the user.</h2>
              <p>The selected workflow creates its output in the browser for download or printing. This architecture reduces the need to upload working image bytes to a FlyThe BG inference server for supported local workflows.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i /> Privacy boundary</span>
            <h2>Browser-first does not mean making absolute privacy promises.</h2>
            <p>
              FlyThe BG describes privacy according to the actual processing path of each feature. Supported local workflows keep working media in browser memory instead of intentionally sending it to a FlyThe BG image-processing server, while the browser still downloads application, model, runtime, font, video, and other required assets.
            </p>
          </div>
          <div className="principleList">
            <article>
              <strong>Local where supported</strong>
              <p>Background removal, photo preparation, and supported media operations are designed around browser-side processing and browser memory.</p>
            </article>
            <article>
              <strong>External services only when required</strong>
              <p>The privacy boundary is feature-specific. A browser-first architecture does not imply that every future or optional service will be local.</p>
            </article>
            <article>
              <strong>Your device still matters</strong>
              <p>FlyThe BG cannot control browser caches, downloaded files, extensions, screenshots, operating-system behavior, or other software on a visitor's device.</p>
            </article>
            <article>
              <strong>Read the full policy</strong>
              <p>For the current image lifecycle, advertising boundary, model/runtime assets, and related privacy details, use the dedicated policy page.</p>
              <Link className="textLink" href="/privacy">Read Privacy &amp; AI Policy ↗</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i /> Product principles</span>
            <h2>Useful content and honest limitations are part of the product.</h2>
            <p>A tool page should still help a visitor understand the task, requirements, workflow, and limitations before they select a file.</p>
          </div>
          <div className="principleList">
            <article>
              <strong>People-first guidance</strong>
              <p>Tool pages are supported by instructions, FAQs, guides, and related links so visitors can understand what to do with the result.</p>
            </article>
            <article>
              <strong>No acceptance guarantees</strong>
              <p>Passport and visa output is measured for physical dimensions, but the receiving authority's current rules determine whether a photo is acceptable.</p>
            </article>
            <article>
              <strong>No perfect AI guarantee</strong>
              <p>Hair, fur, glass, smoke, reflections, low contrast, blur, and difficult edges can produce imperfect image masks. Important results should be checked before use.</p>
            </article>
            <article>
              <strong>No search-engine-first catalog</strong>
              <p>New public pages should provide genuine user value rather than creating thin near-duplicate pages for individual keyword variations.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article>
            <span>Guides</span>
            <h2>Learn before you edit.</h2>
            <p>FlyThe BG's guides cover practical topics such as background removal, passport-photo sizing, printing, browser privacy, and related media workflows.</p>
            <Link className="textLink" href="/guides">Browse Guides ↗</Link>
          </article>
          <article>
            <span>Transparency</span>
            <h2>Know what the product can and cannot do.</h2>
            <p>The model disclosure explains AI-assisted features and their limitations, while the legal pages cover terms, cookies, privacy, and responsible use.</p>
            <Link className="textLink" href="/model-disclosure">Read Model Disclosure ↗</Link>
          </article>
          <article>
            <span>Support</span>
            <h2>Questions, feedback, and security reports.</h2>
            <p>Product support, privacy questions, legal notices, and security reports use the contact channel published by FlyThe BG.</p>
            <Link className="textLink" href="/contact">Contact FlyThe BG ↗</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
