import Link from "next/link";

export const metadata = {
  title: "Background Removal Guide",
  description: "How to prepare a photo for cleaner browser background removal and understand FlytheBG's IMG.LY fallback workflow.",
  alternates: { canonical: "/guides/background-removal" },
};

export default function BackgroundRemovalGuide() {
  return (
    <main className="featurePage">
      <section className="pageHero"><div className="shell narrowHero"><span className="eyebrow"><i/> Guide · Background removal</span><h1>How to get a cleaner browser background cutout.</h1><p>Automatic segmentation works best when the subject has a clear visual boundary. Source sharpness, contrast, fine hair, transparent materials, motion blur, and compression can all affect the result.</p></div></section>

      <section className="section"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 01 · Source photo</span><h2>Give the model a clear subject boundary.</h2><p>A studio wall is not required, but a sharper original image gives the model more useful edge information.</p></div><div className="principleList"><article><strong>Prefer sharp originals</strong><p>Heavy motion blur, missed focus, very low resolution, and repeated screenshot/compression cycles make hair, fingers, clothing, and product edges harder to separate.</p></article><article><strong>Watch low-contrast edges</strong><p>Dark hair on a dark wall, white fabric against a bright sky, glass, smoke, fur, and semi-transparent material are naturally difficult segmentation cases. A different source photo can help more than repeatedly processing the same difficult image.</p></article><article><strong>Use supported formats</strong><p>The current production interface accepts PNG, JPEG, and WebP and checks basic file type and size before browser inference begins.</p></article></div></div></section>

      <section className="section workflowSection"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 02 · Browser models</span><h2>Why the first run can take longer.</h2><p>FlytheBG uses IMG.LY on the visitor's device. The browser must obtain model and WebAssembly/runtime software assets before local inference can start.</p></div><div className="principleList"><article><strong>FP16 quality mode</strong><p>The current production flow tries IMG.LY FP16 first for better fine-edge quality when the device can run it.</p></article><article><strong>Quantized fallback</strong><p>If FP16 cannot initialize or finish, the smaller quantized model retries automatically. The fallback remains browser-side and does not send the photo to a FlytheBG inference server.</p></article><article><strong>Later runs may be faster</strong><p>Browsers may cache model/runtime software assets. Cache behaviour depends on browser settings, storage availability, private-browsing mode, and later cache eviction.</p></article></div></div></section>

      <section className="section"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 03 · Result checks</span><h2>A returned PNG is not automatically treated as success.</h2><p>FlytheBG decodes the generated image and checks that it contains visible foreground and a usable transparent area before presenting it as a finished cutout.</p></div><div className="principleList"><article><strong>Blank output is rejected</strong><p>A completely or almost completely transparent image is treated as a failed cutout rather than a successful blank checkerboard.</p></article><article><strong>Opaque output is rejected</strong><p>If the generated result has effectively no transparent area, FlytheBG treats the attempt as unusable and can fall back to the other browser model.</p></article><article><strong>Inspect fine boundaries</strong><p>Review hair, ears, shoulders, fingers, product handles, and transparent objects before professional use. Automatic segmentation can still make mistakes.</p></article></div></div></section>

      <section className="finalCta"><div className="shell finalCtaInner"><div><span className="eyebrow"><i/> Try the workflow</span><h2>Process one photo in your browser.</h2><p>The live remover uses the same browser-only fallback described above.</p></div><div className="buttonRow"><Link className="buttonPrimary" href="/remove-background">Open remover <span>↗</span></Link><Link className="buttonSecondary" href="/guides">All guides</Link></div></div></section>
    </main>
  );
}
