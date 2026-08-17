import Link from "next/link";
import { Uploader } from "@/components/Uploader";

export const metadata = { title: "Remove Background" };

export default function RemoveBackgroundPage() {
  return (
    <main className="toolPage darkPage browserToolPage">
      <section className="toolPageHero shell browserToolHero">
        <div><span className="eyebrow light"><i/> Browser Background Remover</span><h1>Your photo stays<br/>on your device.</h1><p>FlytheBG uses IMG.LY in the browser. The quantized model runs first; if it fails or returns an unusable cutout, FP16 automatically retries. No image upload API is required.</p><div className="heroTrustPills"><span>✓ Browser-only image processing</span><span>✓ Automatic FP16 fallback</span><span>✓ Transparent PNG</span></div></div>
        <div className="modelLadder"><div><b>01</b><strong>IMG.LY Quantized</strong><span>Fast browser attempt</span></div><i>↓</i><div><b>02</b><strong>IMG.LY FP16</strong><span>Higher-precision fallback</span></div><small>Only used when needed to reduce memory and download cost.</small></div>
      </section>
      <section className="toolWorkspaceSection"><div className="shell removeWorkspace"><Uploader/></div></section>
      <section className="toolInfoSection"><div className="shell toolInfoGrid"><article><span>01</span><h2>No image database.</h2><p>The image tools do not intentionally send image bytes to Render, Supabase, or a FlytheBG server. Working data exists in the browser while you edit.</p></article><article><span>02</span><h2>Fallback without a second server.</h2><p>IMG.LY quantized is tried first. If it fails validation, FlytheBG retries the IMG.LY FP16 model in the same browser.</p></article><article><span>03</span><h2>Need print photos?</h2><p>The Passport Photo Maker uses the same browser-only removal flow before building a white print sheet with multiple copies.</p><Link href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article></div></section>
    </main>
  );
}
