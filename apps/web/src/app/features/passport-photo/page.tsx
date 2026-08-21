import { HoverFaqList } from "@/components/HoverFaqList";
import { PassportPhotoMaker } from "@/components/PassportPhotoMaker";

export const metadata = {
  title: "Passport Photo Maker — Edit, Print & Download PNG",
  description: "Create measured passport-photo sheets in your browser, manually reposition individual copies, print directly at 100%, or download a high-resolution PNG.",
  keywords: ["passport photo maker", "passport size photo", "passport photo print", "passport photo PNG", "35x45 photo maker", "2x2 passport photo", "print passport photos online"],
  alternates: { canonical: "/features/passport-photo" },
};

const passportFaqs = [
  ["Can I manually move each passport photo in the sheet preview?", "Yes. Select any individual photo in the final sheet preview and drag it to reposition only that copy. Scroll over the selected copy to change only its zoom, or use the nudge controls for smaller adjustments."],
  ["Can different copies have different framing?", "Yes. The master frame is used by default, but each sheet copy can have its own position and zoom. Reset a selected copy at any time to make it follow the master frame again."],
  ["Can I print the passport sheet directly?", "Yes. Choose Print directly at 100%. FlytheBG generates the sheet in the browser, opens a print-ready page, and launches the browser print dialog. Keep scaling at Actual Size or 100% and disable Fit to Page."],
  ["Can I download the finished passport sheet as PNG?", "Yes. Choose Download PNG to save the complete print sheet at the selected DPI. Downloading does not clear your edits, so you can keep adjusting or print afterwards."],
  ["Does choosing a preset guarantee that my photo will be accepted?", "No. A physical size is only one requirement. Issuing authorities can also specify head size and position, eye line, expression, clothing, photo age, lighting, background, border, paper quality, and whether digital editing is permitted."],
  ["Why should I print at Actual Size or 100%?", "The exported sheet already contains the requested physical dimensions at the selected DPI. Fit-to-page or automatic printer scaling can change those dimensions and make the final photo too large or too small."],
  ["What does DPI change?", "DPI controls how many pixels represent each inch of physical output. Higher DPI creates more pixels for the same physical size, but it does not change the requested centimetre, millimetre, or inch dimensions when the file is printed without scaling."],
  ["Can I keep the original background?", "Yes. Background removal is optional. If you keep the original, FlytheBG skips the removal step and uses the selected source image for framing and sheet generation."],
  ["Where is the passport sheet generated?", "The production workflow composes the sheet in the browser. FlytheBG does not intentionally upload the source photo or generated sheet to a FlytheBG image-processing server or image database."],
] as const;

export default function PassportPhotoPage() {
  return (
    <main className="passportPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Passport Photo Maker</span><h1>Build, adjust, print, or download your passport sheet.</h1><p>Set the required physical size, frame the subject, then manually fine-tune individual copies directly in the final sheet preview. Print at 100% or save the finished sheet as a PNG.</p><div className="heroProof inline"><span><strong>Per-photo editing</strong><small>move each copy manually</small></span><span><strong>Print directly</strong><small>Actual Size / 100%</small></span><span><strong>PNG download</strong><small>DPI-aware sheet export</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Before you print</span><ol><li><b>01</b><span><strong>Verify the authority</strong><small>size + photo rules</small></span></li><li><b>02</b><span><strong>Fine-tune each copy</strong><small>drag + zoom on preview</small></span></li><li><b>03</b><span><strong>Print at 100%</strong><small>disable fit-to-page</small></span></li></ol></aside>
        </div>
      </section>

      <section className="passportWorkspace shell"><PassportPhotoMaker /></section>

      <section className="section passportNotes">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Printing guide</span><h2>Physical size, pixels, and DPI are different things.</h2><p>A passport photo is normally specified by a physical width and height, while a digital file is measured in pixels. FlytheBG converts the requested physical dimensions into pixels using the export DPI so the generated file has enough pixel data for the intended print size.</p></div>
          <div className="infoCards">
            <article><span>Physical output</span><h2>Dimensions drive the export.</h2><p>Centimetres, millimetres, or inches define the target size on paper. The on-screen preview can appear larger or smaller depending on your display and browser zoom, so preview size should never be used as a ruler.</p></article>
            <article><span>Individual framing</span><h2>Every copy can be adjusted.</h2><p>Set a master framing first, then select any copy in the final sheet preview. Drag it independently, change its zoom, or reset it back to the master frame without affecting the other copies.</p></article>
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

      <section className="section passportNotes"><div className="shell infoCards"><article><span>Optional background removal</span><h2>Keep the original or remove locally.</h2><p>If you choose background removal, the same browser IMG.LY workflow used by FlytheBG’s remover is applied before framing. If you keep the original background, that processing step is skipped.</p></article><article><span>Sheet composition</span><h2>Copies are arranged on a white print sheet.</h2><p>FlytheBG places repeated photo rectangles onto the selected sheet while preserving the requested dimensions. Individual framing adjustments are included in both direct printing and PNG export.</p></article><article><span>Privacy</span><h2>The current sheet workflow is browser-first.</h2><p>Framing, per-copy edits, physical-size conversion, sheet layout, PNG generation, and print preparation happen in the browser. No paid image-processing backend is required.</p></article></div></section>

      <section className="section faqSection">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Passport photo FAQ</span><h2>Hover a question to open it.</h2><p>Desktop pointer users get automatic open/close animation. Touch and keyboard users keep the normal accessible tap/click behavior.</p></div>
          <HoverFaqList items={passportFaqs} />
        </div>
      </section>
    </main>
  );
}
