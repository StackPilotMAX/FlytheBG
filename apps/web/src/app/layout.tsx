import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import "./redesign-world.css";
import "./redesign-sections.css";
import "./hero-video.css";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: `${appConfig.name} — Make the subject impossible to ignore`, template: `%s — ${appConfig.name}` },
  description: "Ultra-fast AI background removal with transparent PNG output, private inference, short-lived feedback tokens, and adaptive edge calibration.",
  applicationName: appConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${appConfig.name} — AI Background Remover`,
    description: "Your subject was never the background. Remove it, refine the cutout, and export a transparent PNG.",
    type: "website",
    url: "/",
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07111f" };

function Logo() {
  return (
    <Link className="brand" href="/" aria-label={`${appConfig.name} home`}>
      <img className="brandMark" src="/brand/flythebg-mark.svg" alt="" width="34" height="34" />
      <span>{appConfig.name}</span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="shell navShell">
            <Logo />
            <nav className="navLinks" aria-label="Primary navigation">
              <Link href="/#story">Experience</Link>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/#privacy">Privacy & AI</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
            <Link className="navCta" href="/#remove">Try it <span>↗</span></Link>
          </div>
        </header>
        {children}
        <footer className="siteFooter">
          <div className="shell footerGrid">
            <div>
              <Logo />
              <p className="footerCopy">Background removal with a private inference path, short-lived PostgreSQL run metadata, and an adaptive quality loop that does not require a raw-image archive.</p>
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
