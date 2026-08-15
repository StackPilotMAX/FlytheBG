import { LegalPage } from "@/components/LegalPage";
import { companyConfig } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact" updated="15 August 2026">
      <h2>Contact FlytheBG</h2>
      <p>Email is the only official contact channel for FlytheBG.</p>
      <p><strong>Email:</strong> <a href={`mailto:${companyConfig.contactEmail}`}>{companyConfig.contactEmail}</a></p>

      <h2>Why email only?</h2>
      <p>Using one written contact channel keeps support, privacy requests, legal notices, and abuse reports in a single auditable place. It also avoids asking users for phone numbers, keeps sensitive requests out of public social-media messages, and makes it easier to maintain a clear record of what was requested and how FlytheBG responded.</p>
      <p>FlytheBG does not currently advertise phone, live-chat, messaging-app, or social-media support as official contact methods. Messages sent elsewhere may not be monitored.</p>

      <h2>Support, privacy, and legal requests</h2>
      <p>The same email address may be used for product support, privacy questions, deletion or data-rights requests, copyright/DMCA notices where applicable, security reports, and other legal correspondence. Include a clear subject line so the request can be routed correctly.</p>

      <h2>Image issues</h2>
      <p>When reporting a processing problem, do not email sensitive images unless they are genuinely necessary to explain the issue. Start with a written description of the problem.</p>
    </LegalPage>
  );
}
