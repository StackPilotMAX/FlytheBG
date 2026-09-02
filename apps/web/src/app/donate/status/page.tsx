import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donation Verification",
  description: "Secure donation verification information for FlytheBG support payments.",
  robots: { index: false, follow: false },
};

export default function DonationStatusPage() {
  return (
    <main className="donatePage">
      <div className="donateShell">
        <section className="donateHero">
          <span className="donateEyebrow">Payment verification</span>
          <h1>Donation status</h1>
          <p>
            FlytheBG does not treat a browser redirect, screenshot, or user-provided claim as proof that a
            payment succeeded. Verified status is based on an authenticated Buy Me a Coffee server event.
          </p>
        </section>

        <section className="donateCard" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2>Secure verification</h2>
          <div className="donateSteps">
            <div className="donateStep"><div><h3>Pending</h3><p>The payment may still be processing, or Buy Me a Coffee has not delivered the confirmation event yet.</p></div></div>
            <div className="donateStep"><div><h3>Confirmed</h3><p>A valid signed <code>donation.created</code> event has been received and accepted by the FlytheBG verification service.</p></div></div>
            <div className="donateStep"><div><h3>Refunded</h3><p>A valid <code>donation.refunded</code> event changes the stored donation state so the site does not continue treating a refunded contribution as active.</p></div></div>
          </div>
          <div className="donateNotice">
            <p>
              <strong>Important:</strong> Buy Me a Coffee&apos;s current webhook system provides authoritative
              server notifications and HMAC-SHA256 signatures. The final production checker will not expose
              the webhook signing secret in the browser.
            </p>
          </div>
          <Link className="donateReturn" href="/donate">← Back to Donate</Link>
        </section>
      </div>
    </main>
  );
}
