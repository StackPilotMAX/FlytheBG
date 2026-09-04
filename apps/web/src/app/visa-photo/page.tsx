import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Visa Photo Maker Online | FlyThe BG",
  description: "Create a visa photo online for free with a browser-first photo maker. Set physical dimensions, position the face with a movable crop frame, and prepare a printable photo sheet without uploading your working image.",
  keywords: [
    "visa photo maker",
    "free visa photo maker",
    "visa photo online",
    "visa photo size",
    "visa photo generator",
    "visa picture maker",
    "print visa photos",
    "visa photo sheet",
    "online visa photo maker",
    "private visa photo maker",
  ],
  alternates: { canonical: "/visa-photo" },
  openGraph: {
    title: "Free Visa Photo Maker Online | FlyThe BG",
    description: "Prepare a measured visa photo and printable sheet in your browser. No signup and no required image-processing upload.",
    url: "/visa-photo",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Free Visa Photo Maker Online | FlyThe BG",
    description: "Create a measured visa photo and printable sheet in your browser.",
  },
};

const faqs = [
  ["Can I make a visa photo online for free?", "Yes. FlyThe BG provides a free browser-first visa photo workflow. You can prepare a correctly measured crop and printable sheet without creating an account."],
  ["Does FlyThe BG upload my photo?", "The photo-making workflow is designed to run in your browser. Crop positioning, physical-size conversion, sheet composition, and PNG generation happen locally; FlyThe BG does not require an image-processing upload server for this workflow."],
  ["Can I choose the visa photo size?", "Yes. The photo maker supports physical dimensions in centimetres, millimetres, or inches and converts those measurements to pixels using the selected export DPI."],
  ["Can I move the face into position?", "Yes. The source photo stays stationary while the crop frame moves over it. This lets you position the face and shoulders without accidentally moving the underlying image."],
  ["Can I print several visa photos on one sheet?", "Yes. The passport/visa photo maker can create multiple copies on a print sheet. You can adjust individual copies before downloading the sheet or printing at Actual Size / 100%."],
  ["Will the generated visa photo definitely be accepted?", "No. Photo requirements vary by destination country, visa type, application centre, and submission method. Always compare the final image with the current official requirements before submitting it."],
  ["Does removing the background guarantee a compliant visa photo?", "No. Some authorities require a specific background, lighting, shadows, expression, clothing, head position, or editing policy. Background removal can help with preparation but cannot guarantee acceptance."],
  ["Why should I print at 100%?", "The generated sheet is based on physical measurements. Browser or printer settings such as Fit to Page can rescale the sheet. Choose Actual Size or 100% when physical dimensions matter."],
];

