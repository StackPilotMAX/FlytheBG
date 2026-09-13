import type { Metadata } from "next";
import Link from "next/link";
import { HoverFaqList } from "@/components/HoverFaqList";
import { Uploader } from "@/components/Uploader";

export const metadata: Metadata = {
  title: "Free Background Remover Online — AI Image Background Remover",
  description: "Remove image backgrounds online for free with FlyTheBG. Images are processed through FlyTheBG's authenticated server route and private Hugging Face AI service, then returned as transparent PNGs.",
  keywords: ["free background remover", "background remover online", "remove image background", "AI background remover", "transparent PNG", "FlytheBG"],
  alternates: { canonical: "/remove-background" },
  openGraph: { title: "Free Background Remover Online — FlytheBG", description: "Free AI background remover with private server-side processing and transparent PNG export.", url: "/remove-background", type: "website" },
  twitter: { card: "summary", title: "Free Background Remover Online — FlytheBG", description: "Remove image backgrounds with private Hugging Face AI processing and transparent PNG export." },
};

const removalFaqs = [
  ["Can I use portrait, landscape, square, or panoramic images?", "Yes. FlyTheBG preserves the source aspect ratio and accepts PNG, JPEG, and WebP images up to the configured upload limit."],
  ["Is my Hugging Face token exposed to visitors?", "No. The browser only calls FlyTheBG's server route. The Hugging Face token stays in Netlify server environment variables and is never returned to the browser."],
  ["Where is my image processed?", "The browser sends the selected image to FlyTheBG's /api/remove-background route. That server route authenticates to the private Hugging Face Space and forwards only the current request's image to the /remove_background Gradio endpoint."],
  ["Does background removal run in my browser?", "No. Background-removal inference is performed by the private Hugging Face Space. The browser is used only for upload, preview, cropping, and download of the returned result."],
  ["Are different users' images mixed together?", "No. Each upload is handled as an independent HTTP request and the returned image is sent only to that requesting browser. The route does not use shared global result state or public result filenames."],
  ["Does FlyTheBG store my uploaded image?", "The FlyTheBG route does not intentionally persist uploaded images in a database or public file store. Temporary processing resources are handled by the underlying Gradio service according to its runtime behavior."],
  ["What happens if the AI service is unavailable?", "The tool shows a clear error and lets you retry. FlyTheBG does not silently substitute a browser-based background-removal model."],
  ["What file do I download?", "The workflow returns a PNG so the removed background can remain transparent."],
  ["Can I crop the result without uploading it again?", "Yes. After removal, choose Crop. The returned cutout is already in your browser and the crop editor works from that result."],
] as const;

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Free Background Remover Online</span><h1>Remove image backgrounds online. Keep the subject.</h1><p>Use FlyTheBG's free AI background remover for portrait, landscape, square, vertical, or panoramic images. Your upload goes through an authenticated FlyTheBG server route to the private Hugging Face Gradio Space, then returns as a transparent PNG.</p><div className="heroProof inline"><span><strong>Free online tool</strong><small>no signup · simple workflow</small></span><span><strong>Private AI processing</strong><small>server-side token · isolated requests</small></span><span><strong>Transparent PNG</strong><small>Hugging Face result</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Processing path</span><ol><li><b>01</b><span><strong>Validate + preview</strong><small>type, size, dimensions</small></span></li><li><b>02</b><span><strong>Private Hugging Face AI</strong><small>authenticated Gradio Space</small></span></li><li><b>03</b><span><strong>Return + export</strong><small>transparent PNG</small></span></li></ol></aside>
        </div>
      </section>

      <section className="toolWorkspace"><div className="shell"><Uploader /></div></section>

      <section className="section toolInfoSection">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> AI background remover guide</span><h2>Private Hugging Face AI handles the background removal.</h2><p>FlyTheBG validates the upload, sends the current request through its authenticated server route to the private Hugging Face Space, receives the result, and returns it to the requesting browser for preview, crop, and transparent PNG download.</p></div>
          <div className="infoCards">
            <article><span>Step 1</span><h2>Your upload is validated first.</h2><p>The server accepts supported PNG, JPEG, and WebP images within the configured size limit and rejects malformed or oversized requests before inference.</p></article>
            <article><span>Step 2</span><h2>The private Gradio endpoint performs the AI removal.</h2><p>FlyTheBG connects server-side to the private <strong>/remove_background</strong> endpoint. The Hugging Face credential never reaches client-side JavaScript.</p></article>
            <article><span>Step 3</span><h2>The returned cutout is prepared for export.</h2><p>The result is returned to the same requesting browser, where FlyTheBG provides preview, crop, and transparent PNG download tools. No local background-removal model runs in the browser.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Better source photos</span><h2>How to get cleaner edges.</h2><p>The AI can only use detail present in the source image. Better separation makes hair, clothing, and product edges easier to segment.</p></div>
          <div className="principleList">
            <article><strong>Keep the subject sharp</strong><p>Motion blur and missed focus blend foreground and background pixels together.</p></article>
            <article><strong>Give pale clothing some separation</strong><p>White clothing against a white wall is intrinsically difficult for segmentation.</p></article>
            <article><strong>Avoid extreme compression</strong><p>High-quality originals preserve more edge information for the model.</p></article>
            <article><strong>Inspect semi-transparent details</strong><p>Glass, smoke, reflections, flyaway hair, fur, lace, and motion blur remain naturally difficult.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Privacy by architecture</span><h2>The credential stays server-side.</h2><p>Visitors never receive the Hugging Face token. Each browser request gets its own response, and FlyTheBG does not intentionally persist uploads in a public image database.</p></article>
          <article><span>Model disclosure</span><h2>Third-party AI is explicitly attributed.</h2><p>FlyTheBG uses a private Hugging Face Space running Gradio. The Space exposes the <strong>/remove_background</strong> API endpoint used by the production processing route.</p><Link className="textLink" href="/model-disclosure">Read Model & Open Source Disclosure ↗</Link></article>
          <article><span>Next step</span><h2>Need physical photo sizes?</h2><p>Use the Passport Photo Maker to set real-world dimensions, choose a photo background, fill a print sheet, and print at 100%.</p><Link className="textLink" href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Remove BG FAQ</span><h2>Click a question for a smooth answer.</h2><p>Common questions about private processing, security, quality, and downloads.</p><Link className="textLink" href="/faq">Open the full FlyTheBG FAQ ↗</Link></div>
          <HoverFaqList items={removalFaqs} />
        </div>
      </section>
    </main>
  );
}
