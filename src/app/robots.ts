import type { MetadataRoute } from 'next'

const PRODUCTION_URL = 'https://motodigital.io'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? PRODUCTION_URL

export default function robots(): MetadataRoute.Robots {
  // Block indexing on any non-production host (staging, preview, localhost)
  if (BASE_URL !== PRODUCTION_URL) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/auth/',
        '/api/',
        '/websites/',
        '/franks-motorrad-center/',
        '/*?SA',
        '/*?SD',
        '/*?SA=*',
        '/*?SD=*',
      ],
    },
    // Google accepts RSS feeds as sitemaps; the feed carries new magazine articles first
    sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/feed.xml`],
  }
}
