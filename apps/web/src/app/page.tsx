import type { Metadata } from "next";
import { FlyTheBGJourney } from "@/components/FlyTheBGJourney";
import { LandingFAQ } from "@/components/LandingFAQ";
import { appConfig } from "@/lib/config";
import "./ai-discovery.css";

const homeTitle = "FlyThe BG | Free Private Background Remover, Passport Photos & Media Tools";
const homeDescription = "Free image tools with private server-side background removal, passport and visa photo layouts, and lightweight browser editing utilities.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "FlyThe BG", "FlyTheBG", "free background remover", "background remover online",
    "remove image background", "image background remover", "online background remover",
    "AI background remover", "background remover AI", "free background remover",
    "private background remover", "server side background remover", "Hugging Face background remover",
    "free passport photo maker", "passport photo maker", "passport size photo",
    "visa photo maker", "print passport photos at home", "passport photo grid maker",
    "Gemini watermark remover", "free Gemini watermark remover", "image tools",
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
        alternateName: ["FlyTheBG", "Fly The BG"],
        url: appConfig.siteUrl,
        description: homeDescription,
      },
      {
        "@type": "SoftwareApplication",
        name: "FlyThe BG",
        url: appConfig.siteUrl,
        description: homeDescription,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
          "Private server-side AI background removal through Hugging Face",
          "Passport and visa photo creation and printable layouts",
          "Browser-based preview and editing utilities with no account required",
        ],
      },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <FlyTheBGJourney />
    <LandingFAQ />
  </>;
}
