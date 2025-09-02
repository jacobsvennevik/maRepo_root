import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:8000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      // Auth (no trailing in source; rewrite to trailing in Django)
      { source: "/backend/token",          destination: `${API_ORIGIN}/api/token/` },
      { source: "/backend/token/refresh",  destination: `${API_ORIGIN}/api/token/refresh/` },

      // REST API (preserve path; Django expects trailing slash and will 301 if missing)
      { source: "/backend/api/:path*",     destination: `${API_ORIGIN}/api/:path*` },

      // Generation API if you have it
      { source: "/generation/api/:path*",  destination: `${API_ORIGIN}/generation/api/:path*` },
    ];
  },
  trailingSlash: true,
};

export default nextConfig;
