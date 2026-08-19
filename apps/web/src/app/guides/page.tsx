import Link from "next/link";

export const metadata = {
  title: "Guides",
  description: "Original FlytheBG guides for browser background removal, passport-photo preparation, printing, and image privacy.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    href: "/guides/background-removal",
    index: "01",
    title: "How to get a cleaner background cutout",
    text: "Learn which source photos are easier to segment, why the first browser run can be slower, how FlytheBG checks a cutout, and what to try when edges are difficult.",
  },
  {
    href: "/guides/passport-photo",
    index: "02",
    title: "How to build and print a passport-photo sheet",
    text: "Understand physical dimensions, DPI, framing, background color, copy capacity, paper size, and why Actual Size / 100% matters when printing.",
  },
  {
    href: "/guides/browser-privacy",
    index: "03",
    title: "What browser-only image processing means",
    text: "See what stays on the device, which IMG.LY software assets are downloaded, what FlytheBG clears after download, and which copies remain outside the page's control.",
  },
];

export default function GuidesPage() {
  return (
    <main className="featurePage">
      <section className="pageHero">
        <div className="shell narrowHero">
          <span className="eyebrow"><i/> FlytheBG guides</span>
          <h1>Practical guidance for better browser image results.</h1>
          <p>These first-party guides explain how the live FlytheBG tools behave, what improves output quality, and where automatic image processing has limits.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell trustGrid">
          {guides.map((guide) => (
            <article key={guide.href}>
              <span>{guide.index}</span>
              <h3>{guide.title}</h3>
              <p>{guide.text}</p>
              <p style={{ marginTop: 18 }}><Link className="textLink" href={guide.href}>Read guide ↗</Link></p>
            </article>
          ))}
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> Scope</span>
            <h2>Useful instructions without pretending one rule fits every document.</h2>
            <p>FlytheBG explains its own tools and general image-production mechanics. For passports, visas, IDs, licences, schools, employers, or other regulated uses, verify the current specification from the authority that will receive the photo.</p>
          </div>
          <div className="principleList">
            <article><strong>Tool-specific</strong><p>The guides describe how FlytheBG processes, frames, exports, and clears working images.</p></article>
            <article><strong>No acceptance guarantee</strong><p>A correctly sized print sheet can still be rejected if the receiving authority has different pose, lighting, expression, clothing, or background rules.</p></article>
            <article><strong>Browser-first</strong><p>The current production tools are designed so image pixels do not need to be sent to an image-processing server.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}
