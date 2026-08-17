import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appConfig.name} Background Remover`,
    short_name: appConfig.name,
    description: "Remove image backgrounds and create print-ready passport photo sheets with FlytheBG.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060b",
    theme_color: "#05060b",
    icons: [{ src: "/brand/flythebg-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
