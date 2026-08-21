import type { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/lib/config";

const homeTitle = "FlytheBG-- Free Background Remover & Passport Photo Maker";
const homeDescription = "Remove photo backgrounds locally in your browser and create print-ready passport photo sheets with FlytheBG. No image-processing upload is required for the current tools.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "FlytheBG",
    "Fly the BG",
    "free background remover",
    "remove background online",
    "local AI background remover",
    "private background remover",
    "transparent PNG maker",
    "passport photo maker",
    "passport size photo maker",
    "browser background remover",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
    siteName: appConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

const heroVideo = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4";

function FlytheBGMark() {
  return (
    <svg viewBox="0 0 256 256" width="24" height="24" aria-hidden="true" focusable="false">
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="currentColor" />
      <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor" />
    </svg>
  );
}

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appConfig.siteUrl}/#website`,
        name: appConfig.name,
        alternateName: ["Fly the BG", "FlytheBG.com"],
        url: appConfig.siteUrl,
        inLanguage: "en",
        description: homeDescription,
      },
      {
        "@type": "Organization",
        "@id": `${appConfig.siteUrl}/#publisher`,
        name: appConfig.name,
        url: appConfig.siteUrl,
        logo: `${appConfig.siteUrl}/icon.svg`,
        ...(appConfig.contactEmail ? { email: appConfig.contactEmail } : {}),
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${appConfig.siteUrl}/#app`,
        name: `${appConfig.name} Background Remover & Passport Photo Maker`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        browserRequirements: "JavaScript and WebAssembly; WebGPU optional",
        url: appConfig.siteUrl,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: homeDescription,
        featureList: [
          "Local browser background removal",
          "Transparent PNG export",
          "Passport photo sizing and print sheets",
          "Manual per-photo passport positioning",
          "WebGPU and CPU/WASM inference",
        ],
      },
    ],
  };

  return (
    <main className="cinematicHero">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <video className="cinematicHeroVideo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="cinematicHeroWash" aria-hidden="true" />

      <div className="cinematicHeroLayer">
        <nav className="cinematicNav" aria-label="FlytheBG tools">
          <Link className="cinematicLogo" href="/" aria-label="FlytheBG home">
            <FlytheBGMark />
          </Link>
          <div className="cinematicTabs">
            <Link href="/remove-background">Remove BG</Link>
            <Link href="/features/passport-photo">Passport</Link>
            <Link href="/privacy">Security</Link>
            <Link href="/about">About</Link>
          </div>
        </nav>

        <section className="cinematicHeroContent" aria-labelledby="flythebg-hero-title">
          <div className="cinematicBadge">
            <span className="cinematicBadgeIcon" aria-hidden="true">L</span>
            <span>Local AI · your photo stays on-device</span>
          </div>

          <h1 id="flythebg-hero-title">
            Remove backgrounds.<br />
            <em>Make passport photos.</em>
          </h1>

          <p>
            Create clean transparent cutouts and print-ready passport sheets directly in your browser.
            Fast local processing, precise framing controls, and no image-processing upload required.
          </p>

          <Link className="cinematicCta" href="/remove-background">
            <span className="cinematicCtaLabel">Start with your photo</span>
            <span className="cinematicCtaArrow" aria-hidden="true">→</span>
          </Link>

          <div className="cinematicTrust" aria-label="FlytheBG benefits">
            <span>Free to use</span>
            <span aria-hidden="true">·</span>
            <span>No account</span>
            <span aria-hidden="true">·</span>
            <span>Images stay local</span>
          </div>
        </section>
      </div>
    </main>
  );
}
