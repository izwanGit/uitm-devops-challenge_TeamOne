import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === 'true';

const nextConfig: NextConfig = {
  // Only use static export for mobile builds
  output: isMobileBuild ? 'export' : undefined,

  images: {
    // Disable optimization only for mobile builds
    unoptimized: isMobileBuild,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.fazwaz.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.fazwaz.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Restore rewrites for standard web development
  async rewrites() {
    // If it's a mobile build (static export), rewrites are not supported
    if (isMobileBuild) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
