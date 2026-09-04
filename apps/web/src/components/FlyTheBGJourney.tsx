"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight, Github, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { GitHubStars } from "@/components/GitHubStars";

const videos = [
  { src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4", label: "Golden Hour" },
  { src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4", label: "Still Water" },
  { src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4", label: "Deep Woods" },
  { src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4", label: "Quiet Dawn" },
];
const nav = [["Remove BG", "/remove-background"], ["Watermark Remover", "/ai-watermark-remover"], ["Passport Photo", "/features/passport-photo"], ["Features", "/features"]];

export function FlyTheBGJourney() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => { const v = videoRefs.current[activeVideo]; if (v) { v.currentTime = 0; void v.play().catch(() => undefined); } }, [activeVideo]);
  const switchVideo = (index: number) => { if (index === activeVideo || isTransitioning) return; setIsTransitioning(true); setActiveVideo(index); window.setTimeout(() => setIsTransitioning(false), 1000); };
  return (
    <main className={`flyJourneyHome ${activeVideo === 2 ? "isDeepWoods" : ""}`}>
      <div className="flyJourneyVideoStack" aria-hidden="true">
        {videos.map((video, index) => <video key={video.src} ref={(el) => { videoRefs.current[index] = el; }} className={`flyJourneyVideo ${index === activeVideo ? "is-active" : ""}`} src={video.src} autoPlay muted loop playsInline preload={index === 0 ? "auto" : "metadata"} />)}
      </div>
      <img className="flyJourneyTrainOverlay" src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png" alt="" aria-hidden="true" />
      <div className="flyJourneySafeOverlay" aria-hidden="true" />
      <div className="flyJourneyContent">
        <nav className="flyJourneyTopbar" aria-label="FlyThe BG navigation">
          <Link href="/" className="flyJourneyBrand">FlyThe BG</Link>
          <div className="flyJourneyDesktopNav liquid-glass">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/features" className="flyJourneyGetStarted">Get Started <ArrowUpRight size={14} /></Link></div>
          <div className="flyJourneyNavActions"><GitHubStars /><button className="flyJourneyMenuButton liquid-glass" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button></div>
        </nav>
        <section className="flyJourneyHero" aria-labelledby="flyJourneyTitle">
          <div className="flyJourneyHeroInner">
            <span className="flyJourneyBadge liquid-glass">Browser-first · private by design</span>
            <h1 id="flyJourneyTitle">Your images.<br /><em>Beautifully clear.</em></h1>
            <p>FlyThe BG gives you fast, useful image and media tools without the clutter. Remove backgrounds, prepare passport photos, and work with supported media directly in your browser.</p>
            <div className="flyJourneyEmail liquid-glass"><input aria-label="Your best email" placeholder="Your Best Email" type="email" /><button>Get Early Access</button></div>
            <div className="flyJourneySwitcher" aria-label="Choose a scene">{videos.map((video, index) => <button key={video.label} className={index === activeVideo ? "active" : ""} onClick={() => switchVideo(index)} disabled={isTransitioning}>{video.label}</button>)}</div>
          </div>
        </section>
        <div className="flyJourneyBottom"><div>60+ <span>Deep Sessions</span></div><i /><div>12,000+ <span>Creators</span></div><i /><div>4.8 <span>User Satisfaction</span></div><i /><div>Intentional-First <span>Design</span></div></div>
      </div>
      <AnimatePresence>{menuOpen && <motion.div className="flyJourneyMobileMenu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}><button className="flyJourneyMenuClose" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={25} /></button><div className="flyJourneyMobileLinks">{nav.map(([label, href], index) => <motion.div key={href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + index * .05, duration: .5 }}><Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link></motion.div>)}<motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .3, duration: .5 }}><Link href="/features" className="flyJourneyMobileCta" onClick={() => setMenuOpen(false)}>Get Started <ArrowUpRight /></Link></motion.div></div><div className="flyJourneyMobileSocials"><Github size={18} /><Instagram size={18} /><Facebook size={18} /><Twitter size={18} /><Youtube size={18} /></div></motion.div>}</AnimatePresence>
    </main>
  );
}
