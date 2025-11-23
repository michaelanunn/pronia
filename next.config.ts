import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack with default settings; keep webpack alias for canvas/encoding
  turbopack: {
    // Explicit root to silence multi-lockfile warning
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },
};

export default nextConfig;
