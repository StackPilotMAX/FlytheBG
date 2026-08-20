import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./tailwind-utilities.css";
import "./production-ui.css";
import "./redesign.css";
import "./genz.css";
import "./adsense-safety.css";
import { MotionLayer } from "@/components/MotionLayer";
import { appConfig } from "@/lib/config";

const defaultTitle = `${appConfig.name} — Free Background Remover & Passport Photo Maker`;
const defaultDescription = "Remove image backgrounds locally in your browser, create transparent PNGs, crop images, and build print-ready passport photo sheets with FlytheBG.";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: defaultTitle, template: `%s — ${appConfig.name}` },
  description: defaultDescription,
  applicationName: appConfig.name,
  authors: [{ name: appConfig.name, url: appConfig.siteUrl }],
  creator: appConfig.name,
  publisher: appConfig.name,
  category: "Image editing tools",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    siteName: appConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: "/brand/icon-512.png", width: 512, height: 512, alt: "FlytheBG logo" }],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/brand/icon-512.png"],
  },
  appleWebApp: {
    capable: true,
    title: appConfig.name,
    statusBarStyle: "black-translucent",
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/brand/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/brand/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#04070d", colorScheme: "dark" };

function Logo() {
  return (
    <Link className="brand" href="/" aria-label={`${appConfig.name} home`}>
      <img src="/brand/flythebg-mark.svg" alt="" width="38" height="38" />
      <span>{appConfig.name}</span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const adsEnabled = /^ca-pub-\d{16}$/.test(adsenseClient);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://staticimgly.com" crossOrigin="anonymous" />
        {adsEnabled && <meta name="google-adsense-account" content={adsenseClient} />}
      </head>
      <body>
        <MotionLayer />
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
            <div className="footerBrand"><Logo/><p>FlytheBG (Fly the BG) is a browser-first background remover and passport-photo toolkit. The current image workflow does not require a FlytheBG inference backend.</p></div>
            <div className="footerLinks">
              <Link href="/remove-background">Remove Background</Link>
              <Link href="/features/passport-photo">Passport Photo</Link>
              <Link href="/features">Features</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/about">About</Link>
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
