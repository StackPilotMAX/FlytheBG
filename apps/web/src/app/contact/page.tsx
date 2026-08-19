import { LegalPage } from "@/components/LegalPage";
import { companyConfig } from "@/lib/config";

export const metadata = {
  title: "Contact",
  description: "Contact FlytheBG for product support, privacy questions, legal notices, copyright matters, security reports, and other correspondence.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact" updated="18 August 2026">
      <h2>Contact FlytheBG</h2>
      <p>Email is the only official contact channel for FlytheBG.</p>
      <p><strong>Email:</strong> <a href={`mailto:${companyConfig.contactEmail}`}>{companyConfig.contactEmail}</a></p>
      <h2>Support, privacy, and legal requests</h2>
      <p>Use this address for product support, privacy questions, legal notices, copyright/DMCA notices where applicable, security reports, and other correspondence. Include a clear subject line.</p>
      <h2>Image issues</h2>
      <p>The current production image tools process image content in the browser. When reporting a problem, start with a written description and do not email sensitive images unless they are genuinely necessary.</p>
    </LegalPage>
  );
}
