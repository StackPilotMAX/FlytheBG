"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const videos = [
  ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4", "Golden Hour"],
  ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4", "Still Water"],
  ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4", "Deep Woods"],
  ["https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4", "Quiet Dawn"],
] as const;

export function FlyTheBGCinematicHero() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [busy, setBusy] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setBusy(false), 1000);
    return () => window.clearTimeout(timer);
  }, [busy]);

  const selectVideo = (index: number) => {
    if (index === activeVideo || busy) return;
    setActiveVideo(index);
    setBusy(true);
  };

  return (
    <section className="flyCinematicHero">
      {videos.map(([src], index) => (
        <video key={src} className={`flyCinematicVideo ${activeVideo === index ? "isActive" : ""}`} autoPlay muted loop playsInline aria-hidden="true" preload={index === 0 ? "auto" : "metadata"}>
          <source src={src} type="video/mp4" />
        </video>
      ))}
      <div className="flyCinematicOverlay" aria-hidden="true" />
      <div className="flyCinematicContent">
        <nav className="flyCinematicNav" aria-label="FlyThe BG primary navigation">
          <Link href="/" className="flyCinematicLogo" aria-label="FlyThe BG">FlyThe BG</Link>
          <div className="flyCinematicNavDesktop">
            <Link href="#tools">Tools</Link><Link href="#workflow">How it works</Link><Link href="/features">Features</Link><Link href="/faq">FAQ</Link><Link href="/donate" className="flyCinematicNavCta">Support <ArrowUpRight size={15} /></Link>
          </div>
          <button className="flyCinematicMenu" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
        </nav>
        {mobileOpen && <div className="flyCinematicMobileMenu"><Link href="#tools" onClick={() => setMobileOpen(false)}>Tools</Link><Link href="#workflow" onClick={() => setMobileOpen(false)}>How it works</Link><Link href="/features" onClick={() => setMobileOpen(false)}>Features</Link><Link href="/faq" onClick={() => setMobileOpen(false)}>FAQ</Link><Link href="/donate" onClick={() => setMobileOpen(false)} className="flyCinematicMobileCta">Support FlyThe BG</Link></div>}

        <div className="flyCinematicCenter">
          <span className="flyCinematicBadge">BROWSER-FIRST · PRIVATE BY DESIGN</span>
          <h1>Make the background<br /><em>disappear.</em></h1>
          <p>Remove backgrounds, build measured passport photos, and clean supported media — directly in your browser, with your working files kept on your device.</p>
          <div className="flyCinematicActions"><Link href="/remove-background" className="flyCinematicPrimary">Remove background <ArrowUpRight size={18} /></Link><Link href="/features/passport-photo" className="flyCinematicSecondary">Passport photos <ArrowUpRight size={18} /></Link></div>
        </div>

        <div className="flyCinematicBottom">
          <div className="flyCinematicStats"><span>Free</span><i /> <span>No account</span><i /> <span>Browser-first</span><i /> <span>PNG export</span></div>
          <div className="flyCinematicSwitcher" aria-label="Background video selector">{videos.map(([, label], index) => <button key={label} type="button" className={activeVideo === index ? "active" : ""} onClick={() => selectVideo(index)} disabled={busy} aria-pressed={activeVideo === index}>{label}</button>)}</div>
        </div>
      </div>
    </section>
  );
}
