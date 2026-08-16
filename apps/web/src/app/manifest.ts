import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appConfig.name} Background Remover`,
    short_name: appConfig.name,
    description: "Remove image backgrounds and download clean transparent PNGs with FlytheBG.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060b",
    theme_color: "#05060b",
    icons: [
      {
        src: "/brand/flythebg-mark.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
