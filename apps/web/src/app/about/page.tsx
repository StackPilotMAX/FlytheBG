import Link from "next/link";

export const metadata = {
  title: "About FlyThe BG | Browser-First Image & Media Tools",
  description:
    "Learn how FlyThe BG was built, why it exists, which browser-first image and media tools are live, how privacy is handled, and what the product does and does not promise.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About FlyThe BG | Browser-First Image & Media Tools",
    description:
      "Explore FlyThe BG's mission, browser-first architecture, image and media tools, privacy boundary, and product principles.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About FlyThe BG | Browser-First Image & Media Tools",
    description:
      "Learn why FlyThe BG exists, how its browser-first tools work, and what the product does and does not promise.",
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
            FlyThe BG was created to make everyday image and media preparation simpler, more accessible, and less dependent on complicated desktop software. The product brings practical browser-based utilities together in one place, with a focus on complete workflows, clear limitations, privacy-aware design, and useful documentation.
          </p>
          <p>
            The goal is not to publish a large collection of pages that exist only to target search queries. Each product area is intended to solve a recognizable task: removing a background, preparing a passport or visa photograph, cleaning up supported media, compressing a video, or learning how to prepare an image correctly before publishing or submitting it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i /> Why it exists</span>
            <h2>Useful media tools should explain the task as well as perform it.</h2>
            <p>
              Many ordinary media tasks require installing software, learning a complex interface, or paying for features that are only needed occasionally. FlyThe BG is designed to reduce that friction through focused browser-based workflows and supporting guidance.
            </p>
            <p>
              The product combines interactive tools with instructions, FAQs, guides, privacy information, and transparent limitations. The result should be a place where a visitor can understand the task, use an appropriate tool, and make an informed decision about the exported result.
            </p>
          </div>
          <div className="principleList">
            <article>
              <strong>Practical first</strong>
              <p>Tools are organized around real media jobs rather than a collection of thin keyword variations.</p>
            </article>
            <article>
              <strong>Explain before export</strong>
              <p>Dimensions, file formats, workflow instructions, limitations, and related guidance are part of the user experience.</p>
            </article>
            <article>
              <strong>Privacy-aware by design</strong>
              <p>Supported local workflows are designed to keep working media in the browser instead of intentionally sending it to a FlyThe BG image-processing server.</p>
            </article>
            <article>
              <strong>Honest about uncertainty</strong>
              <p>AI results, browser compatibility, codecs, official document requirements, and third-party services all have technical boundaries.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i /> What is live</span>
            <h2>Focused tools that solve specific image and media problems.</h2>
            <p>
              The public catalog is intentionally focused on workflows with a usable interface, a defined processing path, and supporting information.
            </p>
          </div>
          <div className="principleList">
            <article>
              <strong>Background removal</strong>
              <p>A browser-first AI workflow for creating transparent cutouts. Where supported, model inference can run on the device using browser capabilities such as WebGPU with CPU/WASM fallback.</p>
              <Link className="textLink" href="/remove-background">Open Background Remover ↗</Link>
            </article>
            <article>
              <strong>Passport &amp; Visa Photo Maker</strong>
              <p>One measured photo workspace supports passport and visa preparation, including physical dimensions, crop framing, repeated copies, printable sheets, and DPI-aware output. The receiving authority's current requirements remain the source of truth.</p>
              <Link className="textLink" href="/features/passport-photo">Open Passport &amp; Visa Photo Maker ↗</Link>
            </article>
            <article>
              <strong>AI image and media cleanup</strong>
              <p>The watermark-removal workspace is presented for supported and authorized media. Automatic detection is a candidate-finding aid rather than an official recognition system, and users remain responsible for rights and platform rules.</p>
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
              FlyThe BG is maintained as a structured Next.js application using React and TypeScript. Its source is managed in GitHub and the production application is built for deployment as a static web output. The browser downloads the application and any model or runtime assets required by the selected workflow.
            </p>
            <p>
              For supported local workflows, editing work is performed in the browser rather than by a FlyThe BG image-processing server. Video compression similarly uses browser-compatible media processing. Some capabilities vary according to browser, device hardware, memory, file format, codec support, and external dependencies.
            </p>
          </div>
          <div className="infoCards">
            <article>
              <span>1 · Select</span>
              <h2>Choose the task and source media.</h2>
              <p>The page validates supported file types and sizes before starting the more expensive processing step.</p>
            </article>
            <article>
              <span>2 · Process</span>
              <h2>Use the capabilities required by the selected tool.</h2>
              <p>Image workflows can use local model/runtime processing, while video compression uses browser media APIs and supported codecs.</p>
            </article>
            <article>
              <span>3 · Export</span>
              <h2>Review and download the result.</h2>
              <p>The selected workflow prepares its output in the browser for download or printing. Users should review important outputs before relying on them.</p>
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
              <p>The privacy boundary is feature-specific. A browser-first architecture does not imply that every current or future service will be local.</p>
            </article>
            <article>
              <strong>Your device still matters</strong>
              <p>FlyThe BG cannot control browser caches, downloaded files, extensions, screenshots, operating-system behavior, or other software on a visitor's device.</p>
            </article>
            <article>
              <strong>Read the full policy</strong>
              <p>The dedicated privacy page explains working media, model/runtime assets, cookies, advertising, third-party services, and related limitations.</p>
              <Link className="textLink" href="/privacy">Read Privacy Policy ↗</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i /> Product principles</span>
            <h2>Trust comes from useful content and honest limitations.</h2>
            <p>
              FlyThe BG treats documentation, transparency, and realistic expectations as part of the product rather than as filler around an upload button.
            </p>
          </div>
          <div className="principleList">
            <article>
              <strong>People-first guidance</strong>
              <p>Tool pages are supported by instructions, FAQs, guides, and related links so visitors can understand what to do with the result.</p>
            </article>
            <article>
              <strong>No acceptance guarantees</strong>
              <p>Passport and visa output can be measured for physical dimensions, but the receiving authority's current rules determine whether a photograph is acceptable.</p>
            </article>
            <article>
              <strong>No perfect AI guarantee</strong>
              <p>Hair, fur, glass, smoke, reflections, low contrast, blur, and difficult edges can produce imperfect masks or edits. Important results should be checked before use.</p>
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
            <p>Read practical guidance on background removal, passport-photo sizing, printing, browser privacy, and related media workflows.</p>
            <Link className="textLink" href="/guides">Browse Guides ↗</Link>
          </article>
          <article>
            <span>Transparency</span>
            <h2>Understand the technology and its boundaries.</h2>
            <p>The model disclosure explains AI-assisted features and their limitations, while the legal pages cover privacy, cookies, terms, and responsible use.</p>
            <Link className="textLink" href="/model-disclosure">Read Model Disclosure ↗</Link>
          </article>
          <article>
            <span>Support</span>
            <h2>Questions, feedback, and security reports.</h2>
            <p>Product support, privacy questions, legal notices, and security reports can be submitted through the published contact channel.</p>
            <Link className="textLink" href="/contact">Contact FlyThe BG ↗</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
