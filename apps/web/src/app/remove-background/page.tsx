import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { HoverFaqList } from "@/components/HoverFaqList";
import { Uploader } from "@/components/Uploader";

export const metadata: Metadata = {
  title: "Free Background Remover Online — AI Image Background Remover",
  description: "Remove image backgrounds online for free with FlyTheBG. This AI background remover runs in your browser, creates transparent PNGs, protects fine foreground detail, and needs no image-processing backend.",
  keywords: ["free background remover", "free background remover online", "background remover online", "remove image background", "image background remover", "online background remover", "AI background remover", "background remover AI", "remove bg free", "background eraser", "transparent background maker", "transparent PNG", "browser background remover", "no upload background remover", "local AI background remover", "FlytheBG", "Fly the BG"],
  alternates: { canonical: "/remove-background" },
  openGraph: { title: "Free Background Remover Online — FlytheBG", description: "Free AI background remover that runs in your browser with adaptive quality checks, fine-edge protection, and transparent PNG export.", url: "/remove-background", type: "website" },
  twitter: { card: "summary", title: "Free Background Remover Online — FlytheBG", description: "Remove image backgrounds online with browser AI, hair-edge protection, and local transparent PNG export." },
};

const removalFaqs = [
  ["Can I use portrait, landscape, square, or panoramic images?", "Yes. FlytheBG preserves the source aspect ratio instead of forcing the image into a square. Large images can be reduced to a bounded working resolution for faster local AI inference while keeping the same proportions; eligible devices can restore source detail afterwards."],
  ["Can this work on a low-end 3 GB RAM phone?", "FlytheBG starts with the smaller quantized model and reduces oversized working images before inference. That makes browser crashes less likely and keeps the common path lighter, although very old browsers and exceptionally large files can still exceed device limits."],
  ["How does FlytheBG protect hair and soft transparent edges?", "The local alpha cleanup is deliberately conservative. It no longer tries to aggressively thin connected low-alpha pixels; connected semi-transparent strands can be preserved, while only essentially empty disconnected mask noise is removed. Fine hair, fur, blur, and transparent objects can still be imperfect and should be checked."],
  ["What about white or pale clothing?", "FlytheBG checks for pale subject regions that appear at risk. Where a pale pixel is substantially surrounded by already-detected foreground, a limited local protection step can recover some alpha without simply restoring a white background around the outside silhouette. On capable WebGPU devices, risk can also trigger a higher-quality FP16 retry. This reduces some failures but cannot guarantee perfect preservation."],
  ["Can the final PNG keep more source detail after faster resized inference?", "When the device has enough memory, FlytheBG can reapply the protected segmentation result to the higher-resolution source image. On constrained phones it may skip that extra memory-heavy restoration step and prioritize a stable result."],
  ["Does FlytheBG always run the large FP16 model?", "No. FlytheBG starts with the smaller quantized model for a faster common path. A local result check can request an FP16 quality pass on suitable WebGPU devices when pale subject areas or fine semi-transparent edges look riskier. If the quality pass is unavailable, FlytheBG keeps the valid protected fast result."],
  ["What kind of images work best?", "Clear photos with a visible subject boundary usually produce the most reliable result. Strong lighting, useful resolution, and some contrast between the foreground and background help the model separate fine details."],
  ["Why can hair, fur, glass, or motion blur still be difficult?", "Those areas contain partially transparent or ambiguous pixels. A segmentation model must estimate which pixels belong to the foreground, so very fine strands, reflections, transparent objects, smoke, similar-colored backgrounds, and heavy blur can still need manual checking."],
  ["Does FlytheBG send my photo to an image-processing server?", "No image-processing backend is used in the current production remover. The browser downloads application/model/runtime assets, but the selected source image is processed in browser memory."],
  ["Why is the first run sometimes slower?", "The browser may need to download the AI model and runtime assets before processing the first image. Later runs can be faster because those assets may be cached. The remover also uses bounded working dimensions for large images so inference does not unnecessarily process every source pixel."],
  ["What happens if WebGPU fails?", "FlytheBG can retry with CPU/WASM. If a bundled WASM or worker runtime cannot initialize, the app also has a browser-safe ESM runtime fallback before giving up."],
  ["What file do I download?", "The background-removal workflow exports a PNG so the removed background can remain transparent. Applications that do not display transparency may show the transparent area as white, black, or a checkerboard preview."],
  ["Can I crop the result without uploading it again?", "Yes. After removal, choose Crop. The cutout remains in the browser and the crop editor works from that local result."],
] as const;

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Free Background Remover Online</span><h1>Remove image backgrounds online. Keep the subject.</h1><p>Use a free AI background remover in your browser for portrait, landscape, square, vertical, or panoramic images. FlytheBG starts with a fast local model, uses bounded working dimensions for large images, protects connected fine edges conservatively, and can escalate to a higher-quality WebGPU pass only when a local result check says it may help.</p><div className="heroProof inline"><span><strong>Free online tool</strong><small>browser-first · no signup</small></span><span><strong>AI background remover</strong><small>quantized first · adaptive quality</small></span><span><strong>Transparent PNG</strong><small>subject + fine-edge protection</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Processing path</span><ol><li><b>01</b><span><strong>Decode + fast working size</strong><small>type, dimensions, device memory</small></span></li><li><b>02</b><span><strong>Fast local AI first</strong><small>WebGPU/CPU · adaptive quality check</small></span></li><li><b>03</b><span><strong>Protect + export</strong><small>fine edges · pale foreground · PNG</small></span></li></ol></aside>
        </div>
        <div className="shell pageHeroAd" aria-label="Top advertisement placement"><AdPlaceholder slot="remove-bg-inline-1" format="leaderboard" /></div>
      </section>

      <section className="toolWorkspace"><div className="shell"><Uploader /></div></section>

      <section className="section toolInfoSection">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> AI background remover guide</span><h2>Free online background removal without sending the working photo to an image-processing server.</h2><p>Background removal is foreground segmentation, not a simple color delete. The model estimates an alpha mask describing how visible each foreground pixel should remain. FlytheBG validates that mask, protects eligible subject edges locally, and exports a transparent PNG without changing the image ratio.</p></div>
          <div className="infoCards">
            <article><span>Step 1</span><h2>The browser prepares a bounded working image when useful.</h2><p>FlytheBG validates the file and caps oversized inference dimensions according to model/device capability. This makes high-resolution inputs faster to process and reduces browser memory spikes while preserving the original aspect ratio.</p></article>
            <article><span>Step 2</span><h2>The smaller model runs first.</h2><p>The quantized IS-Net path is the fast default. A lightweight local mask check looks for preservation risk around pale subject regions and connected semi-transparent edges. On suitable WebGPU devices, only risky results are retried with FP16 for extra quality.</p></article>
            <article><span>Step 3</span><h2>The subject mask gets conservative protection.</h2><p>Connected low-alpha detail is not deliberately thinned. Small interior pale-region holes can receive limited recovery only when surrounded by strong detected foreground. When memory allows, the protected result can be reapplied to higher-resolution source detail.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Better source photos</span><h2>How to get cleaner edges before you use the online background remover.</h2><p>The model can only work with detail that exists in the source image. A few photography choices make difficult boundaries easier to identify.</p></div>
          <div className="principleList">
            <article><strong>Keep the subject sharp</strong><p>Motion blur and missed focus blend foreground and background pixels together. If possible, use a photo where hair, shoulders, product edges, and clothing seams remain visibly defined.</p></article>
            <article><strong>Give pale clothing some separation</strong><p>White clothing against a white wall is intrinsically difficult because the model sees very similar pixels on both sides of the subject boundary. A slightly different background tone, shadow, or edge contrast gives segmentation more evidence.</p></article>
            <article><strong>Avoid extreme compression</strong><p>Heavily compressed screenshots can contain block artifacts around edges. Starting from the original camera image or a higher-quality copy gives the model more information.</p></article>
            <article><strong>Inspect semi-transparent details</strong><p>Veils, glass, smoke, reflections, flyaway hair, fur, lace, and motion blur are naturally ambiguous. FlytheBG protects connected fine alpha more conservatively, but you should still zoom in and check important output.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Privacy by architecture</span><h2>The working image remains browser-side.</h2><p>Source photos and generated cutouts stay in browser memory while you work. Model/runtime assets are downloaded separately and do not need your source photo attached to those requests.</p></article>
          <article><span>Model disclosure</span><h2>Third-party AI is explicitly attributed.</h2><p>FlytheBG uses IMG.LY&apos;s browser package with IS-Net quantized and FP16 model variants and does not claim ownership of those third-party model/runtime assets. FlytheBG&apos;s adaptive selection and subject-protection steps are local processing around that segmentation result.</p><Link className="textLink" href="/model-disclosure">Read Model & Open Source Disclosure ↗</Link></article>
          <article><span>Next step</span><h2>Need physical photo sizes?</h2><p>Use the Passport Photo Maker to keep the source photo stationary, move a crop frame over it, set real-world dimensions, choose a photo background, fill a print sheet, and print at 100%.</p><Link className="textLink" href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Remove BG FAQ</span><h2>Click a question for a smooth answer.</h2><p>Opening and closing animate smoothly. Desktop hover is optional; touch, mouse click, and keyboard activation all use the same accessible accordion.</p><Link className="textLink" href="/faq">Open the full FlytheBG FAQ ↗</Link></div>
          <HoverFaqList items={removalFaqs} />
        </div>
      </section>
    </main>
  );
}
