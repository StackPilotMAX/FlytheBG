import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${appConfig.siteUrl}/sitemap.xml` };
}
