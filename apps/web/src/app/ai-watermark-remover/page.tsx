import type { Metadata } from "next";
import Link from "next/link";
import { WatermarkRemoverV2 } from "@/components/WatermarkRemoverV2";

export const metadata: Metadata = {
  title: "Gemini Watermark Remover — Image & Video Tool",
  description: "Browser-first Gemini and Meta AI watermark remover with full-image automatic candidate detection, manual drag selection, arbitrary image ratios, and local video export.",
  keywords: ["gemini watermark remover", "gemini watermark remover online", "remove gemini watermark", "gemini image watermark remover", "gemini video watermark remover", "meta ai watermark remover", "meta ai watermark remover online", "AI watermark remover", "watermark remover"],
  alternates: { canonical: "/ai-watermark-remover" },
  openGraph: { title: "Gemini Watermark Remover — FlytheBG", description: "Automatic and manual watermark selection for images and video, with arbitrary aspect-ratio support.", url: "/ai-watermark-remover", type: "website" },
};

const faqs = [
  ["Can it find a watermark automatically?", "Yes. Auto-detect scans the full image at multiple sizes instead of assuming a 16:9 frame or a particular corner. It returns a visible candidate box that you can adjust or replace manually."],
  ["Can I select the watermark manually?", "Yes. Drag directly over the watermark in the preview to create your own selection. The manual box is used for the final reconstruction."],
  ["Does it support any image ratio?", "Yes. The preview preserves the uploaded image's natural aspect ratio and selection coordinates are normalized to the actual image, so portrait, square, landscape, and unusual ratios are supported."],
  ["Why did the old corner buttons disappear?", "The old Top right, Bottom right, Top left, and Bottom left shortcuts could be confusing and were too restrictive. The new interface uses automatic detection plus direct drag selection, so the watermark can be anywhere."],
  ["Does it work with video?", "Yes. A fixed selection is applied frame-by-frame and the browser exports a cleaned WebM file. This is best for non-moving overlays. Long or high-resolution videos can use substantial CPU and memory."],
  ["Is the detector a guaranteed AI model?", "No. It is a local multi-scale image-analysis candidate finder. It does not claim perfect watermark recognition. Always inspect the selection before exporting."],
  ["What if the result is poor?", "Drag a tighter selection, change Size scale, Position X/Y, or Strength, then export again. Keep the original file because reconstruction can fail on detailed textures, text, faces, gradients, or complex scenes."],
  ["Does FlytheBG upload my media?", "The watermark workspace is designed to process the selected media in browser memory rather than intentionally sending it to a FlytheBG image-processing server."],
];

export default function AiWatermarkRemoverPage() {
  return <main className="featurePage watermarkPage">
    <section className="pageHero compactHero"><div className="shell narrowHero"><span className="eyebrow"><i/> AI watermark remover</span><h1>Gemini Watermark Remover for Images &amp; Video.</h1><p>Automatic detection, direct manual selection, and support for any image aspect ratio. Meta AI remains a separate source label in the same independent FlytheBG workspace.</p><div className="heroProof inline"><span><strong>Gemini</strong><small>image + video</small></span><span><strong>Meta AI</strong><small>separate source label</small></span><span><strong>Auto + Manual</strong><small>watermark selection</small></span></div></div></section>
    <section className="toolWorkspace"><div className="shell"><WatermarkRemoverV2 /></div></section>
    <section className="section"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Simpler controls</span><h2>Find it automatically or draw the exact area yourself.</h2><p>The previous fixed-corner workflow has been removed. The new tool scans the whole image for a likely fixed overlay and also gives you a direct drag box when the detector needs help.</p></div><div className="principleList"><article><strong>Any aspect ratio</strong><p>Portrait, square, landscape and unusual dimensions are handled from the actual media dimensions rather than a 16:9 template.</p></article><article><strong>Automatic candidate detection</strong><p>Multi-scale scanning checks the whole image, including interior positions and edges. The result is a candidate, not a blind final decision.</p></article><article><strong>Manual selection</strong><p>Drag over the watermark to replace the automatic candidate. Fine controls let you adjust strength, size, and position before export.</p></article><article><strong>Local processing</strong><p>The reconstruction runs in browser memory. Video uses the same selected region on each frame and exports WebM.</p></article></div></div></section>
    <section className="section toolInfoSection"><div className="shell infoCards"><article><span>Better workflow</span><h2>Inspect the red selection before exporting.</h2><p>The red box shows exactly what FlytheBG will reconstruct. If it is too large, drag a smaller box or reduce Size scale. If it is slightly offset, use Position X/Y.</p></article><article><span>Future generations</span><h2>Use the provider's own watermark setting when available.</h2><p>For new Gemini creations, an account-level visible/media watermark option may be available. Provider controls can change and only affect future creations; they do not clean already-saved files.</p></article><article><span>Responsible use</span><h2>Only edit media you are allowed to edit.</h2><p>You remain responsible for copyright, privacy, attribution, platform rules, and any rights attached to the media.</p><Link className="textLink" href="/terms">Read Terms of Use ↗</Link></article></div></section>
    <section className="section faqSection" id="faq"><div className="shell"><div className="sectionHeading"><span className="eyebrow"><i/> Watermark remover FAQ</span><h2>Clear answers before you edit.</h2></div><div className="landingFaqGrid">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
  </main>;
}
