import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { HoverFaqList } from "@/components/HoverFaqList";

export const metadata: Metadata = {
  title: "FlytheBG FAQ: Background Removal & Privacy",
  description: "Answers about FlytheBG browser AI, background removal, passport-photo framing, privacy, model licensing, downloads, and optional advertising.",
  alternates: { canonical: "/faq" },
};

const generalFaqs = [
  ["Does FlytheBG upload my working photo to an image-processing server?", "The current background-removal and passport-photo workflows are designed to process the working image in browser memory. The page still downloads application, model, runtime, font, video, and advertising assets as needed, but FlytheBG does not intentionally attach your source photo to those asset requests."],
  ["Which AI model does FlytheBG use?", "FlytheBG uses IMG.LY's browser background-removal package with IS-Net model variants. The remover starts with the smaller quantized model for the faster common path. On suitable WebGPU devices, a local preservation-risk check can trigger an FP16 retry for pale subject regions or fine semi-transparent edges. CPU/WASM remains a fallback when WebGPU cannot finish."],
  ["Does FlytheBG specifically protect hair or white clothing?", "FlytheBG adds local safeguards around the model result. Connected low-alpha edge detail is preserved conservatively rather than deliberately thinned, and pale pixels can receive limited recovery when they are substantially surrounded by already-detected foreground. These steps reduce some errors but do not guarantee perfect hair, clothing, or edge reconstruction."],
  ["Is the AI model owned by FlytheBG?", "No. The background-removal library, model/runtime assets, and related third-party components are not claimed as FlytheBG property. See the Model & Open Source Disclosure for the current package version, licensing statement, processing role, and limitations."],
  ["How does passport cropping work?", "The source photo stays stationary in the Passport Photo Maker. You move the visible crop frame over the photo, adjust crop zoom/frame size, and then build the print sheet. Individual printed copies can use their own crop-frame settings."],
  ["Does using a passport-photo preset guarantee acceptance?", "No. FlytheBG helps with crop framing, physical dimensions, DPI, layout, and printing, but an issuing authority can also impose rules about expression, head position, lighting, clothing, photo age, editing, paper, and file requirements."],
  ["Can I use FlytheBG without an account?", "Yes. The current public image tools do not require an account to select an image, remove a background, crop a result, or generate a passport-photo sheet."],
  ["Why can the first background-removal run take longer?", "The browser may need to download the AI model and runtime assets before the first inference. Later runs may be faster when those assets are cached. Large source images can also be reduced to bounded working dimensions for faster inference before eligible source detail is restored."],
  ["Can AdSense and Monetag appear on FlytheBG?", "FlytheBG contains reserved advertisement placements and disabled-by-default configuration for both networks. Real advertising only loads after the required public publisher values are configured. Monetag OnClick/pop-under behavior is intentionally not enabled alongside AdSense."],
  ["Are advertisement areas part of the tool controls?", "No. Reserved ad placements are clearly labelled Advertisement and are kept separate from upload, download, navigation, and editing controls so visitors can distinguish advertising from product actions."],
  ["Can I dismiss the October features notice?", "Yes. Dismissing the October 2026 notice stores a small local preference in that browser so the notice does not keep reappearing there."],
] as const;

export default function FaqPage() {
  return (
    <main className="featurePage faqPage">
      <section className="pageHero compactHero">
        <div className="shell narrowHero landingReveal">
          <span className="eyebrow"><i/> FlytheBG FAQ</span>
          <h1>Answers without sending you back to the landing page.</h1>
          <p>Use this page for general questions, then jump directly to the tool-specific FAQ sections when you need deeper background-removal or passport-photo guidance.</p>
          <div className="faqJumpLinks">
            <Link href="/remove-background#faq">Background remover FAQ ↗</Link>
            <Link href="/features/passport-photo#faq">Passport photo FAQ ↗</Link>
            <Link href="/model-disclosure">Model & licensing disclosure ↗</Link>
          </div>
        </div>
        <div className="shell pageHeroAd" aria-label="Top advertisement placement"><AdPlaceholder slot="faq-inline-1" format="leaderboard" /></div>
      </section>

      <section className="section faqSection" id="general-faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact landingReveal">
            <span className="eyebrow"><i/> General questions</span>
            <h2>How FlytheBG works, what it uses, and what it does not claim.</h2>
            <p>Click any question to open or close it. Desktop hover remains available, but click, touch, and keyboard interaction are the primary accessible controls.</p>
          </div>
          <HoverFaqList items={generalFaqs} />
        </div>
      </section>
    </main>
  );
}
