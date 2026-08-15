import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${appConfig.siteUrl}/sitemap.xml` };
}
