import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config";
export default function manifest(): MetadataRoute.Manifest {
  return { name: `${appConfig.name} Background Remover`, short_name: appConfig.name, description: "Remove image backgrounds and download clean transparent PNGs with FlytheBG.", start_url: "/", display: "standalone", background_color: "#f6fbff", theme_color: "#0b6bcb", icons: [{ src: "/brand/flythebg-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
