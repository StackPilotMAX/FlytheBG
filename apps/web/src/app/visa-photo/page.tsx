import type { Metadata } from "next";
import Link from "next/link";
import { PassportDragEnhancer } from "@/components/PassportDragEnhancer";
import { PassportPhotoMaker } from "@/components/PassportPhotoMaker";

export const metadata: Metadata = {
  title: "Free Visa Photo Maker Online | Passport & Visa Photo Tool",
  description: "Make a visa photo online with the same measured browser-first workspace used for passport size photos. Set physical dimensions, position the crop frame, create multiple copies, and prepare a printable photo sheet.",
  keywords: ["visa photo maker", "free visa photo maker", "visa photo online", "visa photo size", "visa picture maker", "print visa photos", "visa photo sheet", "passport and visa photo maker", "document photo maker", "35x45 visa photo", "2x2 visa photo"],
  alternates: { canonical: "/visa-photo" },
  openGraph: { title: "Free Visa Photo Maker Online | Passport & Visa Photo Tool", description: "Prepare measured visa and passport photos in one browser-first workspace with crop positioning and printable sheets.", url: "/visa-photo", type: "website" },
  twitter: { card: "summary", title: "Free Visa Photo Maker Online", description: "Create measured visa photos and printable sheets in your browser." },
};

const faqs = [
  ["Is the visa photo maker separate from the passport photo maker?", "No. FlyThe BG now uses one underlying measured photo workspace for both jobs. The Passport Photo Maker and Visa Photo Maker names describe different search intents, while the editing and sheet-generation workflow is shared."],
  ["Can I choose the visa photo size?", "Yes. Enter the physical dimensions required by your destination country or visa application in centimetres, millimetres, or inches, then choose the export DPI."],
  ["Can I move the face into position?", "Yes. The source photo stays stationary while the crop frame moves over it. This lets you fine-tune the subject position without moving the underlying image."],
  ["Can I print several visa photos on one sheet?", "Yes. The shared photo maker supports multiple copies, individual crop adjustments, PNG sheet export, and printing at Actual Size / 100%."],
  ["Will the generated visa photo definitely be accepted?", "No. Visa requirements vary by destination, visa category, embassy, consulate, application centre, and submission method. Always compare the final image with the current official instructions."],
  ["Does the tool upload my working photo?", "The crop, physical-size conversion, sheet composition, and PNG generation are browser-first. The workflow does not require a FlyThe BG image-processing upload server."],
];

