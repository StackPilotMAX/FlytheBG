import Link from "next/link";

export const metadata = { title: "Features" };

const tools = [
  { index: "01", href: "/remove-background", name: "Remove Background", status: "Live", icon: "✦", description: "Browser-only IMG.LY removal with a quantized first attempt, automatic FP16 fallback, transparent PNG download, and local result validation." },
  { index: "02", href: "/features/passport-photo", name: "Passport Photo Maker", status: "Live", icon: "▣", description: "Exact physical sizing, optional local background removal, framing, background color, multiple copies, and measured print-sheet export." },
  { index: "03", href: "/remove-background", name: "Crop & Refine", status: "Live", icon: "⌗", description: "After a background-removal result is ready, open the local crop editor for free-drag, fixed-ratio, or exact pixel cropping before download." },
];

export default function FeaturesPage() {
  return (
    <main className="featurePage">
      <section className="pageHero">
        <div className="shell narrowHero"><span className="eyebrow"><i/> Feature hub</span><h1>Live browser image tools, without a server inference bill.</h1><p>Every feature listed here is available in the current production workflow. FlytheBG does not show planned or under-construction tools as if they were usable products.</p></div>
      </section>

      <section className="section">
        <div className="shell featureCatalog">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="catalogCard">
              <div className="catalogTop"><span className="featureIndex">{tool.index}</span><span className="statusPill live">{tool.status}</span></div>
              <div className="featureMark">{tool.icon}</div><h2>{tool.name}</h2><p>{tool.description}</p><span className="featureCta">Open workflow ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section principlesSection" id="principles">
        <div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Product principles</span><h2>The operational interface comes before decorative complexity.</h2><p>The landing page can be visual, but uploading, processing, framing, editing, and downloading need predictable controls and readable surfaces.</p></div><div className="principleList"><article><strong>Readable surfaces</strong><p>Tool workspaces use opaque panels and deliberate spacing so the galaxy never reduces legibility or blocks clicks.</p></article><article><strong>Native interactions</strong><p>File selection uses native browser inputs. Drag/drop and paste are enhancements, not fragile replacements for a working upload control.</p></article><article><strong>Browser compute first</strong><p>Image processing stays client-side in the current production workflow, avoiding a per-image inference-server cost.</p></article></div></div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Learn the tools</span><h2>Use the guides when output quality matters.</h2><p>The Guides section explains source-photo quality, model fallback, print sizing, browser privacy, and the limits of automatic image processing.</p></div><div className="principleList"><article><strong>Background removal guide</strong><p>Understand difficult edges, model downloads, output validation, and what to try when a source photo is hard to segment.</p><p style={{marginTop:12}}><Link className="textLink" href="/guides/background-removal">Read guide ↗</Link></p></article><article><strong>Passport printing guide</strong><p>Understand physical dimensions, DPI, framing, copy capacity, and Actual Size / 100% printing.</p><p style={{marginTop:12}}><Link className="textLink" href="/guides/passport-photo">Read guide ↗</Link></p></article><article><strong>Browser privacy guide</strong><p>Understand what stays on-device, which software assets are downloaded, and what is cleared after a download.</p><p style={{marginTop:12}}><Link className="textLink" href="/guides/browser-privacy">Read guide ↗</Link></p></article></div></div>
      </section>
    </main>
  );
}
