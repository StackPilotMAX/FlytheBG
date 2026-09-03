"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Facebook, Instagram, Music2, Twitter, Youtube, ArrowUpRight } from "lucide-react";

const TRAIN_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4";

const toolLinks = [
  ["Remove Background", "/remove-background"],
  ["Watermark Remover", "/ai-watermark-remover"],
  ["Passport Photo", "/features/passport-photo"],
  ["All Features", "/features"],
];
const missionLinks = [
  ["How It Works", "/guides"],
  ["FAQ", "/faq"],
  ["Model Disclosure", "/model-disclosure"],
  ["Privacy & AI", "/privacy"],
];
const conciergeLinks = [
  ["Get in Touch", "/contact"],
  ["Support FlyThe BG", "/donate"],
  ["User Agreement", "/terms"],
  ["Cookies", "/cookies"],
];

function SocialLink({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <a className="flyJourneySocial" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} aria-label={label}>
      {children}
    </a>
  );
}

export function FlyTheBGJourney() {
  return (
    <main className="flyJourneyHome relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white">
      <video className="flyJourneyVideo fixed inset-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline preload="auto" aria-hidden="true">
        <source src={TRAIN_VIDEO} type="video/mp4" />
      </video>
      <div className="flyJourneyWash" aria-hidden="true" />
      <div className="flyJourneyVignette" aria-hidden="true" />

      <div className="flyJourneyContent relative z-10 w-full max-w-7xl flex-1 px-4 md:px-8 lg:px-10 pt-4 md:pt-6 pb-6 flex flex-col">
        <nav className="flyJourneyNav" aria-label="FlyThe BG primary navigation">
          <Link href="/" className="flyJourneyBrand" aria-label="FlyThe BG home">
            <span className="flyJourneyMark" aria-hidden="true"><span /><span /><span /><span /></span>
            <span>FlyThe BG</span>
          </Link>
          <div className="flyJourneyNavLinks">
            <Link href="/remove-background">Remove BG</Link>
            <Link href="/ai-watermark-remover">Watermark</Link>
            <Link href="/features/passport-photo">Passport Photo</Link>
            <Link href="/features">Features</Link>
          </div>
          <Link href="/donate" className="flyJourneyNavCta">Support <ArrowUpRight size={13} strokeWidth={2.2} /></Link>
        </nav>

        <section className="flyJourneyHero" aria-labelledby="flyJourneyTitle">
          <span className="flyJourneyEyebrow">BROWSER-FIRST · PRIVATE BY DESIGN</span>
          <h1 id="flyJourneyTitle">Make the background<br /><em>disappear.</em></h1>
          <p>Free image and media tools for clean, useful results — from background removal and passport photos to authorized AI-media cleanup, right in your browser.</p>
          <div className="flyJourneyActions">
            <Link href="/remove-background" className="flyJourneyPrimary">Remove background <span><ArrowUpRight size={15} /></span></Link>
            <Link href="/features/passport-photo" className="flyJourneySecondary">Passport photos <ArrowUpRight size={14} /></Link>
          </div>
        </section>

        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="liquid-glass flyJourneyFooter w-full rounded-3xl p-6 md:p-10 text-white/70 mt-32 md:mt-64"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
            <div className="md:col-span-5">
              <Link href="/" className="flyJourneyFooterBrand" aria-label="FlyThe BG home">
                <span className="flyJourneyMark flyJourneyMarkLarge" aria-hidden="true"><span /><span /><span /><span /></span>
                <span>FlyThe BG</span>
              </Link>
              <p className="text-sm leading-relaxed max-w-sm mt-5">FlyThe BG is a free browser-first image toolkit for removing photo backgrounds, creating transparent PNGs, and making print-ready passport photo sheets.</p>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
              <div>
                <h2 className="flyJourneyFooterHeading">Tools</h2>
                <ul className="flyJourneyFooterList">{toolLinks.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
              </div>
              <div>
                <h2 className="flyJourneyFooterHeading">The Mission</h2>
                <ul className="flyJourneyFooterList">{missionLinks.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
              </div>
              <div>
                <h2 className="flyJourneyFooterHeading">Concierge</h2>
                <ul className="flyJourneyFooterList">{conciergeLinks.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50">Built by @aadarshf1 · FlyThe BG</p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
              <div className="flex items-center gap-2">
                <SocialLink label="Music" href="/contact"><Music2 size={16} /></SocialLink>
                <SocialLink label="Facebook" href="/contact"><Facebook size={16} /></SocialLink>
                <SocialLink label="Twitter" href="/contact"><Twitter size={16} /></SocialLink>
                <SocialLink label="YouTube" href="/contact"><Youtube size={16} /></SocialLink>
                <SocialLink label="Instagram @aadarshf1" href="https://www.instagram.com/aadarshf1/"><Instagram size={16} /></SocialLink>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}