export default function VisaPhotoPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free Visa Photo Maker Online",
    description: metadata.description,
    url: "https://flythebg.com/visa-photo",
    isPartOf: { "@type": "WebSite", name: "FlyThe BG", url: "https://flythebg.com" },
  };

  return (
    <main className="toolPage seoLandingPage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div>
            <span className="eyebrow"><i/> Free Visa Photo Maker</span>
            <h1>Make a visa photo online, size it precisely, and prepare a printable sheet.</h1>
            <p>FlyThe BG gives you a simple browser-first way to prepare visa photos. Choose the required physical dimensions, keep your source photo stationary, move the crop frame into position, and generate a measured PNG sheet for printing.</p>
            <div className="heroProof inline">
              <span><strong>Free to use</strong><small>no signup required</small></span>
              <span><strong>Measured output</strong><small>cm · mm · inches · DPI</small></span>
              <span><strong>Browser-first</strong><small>working image stays local</small></span>
            </div>
            <div className="heroActions">
              <Link className="button primary" href="/features/passport-photo">Open Visa & Passport Photo Maker ↗</Link>
              <Link className="button secondary" href="/remove-background">Remove Background ↗</Link>
            </div>
          </div>
          <aside className="pageHeroAside"><span className="kicker">Prepare your photo</span><ol><li><b>01</b><span><strong>Check the official rule</strong><small>country + visa type</small></span></li><li><b>02</b><span><strong>Set physical dimensions</strong><small>size + DPI</small></span></li><li><b>03</b><span><strong>Position and print</strong><small>Actual Size / 100%</small></span></li></ol></aside>
        </div>
      </section>

      <section className="section seoContentSection">
        <div className="shell seoContentGrid">
          <article>
            <span className="eyebrow"><i/> Visa photo preparation</span>
            <h2>A free visa photo maker built for accurate preparation.</h2>
            <p>When a visa application asks for a specific photo size, a normal image crop is not enough. The final picture has to match the requested physical dimensions, while the person's face and shoulders also need to sit in an appropriate position.</p>
            <p>FlyThe BG separates those jobs. The source photo remains stationary while a measured crop frame moves over it. That makes it easier to position the subject, choose the exact output size, and create several copies on a single printable sheet.</p>
          </article>
          <aside className="seoCallout"><strong>Important</strong><p>Visa requirements are not universal. Use the current official instructions for your destination, visa category, embassy, consulate, or application centre before submitting a generated photo.</p></aside>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>01 · Exact dimensions</span><h2>Set the size your application asks for.</h2><p>Choose centimetres, millimetres, or inches and select an export DPI. The tool converts the requested physical size into the corresponding pixel dimensions for the sheet.</p></article>
          <article><span>02 · Face positioning</span><h2>Move the crop frame, not the photo.</h2><p>The source image stays fixed while the crop frame moves across it. This makes fine positioning easier and helps you avoid accidentally changing the underlying composition.</p></article>
          <article><span>03 · Printable sheet</span><h2>Make multiple copies in one file.</h2><p>Generate a measured sheet containing multiple visa photos, adjust individual copies when necessary, then download a PNG or print using Actual Size / 100%.</p></article>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Privacy by architecture</span><h2>Your working photo is processed in the browser.</h2><p>FlyThe BG is designed around browser-first processing for the photo workflow. That means the normal editing path does not require you to upload your personal photo to a FlyThe BG image-processing backend.</p></div>
          <div className="principleList">
            <article><strong>Local crop and layout</strong><p>Crop-frame positioning, physical-size calculations, copy placement, sheet composition, and PNG generation happen in browser memory.</p></article>
            <article><strong>Optional local AI</strong><p>If you choose background removal, FlyThe BG can use its browser-based AI workflow locally. The model/runtime assets may be downloaded, but the working image does not need to be sent to an inference server.</p></article>
            <article><strong>No account required</strong><p>You can use the photo workflow without creating a FlyThe BG account. This keeps the path from search result to finished image simple.</p></article>
            <article><strong>Check before submission</strong><p>Local processing protects the workflow from unnecessary image uploads, but privacy does not replace official document requirements. Review the final photo before submitting it.</p></article>
          </div>
        </div>
      </section>

      <section className="section seoContentSection">
        <div className="shell seoArticle">
          <span className="eyebrow"><i/> How to make a visa photo</span>
          <h2>How to create a visa photo with FlyThe BG</h2>
          <h3>1. Start with a suitable source photo</h3>
          <p>Use a sharp, recent photograph with the person's face clearly visible. Avoid heavy blur, extreme shadows, distracting objects, or a background that makes the subject difficult to separate.</p>
          <h3>2. Check the current visa photo requirements</h3>
          <p>Before choosing dimensions, check the official requirements for the exact visa. Requirements can include photo width and height, head size, eye-line position, background colour, lighting, expression, clothing, file format, file size, and recency.</p>
          <h3>3. Set the requested physical size</h3>
          <p>Enter the dimensions specified by the authority. Physical size and pixel dimensions are different: DPI determines how many pixels represent each inch of the requested printed output.</p>
          <h3>4. Position the crop frame</h3>
          <p>Keep the source image stationary and move the crop frame until the subject is positioned correctly. If you create multiple copies, individual crops can be adjusted on the sheet.</p>
          <h3>5. Download or print at the correct scale</h3>
          <p>Download the generated PNG or print the sheet directly. When printing a measured sheet, choose Actual Size or 100% and turn off Fit to Page or other automatic scaling.</p>
        </div>
      </section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Visa photo FAQ</span><h2>Answers to common visa photo questions.</h2><p>These answers explain how the FlyThe BG workflow behaves. Always follow the latest official photo requirements for your application.</p></div>
          <div className="faqList">
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="section toolInfoSection">
        <div className="shell infoCards">
          <article><span>Need a passport photo?</span><h2>Use the full measured photo maker.</h2><p>The same workflow supports passport-photo preparation, physical sizing, multiple copies, and printable sheets.</p><Link className="textLink" href="/features/passport-photo">Open Passport Photo Maker ↗</Link></article>
          <article><span>Need a transparent subject?</span><h2>Remove the background locally.</h2><p>Prepare a transparent PNG with FlyThe BG's browser-first background remover before using the image in other workflows.</p><Link className="textLink" href="/remove-background">Open Free Background Remover ↗</Link></article>
          <article><span>Want the technical details?</span><h2>Read the privacy and model disclosures.</h2><p>Learn what happens locally, what third-party model assets are used, and where the boundaries of the privacy claims are.</p><Link className="textLink" href="/privacy">Read Privacy & AI Policy ↗</Link></article>
        </div>
      </section>
    </main>
  );
}
