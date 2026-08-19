import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./production-ui.css";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: `${appConfig.name} — Private browser image tools`, template: `%s — ${appConfig.name}` },
  description: "Remove image backgrounds, crop transparent PNGs, and build print-ready passport photo sheets directly in your browser.",
  applicationName: appConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${appConfig.name} — Browser Image Tools`,
    description: "Background removal and passport-photo tools that run on the visitor's device.",
    type: "website",
    url: "/",
  },
  icons: {
    icon: [{ url: "/brand/flythebg-mark.svg", type: "image/svg+xml" }],
    shortcut: "/brand/flythebg-mark.svg",
    apple: "/brand/flythebg-mark.svg",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#05070b", colorScheme: "dark" };

function Logo() {
  return (
    <Link className="brand" href="/" aria-label={`${appConfig.name} home`}>
      <img src="/brand/flythebg-mark.svg" alt="" width="38" height="38" />
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
              <Link href="/remove-background">Remove BG</Link>
              <Link href="/features/passport-photo">Passport Photo</Link>
              <Link href="/features">Features</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
            <Link className="navCta" href="/remove-background">Try it free <span>↗</span></Link>
          </div>
        </header>

        {children}

        <footer className="siteFooter">
          <div className="shell footerGrid">
            <div className="footerBrand"><Logo/><p>Browser-first image tools with no image-processing server in the current production workflow.</p></div>
            <div className="footerLinks">
              <Link href="/remove-background">Remove Background</Link>
              <Link href="/features/passport-photo">Passport Photo</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/privacy">Privacy & AI</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookies</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="shell footerBottom"><span>© {new Date().getFullYear()} {appConfig.name}</span><span>{appConfig.contactEmail}</span></div>
        </footer>
      </body>
    </html>
  );
}
