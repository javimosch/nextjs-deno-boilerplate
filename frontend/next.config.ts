import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `http://${process.env.NEXT_API_HOST || 'localhost'}:${process.env.NEXT_API_PORT || '3000'}/api/:path*`
      }
    ];
  },
  output: 'export'
};

export default nextConfig;
