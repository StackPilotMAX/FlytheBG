import { FlytheBGLogo } from "@/components/FlytheBGLogo";
import "./not-found.css";

export default function NotFound() {
  return (
    <main className="fly404">
      <video className="fly404Video" autoPlay loop muted playsInline aria-hidden="true">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260801_001207_ec20d138-aa45-4b2b-ab8c-bdc71607f240.mp4" type="video/mp4" />
      </video>
      <div className="fly404Logo" aria-label="FlyThe BG"><FlytheBGLogo size={40} /></div>
      <div className="fly404Content">
        <h1>404</h1>
        <div className="fly404Rule" />
        <p>The path may be broken, but the journey isn&apos;t. Let&apos;s get you back.</p>
      </div>
    </main>
  );
}
