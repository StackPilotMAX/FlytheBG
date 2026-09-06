import Link from "next/link";

export function MediaLegalNotice() {
  return (
    <section className="mediaLegalNotice" aria-label="Media use and privacy notice">
      <div className="shell mediaLegalNoticeInner">
        <div className="mediaLegalNoticeIcon" aria-hidden="true">✓</div>
        <div>
          <strong>Before you select or provide media</strong>
          <p>
            You confirm that you have the right or permission to use the image, video, or other media with FlyThe BG. You remain responsible for the content you provide and for complying with copyright, privacy, publicity, licensing, platform rules, and applicable law. Supported browser-local tools process working media on your device; features that require an external service may transmit the information necessary to provide that feature.
          </p>
          <p>
            By using the service, you agree to the <Link href="/terms">Terms of Use</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>. Please do not provide passwords, payment-card information, government identification documents, or other unnecessary sensitive information.
          </p>
        </div>
      </div>
    </section>
  );
}
