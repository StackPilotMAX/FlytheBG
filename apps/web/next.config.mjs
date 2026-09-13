import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // FlytheBG uses Next.js server features (the private background-removal
  // route), so this must remain a Netlify Next.js deployment rather than a
  // static export.
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "src"),
      "@pilio/gemini-watermark-remover/browser": path.resolve(process.cwd(), "src/lib/isharaGeminiWatermarkRemover.ts"),
    };
    return config;
  },
};

export default nextConfig;
