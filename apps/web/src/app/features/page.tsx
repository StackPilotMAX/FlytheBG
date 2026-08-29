import Link from "next/link";

export const metadata = {
  title: "FlytheBG Features: Image Tools",
  description: "Explore FlytheBG's live browser image tools for background removal and passport-photo creation, with clear privacy behavior and supporting guidance.",
  alternates: { canonical: "/features" },
};

const tools = [
  { index: "01", href: "/remove-background", name: "Remove Background", status: "Live", icon: "✦", description: "Browser-only IMG.LY removal with the smaller quantized IS-Net model, conservative fine-edge preservation, transparent PNG download, and crop workflow." },
  { index: "02", href: "/features/passport-photo", name: "Passport Photo Maker", status: "Live", icon: "▣", description: "Exact physical sizing, optional local background removal with the same smaller browser model, framing, background color, multiple copies, and measured print-sheet export." },
  { index: "03", href: "/about", name: "How FlytheBG Works", status: "Guide", icon: "◎", description: "A plain-language explanation of the browser-first architecture, small-model image lifecycle, product limitations, and the principles used for the current production tools." },
];

export default function FeaturesPage() {
  return (
    <main className="featurePage">
      <section className="pageHero">
        <div className="shell narrowHero"><span className="eyebrow"><i/> Feature hub</span><h1>Image tools with a browser-first production model.</h1><p>FlytheBG keeps the catalog focused on features that are already available. Each live tool has its own readable workspace, clear privacy behavior, and supporting guidance that explains how to use the workflow and where its limits are.</p></div>
      </section>

      <section className="section">
        <div className="shell featureCatalog">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="catalogCard">
              <div className="catalogTop"><span className="featureIndex">{tool.index}</span><span className={`statusPill ${tool.status === "Live" ? "live" : ""}`}>{tool.status}</span></div>
              <div className="featureMark">{tool.icon}</div><h2>{tool.name}</h2><p>{tool.description}</p><span className="featureCta">{tool.status === "Live" ? "Open tool ↗" : "Read the guide ↗"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section principlesSection" id="principles">
        <div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Product principles</span><h2>Useful output comes before decorative complexity.</h2><p>The production site separates the cinematic landing experience from the workspaces where people select, process, inspect, and download images.</p></div><div className="principleList"><article><strong>Readable surfaces</strong><p>Tools use opaque panels and predictable spacing so animated backgrounds never reduce legibility or make controls difficult to distinguish.</p></article><article><strong>Native interactions</strong><p>File selection uses native inputs; drag/drop and paste are additions, not fragile replacements. A visitor should still understand what the page does without relying on an animation.</p></article><article><strong>Browser compute first</strong><p>Image processing stays client-side when practical, which keeps source image bytes out of a FlytheBG inference server in the current production architecture.</p></article><article><strong>Explain the limitations</strong><p>Automatic segmentation and passport-photo preparation cannot guarantee perfect edges or document acceptance. FlytheBG publishes those limitations next to the tools instead of hiding them behind marketing claims.</p></article></div></div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards"><article><span>Background removal</span><h2>For transparent cutouts and follow-up design work.</h2><p>Use the remover when the main goal is a transparent PNG. The supporting guide explains difficult edges, source-image choices, why the first run can be slower, and what is retained in browser memory.</p><Link className="textLink" href="/remove-background">Read and use Remove Background ↗</Link></article><article><span>Passport workflow</span><h2>For measured photo rectangles and print sheets.</h2><p>Use the Passport Photo Maker when physical dimensions, DPI, framing, repeated copies, and a printable sheet matter. Always verify the issuing authority’s current rules before submitting a photo.</p><Link className="textLink" href="/features/passport-photo">Read and use Passport Photo Maker ↗</Link></article><article><span>Architecture</span><h2>For the details behind the product.</h2><p>The About page documents what runs in the browser, why FlytheBG uses the smaller quantized model, what FlytheBG does not promise, and how the current site treats image data and advertising during review.</p><Link className="textLink" href="/about">About FlytheBG ↗</Link></article></div>
      </section>
    </main>
  );
}
