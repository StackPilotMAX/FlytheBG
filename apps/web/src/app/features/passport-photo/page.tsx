import { PassportPhotoMaker } from "@/components/PassportPhotoMaker";

export const metadata = {
  title: "Passport Photo Maker",
  description: "Create measured passport-photo print sheets in your browser with exact physical dimensions, DPI-aware export, framing, and optional local background removal.",
  alternates: { canonical: "/features/passport-photo" },
};

const passportFaqs = [
  ["Does choosing a preset guarantee that my photo will be accepted?", "No. A physical size is only one requirement. Issuing authorities can also specify head size and position, eye line, expression, clothing, photo age, lighting, background, border, paper quality, and whether digital editing is permitted."],
  ["Why should I print at Actual Size or 100%?", "The exported sheet already contains the requested physical dimensions at the selected DPI. Fit-to-page or automatic printer scaling can change those dimensions and make the final photo too large or too small."],
  ["What does DPI change?", "DPI controls how many pixels represent each inch of physical output. Higher DPI creates more pixels for the same physical size, but it does not change the requested centimetre, millimetre, or inch dimensions when the file is printed without scaling."],
  ["Can I keep the original background?", "Yes. Background removal is optional in the current Passport Photo Maker. If you keep the original, FlytheBG skips the removal step and uses the selected source image for framing and sheet generation."],
  ["Where is the passport sheet generated?", "The current production workflow composes the sheet in the browser. FlytheBG does not intentionally upload the source photo or generated sheet to a FlytheBG image-processing server or image database."],
];

export default function PassportPhotoPage() {
  return (
    <main className="passportPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Passport Photo Maker</span><h1>Build a measured photo sheet in your browser.</h1><p>Set the required physical photo size, frame the subject, choose how the background should be handled, select a print sheet, and export a PNG whose pixel dimensions are calculated from the requested size and DPI.</p><div className="heroProof inline"><span><strong>Measured output</strong><small>cm, mm, or inches</small></span><span><strong>DPI aware</strong><small>pixel size from print size</small></span><span><strong>Browser workflow</strong><small>local composition</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Before you print</span><ol><li><b>01</b><span><strong>Verify the authority</strong><small>size + photo rules</small></span></li><li><b>02</b><span><strong>Frame the subject</strong><small>position + crop carefully</small></span></li><li><b>03</b><span><strong>Print at 100%</strong><small>disable fit-to-page</small></span></li></ol></aside>
        </div>
      </section>

      <section className="passportWorkspace shell"><PassportPhotoMaker /></section>

      <section className="section passportNotes">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Printing guide</span><h2>Physical size, pixels, and DPI are different things.</h2><p>A passport photo is normally specified by a physical width and height, while a digital file is measured in pixels. FlytheBG converts the requested physical dimensions into pixels using the export DPI so the generated file has enough pixel data for the intended print size.</p></div>
          <div className="infoCards">
            <article><span>Physical output</span><h2>Dimensions drive the export.</h2><p>Centimetres, millimetres, or inches define the target size on paper. The on-screen preview can appear larger or smaller depending on your display and browser zoom, so preview size should never be used as a ruler.</p></article>
            <article><span>Pixel calculation</span><h2>DPI determines the pixel count.</h2><p>For an inch-based size, the basic relationship is physical inches multiplied by DPI. Metric dimensions are converted to inches first. The result is rounded to practical whole-pixel dimensions for the exported image and print sheet.</p></article>
            <article><span>Print correctly</span><h2>Use Actual Size / 100%.</h2><p>Printer drivers and photo applications often enable “Fit to page” automatically. That setting can rescale a correctly generated sheet. Disable automatic scaling and verify the final dimensions with a ruler when accuracy matters.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Acceptance depends on more than size</span><h2>Check the issuing authority before relying on any preset.</h2><p>FlytheBG can help with measurement and layout, but it cannot know every current document rule or guarantee acceptance.</p></div>
          <div className="principleList">
            <article><strong>Head position and scale</strong><p>Many authorities define the acceptable distance from chin to crown, eye-line position, or the amount of space above the head. A correctly sized rectangle can still be rejected if the face is framed incorrectly.</p></article>
            <article><strong>Background and lighting</strong><p>Rules may require a plain light background, even lighting, natural skin tone, no strong shadows, and no visible objects behind the subject. Background removal can help with layout, but some authorities restrict editing.</p></article>
            <article><strong>Expression and clothing</strong><p>Neutral expression, open eyes, visible facial features, and restrictions on head coverings, uniforms, glasses, or accessories may apply. These rules vary by country, document type, and applicant circumstances.</p></article>
            <article><strong>Recency and file requirements</strong><p>Authorities can require a recently taken photo and may specify digital file size, resolution, aspect ratio, color mode, paper type, or submission method. Always use the current official instructions for the exact application.</p></article>
          </div>
        </div>
      </section>

      <section className="section passportNotes"><div className="shell infoCards"><article><span>Optional background removal</span><h2>Keep the original or remove locally.</h2><p>If you choose background removal, the same browser IMG.LY workflow used by FlytheBG’s remover is applied before framing. If you keep the original background, that processing step is skipped.</p></article><article><span>Sheet composition</span><h2>Copies are arranged on a white print sheet.</h2><p>FlytheBG places repeated photo rectangles onto the selected sheet while preserving the requested dimensions. The selected photo background applies inside each photo rectangle; the surrounding print sheet remains white.</p></article><article><span>Privacy</span><h2>The current sheet workflow is browser-first.</h2><p>Framing, physical-size conversion, sheet layout, and PNG generation happen in the browser. Working image data is held while the tool is open and released from page-controlled state when the workflow is cleared or the page ends.</p></article></div></section>

      <section className="section faqSection">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Passport photo FAQ</span><h2>Important details before you submit or print.</h2><p>Use these answers as product guidance, then confirm the official rules for the document you are preparing.</p></div>
          <div className="faqList">{passportFaqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
        </div>
      </section>
    </main>
  );
}
