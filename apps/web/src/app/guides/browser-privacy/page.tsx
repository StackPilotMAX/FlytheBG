import Link from "next/link";
import { PublisherAds } from "@/components/PublisherAds";

export const metadata = {
  title: "Browser Image Privacy Guide",
  description: "What FlytheBG means by browser-only image processing, which software assets are downloaded, and what is cleared after a download.",
};

export default function BrowserPrivacyGuide() {
  return (
    <main className="featurePage">
      <PublisherAds />
      <section className="pageHero">
        <div className="shell narrowHero">
          <span className="eyebrow"><i/> Guide · Browser privacy</span>
          <h1>What browser-only image processing means in FlytheBG.</h1>
          <p>The current production image tools are designed so the selected photo can be processed, edited, composed, and exported inside the visitor's browser. That is different from saying the browser makes no network requests at all.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 01 · Image bytes</span>
            <h2>The photo is not intentionally sent to FlytheBG's hosting or database.</h2>
            <p>For the live Remove Background, Crop, and Passport Photo Maker workflows, image pixels stay in browser-managed objects while the page is being used.</p>
          </div>
          <div className="principleList">
            <article><strong>No image-processing API</strong><p>The current static production build does not need a FlytheBG Python inference service, GPU endpoint, or upload API to remove a background.</p></article>
            <article><strong>No image database</strong><p>FlytheBG does not intentionally write source photos or generated PNG files to Supabase or another image database in the current production workflow.</p></article>
            <article><strong>Local editing state</strong><p>Crop rectangles, passport-photo framing, colors, copy layout, and generated canvases exist in the browser while the tool is active.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 02 · Model assets</span>
            <h2>Browser-only inference still needs software and model files.</h2>
            <p>IMG.LY's browser package downloads the neural-network and WebAssembly/runtime assets required to perform local inference. Those are software assets, not copies of the selected image.</p>
          </div>
          <div className="principleList">
            <article><strong>Asset delivery uses the network</strong><p>The browser can contact IMG.LY's configured distribution infrastructure to retrieve model/runtime files. Normal request information such as IP/network metadata is therefore involved in delivering those assets.</p></article>
            <article><strong>The selected photo is separate</strong><p>FlytheBG passes the selected image to the browser package on the user's device. The application does not intentionally attach that image to model-asset download requests.</p></article>
            <article><strong>Caching is normal</strong><p>Browsers may cache model and runtime files so later background-removal sessions do not need to download the same software again. Cache duration and eviction are controlled by the browser and device.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 03 · Cleanup</span>
            <h2>What FlytheBG clears after download.</h2>
            <p>The page releases the working references and generated objects it controls after a download starts or when the tool is reset.</p>
          </div>
          <div className="principleList">
            <article><strong>In-page working objects</strong><p>Object URLs, prepared previews, result blobs held by the component, crop working state, and generated passport-sheet canvases are released or reset by the current tool flow.</p></article>
            <article><strong>The downloaded file remains</strong><p>Downloading intentionally creates a file on the user's device. FlytheBG cannot and should not delete that downloaded file after the user chooses to save it.</p></article>
            <article><strong>External copies are outside the page</strong><p>Browser or operating-system caches, screenshots, extensions, security software, backups, copied files, and other device-level data are not under FlytheBG page-state control.</p></article>
          </div>
        </div>
      </section>

      <section className="section workflowSection">
        <div className="shell workflowGrid">
          <div className="sectionHeading compact">
            <span className="eyebrow"><i/> 04 · Ads and public identifiers</span>
            <h2>AdSense is separated from the operational image screens.</h2>
            <p>FlytheBG does not intentionally send uploaded image bytes, private blob URLs, or generated image files to advertising requests. The production repair also limits the AdSense loader to publisher-content pages rather than the image-tool workspaces.</p>
          </div>
          <div className="principleList">
            <article><strong>Publisher IDs are public</strong><p>An AdSense publisher identifier and ads.txt seller record are public site identifiers. They are not equivalent to an API secret, password, database credential, or service-role key.</p></article>
            <article><strong>Tool screens stay ad-free</strong><p>Remove Background and Passport Photo Maker are operational interfaces. The current code intentionally does not load the AdSense script on those screens.</p></article>
            <article><strong>Consent still matters</strong><p>Advertising cookies, identifiers, and consent requirements are separate from image processing. Where required, users should receive appropriate consent controls before relevant advertising technologies are used.</p></article>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <div className="shell finalCtaInner">
          <div><span className="eyebrow"><i/> Read the policy</span><h2>Need the formal wording?</h2><p>The Privacy & AI Policy describes the production data flow and its limitations.</p></div>
          <div className="buttonRow"><Link className="buttonPrimary" href="/privacy">Privacy & AI <span>↗</span></Link><Link className="buttonSecondary" href="/guides">All guides</Link></div>
        </div>
      </section>
    </main>
  );
}
