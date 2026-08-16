import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cookie & Local Storage Policy" };

export default function CookiesPage() {
  return <LegalPage title="Cookie & Local Storage Policy" updated="16 August 2026">
    <h2>1. Core tools</h2>
    <p>FlytheBG does not require advertising or analytics cookies to perform background removal, cropping, or passport-photo sheet generation. The permanent galaxy and image editors run in the browser without requiring marketing cookies.</p>

    <h2>2. Necessary technologies</h2>
    <p>Hosting, security, load balancing, abuse prevention, and network infrastructure may use strictly necessary request-level technologies to operate the service. Those technologies are not optional advertising cookies.</p>

    <h2>3. Browser-side AI</h2>
    <p>The optional browser comparison model downloads model/runtime files from the configured IMG.LY distribution service. Browser caching or storage mechanisms may be used by the browser or runtime to make those assets available efficiently. The uploaded image is processed locally for that browser-side result.</p>

    <h2>4. Quality feedback</h2>
    <p>Optional result feedback is sent directly to FlytheBG when you choose a rating. It uses a short-lived random run token rather than a marketing identifier, and that run metadata expires within one hour.</p>

    <h2>5. Google AdSense</h2>
    <p>Advertising is disabled unless FlytheBG is configured with a real Google AdSense publisher ID. If AdSense is enabled, Google and its advertising partners may use cookies or similar technologies for ad delivery, measurement, fraud prevention, and, where permitted, personalization. Region-specific consent controls should be shown before loading non-essential advertising technologies where required.</p>

    <h2>6. Your choices</h2>
    <p>If consent controls are presented, you can use them to make the choices offered for your region. Blocking non-essential cookies should not prevent the core background-removal and passport-photo tools from functioning.</p>
  </LegalPage>;
}
