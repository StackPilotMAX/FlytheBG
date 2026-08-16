import Link from "next/link";
import { Uploader } from "@/components/Uploader";

export const metadata = { title: "Remove Background" };

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage darkPage">
      <section className="toolPageHero shell">
        <div><span className="eyebrow light"><i/> Remove Background</span><h1>One upload.<br/>Two AI results.</h1><p>Compare FlytheBG Precision with browser-side AI, inspect the edges, crop the result by cursor, ratio, or pixels, then download the transparent PNG you prefer.</p></div>
        <div className="toolPageMeta"><div><strong>A</strong><span>Private precision model</span></div><div><strong>B</strong><span>Browser AI model</span></div><div><strong>PNG</strong><span>Transparent export</span></div></div>
      </section>
      <section className="toolWorkspaceSection"><div className="shell removeWorkspace"><Uploader /></div></section>
      <section className="toolInfoSection"><div className="shell toolInfoGrid"><article><span>01</span><h2>Compare, don’t guess.</h2><p>Different segmentation engines can fail on different edges. FlytheBG shows two independently generated outputs so you can choose the stronger cutout.</p></article><article><span>02</span><h2>Crop after removal.</h2><p>Open Crop on either result and select with the cursor, lock common ratios, or type exact X/Y/width/height pixel values.</p></article><article><span>03</span><h2>Need print photos?</h2><p>Use the Passport Photo Maker for physical cm/mm/inch sizing, multiple copies, manual placement, and 300/600 DPI export.</p><Link href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article></div></section>
    </main>
  );
}
