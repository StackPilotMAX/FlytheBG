import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${appConfig.name} — Background Remover & Passport Photo Maker`,
    short_name: appConfig.name,
    description: "Remove image backgrounds locally in your browser, create transparent PNGs, crop images, and build print-ready passport photo sheets.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#04070d",
    theme_color: "#04070d",
    lang: "en",
    categories: ["photo", "utilities", "productivity"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    shortcuts: [
      { name: "Remove Background", short_name: "Remove BG", description: "Open the browser background remover.", url: "/remove-background", icons: [{ src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Passport Photo Maker", short_name: "Passport Photo", description: "Create a measured passport-photo print sheet.", url: "/features/passport-photo", icons: [{ src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" }] },
    ],
  };
}
