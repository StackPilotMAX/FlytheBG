import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Static export keeps the app deployable to a CDN/edge host. Vercel serves
  // the generated static assets from its edge network and compresses them.
  images: { unoptimized: true },
};

export default nextConfig;
