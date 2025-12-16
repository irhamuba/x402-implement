import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No remote patterns needed since we use local SVG avatars
  images: {
    unoptimized: true, // SVG files don't need optimization
  },
};

export default nextConfig;
