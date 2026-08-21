import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Terms of Use",
  description: "Read FlytheBG's terms for browser-based background removal, image editing, passport-photo tools, optional advertising, output limitations, and acceptable use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage(){
  return <LegalPage title="Terms of Use" updated="21 August 2026">
    <h2>1. Service</h2>
    <p>FlytheBG provides browser-based image utilities including background removal, cropping, and passport-photo sheet generation. Browser AI may select different local model/runtime paths according to device capability and available memory.</p>

    <h2>2. Your images</h2>
    <p>You are responsible for having the rights and permissions needed to use images with FlytheBG. The current image tools are designed to process image content locally in the browser rather than intentionally store it in a FlytheBG image database.</p>

    <h2>3. Browser AI and third-party software</h2>
    <p>IMG.LY software, model assets, browser runtimes, hosting providers, advertising providers, and other third-party components may have their own terms, licences, availability limits, and policies. FlytheBG does not guarantee that every browser or device can run browser AI successfully. Local post-processing may refine a generated alpha mask, but it does not retrain or alter pretrained model weights.</p>

    <h2>4. Passport photos</h2>
    <p>The Passport Photo Maker provides sizing, background color, layout, DPI, per-copy positioning, and print-sheet tools. It does not guarantee acceptance by any passport office, government authority, visa authority, school, employer, or other organization. Users must verify the applicable photo rules themselves.</p>

    <h2>5. Output and printing</h2>
    <p>For physical sizing, print generated passport sheets at Actual Size or 100% unless your printer workflow specifically requires otherwise. Printer drivers, paper, scaling, and device color management are outside FlytheBG&apos;s control.</p>

    <h2>6. Advertising</h2>
    <p>FlytheBG includes optional, disabled-by-default configuration for Google AdSense and Monetag. Advertising may be enabled only after the required account/site settings are configured and remains subject to the policies and terms of each provider, applicable consent requirements, and FlytheBG&apos;s Privacy & AI Policy.</p>
    <p>If AdSense and Monetag are active together, FlytheBG&apos;s configuration is intended for Monetag formats that do not trigger pop-under/OnClick behavior. Advertising must not obstruct image controls, mislead users into clicking ads, or overwhelm the page&apos;s publisher content.</p>

    <h2>7. Availability and feature announcements</h2>
    <p>FlytheBG may change, suspend, replace, or remove features. Product announcements, including the October 2026 notice, describe planned work and do not guarantee that every announced feature will launch on a particular day or remain unchanged.</p>

    <h2>8. Prohibited use</h2>
    <p>Do not use FlytheBG to violate law, intellectual-property rights, privacy rights, security restrictions, or the rights of other people. Do not attempt to disrupt, abuse, scrape excessively, or interfere with the service or its providers.</p>

    <h2>9. No warranty</h2>
    <p>FlytheBG is provided on an as-available basis. Automated segmentation may make mistakes, including removing parts of the subject or leaving background areas. Edge refinement can improve presentation but cannot guarantee perfect reconstruction. Review results before relying on them.</p>

    <h2>10. Contact</h2>
    {appConfig.contactEmail ? <p>Questions about these terms may be sent to <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>Questions about these terms may be sent through the contact page. A public contact email is shown only when one is intentionally configured.</p>}
  </LegalPage>;
}
