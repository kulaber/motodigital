import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ARTICLES } from '@/lib/data/magazine'
import { routing } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'

const BASE = 'https://motodigital.io'

type StaticHref =
  | '/'
  | '/custom-werkstatt'
  | '/bikes'
  | '/explore'
  | '/magazine'
  | '/magazine/build-story'
  | '/magazine/interview'
  | '/magazine/guide'
  | '/events'
  | '/ueber-motodigital'

type Freq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

function localizedEntry(
  canonical: StaticHref,
  lastModified: Date,
  changeFrequency: Freq,
  priority: number,
): MetadataRoute.Sitemap[number] {
  const urlsByLocale = Object.fromEntries(
    routing.locales.map((l) => [
      l,
      `${BASE}${getPathname({ href: canonical, locale: l })}`,
    ])
  )
  return {
    url: urlsByLocale[routing.defaultLocale],
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: urlsByLocale },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: builders }, { data: bikes }] = await Promise.all([
    (supabase.from('profiles') as any)
      .select('slug, updated_at')
      .eq('role', 'custom-werkstatt')
      .not('slug', 'is', null) as Promise<{ data: { slug: string; updated_at?: string }[] | null }>,
    supabase
      .from('bikes')
      .select('id, updated_at')
      .eq('status', 'active') as unknown as Promise<{ data: { id: string; updated_at: string }[] | null }>,
  ])

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    localizedEntry('/',                          now, 'daily',   1.0),
    localizedEntry('/custom-werkstatt',          now, 'daily',   0.9),
    localizedEntry('/bikes',                     now, 'daily',   0.9),
    localizedEntry('/explore',                   now, 'weekly',  0.7),
    localizedEntry('/magazine',                  now, 'weekly',  0.8),
    localizedEntry('/magazine/build-story',      now, 'weekly',  0.6),
    localizedEntry('/magazine/interview',        now, 'weekly',  0.6),
    localizedEntry('/magazine/guide',            now, 'weekly',  0.6),
    localizedEntry('/events',                    now, 'weekly',  0.7),
    localizedEntry('/ueber-motodigital',         now, 'monthly', 0.6),
  ]

  // `getPathname` honours routing.localePrefix ('as-needed') — default
  // locale returns no prefix, others return `/<locale>/...`.
  const bikeStyleSlugs = ['cafe-racer', 'bobber', 'scrambler', 'tracker', 'chopper', 'street', 'enduro']
  const bikeStylePages: MetadataRoute.Sitemap = bikeStyleSlugs.map((slug) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}/${l === routing.defaultLocale ? '' : `${l}/`}bikes/${slug}`.replace(/\/$/, '') || '/'])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: { languages: urls },
    }
  })

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((a) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}${l === routing.defaultLocale ? '' : `/${l}`}/magazine/${a.slug}`])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: new Date(a.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: { languages: urls },
    }
  })

  const builderPages: MetadataRoute.Sitemap = (builders ?? []).map((b) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [
        l,
        `${BASE}${getPathname({ href: { pathname: '/custom-werkstatt/[slug]', params: { slug: b.slug } }, locale: l })}`,
      ])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: b.updated_at ? new Date(b.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages: urls },
    }
  })

  const bikePages: MetadataRoute.Sitemap = (bikes ?? []).map((b) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}${l === routing.defaultLocale ? '' : `/${l}`}/bikes/${b.id}`])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: new Date(b.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: { languages: urls },
    }
  })

  return [...staticPages, ...bikeStylePages, ...articlePages, ...builderPages, ...bikePages]
}
