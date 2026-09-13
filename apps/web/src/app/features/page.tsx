import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlyThe BG Tools — Remove BG, Passport Photos, Watermark Cleanup, Video Compression",
  description: "A focused launcher for every FlyThe BG tool: private Hugging Face rembg background removal, passport and visa photo maker, AI watermark cleanup, and local video compression.",
  keywords: ["free image tools", "video compressor", "background remover", "passport photo maker", "visa photo maker", "AI image tools", "rembg", "Hugging Face"],
  alternates: { canonical: "/features" },
  openGraph: { title: "FlyThe BG Tools", description: "Private background removal, passport photo sheets, watermark cleanup, and local video compression.", url: "/features", type: "website" },
  twitter: { card: "summary_large_image", title: "FlyThe BG Tools", description: "Private AI media tools that work in your browser." },
};

type Tool = {
  index: string;
  href: string;
  name: string;
  status: "Live" | "Beta";
  icon: string;
  description: string;
  tags: string[];
  wide?: boolean;
  tall?: boolean;
};

const tools: Tool[] = [
  {
    index: "01",
    href: "/remove-background",
    name: "Background Remover",
    status: "Live",
    icon: "✦",
    description: "Upload any photo and get a clean transparent PNG cutout. Background removal runs through FlyTheBG's authenticated server route to a private Hugging Face Space running rembg — your token never touches the browser.",
    tags: ["rembg", "Hugging Face", "Private API", "PNG download"],
    wide: true,
    tall: true,
  },
  {
    index: "02",
    href: "/features/passport-photo",
    name: "Passport & Visa Photo Maker",
    status: "Live",
    icon: "▣",
    description: "Set exact printed dimensions (35×45 mm, 2×2 in, custom), position a movable crop frame over the photo, pick a background color, and generate a print-ready sheet at 300 or 600 DPI.",
    tags: ["Print sheet", "300 / 600 DPI", "A4 · 4×6 · Letter"],
  },
  {
    index: "03",
    href: "/ai-watermark-remover",
    name: "AI Watermark Cleanup",
    status: "Beta",
    icon: "◈",
    description: "Targeted inpainting workflow to help clean visible text or logo overlays from images using third-party AI with conservative defaults and local previews.",
    tags: ["Gemini", "Inpainting", "Preview first"],
  },
  {
    index: "04",
    href: "/tools/video-compressor",
    name: "Video Compressor",
    status: "Live",
    icon: "▶",
    description: "Compress MP4 videos locally in your browser with H.264 output, quality presets, resolution controls, and target-size mode. No upload leaves your device for compression.",
    tags: ["Local", "H.264", "MP4 export"],
  },
];

const comingSoon: Tool[] = [
  { index: "05", href: "/guides", name: "Guides & Tutorials", status: "Live", icon: "✎", description: "Practical walkthroughs for passport photos, background removal, video prep, and everyday media workflows.", tags: ["Learn", "Free"] },
  { index: "06", href: "/blogs", name: "Blog", status: "Live", icon: "❝", description: "Short articles about image quality, privacy, AI attribution, and building lightweight media tools in the browser.", tags: ["Essays", "Updates"] },
];

export default function FeaturesPage() {
  return (
    <main className="launcherPage featurePage">
      <section className="launcherHero">
        <div className="shell launcherHeroInner">
          <div>
            <span className="launcherEyebrow"><i /> FlyThe BG Toolbox</span>
            <h1>Pick a tool.<br /><em>Everything stays simple.</em></h1>
            <p>Each FlyThe BG tool does one thing well. Upload, tweak, download — no accounts, no upsells, and the Hugging Face token never leaves the server.</p>
            <div className="launcherCtas">
              <Link className="buttonPrimary" href="/remove-background">Remove a background now <span>↗</span></Link>
              <Link className="buttonGhost" href="/features/passport-photo">Make a passport photo</Link>
            </div>
          </div>
          <aside className="launcherStats">
            <article><span>Primary engine</span><strong>rembg</strong><small>Private Hugging Face Gradio Space</small></article>
            <article><span>Max upload</span><strong>12 MB</strong><small>PNG · JPEG · WebP</small></article>
            <article><span>Account required</span><strong>None</strong><small>No signup, no paywall</small></article>
          </aside>
        </div>
      </section>

      <section className="launcherSection">
        <div className="shell">
          <div className="launcherSectionHead">
            <div>
              <h2>Core <em>tools</em></h2>
              <p>The production tools. Click any card to jump straight into the workspace.</p>
            </div>
          </div>

          <div className="toolGrid">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className={`toolCard${tool.wide ? " wide" : ""}${tool.tall ? " tall" : ""}`}
              >
                <div className="toolTop">
                  <span className="toolIndex">{tool.index}</span>
                  <span className={`statusPill ${tool.status === "Live" ? "live" : "beta"}`}>{tool.status}</span>
                </div>
                <div className="toolIcon" aria-hidden="true">{tool.icon}</div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <div className="toolMeta">
                  {tool.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <span className="toolCta">Open tool</span>
              </Link>
            ))}
          </div>

          <div className="privacyBand">
            <h3>Your image <em>never reveals the token.</em></h3>
            <div className="privacyGrid">
              <div><strong>Server-side secret</strong><span>HF_TOKEN lives in Netlify env vars. The browser only calls FlyTheBG's own <code>/api/remove-background</code> route.</span></div>
              <div><strong>Isolated requests</strong><span>Each upload is a single HTTP request. No shared state, no public filenames, no image database.</span></div>
              <div><strong>Open source</strong><span>The whole codebase is AGPL-3.0 on GitHub. You can self-host or audit the route yourself.</span></div>
              <div><strong>Transparent output</strong><span>rembg returns a PNG with transparency. Preview, crop, and download happen entirely in your tab.</span></div>
            </div>
          </div>

          <div className="launcherSectionHead" style={{ marginTop: 36 }}>
            <div>
              <h2>Read &amp; <em>learn</em></h2>
              <p>Documentation, articles, and disclosure pages to know exactly what runs where.</p>
            </div>
          </div>

          <div className="toolGrid">
            {comingSoon.map((tool) => (
              <Link key={tool.name} href={tool.href} className="toolCard">
                <div className="toolTop">
                  <span className="toolIndex">{tool.index}</span>
                  <span className={`statusPill ${tool.status === "Live" ? "live" : "beta"}`}>{tool.status}</span>
                </div>
                <div className="toolIcon" aria-hidden="true">{tool.icon}</div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <div className="toolMeta">
                  {tool.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <span className="toolCta">Open</span>
              </Link>
            ))}

            <Link href="/model-disclosure" className="toolCard">
              <div className="toolTop">
                <span className="toolIndex">07</span>
                <span className="statusPill live">Live</span>
              </div>
              <div className="toolIcon" aria-hidden="true">ⓘ</div>
              <h3>Model Disclosure</h3>
              <p>Straightforward attribution for every third-party model and library FlyThe BG uses, including rembg on Hugging Face.</p>
              <div className="toolMeta"><span>Attribution</span><span>Open source</span></div>
              <span className="toolCta">Read</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
