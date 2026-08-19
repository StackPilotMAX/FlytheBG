import Link from "next/link";
import { Uploader } from "@/components/Uploader";

export const metadata = {
  title: "Remove Background",
  description: "Remove photo backgrounds in your browser, understand how the local AI workflow works, and learn how to get cleaner transparent PNG edges.",
  alternates: { canonical: "/remove-background" },
};

const removalFaqs = [
  ["What kind of images work best?", "Clear photos with a visible subject boundary usually produce the most reliable result. Strong lighting, useful resolution, and some contrast between the foreground and background help the model separate fine details."],
  ["Why can hair, fur, glass, or motion blur be difficult?", "Those areas contain partially transparent or ambiguous pixels. A segmentation model must estimate which pixels belong to the foreground, so very fine strands, reflections, transparent objects, smoke, and heavy blur can need manual checking."],
  ["Does FlytheBG send my photo to an image-processing server?", "The current production remover runs IMG.LY in the browser. The page does not intentionally send source or generated image bytes to a FlytheBG inference server or image database."],
  ["Why is the first run sometimes slower?", "The browser may need to download model and runtime assets before processing the first image. Later attempts can be faster when those software assets are already cached by the browser."],
  ["What file do I download?", "The background-removal workflow exports a PNG so the removed background can remain transparent. Applications that do not display transparency may show the transparent area as white, black, or a checkerboard preview."],
];

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Remove Background</span><h1>Background removal that runs on your device.</h1><p>Choose a photo and FlytheBG runs IMG.LY directly in your browser. FP16 is tried first for better portrait and fine-edge quality; the smaller quantized model is the automatic fallback.</p><div className="heroProof inline"><span><strong>No image API</strong><small>static host only</small></span><span><strong>2 browser models</strong><small>quality-first fallback</small></span><span><strong>PNG</strong><small>transparent output</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Processing path</span><ol><li><b>01</b><span><strong>Validate photo</strong><small>type + size in browser</small></span></li><li><b>02</b><span><strong>IMG.LY FP16</strong><small>quality-first local attempt</small></span></li><li><b>03</b><span><strong>Quantized fallback</strong><small>smaller-device retry</small></span></li></ol></aside>
        </div>
      </section>

      <section className="toolWorkspace"><div className="shell"><Uploader /></div></section>

      <section className="section toolInfoSection">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Background removal guide</span><h2>What the tool is actually doing.</h2><p>Background removal is a foreground-segmentation task, not a simple color delete. The browser model estimates an alpha mask that describes how visible each foreground pixel should remain, then FlytheBG uses that mask to create a transparent PNG.</p></div>
          <div className="infoCards">
            <article><span>Step 1</span><h2>The browser validates the image.</h2><p>FlytheBG checks the selected file before processing so obviously unsupported or oversized input can be stopped before expensive model work begins. Selection, drag and drop, and paste all feed the same local workflow.</p></article>
            <article><span>Step 2</span><h2>A quality-first model creates the mask.</h2><p>The current implementation tries the FP16 IMG.LY model first. FP16 uses more browser memory but can preserve smoother portrait boundaries. If the device cannot complete that attempt, FlytheBG retries with the smaller quantized model.</p></article>
            <article><span>Step 3</span><h2>The cutout is rebuilt and exported.</h2><p>When browser memory allows, FlytheBG can conservatively rebuild fine foreground boundaries from the original pixels around the generated mask. The finished image is encoded as a PNG so transparent pixels remain transparent after download.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Better source photos</span><h2>How to get cleaner edges before you upload.</h2><p>The model can only work with detail that exists in the source image. A few photography choices make difficult boundaries easier to identify.</p></div>
          <div className="principleList">
            <article><strong>Keep the subject sharp</strong><p>Motion blur and missed focus blend foreground and background pixels together. If possible, use a photo where hair, shoulders, product edges, and clothing seams remain visibly defined.</p></article>
            <article><strong>Use useful separation</strong><p>A subject wearing dark clothing against an equally dark background is harder to separate than the same subject against a visibly different background. You do not need a studio backdrop, but clear visual separation helps.</p></article>
            <article><strong>Avoid extreme compression</strong><p>Heavily compressed screenshots and repeatedly shared images can contain block artifacts around edges. Starting from the original camera image or a higher-quality copy gives the model more information to work with.</p></article>
            <article><strong>Inspect semi-transparent details</strong><p>Veils, glass, smoke, reflections, flyaway hair, fur, lace, and motion blur are naturally ambiguous. Zoom in after removal and check those areas before using the result in a final design or document.</p></article>
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Privacy by architecture</span><h2>The image does not need a FlytheBG server.</h2><p>Source photos and generated cutouts stay in browser memory while you work. The static host serves application files only. Model/runtime assets can still be downloaded by the browser from their configured provider, but FlytheBG does not intentionally attach your source image to those asset requests.</p></article>
          <article><span>Know the limits</span><h2>AI segmentation is an estimate, not a guarantee.</h2><p>No automatic remover can guarantee a perfect result for every image. Difficult foregrounds can be clipped, background fragments can remain, and fine translucent details can be simplified. Check important results at full size before publishing or printing them.</p></article>
          <article><span>Next step</span><h2>Need physical photo sizes?</h2><p>Use the Passport Photo Maker to frame the result, set real-world dimensions, choose a photo background, and build a white print sheet. Document authorities can have additional rules beyond image size.</p><Link className="textLink" href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
        </div>
      </section>

      <section className="section faqSection">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Remove BG FAQ</span><h2>Common questions before you process a photo.</h2><p>These answers describe the current FlytheBG browser workflow rather than promising results the model cannot guarantee.</p></div>
          <div className="faqList">{removalFaqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>
    </main>
  );
}
