import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/features", priority: .9, changeFrequency: "weekly" as const },
    { path: "/remove-background", priority: .95, changeFrequency: "weekly" as const },
    { path: "/features/passport-photo", priority: .9, changeFrequency: "weekly" as const },
    { path: "/faq", priority: .82, changeFrequency: "monthly" as const },
    { path: "/model-disclosure", priority: .55, changeFrequency: "monthly" as const },
    { path: "/about", priority: .75, changeFrequency: "monthly" as const },
    { path: "/guides", priority: .82, changeFrequency: "monthly" as const },
    { path: "/guides/background-removal", priority: .8, changeFrequency: "monthly" as const },
    { path: "/guides/passport-photo", priority: .8, changeFrequency: "monthly" as const },
    { path: "/guides/browser-privacy", priority: .8, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: .4, changeFrequency: "monthly" as const },
    { path: "/terms", priority: .4, changeFrequency: "monthly" as const },
    { path: "/cookies", priority: .4, changeFrequency: "monthly" as const },
    { path: "/contact", priority: .4, changeFrequency: "monthly" as const },
  ];
  return routes.map((route) => ({ url: `${appConfig.siteUrl}${route.path}`, changeFrequency: route.changeFrequency, priority: route.priority }));
}
