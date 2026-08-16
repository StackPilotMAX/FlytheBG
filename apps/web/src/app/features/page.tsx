import Link from "next/link";

export const metadata = { title: "Features" };

const tools = [
  {
    status: "Live",
    href: "/remove-background",
    name: "Remove Background",
    description: "Compare two background-removal engines, crop the stronger result, and export a transparent PNG.",
    icon: "✦",
  },
  {
    status: "Live",
    href: "/features/passport-photo",
    name: "Passport Photo Maker",
    description: "Exact physical photo sizing, optional background removal, multiple copies, manual layout, and print-ready 300/600 DPI sheets.",
    icon: "▣",
  },
  {
    status: "Planned",
    href: "#future",
    name: "More image tools",
    description: "This hub is ready for future resize, compression, format conversion, batch processing, and other focused utilities.",
    icon: "＋",
  },
];

export default function FeaturesPage() {
  return (
    <main className="darkPage featurePage">
      <section className="featurePageHero shell">
        <span className="eyebrow light"><i/> Feature hub</span>
        <h1>Tools live here.<br/>The landing page stays clean.</h1>
        <p>This page is the permanent catalog for FlytheBG features. New tools can be added here later without changing the core navigation or overwhelming the homepage.</p>
      </section>
      <section className="featureCatalog shell">
        {tools.map((tool, index) => (
          <Link key={tool.name} href={tool.href} className={`featureCatalogCard ${tool.status === "Planned" ? "planned" : ""}`}>
            <div className="featureCatalogTop"><span className="featureIcon">{tool.icon}</span><span className={`statusPill ${tool.status === "Live" ? "live" : ""}`}>{tool.status}</span></div>
            <span className="featureNumber">0{index + 1}</span>
            <h2>{tool.name}</h2>
            <p>{tool.description}</p>
            <span className="featureLink">{tool.status === "Live" ? "Open tool ↗" : "Reserved for future tools"}</span>
          </Link>
        ))}
      </section>
      <section className="futureArchitecture" id="future"><div className="shell"><span className="eyebrow light"><i/> Built to expand</span><h2>Future features can become their own pages.</h2><p>FlytheBG now has a stable structure: landing page → feature hub → dedicated tool workspace. That is the structure to keep as you add more utilities.</p></div></section>
    </main>
  );
}
