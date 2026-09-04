"use client";

import Link from "next/link";

const faqs = [
  ["Is FlyThe BG really browser-first?", "Yes. The core image workflows are designed to process working media in your browser. Keep your original files and review generated outputs before publishing."],
  ["What can I use FlyThe BG for?", "You can remove image backgrounds, create passport-photo sheets, and use supported visible-watermark editing utilities for media you own or are authorized to modify."],
  ["Does the watermark remover blur my image?", "Gemini and Veo visible marks use calibrated reverse-alpha reconstruction rather than a blur filter or generative fill. A before/after preview is available before image export."],
  ["Where is the Gemini watermark?", "Current Gemini visible sparkle variants are commonly positioned in the lower-right area. FlyThe BG uses the supplied calibrated geometry and lets you fine-tune the box if a provider changes its layout."],
  ["What about Meta AI?", "Older Meta AI generations used visible labels in a lower corner. Newer Meta systems can use invisible Content Seal provenance, which is different from a visible pixel watermark and is not removed by this tool."],
  ["Can I process video?", "Yes for supported browser video workflows. Gemini/Veo processing applies the fixed visible-mark region frame-by-frame and exports a browser-generated WebM file."],
  ["Is my file uploaded?", "The editing workflows are designed for local browser processing. Network requests can still occur for site assets, model/runtime assets, analytics, or advertising when enabled."],
  ["Is FlyThe BG production ready?", "Yes. The public site is presented as a production service, not an early-access or preview product. Features are described according to their current behavior."],
];

export function LandingFAQ() {
  return <section className="landingFaq section" id="faq"><div className="shell"><div className="landingFaqIntro"><span className="eyebrow"><i /> Frequently asked</span><h2>A few useful answers<br /><em>before you start.</em></h2><p>Simple tools, clear limits, and no mystery about what happens to your working media.</p></div><div className="landingFaqGrid">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div><div className="landingFaqActions"><Link className="landingFaqCta" href="/faq">View all FAQs <span>↗</span></Link><Link className="landingFaqText" href="/privacy">Read Privacy &amp; AI</Link><Link className="landingFaqText" href="/terms">Read Terms</Link></div></div></section>;
}
