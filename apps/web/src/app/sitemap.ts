import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = ["", "/privacy", "/terms", "/cookies", "/contact"].map((path) => ({
    url: `${appConfig.siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "monthly" : "weekly",
    priority: path ? 0.4 : 1,
  }));
  return routes;
}
