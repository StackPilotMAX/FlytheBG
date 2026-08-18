import { PassportPhotoMaker } from "@/components/PassportPhotoMaker";

export const metadata = { title: "Passport Photo Maker" };

export default function PassportPhotoPage() {
  return (
    <main className="passportPage">
      <section className="passportWorkspace shell"><PassportPhotoMaker /></section>
      <section className="section passportNotes"><div className="shell infoCards"><article><span>Physical output</span><h2>Dimensions drive the export.</h2><p>FlytheBG converts centimetres, millimetres, or inches into pixels using the actual export DPI. The on-screen preview size does not define the printed size.</p></article><article><span>Print correctly</span><h2>Use Actual Size / 100%.</h2><p>Printer drivers can scale images automatically. Disable “Fit to page” when accurate physical photo dimensions are required.</p></article><article><span>Document rules</span><h2>Check the issuing authority.</h2><p>Photo size, head position, background, expression, clothing, and recency requirements vary by document and country. FlytheBG does not guarantee acceptance.</p></article></div></section>
    </main>
  );
}
