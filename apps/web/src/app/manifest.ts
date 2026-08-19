import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${appConfig.name} — Background Remover & Passport Photo Maker`,
    short_name: appConfig.name,
    description: "Remove backgrounds, create transparent PNGs, crop images, and build print-ready passport photo sheets directly in your browser.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#05060b",
    theme_color: "#05060b",
    lang: "en",
    categories: ["photo", "utilities", "productivity"],
    icons: [{ src: "/brand/flythebg-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Remove Background", short_name: "Remove BG", description: "Open the browser background remover.", url: "/remove-background", icons: [{ src: "/brand/flythebg-mark.svg", sizes: "any", type: "image/svg+xml" }] },
      { name: "Passport Photo Maker", short_name: "Passport Photo", description: "Create a measured passport-photo print sheet.", url: "/features/passport-photo", icons: [{ src: "/brand/flythebg-mark.svg", sizes: "any", type: "image/svg+xml" }] },
    ],
  };
}
