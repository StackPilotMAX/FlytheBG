import type { Metadata } from "next";
import { FlyTheBGJourney } from "@/components/FlyTheBGJourney";
import { appConfig } from "@/lib/config";

const homeTitle = "FlyThe BG | Free Background Remover, Passport Photos & Media Tools";
const homeDescription = "FlyThe BG is a browser-first toolkit for background removal, passport photo sheets, and authorized AI-media cleanup. Your working media stays in your browser.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  keywords: ["FlyThe BG", "FlyTheBG", "background remover", "passport photo maker", "Gemini watermark remover", "browser image tools", "private image editor"],
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const structuredData = { "@context": "https://schema.org", "@type": "WebSite", name: "FlyThe BG", url: appConfig.siteUrl, description: homeDescription };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <FlyTheBGJourney />
    </>
  );
}
