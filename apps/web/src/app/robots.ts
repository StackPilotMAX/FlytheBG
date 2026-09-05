import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot"];
  return {
    rules: [
      { userAgent: aiCrawlers, allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
    host: appConfig.siteUrl,
  };
}
