import type { Metadata } from "next";
import { FlyTheBGJourney } from "@/components/FlyTheBGJourney";
import { LandingFAQ } from "@/components/LandingFAQ";
import { appConfig } from "@/lib/config";

const homeTitle = "FlyThe BG | Free Background Remover, Passport Photos & Media Tools";
const homeDescription = "Free online image tools for background removal, passport photo making, and authorized AI-media cleanup. Remove image backgrounds in your browser and keep working media on your device.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: [
    "FlyThe BG",
    "FlyTheBG",
    "free background remover",
    "background remover online",
    "remove image background",
    "image background remover",
    "online background remover",
    "AI background remover",
    "background remover AI",
    "free passport photo maker",
    "passport photo maker",
    "passport size photo",
    "Gemini watermark remover",
    "free Gemini watermark remover",
    "browser image tools",
    "private image editor",
  ],
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const structuredData = { "@context": "https://schema.org", "@type": "WebSite", name: "FlyThe BG", url: appConfig.siteUrl, description: homeDescription };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <FlyTheBGJourney />
    <LandingFAQ />
  </>;
}
