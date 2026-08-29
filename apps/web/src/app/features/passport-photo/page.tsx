import { AdPlaceholder } from "@/components/AdPlaceholder";
import { HoverFaqList } from "@/components/HoverFaqList";
import { PassportPhotoMaker } from "@/components/PassportPhotoMaker";

export const metadata = {
  title: "Passport Photo Maker: Print & Download",
  description: "Create measured passport-photo sheets in your browser, move the crop frame over a stationary photo, adjust individual crops, print at 100%, or download a high-resolution PNG.",
  keywords: ["passport photo maker", "passport size photo", "passport photo crop frame", "passport photo print", "passport photo PNG", "35x45 photo maker", "2x2 passport photo", "print passport photos online"],
  alternates: { canonical: "/features/passport-photo" },
  openGraph: {
    title: "Passport Photo Maker: Print & Download Online",
    description: "Create measured passport-photo sheets in your browser with movable crop framing, individual copy adjustments, DPI-aware PNG export, and 100% printing.",
    url: "/features/passport-photo",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Passport Photo Maker: Print & Download Online",
    description: "Create measured passport-photo sheets with movable crop framing and DPI-aware export.",
  },
};

const passportFaqs = [
  ["Can I move the passport crop frame without moving the photo?", "Yes. The source photo stays stationary in the crop workspace. Drag the outlined crop frame over it, use the arrow pad, or use the frame X/Y sliders. Crop zoom changes the frame size and therefore how tightly the final passport photo is cropped."],
  ["Can different copies use different crop frames?", "Yes. The main crop frame is used by default. Select a photo in the final sheet, then adjust that copy's crop-frame X/Y position or crop zoom without changing the other copies."],
  ["Can I print the passport sheet directly?", "Yes. Choose Print directly at 100%. FlytheBG generates the sheet in the browser, opens a print-ready page, and launches the browser print dialog. Keep scaling at Actual Size or 100% and disable Fit to Page."],
  ["Can I download the finished passport sheet as PNG?", "Yes. Choose Download PNG to save the complete print sheet at the selected DPI. Downloading does not clear your crop-frame edits, so you can keep adjusting or print afterwards."],
  ["Does choosing a preset guarantee that my photo will be accepted?", "No. A physical size is only one requirement. Issuing authorities can also specify head size and position, eye line, expression, clothing, photo age, lighting, background, border, paper quality, and whether digital editing is permitted."],
  ["Why should I print at Actual Size or 100%?", "The exported sheet already contains the requested physical dimensions at the selected DPI. Fit-to-page or automatic printer scaling can change those dimensions and make the final photo too large or too small."],
  ["What does DPI change?", "DPI controls how many pixels represent each inch of physical output. Higher DPI creates more pixels for the same physical size, but it does not change the requested centimetre, millimetre, or inch dimensions when the file is printed without scaling."],
  ["Can I keep the original background?", "Yes. Background removal is optional. If you keep the original, FlytheBG skips the removal step and uses the selected source image for crop-frame positioning and sheet generation."],
  ["Where is the passport sheet generated?", "The production workflow composes the sheet in the browser. FlytheBG does not intentionally upload the source photo or generated sheet to a FlytheBG image-processing server or image database."],
] as const;

