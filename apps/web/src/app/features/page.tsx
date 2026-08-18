import Link from "next/link";

export const metadata = { title: "Features" };

const tools = [
  { index: "01", href: "/remove-background", name: "Remove Background", status: "Live", icon: "✦", description: "Browser-only IMG.LY removal with FP16 quality-first processing, quantized fallback, conservative fine-edge preservation, transparent PNG download, and crop workflow." },
  { index: "02", href: "/features/passport-photo", name: "Passport Photo Maker", status: "Live", icon: "▣", description: "Exact physical sizing, optional local background removal, framing, background color, multiple copies, and measured print-sheet export." },
  { index: "03", href: "#principles", name: "More browser utilities", status: "Planned", icon: "＋", description: "Future utilities should follow the same rule: keep image work on the visitor's device whenever the browser can do it safely." },
];

export default function FeaturesPage() {
  return (
    <main className="featurePage">
      <section className="pageHero">
        <div className="shell narrowHero"><span className="eyebrow"><i/> Feature hub</span><h1>Image tools with a browser-first production model.</h1><p>FlytheBG keeps the catalog focused: each live tool has its own readable workspace, clear privacy behavior, and no dependency on a background-removal server.</p></div>
      </section>

      <section className="section">
        <div className="shell featureCatalog">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className={`catalogCard ${tool.status === "Planned" ? "planned" : ""}`}>
              <div className="catalogTop"><span className="featureIndex">{tool.index}</span><span className={`statusPill ${tool.status === "Live" ? "live" : ""}`}>{tool.status}</span></div>
              <div className="featureMark">{tool.icon}</div><h2>{tool.name}</h2><p>{tool.description}</p><span className="featureCta">{tool.status === "Live" ? "Open tool ↗" : "Browser-first roadmap"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section principlesSection" id="principles">
        <div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Product principles</span><h2>New features should not make the current tools harder to use.</h2><p>Operational clarity, responsive behavior, and privacy come before decorative complexity.</p></div><div className="principleList"><article><strong>Readable surfaces</strong><p>Tools use opaque panels and predictable spacing so animated backgrounds never reduce legibility.</p></article><article><strong>Native interactions</strong><p>File selection uses native inputs; drag/drop and paste are additions, not fragile replacements.</p></article><article><strong>Browser compute first</strong><p>Image processing stays client-side when practical, which avoids per-image inference-server cost.</p></article></div></div>
      </section>
    </main>
  );
}
