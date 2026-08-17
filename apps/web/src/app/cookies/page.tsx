import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cookie & Local Storage Policy" };

export default function CookiesPage() {
  return <LegalPage title="Cookie & Local Storage Policy" updated="17 August 2026">
    <h2>1. Core image tools</h2>
    <p>FlytheBG&apos;s core background-removal, cropping, and passport-photo tools do not depend on advertising cookies to perform the image-editing task. The galaxy and image editors run in the browser independently of advertising preferences.</p>

    <h2>2. Temporary browser working memory</h2>
    <p>Image previews, Blob/object URLs, canvas buffers, and generated print sheets may exist temporarily in the current browser tab&apos;s working memory while you use an image tool. These working objects are not used as advertising identifiers. FlytheBG releases temporary preview/export resources when they are no longer needed and clears the current working images after the relevant browser download starts.</p>
    <p>This application cleanup is different from cookies or persistent local storage, and it cannot delete the file you deliberately downloaded or control normal caching performed by your browser, operating system, network, or security software.</p>

    <h2>3. Necessary technologies</h2>
    <p>Hosting, security, load balancing, abuse prevention, request routing, and network infrastructure may use strictly necessary request-level technologies to operate and protect the service. These are separate from optional advertising or personalization technologies.</p>

    <h2>4. IMG.LY Browser AI</h2>
    <p>The browser comparison feature uses <a href="https://github.com/imgly/background-removal-js" rel="noreferrer">IMG.LY background-removal software</a>. The browser downloads model/runtime files from IMG.LY&apos;s configured distribution service. Browser caching or related storage mechanisms may be used to make those assets available efficiently. The uploaded image itself is processed locally for this browser-side result.</p>

    <h2>5. Quality feedback</h2>
    <p>Optional result feedback is sent directly to FlytheBG only when you choose a rating. It uses a short-lived random run token rather than a marketing identifier, and that run metadata expires within one hour.</p>

    <h2>6. Google AdSense</h2>
    <p>FlytheBG is configured to use Google AdSense. Google and its advertising partners may use cookies, local storage, device/browser identifiers, IP/network information, ad interactions, and similar technologies for ad delivery, measurement, fraud prevention, frequency controls, and—where permitted—personalization.</p>
    <p>Google provides more information in its <a href="https://policies.google.com/privacy" rel="noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/technologies/ads" rel="noreferrer">advertising technologies information</a>.</p>

    <h2>7. Consent management</h2>
    <p>Where required by the visitor&apos;s region, FlytheBG uses or intends to use a Google-certified consent management platform configured through Google AdSense Privacy &amp; messaging. The consent message can provide choices such as consent, refusal, or management of advertising purposes and vendors. The exact options shown can vary by region and Google&apos;s current regulatory configuration.</p>

    <h2>8. Your choices</h2>
    <p>Blocking or declining non-essential advertising technologies should not prevent the core image tools from working. Where a Google privacy message is shown, use that message to make or manage the choices available for your region. Browser settings can also be used to control cookies and site storage, although blocking all storage may affect caching or other site functionality.</p>
  </LegalPage>;
}
