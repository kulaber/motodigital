import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/', has: [{ type: 'query', key: 'SA' }], destination: '/', permanent: true },
      { source: '/', has: [{ type: 'query', key: 'SD' }], destination: '/', permanent: true },
      // Clean URLs for static client pages — strip /index.html from browser URL
      { source: '/franks-motorrad-center/index.html', destination: '/franks-motorrad-center', permanent: true },
      { source: '/websites/index.html', destination: '/websites', permanent: true },
      { source: '/tommys-garage/index.html', destination: '/tommys-garage', permanent: true },
      // /custom-bike has only [slug] detail pages — the listing lives at /bikes
      { source: '/custom-bike', destination: '/bikes', permanent: true },
      { source: '/en/custom-bike', destination: '/en/bikes', permanent: true },
      // Invented interviews and build stories, removed 2026-11-04 — closest real guide instead
      ...[
        ['jakob-kraft-berlin-interview', 'cafe-racer-umbau'],
        ['max-steiner-bobber-interview', 'bobber-kaufen-guide'],
        ['shovelhead-revival-kai-fuchs', 'harley-custom-werkstatt-finden'],
        ['berlin-ghost-build-story', 'street-fighter-motorrad-umbau'],
      ].flatMap(([from, to]) => [
        { source: `/magazine/${from}`, destination: `/magazine/${to}`, permanent: true },
        { source: `/en/magazine/${from}`, destination: `/en/magazine/${to}`, permanent: true },
      ]),
    ]
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: 30,  // cache dynamic pages 30s client-side (back-nav = instant)
      static: 180,  // cache static/ISR pages 3min client-side
    },
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60, // 1 Stunde (Avatare ändern sich häufig, Cache-Bust via ?t= Parameter)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'wheels-and-waves.com',
      },
      {
        protocol: 'https',
        hostname: 'badandbold.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bikebound.com',
      },
      {
        protocol: 'https',
        hostname: 'koelnmesse.omn-cloud.com',
        pathname: '/servlet/**',
      },
      {
        protocol: 'https',
        hostname: 'www.wwag.com',
        pathname: '/step3/**',
      },
      {
        protocol: 'https',
        hostname: 'www.custombike-show.de',
        pathname: '/wp-content/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)