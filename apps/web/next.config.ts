import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${isDev ? "'unsafe-eval'" : ""} https://pagead2.googlesyndication.com https://www.googletagservices.com https://fundingchoicesmessages.google.com`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.googleadservices.com",
  "font-src 'self' data:",
  "connect-src 'self' https://staticimgly.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.googleadservices.com https://fundingchoicesmessages.google.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.googleadservices.com https://fundingchoicesmessages.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
