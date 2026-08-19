import Link from "next/link";
import { PublisherAds } from "@/components/PublisherAds";

export const metadata = {
  title: "Passport Photo Printing Guide",
  description: "How FlytheBG converts physical photo dimensions into pixels, frames a subject, fills a print sheet, and exports at a measured DPI.",
};

export default function PassportPhotoGuide() {
  return (
    <main className="featurePage">
      <PublisherAds />
      <section className="pageHero">
        <div className="shell narrowHero">
          <span className="eyebrow"><i/> Guide · Passport photos</span>
          <h1>How to build a measured passport-photo print sheet.</h1>
          <p>Passport and ID rules vary by authority. FlytheBG handles the production mechanics—physical dimensions, framing, background color, copies, paper size, and PNG export—but the receiving authority decides whether a photo is acceptable.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 01 · Size</span>
            <h2>Start with the official physical dimensions.</h2>
            <p>Enter the width and height required by the document authority in centimetres, millimetres, or inches. FlytheBG converts those dimensions into output pixels using the selected DPI.</p>
          </div>
          <div className="principleList">
            <article><strong>Physical size comes first</strong><p>A photo that merely looks correct on screen can print at the wrong size. The important inputs are the required physical width and height together with the intended print resolution.</p></article>
            <article><strong>300 DPI is the safe default</strong><p>For common photo-sheet sizes, 300 DPI provides substantial print resolution without creating extremely large browser canvases. A 600 DPI request may be reduced automatically when the resulting canvas would exceed the application's memory guard.</p></article>
            <article><strong>Check the authority's specification</strong><p>Do not assume that a commonly used passport-photo size is correct for every country, visa, licence, school, employer, or ID card. Requirements can differ and can change.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 02 · Subject and background</span>
            <h2>Frame the person before filling the sheet.</h2>
            <p>The Passport Photo Maker lets you drag the subject, adjust zoom, and choose a background color. If background removal is enabled, the same browser-only IMG.LY fallback used by the main remover runs first.</p>
          </div>
          <div className="principleList">
            <article><strong>Use the frame controls deliberately</strong><p>Zoom and reposition so the face and shoulders sit where the target specification expects. FlytheBG does not automatically guarantee head-height, eye-line, expression, pose, clothing, lighting, or biometric compliance.</p></article>
            <article><strong>Color belongs inside each photo</strong><p>The chosen photo background is painted inside every passport-photo rectangle. The surrounding paper remains white, preventing the earlier failure mode where a selected color covered the whole print sheet.</p></article>
            <article><strong>Review the cutout</strong><p>If you removed the background, inspect hair and shoulder edges before printing. A mathematically correct sheet cannot fix a poor cutout or a source image that violates document rules.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 03 · Paper and copies</span>
            <h2>Let the layout capacity determine how many copies fit.</h2>
            <p>Paper size, margins, gaps, and individual photo dimensions determine the capacity of a sheet. FlytheBG calculates that capacity before export.</p>
          </div>
          <div className="principleList">
            <article><strong>Use Fill sheet when appropriate</strong><p>The Fill sheet control sets the copy count to the calculated capacity rather than asking the browser to draw copies outside the available paper area.</p></article>
            <article><strong>Leave practical cutting space</strong><p>A small gap between copies can make trimming easier. Larger margins reduce the number of photos that fit but can help printers that cannot print edge-to-edge.</p></article>
            <article><strong>Use the correct paper preset</strong><p>A4, 4×6-inch photo paper, US Letter, and custom paper sizes have different capacities. Choose the paper you will actually print on.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 04 · Print</span>
            <h2>Print at Actual Size / 100%.</h2>
            <p>The exported PNG contains the requested physical layout at the reported DPI. Printer software can still rescale that file unless you disable fit-to-page behaviour.</p>
          </div>
          <div className="principleList">
            <article><strong>Avoid Fit to page</strong><p>Options such as Fit, Shrink to printable area, or Scale to page can change the physical dimensions. Prefer Actual Size or 100% scaling when the printer and paper setup allow it.</p></article>
            <article><strong>Measure a test print</strong><p>Before producing many copies, print one sheet and measure a photo rectangle with a ruler. This catches printer-driver scaling, wrong paper selection, and application print settings.</p></article>
            <article><strong>Keep the original requirements nearby</strong><p>Compare the final print with the receiving authority's current written rules. FlytheBG is a production tool, not an authority approval system.</p></article>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <div className="shell finalCtaInner">
          <div><span className="eyebrow"><i/> Build a sheet</span><h2>Frame one photo and fill the page.</h2><p>The live maker performs the layout and PNG export in your browser.</p></div>
          <div className="buttonRow"><Link className="buttonPrimary" href="/features/passport-photo">Open Passport Maker <span>↗</span></Link><Link className="buttonSecondary" href="/guides">All guides</Link></div>
        </div>
      </section>
    </main>
  );
}
