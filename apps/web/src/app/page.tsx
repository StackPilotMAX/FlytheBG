import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { FlytheBGLogo } from "@/components/FlytheBGLogo";
import { HoverFaqList } from "@/components/HoverFaqList";
import { appConfig } from "@/lib/config";

const homeTitle = "FLYTHEBG | Free Background Remover & Passport Photo Maker";
const homeDescription = "FLYTHEBG is a free browser-first image toolkit for removing photo backgrounds, creating transparent PNGs, and making print-ready passport photo sheets. Your working photo stays on your device.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "FLYTHEBG",
    "FlytheBG",
    "Fly the BG",
    "flythebg.com",
    "free background remover",
    "remove background online",
    "local AI background remover",
    "private background remover",
    "transparent PNG maker",
    "passport photo maker",
    "passport size photo maker",
    "browser background remover",
  ],
  alternates: { canonical: "/" },
  openGraph: { title: homeTitle, description: homeDescription, url: "/", siteName: "FLYTHEBG", locale: "en_US", type: "website" },
  twitter: { card: "summary", title: homeTitle, description: homeDescription },
};

const landingFaqs = [
  ["Does my photo stay on my device?", "The current image tools are designed to keep the working source and generated output in browser memory. The page still downloads app, model, runtime, video, font, and optional advertising assets separately."],
  ["Which model does background removal use?", "FlytheBG integrates IMG.LY's browser background-removal package and can use quantized IS-Net or FP16 IS-Net depending on device capability, with CPU/WASM fallback when WebGPU cannot finish."],
  ["Where can I read all FAQs?", "FlytheBG has a dedicated FAQ page, plus deeper FAQ sections on the Background Remover and Passport Photo Maker pages."],
] as const;

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${appConfig.siteUrl}/#website`, name: "FLYTHEBG", alternateName: ["FlytheBG", "Fly the BG", "FlytheBG.com"], url: appConfig.siteUrl, inLanguage: "en", description: homeDescription },
      { "@type": "Organization", "@id": `${appConfig.siteUrl}/#publisher`, name: "FLYTHEBG", alternateName: "FlytheBG", url: appConfig.siteUrl, logo: `${appConfig.siteUrl}/brand/flythebg-mark.svg`, ...(appConfig.contactEmail ? { email: appConfig.contactEmail } : {}) },
      {
        "@type": "SoftwareApplication",
        "@id": `${appConfig.siteUrl}/#app`,
        name: "FLYTHEBG Background Remover & Passport Photo Maker",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        browserRequirements: "JavaScript and WebAssembly; WebGPU optional",
        url: appConfig.siteUrl,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: homeDescription,
        featureList: ["Local browser background removal", "Transparent PNG export", "Passport photo sizing and print sheets", "Manual per-photo passport positioning", "WebGPU and CPU/WASM inference"],
      },
    ],
  };

  return (
    <main className="cinematicLanding">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

      <section className="cinematicHero">
        <div className="cinematicHeroWash" aria-hidden="true" />
        <div className="cinematicHeroLayer">
          <nav className="cinematicNav" aria-label="FLYTHEBG tools">
            <FlytheBGLogo className="cinematicLogo" imageClassName="cinematicBrandMark" size={28} />
            <div className="cinematicTabs">
              <Link href="/remove-background">Remove BG</Link>
              <Link href="/features/passport-photo">Passport</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/privacy">Security</Link>
              <Link href="/about">About</Link>
            </div>
          </nav>

          <div className="landingHeroAd" aria-label="Top advertisement placement">
            <AdPlaceholder slot="landing-inline-1" format="leaderboard" />
          </div>

          <section className="cinematicHeroContent" aria-labelledby="flythebg-hero-title">
            <div className="cinematicBadge"><span className="cinematicBadgeIcon" aria-hidden="true">L</span><span>FLYTHEBG · Local AI · your photo stays on-device</span></div>
            <h1 id="flythebg-hero-title">FLYTHEBG<br /><em>Remove backgrounds. Make passport photos.</em></h1>
            <p>FLYTHEBG is a free browser-first image toolkit for creating clean transparent cutouts and print-ready passport sheets directly in your browser. Fast local processing, precise framing controls, and no image-processing upload required.</p>
            <Link className="cinematicCta" href="/remove-background"><span className="cinematicCtaLabel">Start with your photo</span><span className="cinematicCtaArrow" aria-hidden="true">→</span></Link>
            <div className="cinematicTrust" aria-label="FLYTHEBG benefits"><span>Free to use</span><span aria-hidden="true">·</span><span>No account</span><span aria-hidden="true">·</span><span>Images stay local</span></div>
            <a className="landingScrollCue" href="#what-flythebg-does">Scroll to explore <span aria-hidden="true">↓</span></a>
          </section>
        </div>
      </section>

      <section className="cinematicLandingSection" id="what-flythebg-does">
        <div className="landingSectionShell">
          <div className="landingSectionHeader landingReveal"><span className="eyebrow"><i/> Built for real image tasks</span><h2>One cinematic theme. Two practical tools.</h2><p>The homepage now continues beyond the first screen, using the same video backdrop and glass language as the rest of FLYTHEBG.</p></div>
          <div className="landingCards">
            <article className="landingCard landingReveal"><span>Remove BG</span><h3>Transparent cutouts in the browser.</h3><p>Keep portrait, landscape, square, vertical, and panoramic proportions while the browser adapts model choice and working resolution to the device.</p><Link href="/remove-background">Open Background Remover ↗</Link></article>
            <article className="landingCard landingReveal"><span>Passport</span><h3>Measured sheets with manual control.</h3><p>Frame the subject, adjust individual copies, choose physical dimensions and DPI, then print at 100% or download a PNG sheet.</p><Link href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
            <article className="landingCard landingReveal"><span>Privacy</span><h3>Browser-first by architecture.</h3><p>The current image workflow does not intentionally require a FLYTHEBG image-upload backend or image database for processing your working photo.</p><Link href="/privacy">Read Privacy & AI Policy ↗</Link></article>
          </div>
        </div>
      </section>

      <section className="cinematicLandingSection">
        <div className="landingSectionShell">
          <div className="landingSectionHeader landingReveal"><span className="eyebrow"><i/> Search-ready product guide</span><h2>Free background removal and passport-photo tools, explained clearly.</h2><p>FLYTHEBG combines browser-based background removal with a measured passport photo workflow. Use the background remover for transparent PNG cutouts, or use the Passport Photo Maker when you need physical dimensions, DPI, crop framing, repeated copies, and a print-ready sheet. The working image is designed to stay in browser memory rather than being sent to a FLYTHEBG image-processing server.</p></div>
          <div className="landingCards">
            <article className="landingCard landingReveal"><span>Background remover</span><h3>Remove an image background without a forced crop.</h3><p>Start with portraits, products, graphics, or other clear subjects. The tool preserves the source ratio, uses bounded inference dimensions for large images, and exports a transparent PNG. Difficult hair, fur, glass, smoke, blur, reflections, and similar-colored boundaries can still need review.</p><Link href="/remove-background">Learn about background removal ↗</Link></article>
            <article className="landingCard landingReveal"><span>Passport photos</span><h3>Create measured photo sheets in the browser.</h3><p>Set a physical photo size and DPI, keep the source photo stationary, move the crop frame, customize individual copies, and generate a printable sheet. Always verify the current requirements of the authority receiving the photo.</p><Link href="/features/passport-photo">Learn about passport photo sheets ↗</Link></article>
            <article className="landingCard landingReveal"><span>Privacy</span><h3>Understand browser-first image processing.</h3><p>The browser downloads software and model assets separately from your selected photo. FLYTHEBG documents working-memory cleanup, model attribution, advertising behavior, and the limits of what a website can control on a visitor&apos;s device.</p><Link href="/guides/browser-privacy">Read the browser privacy guide ↗</Link></article>
          </div>
        </div>
      </section>

      <section className="cinematicLandingSection">
        <div className="landingSectionShell">
          <div className="landingSectionHeader landingReveal"><span className="eyebrow"><i/> Model transparency</span><h2>Third-party AI is named, attributed, and explained.</h2><p>FLYTHEBG uses IMG.LY&apos;s browser background-removal package with IS-Net model variants. The site does not claim those third-party model/runtime assets as FLYTHEBG property, does not claim to train them with your selected photo, and documents the current licensing statement and technical limits.</p></div>
          <div className="landingCards">
            <article className="landingCard landingReveal"><span>Package</span><h3>@imgly/background-removal 1.7.0</h3><p>Integrated for browser-side background segmentation, with separate FLYTHEBG safeguards and output handling around the generated mask.</p><Link href="/model-disclosure">Model & Open Source Disclosure ↗</Link></article>
            <article className="landingCard landingReveal"><span>Runtime</span><h3>WebGPU first, CPU/WASM fallback.</h3><p>Capable devices can try the FP16 model; constrained devices use the smaller quantized model. Runtime fallback protects compatibility when WebGPU fails.</p><Link href="/guides/browser-privacy">Browser privacy guide ↗</Link></article>
            <article className="landingCard landingReveal"><span>Limits</span><h3>AI output is an estimate.</h3><p>Fine hair, fur, glass, smoke, reflections, motion blur, compression, and low contrast can still produce imperfect segmentation.</p><Link href="/faq">Read common questions ↗</Link></article>
          </div>
        </div>
      </section>

      <section className="cinematicLandingSection" id="landing-faq">
        <div className="landingSectionShell">
          <div className="landingSectionHeader landingReveal"><span className="eyebrow"><i/> Quick FAQ</span><h2>Questions open smoothly here—and the full FAQ has its own page.</h2><p>Click to open or close each answer. Tool-specific questions remain available directly on their respective tool pages.</p></div>
          <div className="landingFaqGrid"><HoverFaqList items={landingFaqs} /></div>
          <div className="landingFaqActions landingReveal"><Link className="cinematicCta" href="/faq"><span className="cinematicCtaLabel">Open all FAQs</span><span className="cinematicCtaArrow" aria-hidden="true">→</span></Link><Link className="textLink" href="/remove-background#faq">Background remover FAQ ↗</Link><Link className="textLink" href="/features/passport-photo#faq">Passport FAQ ↗</Link></div>
        </div>
      </section>

      <footer className="cinematicLandingFooter">
        <FlytheBGLogo className="landingBrandLogo" imageClassName="landingBrandMark" size={44} />
        <nav aria-label="Landing footer"><Link href="/faq">FAQ</Link><Link href="/model-disclosure">Model Disclosure</Link><Link href="/privacy">Privacy & AI</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></nav>
      </footer>
    </main>
  );
}
