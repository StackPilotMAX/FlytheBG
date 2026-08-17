import Link from "next/link";
import { GalaxyWorld } from "@/components/GalaxyWorld";
import { appConfig } from "@/lib/config";

const faqs = [
  ["Does FlytheBG upload my photo?", "The current background remover, crop workflow, and passport-photo image processing run in your browser. FlytheBG does not intentionally send image bytes to Render, Supabase, or an image database. IMG.LY model/runtime assets are downloaded so local inference can run."],
  ["What happens if the first background model fails?", "FlytheBG tries IMG.LY's quantized browser model first. If it fails or returns an unusable result, the site automatically retries with the IMG.LY FP16 browser model."],
  ["Can I make many passport photos?", "Yes. Upload one photo, optionally remove its background in the browser, set exact dimensions, choose a photo background color, fill the sheet, and download a print-ready PNG."],
  ["Why does the passport page stay white around the photos?", "The selected color is applied only inside each passport-photo rectangle. The print paper itself stays white."],
  ["Why can 600 DPI be reduced?", "Large high-DPI sheets can exceed browser memory. FlytheBG applies a memory guard and shows the actual export DPI instead of risking a blank or crashed export."],
  ["What happens after download?", "After the browser download starts, FlytheBG releases the working source, cutout, previews, and generated sheet from the page's working memory. Your downloaded file remains on your device."],
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: appConfig.name, url: appConfig.siteUrl },
      { "@type": "SoftwareApplication", name: `${appConfig.name} Image Tools`, applicationCategory: "MultimediaApplication", operatingSystem: "Web", url: appConfig.siteUrl, description: "Browser background removal, crop tools, and print-ready passport photo sheets." },
      { "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    ],
  };

  return (
    <main className="darkLanding browserLanding">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/>
      <GalaxyWorld/>
      <section className="landingIntro shell"><div className="landingIntroCopy"><span className="eyebrow light"><i/> Private browser image tools</span><h2>Clean images.<br/>No image upload server.</h2><p>Remove backgrounds with IMG.LY directly in your browser, crop precisely, and build print-ready passport sheets without storing photos in a FlytheBG database.</p><div className="landingButtons"><Link className="primaryButton" href="/remove-background">Remove a background <span>↗</span></Link><Link className="secondaryButton" href="/features/passport-photo">Make passport photos</Link></div></div><div className="landingStatGrid"><div><strong>2</strong><span>IMG.LY browser model variants</span></div><div><strong>0</strong><span>image database uploads</span></div><div><strong>300</strong><span>DPI safe passport default</span></div></div></section>
      <section className="section landingFeatures" id="features"><div className="shell"><div className="sectionHeading wide"><span className="eyebrow light"><i/> Live tools</span><h2>Focused tools. Cleaner workflow.</h2><p>The galaxy stays in the background; the actual workspaces use solid, readable surfaces.</p></div><div className="featureHubGrid"><Link href="/remove-background" className="featureHubCard featuredTool"><span className="featureNumber">01</span><div className="featureIcon">✦</div><h3>Remove Background</h3><p>Browser-only IMG.LY removal with quantized first and automatic FP16 fallback.</p><span className="featureLink">Open remover ↗</span></Link><Link href="/features/passport-photo" className="featureHubCard"><span className="featureNumber">02</span><div className="featureIcon">▣</div><h3>Passport Photo Maker</h3><p>Remove the background locally, choose exact print size and color, then fill a white print sheet with multiple copies.</p><span className="featureLink">Make passport photos ↗</span></Link><Link href="/features" className="featureHubCard futureTool"><span className="featureNumber">03+</span><div className="featureIcon">＋</div><h3>More browser tools</h3><p>Future tools can be added without sending private image data to a permanent image store.</p><span className="featureLink">View feature hub ↗</span></Link></div></div></section>
      <section className="section darkFaq" id="faq"><div className="shell faqWrap"><div className="sectionHeading compact"><span className="eyebrow light"><i/> FAQ</span><h2>Privacy and output, clearly explained.</h2></div><div className="faqList">{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>
      <section className="closingCta"><div className="closingGlow"/><div className="shell closingInner"><div><span className="eyebrow light"><i/> Start in the browser</span><h2>Remove. Frame. Print.</h2><p>No account is required for the current tools.</p></div><Link href="/remove-background" className="primaryButton lightButton">Remove background <span>↗</span></Link></div></section>
    </main>
  );
}
