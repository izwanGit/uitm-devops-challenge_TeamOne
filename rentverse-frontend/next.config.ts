import type { NextConfig } from "next";

const isMobileBuild = process.env.MOBILE_BUILD === 'true';

const nextConfig: NextConfig = {
  // Only use static export for mobile builds
  output: isMobileBuild ? 'export' : undefined,

  // Required for static export navigation to work in Capacitor WebView
  trailingSlash: isMobileBuild,

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
  // IMPORTANT: Rewrites run on the server (host machine), so they must use localhost
  // The NEXT_PUBLIC_API_BASE_URL with 10.0.2.2 is only for client-side code in the emulator
  async rewrites() {
    // If it's a mobile build (static export), rewrites are not supported
    if (isMobileBuild) return [];

    // Use dynamic API URL from environment variables, fallback to local
    const serverApiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    console.log('[REWRITE] Server API URL:', serverApiUrl);

    return [
      {
        source: '/api/:path*',
        destination: `${serverApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
