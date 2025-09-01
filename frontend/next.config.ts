import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      { 
        source: '/backend/:path*', 
        destination: 'http://localhost:8000/:path*' 
      },
    ];
  },
};

export default nextConfig;
