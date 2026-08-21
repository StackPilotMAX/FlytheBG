import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${appConfig.name} — Local AI Background Remover & Passport Photo Maker`,
    short_name: appConfig.name,
    description: "Remove backgrounds locally in your browser, create transparent PNGs, crop images, and build print-ready passport photo sheets.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#05070d",
    theme_color: "#05070d",
    lang: "en",
    categories: ["photo", "utilities", "productivity"],
    icons: [{ src: "/icon.svg", sizes: "64x64", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Remove Background", short_name: "Remove BG", description: "Open the local browser background remover.", url: "/remove-background", icons: [{ src: "/icon.svg", sizes: "64x64", type: "image/svg+xml" }] },
      { name: "Passport Photo Maker", short_name: "Passport Photo", description: "Create a measured passport-photo print sheet.", url: "/features/passport-photo", icons: [{ src: "/icon.svg", sizes: "64x64", type: "image/svg+xml" }] },
    ],
  };
}
