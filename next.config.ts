import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /** Plant photo uploads via Server Actions (max 10 MB per file in app code). */
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
