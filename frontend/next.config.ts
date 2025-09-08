import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:8000';
const GENERATION_ORIGIN = process.env.GENERATION_ORIGIN || API_ORIGIN;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      { source: "/backend/generation/:path*", destination: `${GENERATION_ORIGIN}/:path*` },
      { source: "/backend/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
    ];
  },
  trailingSlash: false, // Explicitly disable trailing slash handling
};

export default nextConfig;
