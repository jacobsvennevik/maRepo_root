import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
  }
};

export default nextConfig;
