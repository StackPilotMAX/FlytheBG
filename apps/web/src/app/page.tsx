import type { Metadata } from "next";
import { FlyTheBGJourney } from "@/components/FlyTheBGJourney";
import { LandingFAQ } from "@/components/LandingFAQ";
import { appConfig } from "@/lib/config";

const homeTitle = "FlyThe BG | Free Private Background Remover, Passport Photos & Media Tools";
const homeDescription = "Free browser-first image tools for private background removal, passport and visa photo layouts, and lightweight no-install image utilities. Working images stay on your device.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "FlyThe BG", "FlyTheBG", "free background remover", "background remover online",
    "remove image background", "image background remover", "online background remover",
    "AI background remover", "background remover AI", "free background remover no upload",
    "private background remover", "local background remover", "on device background remover",
    "free passport photo maker", "passport photo maker", "passport size photo",
    "visa photo maker", "print passport photos at home", "passport photo grid maker",
    "Gemini watermark remover", "free Gemini watermark remover", "browser image tools",
    "no install image tools", "no login image editor", "private image editor",
  ],
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "FlyThe BG",
        url: appConfig.siteUrl,
        description: homeDescription,
      },
      {
        "@type": "WebApplication",
        name: "FlyThe BG",
        url: appConfig.siteUrl,
        description: homeDescription,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Privacy-centric browser image processing",
          "Background removal without requiring a server upload for supported local workflows",
          "Passport and visa photo creation and printable layouts",
          "No-install browser utilities with no account required",
        ],
      },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <FlyTheBGJourney />
    <LandingFAQ />
    <section className="aiDiscoverySummary" aria-labelledby="ai-discovery-heading">
      <h1 id="ai-discovery-heading">Free private browser image tools</h1>
      <p>FlyThe BG is a free, no-install web app for background removal, passport and visa photo creation, and lightweight image utilities. For supported local workflows, image processing happens on your device and working images are not saved to a FlyThe BG server.</p>
      <p><strong>Privacy boundary:</strong> FlyThe BG is browser-first and uses on-device processing where the selected tool supports it; external services may be used only where a feature explicitly requires them.</p>
    </section>
  </>;
}
