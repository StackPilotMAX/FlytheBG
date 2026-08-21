import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Josefin_Sans } from "next/font/google";
import "./production-ui.css";
import "./redesign.css";
import "./adsense-safety.css";
import "./genz.css";
import { MotionLayer } from "@/components/MotionLayer";
import { appConfig } from "@/lib/config";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-josefin",
});

const defaultTitle = `${appConfig.name} — Free AI Background Remover & Passport Photo Maker`;
const defaultDescription = "Remove image backgrounds online with local browser AI, create transparent PNGs, crop images, and build print-ready passport photo sheets with FlytheBG.";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: { default: defaultTitle, template: `%s — ${appConfig.name}` },
  description: defaultDescription,
  applicationName: appConfig.name,
  keywords: [
    "FlytheBG",
    "Fly the BG",
    "FlytheBG.com",
    "remove bg",
    "remove background",
    "remove background online",
    "remove image background",
    "free background remover",
    "AI background remover",
    "background eraser online",
    "transparent background maker",
    "transparent PNG maker",
    "browser background remover",
    "local AI background remover",
    "private background remover",
    "no upload background remover",
    "passport photo maker",
    "passport photo maker online",
  ],
  authors: [{ name: appConfig.name, url: appConfig.siteUrl }],
  creator: appConfig.name,
  publisher: appConfig.name,
  category: "Image editing tools",
  classification: "Browser-based image editing and background removal",
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
    url: "/",
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "64x64" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  other: {
    "application-name": appConfig.name,
    "apple-mobile-web-app-title": appConfig.name,
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#05060a", colorScheme: "dark" };

function Logo() {
  return (
    <Link className="brand" href="/" aria-label={`${appConfig.name} home`}>
      <img src="/icon.svg" alt="" width="38" height="38" />
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
        {adsEnabled && <meta name="google-adsense-account" content={adsenseClient} />}
      </head>
      <body className={josefinSans.variable}>
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
            <div className="footerBrand"><Logo/><p>Browser-first image tools. Your working photo stays on your device while the browser runs the local AI model.</p></div>
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
