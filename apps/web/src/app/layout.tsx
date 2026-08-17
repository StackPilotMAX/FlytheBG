import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import "./redesign-world.css";
import "./redesign-sections.css";
import "./hero-video.css";
import "./galaxy-world.css";
import "./final-dark.css";
import "./production-fixes.css";
import "./browser-production.css";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: `${appConfig.name} — Private browser image tools`, template: `%s — ${appConfig.name}` },
  description: "Privacy-focused browser image tools with IMG.LY background removal, precise crop controls, and print-ready passport photo sheets.",
  applicationName: appConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${appConfig.name} — Browser Image Tools`,
    description: "Remove backgrounds in your browser, crop precisely, and create print-ready passport photo sheets.",
    type: "website",
    url: "/",
  },
  icons: {
    icon: [{ url: "/brand/flythebg-mark.svg", type: "image/svg+xml" }],
    shortcut: "/brand/flythebg-mark.svg",
    apple: "/brand/flythebg-mark.svg",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#05060b", colorScheme: "dark" };

function Logo() {
  return <Link className="brand" href="/" aria-label={`${appConfig.name} home`}><img className="brandMark" src="/brand/flythebg-mark.svg" alt="" width="38" height="38"/><span>{appConfig.name}</span></Link>;
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const adsEnabled = /^ca-pub-\d{16}$/.test(adsenseClient);
  return (
    <html lang="en">
      <body>
        {adsEnabled && <Script id="flythebg-adsense" async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}/>} 
        <header className="siteHeader"><div className="shell navShell"><Logo/><nav className="navLinks" aria-label="Primary navigation"><Link href="/features">Features</Link><Link href="/remove-background">Remove BG</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/#faq">FAQ</Link></nav><Link className="navCta" href="/remove-background">Remove background <span>↗</span></Link></div></header>
        {children}
        <footer className="siteFooter"><div className="shell footerGrid"><div><Logo/><p className="footerCopy">Browser-first image tools for background removal, precise cropping, and print-ready passport photo sheets.</p></div><div className="footerLinks"><Link href="/features">Features</Link><Link href="/privacy">Privacy & AI</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div><div className="shell footerBottom"><span>© {new Date().getFullYear()} {appConfig.name}</span><span>Contact: {appConfig.contactEmail}</span></div></footer>
      </body>
    </html>
  );
}
