import Link from "next/link";
import { HoverFaqList } from "@/components/HoverFaqList";
import { Uploader } from "@/components/Uploader";

export const metadata = {
  title: "Remove Background Online — Local AI, No Upload",
  description: "Remove backgrounds locally in your browser with FlytheBG. Supports portrait, landscape, square, vertical, and panoramic images with WebGPU and CPU/WASM fallback.",
  alternates: { canonical: "/remove-background" },
};

const removalFaqs = [
  ["Can I use portrait, landscape, square, or panoramic images?", "Yes. FlytheBG preserves the source aspect ratio instead of forcing the image into a square. On low-memory devices, a large image can be reduced to a safer working resolution while keeping the same proportions."],
  ["Can this work on a low-end 3 GB RAM phone?", "FlytheBG now uses the smaller quantized model by default on constrained devices and reduces oversized working images before inference. That makes browser crashes less likely, although very old browsers and exceptionally large files can still exceed device limits."],
  ["Does FlytheBG use a better-quality model on stronger devices?", "When a device reports enough memory and supports WebGPU, FlytheBG can try IMG.LY's FP16 model for a better mask. If that path fails, it automatically falls back to the smaller quantized model."],
  ["What kind of images work best?", "Clear photos with a visible subject boundary usually produce the most reliable result. Strong lighting, useful resolution, and some contrast between the foreground and background help the model separate fine details."],
  ["Why can hair, fur, glass, or motion blur be difficult?", "Those areas contain partially transparent or ambiguous pixels. A segmentation model must estimate which pixels belong to the foreground, so very fine strands, reflections, transparent objects, smoke, and heavy blur can still need manual checking."],
  ["Does FlytheBG send my photo to an image-processing server?", "No image-processing backend is used in the current production remover. The browser downloads application/model/runtime assets, but the selected source image is processed in browser memory."],
  ["Why is the first run sometimes slower?", "The browser may need to download the AI model and runtime assets before processing the first image. Later runs can be faster because those assets may be cached."],
  ["What happens if WebGPU fails?", "FlytheBG retries with CPU/WASM. If a bundled WASM or worker runtime cannot initialize, the app also has a browser-safe ESM runtime fallback before giving up."],
  ["What file do I download?", "The background-removal workflow exports a PNG so the removed background can remain transparent. Applications that do not display transparency may show the transparent area as white, black, or a checkerboard preview."],
  ["Can I crop the result without uploading it again?", "Yes. After removal, choose Crop. The cutout remains in the browser and the crop editor works from that local result."],
] as const;

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Remove Background</span><h1>Keep the frame. Remove the background.</h1><p>Use portrait, landscape, square, vertical, or panoramic raster images without forcing a preset crop. FlytheBG keeps processing browser-side, protects low-memory phones with a safer working resolution, and can use a higher-quality FP16 model on stronger WebGPU devices.</p><div className="heroProof inline"><span><strong>Any normal ratio</strong><small>source proportions preserved</small></span><span><strong>Smart local AI</strong><small>FP16 or quantized · GPU/CPU</small></span><span><strong>PNG</strong><small>transparent output</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Processing path</span><ol><li><b>01</b><span><strong>Decode + memory guard</strong><small>type, dimensions, device capability</small></span></li><li><b>02</b><span><strong>Local AI model</strong><small>WebGPU first · CPU/WASM fallback</small></span></li><li><b>03</b><span><strong>Transparent PNG</strong><small>validate + export cutout</small></span></li></ol></aside>
        </div>
      </section>

      <section className="toolWorkspace"><div className="shell"><Uploader /></div></section>

      <section className="section toolInfoSection">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Background removal guide</span><h2>What happens after you choose an image.</h2><p>Background removal is foreground segmentation, not a simple color delete. The model estimates an alpha mask describing how visible each foreground pixel should remain, and FlytheBG exports the resulting transparent PNG without changing the image ratio.</p></div>
          <div className="infoCards">
            <article><span>Step 1</span><h2>The browser checks the source and available memory.</h2><p>FlytheBG validates the file. Constrained devices can use a smaller working copy before inference to avoid oversized browser canvases and memory spikes.</p></article>
            <article><span>Step 2</span><h2>The model adapts to the device.</h2><p>Higher-memory WebGPU devices can try FP16 for a better mask. Other devices use the smaller quantized IS-Net model. CPU/WASM remains the automatic fallback when WebGPU cannot finish.</p></article>
            <article><span>Step 3</span><h2>The cutout is validated and exported.</h2><p>FlytheBG checks that the result contains meaningful foreground and transparency, then presents the transparent PNG for download or local cropping.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Better source photos</span><h2>How to get cleaner edges before you upload.</h2><p>The model can only work with detail that exists in the source image. A few photography choices make difficult boundaries easier to identify.</p></div>
          <div className="principleList">
            <article><strong>Keep the subject sharp</strong><p>Motion blur and missed focus blend foreground and background pixels together. If possible, use a photo where hair, shoulders, product edges, and clothing seams remain visibly defined.</p></article>
            <article><strong>Use useful separation</strong><p>A subject wearing dark clothing against an equally dark background is harder to separate than the same subject against a visibly different background.</p></article>
            <article><strong>Avoid extreme compression</strong><p>Heavily compressed screenshots can contain block artifacts around edges. Starting from the original camera image or a higher-quality copy gives the model more information.</p></article>
            <article><strong>Inspect semi-transparent details</strong><p>Veils, glass, smoke, reflections, flyaway hair, fur, lace, and motion blur are naturally ambiguous. Zoom in after removal and check those areas before final use.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Privacy by architecture</span><h2>The working image remains browser-side.</h2><p>Source photos and generated cutouts stay in browser memory while you work. Model/runtime assets are downloaded separately and do not need your source photo attached to those requests.</p></article>
          <article><span>Know the limits</span><h2>AI segmentation is an estimate, not a guarantee.</h2><p>No automatic remover can guarantee a perfect result for every image. Difficult foregrounds can be clipped, background fragments can remain, and fine translucent details can be simplified.</p></article>
          <article><span>Next step</span><h2>Need physical photo sizes?</h2><p>Use the Passport Photo Maker to manually frame the person, set real-world dimensions, choose a photo background, fill a print sheet, and print at 100%.</p><Link className="textLink" href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
        </div>
      </section>

      <section className="section faqSection">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Remove BG FAQ</span><h2>Common questions before you process an image.</h2><p>Hovering a question opens it automatically on desktop. Touch and keyboard users can still use the normal accessible details control.</p></div>
          <HoverFaqList items={removalFaqs} />
        </div>
      </section>
    </main>
  );
}
