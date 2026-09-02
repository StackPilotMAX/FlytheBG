import type { Metadata } from "next";
import Link from "next/link";

const BMC_URL = "https://buymeacoffee.com/flythebg";

export const metadata: Metadata = {
  title: "Support FlytheBG",
  description: "Support FlytheBG through the official Buy Me a Coffee page.",
  alternates: { canonical: "/donate" },
};

export default function DonatePage() {
  return (
    <main className="donatePage">
      <div className="donateShell">
        <section className="donateHero">
          <span className="donateEyebrow">☕ Buy Me a Coffee · FlytheBG</span>
          <h1>Help keep FlytheBG free.</h1>
          <p>
            FlytheBG is built to make useful browser-first image and media tools simple and accessible.
            If the tools save you time, a small contribution helps support development, maintenance,
            hosting and future improvements.
          </p>
        </section>

        <div className="donateGrid">
          <section className="donateCard">
            <h2>Support the project</h2>
            <p>
              Payments are handled directly by Buy Me a Coffee. FlytheBG does not collect or process
              your card or wallet details on this website.
            </p>
            <a className="bmcButton" href={BMC_URL} target="_blank" rel="noopener noreferrer">
              ☕ Support FlytheBG on Buy Me a Coffee <span>↗</span>
            </a>
            <div className="bmcHandle">
              Official creator page: <a href={BMC_URL} target="_blank" rel="noopener noreferrer">buymeacoffee.com/flythebg</a>
            </div>
            <div className="donateStatus">
              <strong>Payment status:</strong> Buy Me a Coffee is the payment processor. A return to this
              website by itself is not treated as proof of payment. Verified support status will only be
              shown after a signed Buy Me a Coffee webhook confirms the event.
            </div>
          </section>

          <section className="donateCard">
            <h2>How it works</h2>
            <div className="donateSteps">
              <div className="donateStep"><div><h3>Open the genuine BMC page</h3><p>The button takes you to FlytheBG&apos;s Buy Me a Coffee page.</p></div></div>
              <div className="donateStep"><div><h3>Choose your support</h3><p>Select the amount and complete checkout using the payment methods offered by Buy Me a Coffee.</p></div></div>
              <div className="donateStep"><div><h3>Return safely</h3><p>If you return to FlytheBG, the site will not blindly call it successful. Verified status comes from the payment provider&apos;s signed server notification.</p></div></div>
            </div>
            <div className="donateNotice">
              <p>
                <strong>Why this matters:</strong> a browser cannot securely prove that a payment succeeded
                just because a user reached a URL. FlytheBG will use Buy Me a Coffee&apos;s signed webhook for
                genuine confirmation and will also handle donation/refund events.
              </p>
            </div>
            <Link className="donateReturn" href="/donate/status">Check donation verification status →</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
