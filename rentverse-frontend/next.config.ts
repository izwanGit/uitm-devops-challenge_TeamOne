import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Remove trailing slash from apiBaseUrl if present
    const cleanApiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

    return [
      // Properties API routes - order matters, more specific routes first
      {
        source: '/api/properties/featured',
        destination: `${cleanApiBaseUrl}/api/properties/featured`,
      },
      {
        source: '/api/properties/property/:code',
        destination: `${cleanApiBaseUrl}/api/properties/property/:code`,
      },
      {
        source: '/api/properties/:id/view',
        destination: `${cleanApiBaseUrl}/api/properties/:id/view`,
      },
      {
        source: '/api/properties/:id',
        destination: `${cleanApiBaseUrl}/api/properties/:id`,
      },
      {
        source: '/api/properties',
        destination: `${cleanApiBaseUrl}/api/properties`,
      },
      // Authentication API routes
      {
        source: '/api/auth/login',
        destination: `${cleanApiBaseUrl}/api/auth/login`,
      },
      {
        source: '/api/auth/signup',
        destination: `${cleanApiBaseUrl}/api/auth/signup`,
      },
      {
        source: '/api/auth/register',
        destination: `${cleanApiBaseUrl}/api/auth/register`,
      },
      {
        source: '/api/auth/validate',
        destination: `${cleanApiBaseUrl}/api/auth/me`, // Note: validate maps to /me endpoint
      },
      {
        source: '/api/auth/me',
        destination: `${cleanApiBaseUrl}/api/auth/me`,
      },
      {
        source: '/api/auth/check-email',
        destination: `${cleanApiBaseUrl}/api/auth/check-email`,
      },
      // Upload API routes
      {
        source: '/api/upload/multiple',
        destination: `${cleanApiBaseUrl}/api/upload/multiple`,
      },
      // Generic API catchall for any other API routes (should be last)
      // Exclude /api/pdf from being rewritten to backend, as it is a local Next.js API route
      {
        source: '/api/:path((?!pdf).*)',
        destination: `${cleanApiBaseUrl}/api/:path`,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          // {
          //   key: 'Access-Control-Allow-Headers',
          //   value: 'Content-Type, Authorization, X-Requested-With',
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