export default function VisaPhotoPage() {
  const structuredData = { "@context": "https://schema.org", "@type": "WebApplication", name: "FlyThe BG Passport & Visa Photo Maker", applicationCategory: "MultimediaApplication", operatingSystem: "Web", url: "https://flythebg.com/visa-photo", description: metadata.description };

  return (
    <main className="passportPage seoLandingPage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div>
            <span className="eyebrow"><i/> Free Visa Photo Maker</span>
            <h1>Make a visa photo online with the same measured passport & visa photo workspace.</h1>
            <p>Choose the physical size required by your application, keep the source photo stationary, move the crop frame into position, create multiple copies, and download or print a measured photo sheet.</p>
            <div className="heroProof inline"><span><strong>Visa photo size</strong><small>cm · mm · inches</small></span><span><strong>Movable crop frame</strong><small>fine positioning</small></span><span><strong>Printable sheet</strong><small>Actual Size / 100%</small></span></div>
            <div className="heroActions"><Link className="button primary" href="#photo-maker">Open Visa Photo Maker ↓</Link><Link className="button secondary" href="/features/passport-photo">Passport Photo Maker ↗</Link></div>
          </div>
          <aside className="pageHeroAside"><span className="kicker">Before submitting</span><ol><li><b>01</b><span><strong>Check the official rule</strong><small>country + visa type</small></span></li><li><b>02</b><span><strong>Set the exact dimensions</strong><small>size + DPI</small></span></li><li><b>03</b><span><strong>Inspect the result</strong><small>then submit or print</small></span></li></ol></aside>
        </div>
      </section>

      <section className="passportWorkspace shell" id="photo-maker"><PassportPhotoMaker /><PassportDragEnhancer /></section>

      <section className="section seoContentSection"><div className="shell seoArticle"><span className="eyebrow"><i/> Visa photo preparation guide</span><h2>One photo workspace, two common document-photo needs.</h2><p>A visa photo and a passport size photo are often described as separate tasks, but the core preparation workflow is similar: verify the current authority requirements, choose the physical dimensions, position the subject inside a measured crop, and produce a correctly scaled digital or printable result.</p><p>FlyThe BG keeps that functionality in one browser-first tool. The same crop-frame controls, DPI-aware sizing, per-copy adjustments, and print-sheet generation are available from the passport and visa entry points. This avoids maintaining two separate editors that could behave differently.</p><h3>Use the official requirement as the source of truth</h3><p>Do not assume that a generic “visa photo” size is accepted everywhere. Requirements can differ by country and visa type and may specify head size, eye-line, background colour, lighting, expression, clothing, glasses, file format, file size, and photo age. Check the current official instructions before submission.</p><h3>Print at Actual Size</h3><p>The generated sheet is based on physical measurements. When printing, disable Fit to Page or automatic scaling and choose Actual Size / 100% so the physical dimensions are not changed by the printer or browser.</p></div></section>

      <section className="section toolInfoSection"><div className="shell infoCards"><article><span>Physical dimensions</span><h2>Measure before you export.</h2><p>Use the dimensions specified by the visa authority. Pixels are calculated from the selected physical size and export DPI.</p></article><article><span>Subject positioning</span><h2>Move the frame, not the source photo.</h2><p>Fine-tune face and shoulder placement by moving the crop frame across the stationary source image.</p></article><article><span>Multiple copies</span><h2>Prepare a complete sheet.</h2><p>Create several copies and adjust individual crops when needed before downloading or printing the final PNG sheet.</p></article></div></section>

      <section className="section workflowSection"><div className="shell workflowGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Browser-first workflow</span><h2>Prepare the photo without a required image-processing upload.</h2><p>The normal photo editing path runs in the browser, including crop positioning, physical-size conversion, sheet composition, and PNG generation.</p></div><div className="principleList"><article><strong>Local crop and layout</strong><p>The editor calculates dimensions and composes the print sheet in browser memory.</p></article><article><strong>Optional background workflow</strong><p>Background removal remains optional; do not use it as a substitute for an authority's photo-editing rules.</p></article><article><strong>No signup for the core tool</strong><p>The photo maker can be opened directly from the visa or passport search intent without an account.</p></article><article><strong>Review before submission</strong><p>Always inspect the final image against the latest official instructions for the exact visa application.</p></article></div></div></section>

      <section className="section faqSection" id="faq"><div className="shell faqGrid"><div className="sectionHeading compact"><span className="eyebrow"><i/> Visa photo FAQ</span><h2>Common questions about the shared photo maker.</h2><p>The answers describe FlyThe BG's workflow; they do not replace the official requirements for a specific application.</p></div><div className="faqList">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

      <section className="section toolInfoSection"><div className="shell infoCards"><article><span>Passport size photos</span><h2>Use the same editor.</h2><p>The passport entry point opens the same underlying measured photo workspace.</p><Link className="textLink" href="/features/passport-photo">Open Passport & Visa Photo Maker ↗</Link></article><article><span>Background removal</span><h2>Keep editing separate.</h2><p>If you need a transparent subject, use the browser-first background remover before preparing another document image.</p><Link className="textLink" href="/remove-background">Open Background Remover ↗</Link></article><article><span>Guidance</span><h2>Read the photo guide.</h2><p>Use the FlyThe BG guides and official authority instructions to verify requirements before submitting a document photo.</p><Link className="textLink" href="/guides/passport-photo">Read Passport Photo Guide ↗</Link></article></div></section>
    </main>
  );
}
