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
import { FeatureAnnouncement } from "@/components/FeatureAnnouncement";
import { FlytheBGLogo } from "@/components/FlytheBGLogo";
import { MonetizationHead, MonetizationScripts } from "@/components/MonetizationScripts";
import { MotionLayer } from "@/components/MotionLayer";
import { appConfig } from "@/lib/config";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", variable: "--font-instrument-serif" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-inter" });

const siteVideo = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4";
const defaultTitle = `${appConfig.name} — Free AI Background Remover & Passport Photo Maker`;
const defaultDescription = "Remove image backgrounds online with local browser AI, create transparent PNGs, crop images, and build print-ready passport photo sheets with FlytheBG.";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: defaultTitle, template: `%s — ${appConfig.name}` },
  description: defaultDescription,
  applicationName: appConfig.name,
  keywords: ["FlytheBG","Fly the BG","FlytheBG.com","remove bg","remove background","remove background online","remove image background","free background remover","AI background remover","background eraser online","transparent background maker","transparent PNG maker","browser background remover","local AI background remover","private background remover","no upload background remover","passport photo maker","passport photo maker online"],
  authors: [{ name: appConfig.name, url: appConfig.siteUrl }], creator: appConfig.name, publisher: appConfig.name,
  category: "Image editing tools", classification: "Browser-based image editing and background removal", referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest", formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true, nocache: false, googleBot: { index: true, follow: true, noimageindex: false, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: { title: defaultTitle, description: defaultDescription, siteName: appConfig.name, locale: "en_US", type: "website", url: "/" },
  twitter: { card: "summary", title: defaultTitle, description: defaultDescription },
  appleWebApp: { capable: true, title: appConfig.name, statusBarStyle: "default" },
  verification: { ...(googleVerification ? { google: googleVerification } : {}), ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}) },
  icons: { icon: [{ url: "/brand/flythebg-mark.svg", type: "image/svg+xml", sizes: "any" }], shortcut: "/brand/flythebg-mark.svg", apple: "/brand/flythebg-mark.svg" },
  other: { "application-name": appConfig.name, "apple-mobile-web-app-title": appConfig.name },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#d9d5ef", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="monetag" content="5e777e0aa6ce027ca2e1a8ec1c8325b3" />
        <MonetizationHead />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-S50DRFD37X" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-S50DRFD37X');`}
        </Script>
      </head>
      <body className={`${instrumentSerif.variable} ${inter.variable}`}>
        <div className="siteVideoBackdrop" aria-hidden="true"><video className="siteBackdropVideo" autoPlay muted loop playsInline preload="metadata"><source src={siteVideo} type="video/mp4" /></video><div className="siteBackdropWash" /></div>
        <MotionLayer />
        <FeatureAnnouncement />
        <header className="siteHeader"><div className="shell navShell"><FlytheBGLogo /><nav className="navLinks" aria-label="Primary navigation"><Link href="/remove-background">Remove BG</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/features">Features</Link><Link href="/guides">Guides</Link><Link href="/faq">FAQ</Link></nav><Link className="navCta" href="/remove-background">Try it free <span>↗</span></Link></div></header>
        {children}
        <footer className="siteFooter"><div className="shell footerGrid"><div className="footerBrand"><FlytheBGLogo size={42}/><p>Browser-first image tools. Your working photo stays on your device while the browser runs the local AI model.</p></div><div className="footerLinks"><Link href="/remove-background">Remove Background</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/features">Features</Link><Link href="/guides">Guides</Link><Link href="/faq">FAQ</Link><Link href="/about">About</Link><Link href="/model-disclosure">Model Disclosure</Link><Link href="/privacy">Privacy & AI</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div><div className="shell footerBottom"><span>© {new Date().getFullYear()} {appConfig.name}</span>{appConfig.contactEmail && <span>{appConfig.contactEmail}</span>}</div></footer>
        <MonetizationScripts />
      </body>
    </html>
  );
}
