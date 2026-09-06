import Link from "next/link";

export const metadata = {
  title: "FlytheBG Guides: Image, Photo & Privacy Help",
  description: "Practical first-party guides for browser background removal, passport and visa photo preparation, printing, video compression, and image privacy.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "FlytheBG Guides: Image, Photo, Video & Privacy Help",
    description: "Practical first-party guidance for better image, document-photo, video-compression, and browser-privacy workflows.",
    url: "/guides",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FlytheBG Guides: Image, Photo, Video & Privacy Help",
    description: "Guides for better FlytheBG image, photo, video and privacy workflows.",
  },
};

const guides = [
  { href: "/guides/background-removal", index: "01", title: "How to get a cleaner background cutout", text: "Learn which source photos are easier to segment, why the first browser run can be slower, how FlytheBG checks a cutout, and what to try when edges are difficult." },
  { href: "/guides/passport-photo", index: "02", title: "How to build and print a passport-photo sheet", text: "Understand physical dimensions, DPI, framing, background color, copy capacity, paper size, and why Actual Size / 100% matters when printing." },
  { href: "/guides/passport-photo-size", index: "03", title: "Passport photo size, DPI and pixels explained", text: "Understand why physical dimensions come first, how DPI changes pixel dimensions, how the crop frame works, and how printer scaling can change a measured result." },
  { href: "/guides/video-compression", index: "04", title: "How browser video compression works", text: "Learn how local browser encoding uses quality, resolution and target-size controls, why final size varies, and what device limits mean for long videos." },
  { href: "/guides/browser-privacy", index: "05", title: "What browser-only image processing means", text: "See what stays on the device, which software assets are downloaded, what FlytheBG clears after download, and which copies remain outside the page's control." },
];

export default function GuidesPage() {
  return (
    <main className="featurePage">
      <section className="pageHero"><div className="shell narrowHero"><span className="eyebrow"><i/> FlytheBG guides</span><h1>Practical guidance for better browser image and media results.</h1><p>These first-party guides explain how the live FlytheBG tools behave, what improves output quality, and where automatic processing has limits. They are written to help people use the tools, not to create keyword-only pages.</p></div></section>
      <section className="section"><div className="shell trustGrid">{guides.map((guide) => (<article key={guide.href}><span>{guide.index}</span><h3>{guide.title}</h3><p>{guide.text}</p><p className="guideLinkRow"><Link className="textLink" href={guide.href}>Read guide ↗</Link></p></article>))}</div></section>
      <section className="section workflowSection"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> How to use these guides</span><h2>Start with the live tool, then use the guide when you need more context.</h2><p>Each guide is connected to a real FlytheBG workflow. The goal is to explain decisions users actually make: source quality, physical sizing, printing, compression settings, privacy boundaries, and output limitations.</p></div><div className="principleList"><article><strong>Tool-specific</strong><p>The guides describe how FlytheBG processes, frames, exports, compresses, and clears working media.</p></article><article><strong>Useful detail over word count</strong><p>There is no artificial minimum word count. Sections are included when they answer a real question or help a visitor complete a workflow correctly.</p></article><article><strong>No acceptance guarantee</strong><p>A correctly sized print sheet can still be rejected if the receiving authority has different pose, lighting, expression, clothing, background, or file rules.</p></article><article><strong>Browser-first</strong><p>The current production tools are designed so image pixels do not need to be sent to an image-processing server for supported local workflows.</p></article></div></div></section>
    </main>
  );
}
