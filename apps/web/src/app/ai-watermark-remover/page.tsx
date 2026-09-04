import type { Metadata } from "next";
import Link from "next/link";
import { WatermarkRemoverV2 } from "@/components/WatermarkRemoverV2";

export const metadata: Metadata = {
  title: "Gemini Watermark Remover — Image & Video Tool",
  description: "Browser-first visible Gemini and Veo watermark editor with calibrated fixed-position presets, manual selection, before-and-after preview, and local export.",
  keywords: ["gemini watermark remover", "gemini watermark remover online", "remove gemini watermark", "gemini image watermark remover", "gemini video watermark remover", "meta ai watermark remover", "AI watermark remover", "watermark remover"],
  alternates: { canonical: "/ai-watermark-remover" },
  openGraph: { title: "Gemini Watermark Remover — FlyThe BG", description: "Calibrated visible-watermark presets, manual selection, preview, and local export.", url: "/ai-watermark-remover", type: "website" },
};

const faqs = [
  ["Where is the Gemini watermark?", "The visible Gemini sparkle is commonly placed in the lower-right area. FlyThe BG uses the calibrated geometry from the supplied ishara-madu project rather than the old percentage-based guess, then shows the exact selection box in the preview."],
  ["Can I move the fixed selection?", "Yes. Use Position X/Y and Size scale, or drag directly over the mark to create a manual selection. This keeps the tool useful if a provider changes its export layout."],
  ["Does the image get blurred?", "The Gemini/Veo path uses reverse-alpha reconstruction instead of Gaussian blur or generative inpainting. Use Preview result first so you can inspect the actual pixels before downloading."],
  ["Does it support any image ratio?", "Yes. Geometry is calculated from the uploaded media dimensions, so portrait, square, landscape, and unusual aspect ratios are supported."],
  ["Does it work with Veo video?", "Yes. The selected fixed region is reconstructed frame-by-frame and exported as WebM where the browser supports MediaRecorder."],
  ["What about Meta AI?", "Older Meta AI generations used visible corner labels. The tool provides an editable lower-right legacy preset for those visible marks. Newer Meta Content Seal is an invisible provenance system and is not a visible pixel watermark that this editor can remove."],
  ["Does it remove SynthID or Content Seal?", "No. Google describes SynthID as an invisible watermark, and Meta describes Content Seal as an invisible provenance signal. This tool targets visible pixel overlays only."],
  ["Is processing local?", "The watermark reconstruction and preview run in browser memory. Software/reference assets may still be downloaded by the browser, and optional site analytics or advertising can make separate network requests."],
];

export default function AiWatermarkRemoverPage() {
  return <main className="featurePage watermarkPage">
    <section className="pageHero compactHero"><div className="shell narrowHero"><span className="eyebrow"><i/> Visible watermark editor</span><h1>Gemini &amp; Veo watermark remover for images and video.</h1><p>Calibrated fixed-position presets, direct selection, a before-and-after image preview, and local browser export — without blurring the whole watermark area.</p><div className="heroProof inline"><span><strong>Gemini / Veo</strong><small>calibrated visible mark</small></span><span><strong>Meta AI</strong><small>legacy visible preset</small></span><span><strong>Preview</strong><small>inspect before export</small></span></div></div></section>
    <section className="toolWorkspace"><div className="shell"><WatermarkRemoverV2 /></div></section>
    <section className="section"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Simpler controls</span><h2>Start with the known position, then adjust only if needed.</h2><p>The previous blind percentage guess has been replaced with provider-aware fixed geometry. The red box is visible before processing, and manual drag selection remains available when a source uses a different layout.</p></div><div className="principleList"><article><strong>Calibrated geometry</strong><p>Gemini/Veo placement is calculated from the actual media dimensions using the supplied upstream project&apos;s geometry approach.</p></article><article><strong>No blur pass</strong><p>The Gemini/Veo reconstruction uses reverse-alpha math with the upstream reference masks instead of blurring the surrounding scene.</p></article><article><strong>Before export</strong><p>For images, Preview result generates a smaller comparison so you can inspect the cleaned region before downloading the full export.</p></article><article><strong>Local processing</strong><p>Image reconstruction and browser video processing run in local browser memory. Long or high-resolution videos can still use substantial CPU and memory.</p></article></div></div></section>
    <section className="section toolInfoSection"><div className="shell infoCards"><article><span>Provider changes</span><h2>The box is adjustable on purpose.</h2><p>Watermark dimensions and margins can change between model generations, export surfaces, and resolutions. Use the visible box, Size scale, and Position controls rather than assuming every future output will match one sample.</p></article><article><span>Invisible provenance</span><h2>Visible removal is not provenance removal.</h2><p>Google&apos;s SynthID and newer Meta provenance systems are designed to be invisible. FlyThe BG does not claim to remove or defeat those systems.</p></article><article><span>Responsible use</span><h2>Only edit media you are allowed to edit.</h2><p>You remain responsible for copyright, privacy, attribution, platform rules, and any rights attached to the media.</p><Link className="textLink" href="/terms">Read Terms of Use ↗</Link></article></div></section>
    <section className="section faqSection" id="faq"><div className="shell"><div className="sectionHeading"><span className="eyebrow"><i/> Watermark remover FAQ</span><h2>Clear answers before you edit.</h2></div><div className="landingFaqGrid">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
  </main>;
}
