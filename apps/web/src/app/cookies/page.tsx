import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Cookie Policy",
  description: "Read how FlytheBG uses browser storage, model/runtime caching, the dismissible feature notice, and optional Google AdSense and Monetag advertising technologies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage(){
  return <LegalPage title="Cookie Policy" updated="21 August 2026">
    <h2>1. Core image tools</h2>
    <p>FlytheBG&apos;s current background remover and Passport Photo Maker do not require an advertising cookie to process your photo. Image content is handled in the browser.</p>

    <h2>2. Browser model caching</h2>
    <p>Your browser may cache model/runtime assets so later processing can start faster. These cached software assets are not copies of the photo you selected.</p>

    <h2>3. Dismissible product notice</h2>
    <p>When you dismiss the October 2026 new-features notice, FlytheBG stores a small local browser flag so the same notice does not keep appearing. The flag contains no uploaded image data and can be removed by clearing site storage.</p>

    <h2>4. Google AdSense and Monetag</h2>
    <p>FlytheBG includes disabled-by-default settings for Google AdSense and Monetag. When advertising is disabled, their ad-serving scripts are not intentionally loaded by the FlytheBG monetization component. Verification metadata or public seller records may still be configured separately when needed for account/site verification.</p>
    <p>If advertising is enabled, Google, Monetag, and their partners may use cookies, local storage, or similar technologies for ad delivery, measurement, fraud prevention, frequency controls, and personalization where permitted. FlytheBG is intended to use only AdSense-compatible Monetag formats when both networks are active; pop-under/OnClick behavior should not be enabled alongside AdSense.</p>

    <h2>5. Consent controls</h2>
    <p>Applicable consent or opt-out controls must be presented where required. Personalized AdSense ads served to visitors in the EEA, UK, or Switzerland require an appropriate Google-certified consent management platform integrated with the IAB TCF.</p>

    <h2>6. Browser controls</h2>
    <p>You can clear or block cookies and site storage using your browser settings. Doing so may remove cached browser-model files and the dismissed-notice flag, and may affect advertising preferences or ad delivery if advertising is enabled.</p>

    <h2>7. Contact</h2>
    {appConfig.contactEmail ? <p>Questions may be sent to <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>Questions may be sent through the contact page. A public contact email is shown only when one is intentionally configured.</p>}
  </LegalPage>;
}
