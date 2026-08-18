import Link from "next/link";
import { Uploader } from "@/components/Uploader";

export const metadata = { title: "Remove Background" };

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Remove Background</span><h1>Background removal that runs on your device.</h1><p>Choose a photo and FlytheBG runs IMG.LY directly in your browser. The fast quantized model is tried first; FP16 retries automatically only when needed.</p><div className="heroProof inline"><span><strong>No image API</strong><small>static host only</small></span><span><strong>2 browser models</strong><small>automatic fallback</small></span><span><strong>PNG</strong><small>transparent output</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Processing path</span><ol><li><b>01</b><span><strong>Validate photo</strong><small>type + size in browser</small></span></li><li><b>02</b><span><strong>IMG.LY quantized</strong><small>first local attempt</small></span></li><li><b>03</b><span><strong>FP16 fallback</strong><small>only if required</small></span></li></ol></aside>
        </div>
      </section>

      <section className="toolWorkspace"><div className="shell"><Uploader /></div></section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Private by architecture</span><h2>The image does not need a FlytheBG server.</h2><p>Source photos and generated cutouts stay in browser memory while you work. The static host serves application files only.</p></article>
          <article><span>First run</span><h2>Model downloads can take time.</h2><p>The browser downloads IMG.LY runtime/model assets on demand. A slow first run is normal; later runs may reuse cached assets.</p></article>
          <article><span>Next step</span><h2>Need physical photo sizes?</h2><p>Use the Passport Photo Maker to frame the result, set real-world dimensions, and build a white print sheet.</p><Link className="textLink" href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
        </div>
      </section>
    </main>
  );
}
