import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ARTICLES } from '@/lib/data/magazine'

const BASE = 'https://motodigital.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch dynamic slugs from Supabase
  const [{ data: builders }, { data: bikes }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('profiles') as any)
      .select('slug, updated_at')
      .eq('role', 'custom-werkstatt')
      .not('slug', 'is', null) as Promise<{ data: { slug: string; updated_at?: string }[] | null }>,
    supabase
      .from('bikes')
      .select('id, updated_at')
      .eq('status', 'active') as unknown as Promise<{ data: { id: string; updated_at: string }[] | null }>,
  ])

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/custom-werkstatt`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/bikes`,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/explore`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/magazine`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/magazine/build-story`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/magazine/interview`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/magazine/guide`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/events`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/ueber-motodigital`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    // Bike style pages
    { url: `${BASE}/bikes/cafe-racer`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/bikes/bobber`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/bikes/scrambler`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/bikes/tracker`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/bikes/chopper`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/bikes/street`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/bikes/enduro`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
  ]

  // Magazine articles
  const articlePages: MetadataRoute.Sitemap = ARTICLES.map(a => ({
    url: `${BASE}/magazine/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Custom Werkstatt profiles
  const builderPages: MetadataRoute.Sitemap = (builders ?? []).map(b => ({
    url: `${BASE}/custom-werkstatt/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Active bike listings
  const bikePages: MetadataRoute.Sitemap = (bikes ?? []).map(b => ({
    url: `${BASE}/bikes/${b.id}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...articlePages, ...builderPages, ...bikePages]
}
