import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    /* Security headers for all routes */
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options',  value: 'nosniff' },
        { key: 'X-Frame-Options',          value: 'DENY' },
        { key: 'X-XSS-Protection',         value: '1; mode=block' },
        { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
      ],
    },
    /* Service worker must be served with Service-Worker-Allowed: / so it
       can control all paths under the origin */
    {
      source: '/sw.js',
      headers: [
        { key: 'Service-Worker-Allowed', value: '/' },
        { key: 'Cache-Control',          value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type',           value: 'application/javascript; charset=utf-8' },
      ],
    },
    /* Manifest must not be cached aggressively */
    {
      source: '/manifest.json',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Content-Type',  value: 'application/manifest+json' },
      ],
    },
  ],
};

export default nextConfig;
