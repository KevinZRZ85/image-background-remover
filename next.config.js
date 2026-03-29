import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 支持
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;