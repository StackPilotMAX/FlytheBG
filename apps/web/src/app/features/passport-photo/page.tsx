import { PassportPhotoMaker } from "@/components/PassportPhotoMaker";

export const metadata = { title: "Passport Photo Maker" };

export default function PassportPhotoPage() {
  return (
    <main className="darkPage passportPage">
      <section className="passportPageShell shell"><PassportPhotoMaker /></section>
      <section className="passportNotes"><div className="shell passportNotesGrid"><article><span>Print-size accuracy</span><h2>Physical dimensions drive the export.</h2><p>The generated sheet converts your requested centimetres, millimetres, or inches into pixels using the selected DPI. Browser preview size does not determine the downloaded image size.</p></article><article><span>Country requirements</span><h2>Check the official specification.</h2><p>Passport and ID photo rules vary by country and document type. FlytheBG lets you enter exact measurements, but you should use the dimensions and head-position rules published by the issuing authority.</p></article></div></section>
    </main>
  );
}
