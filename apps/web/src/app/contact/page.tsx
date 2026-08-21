import { LegalPage } from "@/components/LegalPage";
import { companyConfig } from "@/lib/config";

export const metadata = {
  title: "Contact",
  description: "Contact FlytheBG for product support, privacy questions, legal notices, copyright matters, security reports, and other correspondence.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const publicEmail = companyConfig.contactEmail;

  return (
    <LegalPage title="Contact" updated="21 August 2026">
      <h2>Contact FlytheBG</h2>
      {publicEmail ? (
        <p><strong>Email:</strong> <a href={`mailto:${publicEmail}`}>{publicEmail}</a></p>
      ) : (
        <p>A public support email has not been embedded in this repository build. The site owner can intentionally publish one at deployment time with <code>NEXT_PUBLIC_CONTACT_EMAIL</code>.</p>
      )}
      <h2>Support, privacy, and legal requests</h2>
      <p>When a public support address is configured, use it for product support, privacy questions, legal notices, copyright/DMCA notices where applicable, security reports, and other correspondence. Never publish private credentials or personal data in a GitHub issue.</p>
      <h2>Image issues</h2>
      <p>The production image tools process image content in the browser. When reporting a problem, start with a written description and do not share sensitive images unless they are genuinely necessary and you have chosen a private reporting channel.</p>
    </LegalPage>
  );
}
