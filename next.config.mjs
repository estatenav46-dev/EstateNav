// The site's public address (canonical links, sitemap, share links, WhatsApp enquiry links). A
// deployment on Vercel must never publish a localhost address: if NEXT_PUBLIC_SITE_URL is unset or
// points at localhost there, fall back to the project's production domain that Vercel provides.
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl =
  process.env.VERCEL && vercelDomain && (!configuredSiteUrl || /localhost|127\.0\.0\.1/.test(configuredSiteUrl))
    ? `https://${vercelDomain}`
    : configuredSiteUrl;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(siteUrl ? { env: { NEXT_PUBLIC_SITE_URL: siteUrl } } : {}),
  poweredByHeader: false,
  // Keep the development server's output separate from production builds.
  // Next writes both outputs into distDir, so sharing it can leave either
  // process with incomplete manifests and vendor chunks.
  // NEXT_DIST_DIR lets the test suite build into its own folder (.next_e2e).
  distDir: process.env.VERCEL
    ? '.next'
    : process.env.NEXT_DIST_DIR
      ? process.env.NEXT_DIST_DIR
    : process.env.NODE_ENV === 'development'
      ? '.next_dev'
      : '.next_build',
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', '@google-cloud/firestore'],
    // Keep visited pages in the browser's router cache so going back, or between tabs, is
    // instant. Edits still show at once: server actions and router.refresh() clear this cache.
    staleTimes: { dynamic: 30, static: 300 },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Optimised images stay cached for 30 days (Cloudinary URLs change when a photo changes).
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.abheeventures.co.in' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
