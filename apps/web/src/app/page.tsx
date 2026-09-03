import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { FlytheBGLogo } from "@/components/FlytheBGLogo";
import { HoverFaqList } from "@/components/HoverFaqList";
import { appConfig } from "@/lib/config";

const SUPPORT_URL = "https://buymeacoffee.com/flythebg";
const homeTitle = "FLYTHEBG | Free Background Remover, Passport Photos & Media Tools";
const homeDescription = "FLYTHEBG is a browser-first toolkit for background removal, passport photo sheets, and authorized AI-media cleanup. Your working media stays in your browser.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: ["FLYTHEBG", "background remover", "passport photo maker", "Gemini watermark remover", "browser image tools", "private image editor"],
  alternates: { canonical: "/" },
};

const faqs = [
  ["Does FLYTHEBG upload my photo?", "The core image workflows run in the browser. Your selected working media is processed in browser memory rather than being sent to a FLYTHEBG image-processing server."],
  ["What can I do with FLYTHEBG?", "Remove backgrounds, create measured passport-photo sheets, and use the media cleanup tools for supported Gemini/Veo and other authorized media."],
  ["Is it free?", "Yes. FLYTHEBG is designed as a free browser-first toolkit with no account required for the core workflows."],
] as const;

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FLYTHEBG",
    url: appConfig.siteUrl,
    description: homeDescription,
  };

  return (
    <main className="flyHome">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="flyHero">
        <div className="flyHeroGrid" aria-hidden="true" />
        <div className="flyHeroInner">
          <div className="flyHeroKicker"><span className="flyDot" /> BROWSER-FIRST · PRIVATE BY DESIGN</div>
          <h1>Make the background<br /><em>disappear.</em></h1>
          <p className="flyHeroLead">Clean cutouts, measured passport photos, and practical media tools — built to work in your browser without turning your photo into a server upload.</p>
          <div className="flyHeroActions">
            <Link className="flyPrimary" href="/remove-background">Remove background <span>↗</span></Link>
            <Link className="flySecondary" href="/features/passport-photo">Make passport photos <span>↗</span></Link>
          </div>
          <div className="flyHeroMeta"><span>Free</span><i /> <span>No account</span><i /> <span>Browser-first</span><i /> <span>PNG export</span></div>
        </div>
        <div className="flyHeroSide"><span>FLYTHEBG / 01</span><span>IMAGE · MEDIA · UTILITY</span></div>
      </section>

      <section className="flySection flyTools" id="tools">
        <div className="flySectionHead"><span className="flyEyebrow">01 / TOOLS</span><h2>Small tools.<br /><em>Real jobs.</em></h2><p>Open a tool, drop in your media, make the adjustment, and export. No account wall between you and the result.</p></div>
        <div className="flyToolGrid">
          <Link href="/remove-background" className="flyToolCard flyToolFeatured"><span className="flyToolIndex">01</span><div><span className="flyToolLabel">BACKGROUND REMOVER</span><h3>Turn a busy image into a clean transparent PNG.</h3><p>Browser-based segmentation with practical framing and export controls.</p></div><b>↗</b></Link>
          <Link href="/features/passport-photo" className="flyToolCard"><span className="flyToolIndex">02</span><div><span className="flyToolLabel">PASSPORT PHOTO</span><h3>Build a measured, print-ready sheet.</h3><p>Set dimensions, DPI, crop framing and individual copies.</p></div><b>↗</b></Link>
          <Link href="/ai-watermark-remover" className="flyToolCard"><span className="flyToolIndex">03</span><div><span className="flyToolLabel">MEDIA CLEANUP</span><h3>Work with supported AI-media marks.</h3><p>Use the browser workflow for authorized Gemini/Veo and compatible media.</p></div><b>↗</b></Link>
          <Link href="/features" className="flyToolCard"><span className="flyToolIndex">04</span><div><span className="flyToolLabel">ALL FEATURES</span><h3>See everything FLYTHEBG can do.</h3><p>Browse the complete toolkit and choose the workflow you need.</p></div><b>↗</b></Link>
        </div>
      </section>

      <section className="flySection flyManifesto">
        <div className="flyManifestoMark">BG</div>
        <div><span className="flyEyebrow">02 / THE IDEA</span><h2>Your photo is the input.<br /><em>Not the product.</em></h2><p>FLYTHEBG is built around a simple principle: use the browser for the work whenever the workflow allows it. Software, models and runtime assets may be downloaded, but your selected working image is designed to stay in browser memory during core processing.</p><Link className="flyInline" href="/privacy">Read the privacy & AI policy ↗</Link></div>
      </section>

      <section className="flySection flyProcess">
        <div className="flySectionHead"><span className="flyEyebrow">03 / WORKFLOW</span><h2>Drop. Adjust.<br /><em>Export.</em></h2></div>
        <div className="flySteps"><div><span>01</span><h3>Choose</h3><p>Pick the tool that matches the job and add your image or supported media.</p></div><div><span>02</span><h3>Shape</h3><p>Review the result and use the available crop, position, size or strength controls.</p></div><div><span>03</span><h3>Export</h3><p>Download the finished PNG, sheet or supported media output from your browser.</p></div></div>
      </section>

      <section className="flySection flyGuide">
        <div className="flyGuideCopy"><span className="flyEyebrow">04 / TRANSPARENCY</span><h2>Open about the<br /><em>technology.</em></h2><p>FLYTHEBG uses third-party packages and models where they make the product better. Their attribution, licensing, limitations and browser behavior are documented instead of hidden.</p><div className="flyGuideLinks"><Link href="/model-disclosure">Model disclosure ↗</Link><Link href="/guides/browser-privacy">Browser privacy guide ↗</Link><Link href="/faq">Frequently asked questions ↗</Link></div></div>
        <div className="flyGuideStat"><strong>100%</strong><span>browser-first<br />core workflow</span></div>
      </section>

      <section className="flySection flyFaq" id="faq">
        <div className="flySectionHead"><span className="flyEyebrow">05 / FAQ</span><h2>Before you<br /><em>start.</em></h2></div>
        <HoverFaqList items={faqs} />
      </section>

      <section className="flySupport">
        <div><span className="flyEyebrow">06 / SUPPORT</span><h2>If FLYTHEBG<br />saves you time, <em>buy it a book.</em></h2></div>
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="flySupportButton">Support FLYTHEBG <span>↗</span></a>
      </section>

      <div className="flyHomeAd"><AdPlaceholder slot="landing-inline-1" format="leaderboard" /></div>
      <footer className="flyHomeFooter"><FlytheBGLogo size={36} /><span>FLYTHEBG — browser-first image & media tools.</span><Link href="/contact">Contact ↗</Link></footer>
    </main>
  );
}
