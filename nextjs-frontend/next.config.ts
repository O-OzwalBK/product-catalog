import path from "node:path";
import type { NextConfig } from "next";
import { pathHasPrefix } from "next/dist/shared/lib/router/utils/path-has-prefix";

const nextConfig: NextConfig = {
  transpilePackages: ["@catalog/shared"],
  turbopack: { root: path.join(__dirname, "..") },
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
