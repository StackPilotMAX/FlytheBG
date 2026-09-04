import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "FlyThe BG Cookie & Storage Policy",
  description: "Read how FlyThe BG uses browser storage, model/runtime caching, and optional advertising technologies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage(){
  return <LegalPage title="Cookie & Storage Policy" updated="4 September 2026">
    <h2>1. Core image tools</h2>
    <p>FlyThe BG&apos;s background remover, Passport Photo Maker, and supported editing workflows do not require advertising cookies to process your media. Working image data is handled in the browser.</p>

    <h2>2. Browser model caching</h2>
    <p>Your browser may cache model and runtime assets so later processing can start faster. These cached software assets are not copies of the photo you selected.</p>

    <h2>3. Local preferences</h2>
    <p>FlyThe BG may store small, non-image preferences in browser storage, such as interface choices or whether a user has dismissed a product message. These values are not intended to contain uploaded image or video bytes.</p>

    <h2>4. Google AdSense and Monetag</h2>
    <p>FlyThe BG may use Google AdSense and Monetag when the corresponding production configuration is enabled. If advertising is disabled, ad-serving scripts are not intentionally loaded by the monetization component. Verification metadata or public seller records may be configured separately when required.</p>
    <p>If advertising is enabled, Google, Monetag, and their partners may use cookies, local storage, or similar technologies for ad delivery, measurement, fraud prevention, frequency controls, and personalization where permitted. Advertising remains separate from upload, editing, and download controls.</p>

    <h2>5. Consent controls</h2>
    <p>Applicable consent or opt-out controls must be presented where required by law or the relevant advertising platform. Advertising settings can change as provider requirements evolve.</p>

    <h2>6. Browser controls</h2>
    <p>You can clear or block cookies and site storage using your browser settings. Doing so may remove cached model files and local preferences and may affect optional advertising functionality.</p>

    <h2>7. Changes</h2>
    <p>FlyThe BG may update this policy when storage, analytics, advertising, or other optional browser technologies change. The effective date above identifies the current version.</p>

    <h2>8. Contact</h2>
    {appConfig.contactEmail ? <p>Questions may be sent to <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>Questions may be sent through the contact page. A public contact email is shown only when one is intentionally configured.</p>}
  </LegalPage>;
}
