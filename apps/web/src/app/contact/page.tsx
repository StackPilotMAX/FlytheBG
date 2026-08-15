import { LegalPage } from "@/components/LegalPage";
import { companyConfig } from "@/lib/config";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };
export default function ContactPage() { return <LegalPage title="Contact" updated="15 August 2026"><h2>Support</h2>{companyConfig.contactEmail ? <p>Email us at <a href={`mailto:${companyConfig.contactEmail}`}>{companyConfig.contactEmail}</a>.</p> : <p>A real support email must be configured in <code>CONTACT_EMAIL</code> before public launch.</p>}<h2>Legal notices</h2>{companyConfig.legalEmail ? <p>Legal correspondence can be sent to <a href={`mailto:${companyConfig.legalEmail}`}>{companyConfig.legalEmail}</a>.</p> : <p>A real legal contact must be configured before public launch.</p>}<h2>Image issues</h2><p>When reporting a processing problem, do not send sensitive images unless support specifically needs the file and provides an appropriate method for sharing it.</p></LegalPage>; }
