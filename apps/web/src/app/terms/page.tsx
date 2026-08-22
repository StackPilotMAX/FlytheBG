import { LegalPage } from "@/components/LegalPage";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Terms of Use",
  description: "Read FlytheBG's terms for browser-based background removal, image editing, passport-photo crop-frame tools, optional advertising, output limitations, and acceptable use.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage(){
  return <LegalPage title="Terms of Use" updated="22 August 2026">
    <h2>1. Service</h2>
    <p>FlytheBG provides browser-based image utilities including background removal, cropping, and passport-photo sheet generation. Browser AI may select different local model/runtime paths according to device capability, available memory, and local result-quality checks.</p>

    <h2>2. Your images</h2>
    <p>You are responsible for having the rights and permissions needed to use images with FlytheBG. Using the service does not transfer ownership of your image to FlytheBG. The current image tools are designed to process image content locally in the browser rather than intentionally store it in a FlytheBG image database.</p>

    <h2>3. Browser AI and third-party software</h2>
    <p>FlytheBG currently integrates <code>@imgly/background-removal</code> version <strong>1.7.0</strong> with IS-Net quantized and FP16 model paths. The production workflow normally starts with the quantized path for speed and may retry with FP16 on suitable WebGPU devices when local checks indicate higher preservation risk around pale or fine-edge subject regions. IMG.LY software, model/runtime assets, browser runtimes, hosting providers, advertising providers, and other third-party components may have their own terms, licences, availability limits, and policies.</p>
    <p>FlytheBG does not claim ownership or authorship of IMG.LY&apos;s library, the IS-Net model variants, model/runtime assets, or other third-party dependencies. IMG.LY&apos;s published package documentation states that its background-removal software is available under the AGPL license and directs users to IMG.LY for other licensing options. Model/runtime assets and other dependencies may carry additional notices or terms that remain applicable.</p>
    <p>Local FlytheBG post-processing may validate output, bound inference dimensions for speed/memory, conservatively protect connected semi-transparent edges, recover limited pale foreground only in strongly foreground-surrounded areas, restore eligible source detail, and prepare exports. It does not retrain or alter pretrained model weights. See the <a href="/model-disclosure">Model &amp; Open Source Disclosure</a> for more detail.</p>

    <h2>4. Passport photos</h2>
    <p>The Passport Photo Maker provides sizing, background color, movable crop-frame positioning over a stationary source photo, per-copy crop choices, layout, DPI, and print-sheet tools. It does not guarantee acceptance by any passport office, government authority, visa authority, school, employer, or other organization. Users must verify the applicable photo rules themselves.</p>

    <h2>5. Output and printing</h2>
    <p>For physical sizing, print generated passport sheets at Actual Size or 100% unless your printer workflow specifically requires otherwise. Printer drivers, paper, scaling, and device color management are outside FlytheBG&apos;s control.</p>

    <h2>6. Advertising</h2>
    <p>FlytheBG includes optional, disabled-by-default configuration for Google AdSense and Monetag. Advertising may be enabled only after the required account/site settings are configured and remains subject to the policies and terms of each provider, applicable consent requirements, and FlytheBG&apos;s Privacy &amp; AI Policy.</p>
    <p>If AdSense and Monetag are active together, FlytheBG&apos;s configuration is intended for Monetag formats that do not trigger pop-under/OnClick behavior. Reserved advertisement placements are explicitly labelled <strong>Advertisement</strong>, are not product controls, and must remain visually separate from upload, download, editing, and navigation actions.</p>

    <h2>7. Availability and feature announcements</h2>
    <p>FlytheBG may change, suspend, replace, or remove features. Product announcements, including the October 2026 notice, describe planned work and do not guarantee that every announced feature will launch on a particular day or remain unchanged.</p>

    <h2>8. Prohibited use</h2>
    <p>Do not use FlytheBG to violate law, intellectual-property rights, privacy rights, security restrictions, or the rights of other people. Do not attempt to disrupt, abuse, scrape excessively, or interfere with the service or its providers.</p>

    <h2>9. No warranty</h2>
    <p>FlytheBG is provided on an as-available basis. Automated segmentation may make mistakes, including removing hair, pale or white clothing, or other parts of the subject, or leaving background areas. Local preservation processing is designed to reduce some of those errors but cannot guarantee perfect reconstruction. Review results before relying on them.</p>

    <h2>10. Contact</h2>
    {appConfig.contactEmail ? <p>Questions about these terms may be sent to <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.</p> : <p>Questions about these terms may be sent through the contact page. A public contact email is shown only when one is intentionally configured.</p>}
  </LegalPage>;
}