export default function PassportPhotoPage() {
  return (
    <main className="passportPage">
      <section className="pageHero compactHero">
        <div className="shell pageHeroGrid">
          <div><span className="eyebrow"><i/> Passport Photo Maker</span><h1>Move the crop frame, then print or download your passport sheet.</h1><p>Set the required physical size, keep the source photo stationary, and move the crop frame over the photo until the subject is positioned correctly. You can also customize the crop frame for individual copies in the final sheet.</p><div className="heroProof inline"><span><strong>Movable crop frame</strong><small>photo stays stationary</small></span><span><strong>Print directly</strong><small>Actual Size / 100%</small></span><span><strong>PNG download</strong><small>DPI-aware sheet export</small></span></div></div>
          <aside className="pageHeroAside"><span className="kicker">Before you print</span><ol><li><b>01</b><span><strong>Verify the authority</strong><small>size + photo rules</small></span></li><li><b>02</b><span><strong>Position the crop frame</strong><small>move + crop zoom</small></span></li><li><b>03</b><span><strong>Print at 100%</strong><small>disable fit-to-page</small></span></li></ol></aside>
        </div>
        <div className="shell pageHeroAd" aria-label="Top advertisement placement"><AdPlaceholder slot="passport-inline-1" format="leaderboard" /></div>
      </section>

      <section className="passportWorkspace shell"><PassportPhotoMaker /></section>

      <section className="section passportNotes">
        <div className="shell">
          <div className="sectionHeading"><span className="eyebrow"><i/> Printing guide</span><h2>Physical size, crop position, pixels, and DPI are different things.</h2><p>A passport photo is normally specified by a physical width and height, while a digital file is measured in pixels. FlytheBG converts the requested physical dimensions into pixels using the export DPI. The crop frame determines which stationary part of the source image is placed inside those output dimensions.</p></div>
          <div className="infoCards">
            <article><span>Physical output</span><h2>Dimensions drive the export.</h2><p>Centimetres, millimetres, or inches define the target size on paper. The on-screen preview can appear larger or smaller depending on your display and browser zoom, so preview size should never be used as a ruler.</p></article>
            <article><span>Crop-frame positioning</span><h2>The photo stays still while the frame moves.</h2><p>Drag or nudge the main crop frame over the stationary source photo. For individual printed copies, select a copy and adjust its own crop-frame position or crop zoom without moving the source image itself.</p></article>
            <article><span>Print correctly</span><h2>Use Actual Size / 100%.</h2><p>Printer drivers and photo applications often enable “Fit to page” automatically. That setting can rescale a correctly generated sheet. Disable automatic scaling and verify the final dimensions with a ruler when accuracy matters.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Acceptance depends on more than size</span><h2>Check the issuing authority before relying on any preset.</h2><p>FlytheBG can help with measurement and layout, but it cannot know every current document rule or guarantee acceptance.</p></div>
          <div className="principleList">
            <article><strong>Head position and scale</strong><p>Many authorities define the acceptable distance from chin to crown, eye-line position, or the amount of space above the head. Move and resize the crop frame so the source photo is sampled correctly, then compare the result with the authority&apos;s current instructions.</p></article>
            <article><strong>Background and lighting</strong><p>Rules may require a plain light background, even lighting, natural skin tone, no strong shadows, and no visible objects behind the subject. Background removal can help with layout, but some authorities restrict editing.</p></article>
            <article><strong>Expression and clothing</strong><p>Neutral expression, open eyes, visible facial features, and restrictions on head coverings, uniforms, glasses, or accessories may apply. These rules vary by country, document type, and applicant circumstances.</p></article>
            <article><strong>Recency and file requirements</strong><p>Authorities can require a recently taken photo and may specify digital file size, resolution, aspect ratio, color mode, paper type, or submission method. Always use the current official instructions for the exact application.</p></article>
          </div>
        </div>
      </section>

      <section className="section passportNotes"><div className="shell infoCards"><article><span>Optional background removal</span><h2>Keep the original or remove locally.</h2><p>If you choose background removal, the same browser IMG.LY workflow used by FlytheBG&apos;s remover is applied before crop-frame positioning. If you keep the original background, that processing step is skipped.</p></article><article><span>Model disclosure</span><h2>Third-party AI is attributed clearly.</h2><p>When background removal is selected, FlytheBG uses IMG.LY&apos;s browser package with IS-Net model variants. FlytheBG does not claim ownership of those model/runtime assets.</p><a className="textLink" href="/model-disclosure">Read Model & Open Source Disclosure ↗</a></article><article><span>Privacy</span><h2>The current sheet workflow is browser-first.</h2><p>Crop-frame positioning, per-copy crop choices, physical-size conversion, sheet layout, PNG generation, and print preparation happen in the browser. No paid image-processing backend is required.</p></article></div></section>

      <section className="section faqSection" id="faq">
        <div className="shell faqGrid">
          <div className="sectionHeading compact"><span className="eyebrow"><i/> Passport photo FAQ</span><h2>Click a question for a smooth answer.</h2><p>Opening and closing animate smoothly. Desktop hover is optional; touch, mouse click, and keyboard activation all use the same accessible accordion.</p><a className="textLink" href="/faq">Open the full FlytheBG FAQ ↗</a></div>
          <HoverFaqList items={passportFaqs} />
        </div>
      </section>
    </main>
  );
}
