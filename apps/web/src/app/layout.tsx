import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Instrument_Serif, Inter } from "next/font/google";
import "./production-ui.css";
import "./redesign.css";
import "./adsense-safety.css";
import "./genz.css";
import "./polish.css";
import "./immersive-theme.css";
import "./cinematic-hero.css";
import "./monetization.css";
import "./theme-refinements.css";
import "./landing-extras.css";
import "./light-theme-final.css";
import "./tool-pastel-theme.css";
import "./passport-manual-controls.css";
import "./top-ad-placement.css";
import "./feature-fixes.css";
import "./mobile-header-fixes.css";
import "./watermark-tool.css";
import "./donate.css";
import "./watermark-remover-v2.css";
import { FlytheBGLogo } from "@/components/FlytheBGLogo";
import { MonetizationHead, MonetizationScripts } from "@/components/MonetizationScripts";
import { MotionLayer } from "@/components/MotionLayer";
import { appConfig } from "@/lib/config";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", variable: "--font-instrument-serif" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-inter" });
const siteVideo = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4";
const defaultTitle = `FLYTHEBG | Free AI Background Remover & Passport Photo Maker`;
const defaultDescription = "FLYTHEBG is a free browser-first image toolkit for background removal, passport photos, and AI watermark-removal utilities for Gemini and Meta AI media. Supported working media stays on the user's device.";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "";

export const metadata: Metadata = { metadataBase: new URL(appConfig.siteUrl), title: { default: defaultTitle, template: `%s | FLYTHEBG` }, description: defaultDescription, applicationName: "FLYTHEBG", keywords: ["FLYTHEBG", "FlytheBG", "free background remover", "Gemini watermark remover", "Gemini watermark remover online", "Meta AI watermark remover", "Meta AI watermark remover online", "AI watermark remover", "remove background online", "transparent PNG maker", "passport photo maker", "Buy Me a Coffee", "support FlytheBG"], authors: [{ name: "FLYTHEBG", url: appConfig.siteUrl }], creator: "FLYTHEBG", publisher: "FLYTHEBG", category: "Image editing tools", classification: "Browser-based image editing and media utilities", referrer: "origin-when-cross-origin", manifest: "/manifest.webmanifest", formatDetection: { telephone: false, address: false, email: false }, robots: { index: true, follow: true, nocache: false, googleBot: { index: true, follow: true, noimageindex: false, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } }, openGraph: { title: defaultTitle, description: defaultDescription, siteName: "FLYTHEBG", locale: "en_US", type: "website", url: "/" }, twitter: { card: "summary", title: defaultTitle, description: defaultDescription }, appleWebApp: { capable: true, title: "FLYTHEBG", statusBarStyle: "default" }, verification: { ...(googleVerification ? { google: googleVerification } : {}), ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}) }, icons: { icon: [{ url: "/brand/flythebg-mark.svg", type: "image/svg+xml", sizes: "any" }], shortcut: "/brand/flythebg-mark.svg", apple: "/brand/flythebg-mark.svg" }, other: { "application-name": "FLYTHEBG", "apple-mobile-web-app-title": "FLYTHEBG" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#d9d5ef", colorScheme: "light" };
function GithubIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.1.76 2.22v3.28c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg>; }
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>; }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><head><meta name="monetag" content="5e777e0aa6ce027ca2e1a8ec1c8325b3" /><MonetizationHead /><Script src="https://www.googletagmanager.com/gtag/js?id=G-S50DRFD37X" strategy="lazyOnload" /><Script id="google-analytics" strategy="lazyOnload">{`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-S50DRFD37X');`}</Script></head><body className={`${instrumentSerif.variable} ${inter.variable}`}><div className="siteVideoBackdrop" aria-hidden="true"><video className="siteBackdropVideo" autoPlay muted loop playsInline preload="none"><source src={siteVideo} type="video/mp4" /></video><div className="siteBackdropWash" /></div><MotionLayer /><header className="siteHeader"><div className="shell navShell"><FlytheBGLogo priority /><nav className="navLinks" aria-label="Primary navigation"><Link href="/remove-background">Remove BG</Link><Link href="/ai-watermark-remover">Watermark Remover</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/features">Features</Link><Link href="/guides">Guides</Link><Link href="/faq">FAQ</Link><Link href="/donate">Donate</Link></nav><Link className="navCta" href="/donate">☕ Support FlytheBG <span>↗</span></Link><Link className="mobileFeaturesButton" href="/features" aria-label="Open FlytheBG features">Features <span>↗</span></Link></div></header>{children}<footer className="siteFooter"><div className="shell footerGrid"><div className="footerBrand"><FlytheBGLogo size={42}/><p>Browser-first image and media tools. Supported workflows keep working media on your device.</p><div className="footerSocials"><a className="socialIconLink" href="https://github.com/StackPilotMAX" target="_blank" rel="noreferrer" aria-label="FlytheBG GitHub"><GithubIcon /><span>GitHub</span></a><a className="socialIconLink" href="https://www.instagram.com/flythebg/" target="_blank" rel="noreferrer" aria-label="FlytheBG Instagram"><InstagramIcon /><span>Instagram</span></a></div></div><div className="footerLinks"><Link href="/remove-background">Remove Background</Link><Link href="/ai-watermark-remover">Gemini Watermark Remover</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/features">Features</Link><Link href="/guides">Guides</Link><Link href="/faq">FAQ</Link><Link href="/donate">Donate / Support</Link><Link href="/about">About</Link><Link href="/model-disclosure">Model Disclosure</Link><Link href="/privacy">Privacy & AI</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div><div className="shell footerBottom"><span>© {new Date().getFullYear()} {appConfig.name}</span>{appConfig.contactEmail && <span>{appConfig.contactEmail}</span>}</div></footer><MonetizationScripts /></body></html>; }
