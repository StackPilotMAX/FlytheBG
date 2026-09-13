import Link from "next/link";

export const metadata = {
  title: "Image Processing & Privacy Guide",
  description: "How FlyTheBG handles uploads, private Hugging Face background removal, browser previews, and cleanup.",
  alternates: { canonical: "/guides/browser-privacy" },
};

export default function BrowserPrivacyGuide() {
  return (
    <main className="featurePage">
      <section className="pageHero"><div className="shell narrowHero"><span className="eyebrow"><i/> Guide · Image privacy</span><h1>How FlyTheBG processes images.</h1><p>FlyTheBG no longer performs background-removal inference locally in the browser. The background-removal tool sends the selected image through an authenticated FlyTheBG server route to the private Hugging Face Space, while preview, crop, and download remain browser-side.</p></div></section>

      <section className="section"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 01 · Upload</span><h2>Your image starts in your browser.</h2><p>The browser lets you choose, drag, drop, or paste a supported image. Basic type and size validation happens before the request is sent.</p></div><div className="principleList"><article><strong>Supported formats</strong><p>PNG, JPEG, and WebP are accepted by the production background-removal route.</p></article><article><strong>Request-specific processing</strong><p>Each upload is sent as its own HTTP request to FlyTheBG's background-removal route.</p></article><article><strong>No local inference</strong><p>The browser does not load a background-removal neural-network or WebAssembly inference package.</p></article></div></div></section>

      <section className="section workflowSection"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 02 · Private AI</span><h2>Hugging Face performs the background removal.</h2><p>FlyTheBG's server route authenticates to the private <strong>StackPilotMAX/bg-remover-api</strong> Space and calls its Gradio <strong>/remove_background</strong> endpoint.</p></div><div className="principleList"><article><strong>Credential stays server-side</strong><p>The Hugging Face token is stored in the server environment and is never sent to visitor-side JavaScript.</p></article><article><strong>No browser model downloads</strong><p>The background-removal workflow does not download IMG.LY, ONNX, or other local inference model assets.</p></article><article><strong>Result returns to the requester</strong><p>The server fetches the AI result and returns the image directly to the browser that initiated the request.</p></article></div></div></section>

      <section className="section"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 03 · Browser work</span><h2>The browser is used for presentation, not AI inference.</h2><p>After the server returns the cutout, the browser can preview it, open the crop editor, create an object URL, and start a download.</p></div><div className="principleList"><article><strong>Preview</strong><p>The returned image is displayed locally using a temporary object URL.</p></article><article><strong>Crop</strong><p>The crop editor works on the returned cutout in the current page session.</p></article><article><strong>Cleanup</strong><p>FlyTheBG releases the temporary object URLs and working state when the result is reset or downloaded.</p></article></div></div></section>

      <section className="section workflowSection"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> 04 · Data boundaries</span><h2>What FlyTheBG does and does not claim.</h2><p>FlyTheBG does not intentionally persist uploaded images in a public image database. Temporary processing behavior on the underlying Hugging Face service is governed by that service's runtime.</p></div><div className="principleList"><article><strong>No public result URLs</strong><p>The FlyTheBG route returns the result directly instead of creating a public FlyTheBG result page or public result filename.</p></article><article><strong>No shared result state</strong><p>The route does not intentionally keep one user's output in global application state for another user.</p></article><article><strong>Service dependency</strong><p>Background removal depends on the availability and runtime behavior of the private Hugging Face Space.</p></article></div></div></section>

      <section className="finalCta"><div className="shell finalCtaInner"><div><span className="eyebrow"><i/> Formal details</span><h2>Need the full policy?</h2><p>The Privacy & AI Policy describes the production data flow and its limitations.</p></div><div className="buttonRow"><Link className="buttonPrimary" href="/privacy">Privacy & AI <span>↗</span></Link><Link className="buttonSecondary" href="/guides">All guides</Link></div></div></section>
    </main>
  );
}
