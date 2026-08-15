import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cookie & Local Storage Policy" };

export default function CookiesPage() {
  return <LegalPage title="Cookie & Local Storage Policy" updated="15 August 2026">
    <h2>1. Current product behavior</h2>
    <p>FlytheBG does not require advertising or analytics cookies to perform background removal. The 3D and scroll effects run in the browser without loading third-party tracking scripts.</p>

    <h2>2. Necessary technologies</h2>
    <p>Hosting, security, load-balancing, abuse prevention, or network infrastructure may use strictly necessary request-level technologies to operate the service. Those technologies should not be described as optional advertising cookies.</p>

    <h2>3. Quality feedback</h2>
    <p>Optional result feedback is sent directly to the FlytheBG application when you choose a rating. It uses a short-lived random run token rather than a marketing cookie, and that token expires within one hour.</p>

    <h2>4. Future analytics or advertising</h2>
    <p>If non-essential analytics, advertising, authentication, personalization, or similar technologies are enabled later, this policy and any legally required consent controls must be updated before those technologies are loaded.</p>
  </LegalPage>;
}
