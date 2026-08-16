import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import "./redesign-world.css";
import "./redesign-sections.css";
import "./hero-video.css";
import "./galaxy-world.css";
import "./final-dark.css";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: `${appConfig.name} — Compare two AI background removers`, template: `%s — ${appConfig.name}` },
  description: "Dark, privacy-focused AI background removal with two independent cutout results, transparent PNG export, cursor/pixel/ratio cropping, and a permanent WebGL galaxy.",
  applicationName: appConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${appConfig.name} — Dual-model AI Background Remover`,
    description: "Upload once, compare two background-removal engines, crop the result precisely, and download the cleaner transparent PNG.",
    type: "website",
    url: "/",
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#05060b", colorScheme: "dark" };

function Logo() {
  return (
    <Link className="brand" href="/" aria-label={`${appConfig.name} home`}>
      <img className="brandMark" src="/brand/flythebg-mark.svg" alt="" width="34" height="34" />
      <span>{appConfig.name}</span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const adsEnabled = /^ca-pub-\d{16}$/.test(adsenseClient);

  return (
    <html lang="en">
      <body>
        {adsEnabled && (
          <Script
            id="flythebg-adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
          />
        )}
        <header className="siteHeader">
          <div className="shell navShell">
            <Logo />
            <nav className="navLinks" aria-label="Primary navigation">
              <Link href="/#remove">Compare models</Link>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/#privacy">Privacy & AI</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
            <Link className="navCta" href="/#remove">Remove background <span>↗</span></Link>
          </div>
        </header>
        {children}
        <footer className="siteFooter">
          <div className="shell footerGrid">
            <div>
              <Logo />
              <p className="footerCopy">Compare private server precision with on-device browser AI, crop by cursor, pixels, or ratio, then download the result you prefer.</p>
            </div>
            <div className="footerLinks">
              <Link href="/privacy">Privacy & AI</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookies</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="shell footerBottom"><span>© {new Date().getFullYear()} {appConfig.name}</span><span>Official contact: stackpilotfe@outlook.com · email only</span></div>
        </footer>
      </body>
    </html>
  );
}
