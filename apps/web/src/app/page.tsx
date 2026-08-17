import Link from "next/link";
import { GalaxyWorld } from "@/components/GalaxyWorld";
import { appConfig } from "@/lib/config";

const faqs = [
  ["Where do I remove a background?", "Open Remove Background from the navigation or landing-page button. The editor has its own workspace so the homepage stays fast and focused."],
  ["Why does FlytheBG show two results?", "The remover compares FlytheBG Precision on the private inference service with an independent browser-side model. You can download whichever result preserves your subject better."],
  ["Can I make print-ready passport photos?", "Yes. Passport Photo Maker can use your existing photo or remove its background first, validate the cutout, then create multiple copies at exact physical dimensions. 300 DPI is the memory-safe default; up to 600 DPI is available when the selected paper size can be exported safely in the browser."],
  ["Why would FlytheBG lower a 600 DPI passport export?", "Very large high-DPI sheets require large browser canvases. FlytheBG applies a memory guard and shows the actual export DPI before download instead of risking a browser crash or blank sheet."],
  ["Can I crop manually?", "Yes. Background-removal results can be cropped by cursor, common aspect ratios, or exact pixel coordinates. Passport photos can also be repositioned and resized by cursor."],
  ["What happens to my image after download?", "FlytheBG does not intentionally keep raw uploads or generated results in a permanent image database. After a remover or passport-sheet download starts, the current working upload, results, previews, and generated sheet are cleared from the FlytheBG tab memory. Your downloaded file remains on your device."],
  ["Does FlytheBG store my photos for training?", "No raw-image training archive is used by the production workflow. Short-lived anonymous run metadata used for optional feedback expires in under one hour and does not contain your uploaded image or generated PNG."],
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: appConfig.name, url: appConfig.siteUrl },
      { "@type": "SoftwareApplication", name: `${appConfig.name} Creative Tools`, applicationCategory: "MultimediaApplication", operatingSystem: "Web", url: appConfig.siteUrl, description: "AI background removal, crop tools, and print-ready passport photo sheets." },
      { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };

  return (
    <main className="darkLanding">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <GalaxyWorld />

      <section className="landingIntro shell">
        <div className="landingIntroCopy">
          <span className="eyebrow light"><i/> One place for clean image tools</span>
          <h2>Choose the tool.<br/>Keep the workflow simple.</h2>
          <p>FlytheBG is organized like a product, not a single long demo. Start with background removal, build exact passport-photo sheets, and use the Features hub as new tools arrive.</p>
          <div className="landingButtons"><Link className="primaryButton" href="/remove-background">Remove a background <span>↗</span></Link><Link className="secondaryButton" href="/features">Explore features</Link></div>
        </div>
        <div className="landingStatGrid">
          <div><strong>2</strong><span>validated removal results</span></div>
          <div><strong>600</strong><span>DPI available with memory guard</span></div>
          <div><strong>0</strong><span>account required</span></div>
        </div>
      </section>

      <section className="section landingFeatures" id="features">
        <div className="shell">
          <div className="sectionHeading wide"><span className="eyebrow light"><i/> Live tools</span><h2>Focused pages for focused jobs.</h2><p>Each tool gets its own workspace, URL, controls, and room to grow.</p></div>
          <div className="featureHubGrid">
            <Link href="/remove-background" className="featureHubCard featuredTool">
              <span className="featureNumber">01</span><div className="featureIcon">✦</div><h3>Remove Background</h3><p>Upload once, compare FlytheBG Precision with browser AI, crop the preferred result, and download a transparent PNG.</p><span className="featureLink">Open remover ↗</span>
            </Link>
            <Link href="/features/passport-photo" className="featureHubCard">
              <span className="featureNumber">02</span><div className="featureIcon">▣</div><h3>Passport Photo Maker</h3><p>Use an existing photo or remove its background first, validate the cutout, set exact printed size, arrange copies, and export a memory-safe print sheet.</p><span className="featureLink">Make passport photos ↗</span>
            </Link>
            <Link href="/features" className="featureHubCard futureTool">
              <span className="featureNumber">03+</span><div className="featureIcon">＋</div><h3>More tools later</h3><p>The Features page is designed as the permanent home for future image utilities without crowding the landing page.</p><span className="featureLink">View feature hub ↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section darkFaq" id="faq">
        <div className="shell faqWrap">
          <div className="sectionHeading compact"><span className="eyebrow light"><i/> FAQ</span><h2>Before you upload.</h2><p>Short answers about the product structure, memory guard, and privacy model.</p></div>
          <div className="faqList">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div>
        </div>
      </section>

      <section className="closingCta"><div className="closingGlow"/><div className="shell closingInner"><div><span className="eyebrow light"><i/> Start with the job you need</span><h2>Remove. Resize. Print.</h2><p>The landing page introduces FlytheBG; dedicated tool pages do the work.</p></div><Link href="/features" className="primaryButton lightButton">Open features <span>↗</span></Link></div></section>
    </main>
  );
}
