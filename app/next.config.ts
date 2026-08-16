import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@mashups/contracts"],
  async redirects() {
    return [
      { source: "/explore", destination: "/discover", permanent: true },
      { source: "/feed", destination: "/discover", permanent: true },
      { source: "/launchpad", destination: "/campaigns/new", permanent: true },
      { source: "/daily", destination: "/challenges", permanent: true },
      { source: "/daily-flip", destination: "/challenges", permanent: true },
      { source: "/subscriptions", destination: "/pricing", permanent: true },
    ]
  },
  async rewrites() {
    return [
      { source: "/pitch", destination: "/founder-pitch.html" },
      { source: "/founder-pitch", destination: "/founder-pitch.html" },
      { source: "/demo-track", destination: "/mashup-demo.html" },
    ]
  },
  async headers() {
    return [
      {
        source: "/demo-track",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/mashup-demo.html",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
        ],
      },
    ]
  },
};

export default nextConfig;
