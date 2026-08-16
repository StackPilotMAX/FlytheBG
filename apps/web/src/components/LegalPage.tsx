import Link from "next/link";
import { companyConfig } from "@/lib/config";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <main className="legalMain"><div className="legalShell"><Link href="/" className="backLink">← Back to FlytheBG</Link><div className="legalHeading"><span>Legal</span><h1>{title}</h1><p>Last updated: {updated}</p></div><div className="legalBody">{children}</div><div className="legalIdentity"><strong>Operator information</strong><p>{companyConfig.legalName || companyConfig.tradingName}</p>{companyConfig.registrationNumber && <p>Registration: {companyConfig.registrationNumber}</p>}{companyConfig.registeredAddress && <p>{companyConfig.registeredAddress}</p>}{companyConfig.country && <p>{companyConfig.country}</p>}<p>{companyConfig.legalEmail}</p></div></div></main>;
}
