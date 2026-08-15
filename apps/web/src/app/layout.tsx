import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: `${appConfig.name} — AI Background Remover`, template: `%s — ${appConfig.name}` },
  description: "Remove image backgrounds and download a clean transparent PNG with a privacy-first workflow.",
  applicationName: appConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${appConfig.name} — AI Background Remover`,
    description: "Upload a photo, remove its background, edit the backdrop, and download the result.",
    type: "website",
    url: "/",
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6fbff" };

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
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/#privacy">Privacy</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
            <Link className="navCta" href="/#remove">Remove background</Link>
          </div>
        </header>
        {children}
        <footer className="siteFooter">
          <div className="shell footerGrid">
            <div>
              <Logo />
              <p className="footerCopy">Simple background removal with a private server-side AI workflow.</p>
            </div>
            <div className="footerLinks">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookies</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="shell footerBottom">© {new Date().getFullYear()} {appConfig.name}. All rights reserved.</div>
        </footer>
      </body>
    </html>
  );
}
