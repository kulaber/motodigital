import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { getAllArticles } from '@/lib/magazine/articles'
import { routing } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

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
  | '/motorrad-umbau'
  | '/sell'
  | '/faq'
  | '/partner'
  | '/vorteile'
  | '/marken'
  | '/impressum'
  | '/datenschutz'
  | '/nutzungsbedingungen'
  | '/support'

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
  const supabase = createPublicClient()

  // Rider profiles are login-gated (PROTECTED_ROUTES in middleware → 307 to
  // /auth/login), so they are deliberately not part of the sitemap.
  const [{ data: builders }, { data: bikes }, { data: events }, { data: brands }] = await Promise.all([
    (supabase.from('profiles') as any)
      // profiles has no updated_at column — selecting it makes the whole query fail
      .select('slug, created_at')
      .eq('role', 'custom-werkstatt')
      .not('slug', 'is', null)
      .throwOnError() as Promise<{ data: { slug: string; created_at?: string }[] | null }>,
    supabase
      .from('bikes')
      .select('id, slug, title, updated_at')
      .eq('status', 'active')
      .throwOnError() as unknown as Promise<{ data: { id: string; slug: string | null; title: string; updated_at: string }[] | null }>,
    (supabase.from('events') as any)
      .select('slug, date_start')
      .not('slug', 'is', null)
      .throwOnError() as Promise<{ data: { slug: string; date_start?: string }[] | null }>,
    (supabase.from('base_bike_brands') as any)
      .select('slug')
      .not('slug', 'is', null)
      .throwOnError() as Promise<{ data: { slug: string }[] | null }>,
  ])

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    localizedEntry('/',                          now, 'daily',   1.0),
    localizedEntry('/custom-werkstatt',          now, 'daily',   0.9),
    localizedEntry('/bikes',                     now, 'daily',   0.9),
    localizedEntry('/sell',                      now, 'monthly', 0.8),
    localizedEntry('/marken',                    now, 'weekly',  0.7),
    localizedEntry('/explore',                   now, 'weekly',  0.7),
    localizedEntry('/magazine',                  now, 'weekly',  0.8),
    localizedEntry('/magazine/build-story',      now, 'weekly',  0.6),
    localizedEntry('/magazine/interview',        now, 'weekly',  0.6),
    localizedEntry('/magazine/guide',            now, 'weekly',  0.6),
    localizedEntry('/events',                    now, 'weekly',  0.7),
    localizedEntry('/ueber-motodigital',         now, 'monthly', 0.6),
    localizedEntry('/motorrad-umbau',            now, 'monthly', 0.8),
    localizedEntry('/faq',                       now, 'monthly', 0.5),
    localizedEntry('/partner',                   now, 'monthly', 0.5),
    localizedEntry('/vorteile',                  now, 'monthly', 0.5),
    localizedEntry('/impressum',                 now, 'yearly',  0.3),
    localizedEntry('/datenschutz',               now, 'yearly',  0.3),
    localizedEntry('/nutzungsbedingungen',       now, 'yearly',  0.3),
    localizedEntry('/support',                   now, 'monthly', 0.4),
  ]

  // `getPathname` honours routing.localePrefix ('as-needed') — default
  // locale returns no prefix, others return `/<locale>/...`.
  const cityHubSlugs = ['muenchen', 'berlin', 'hamburg', 'frankfurt', 'koeln', 'stuttgart', 'wien', 'zuerich']
  const cityHubPages: MetadataRoute.Sitemap = cityHubSlugs.map((slug) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}${l === routing.defaultLocale ? '' : `/${l}`}/custom-werkstatt/${slug}`])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: { languages: urls },
    }
  })

  const bikeStyleSlugs = [
    'cafe-racer', 'bobber', 'scrambler', 'tracker', 'chopper',
    'street', 'enduro', 'brat-style', 'street-fighter', 'old-school',
    'naked', 'basis-bike',
  ]
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

  // Article bodies are German-only, so the EN URLs are noindexed duplicates —
  // no hreflang alternates, otherwise Google ranks /en/ for German queries.
  const articlePages: MetadataRoute.Sitemap = (await getAllArticles('de')).map((a) => ({
    url: `${BASE}/magazine/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const builderPages: MetadataRoute.Sitemap = (builders ?? []).map((b) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [
        l,
        `${BASE}${getPathname({ href: { pathname: '/custom-werkstatt/[slug]', params: { slug: b.slug } }, locale: l })}`,
      ])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: b.created_at ? new Date(b.created_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages: urls },
    }
  })

  const bikePages: MetadataRoute.Sitemap = (bikes ?? []).map((b) => {
    const bikeSlug = b.slug ?? (b.title ? generateBikeSlug(b.title) : null) ?? b.id
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}${l === routing.defaultLocale ? '' : `/${l}`}/custom-bike/${bikeSlug}`])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: new Date(b.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: { languages: urls },
    }
  })

  const eventPages: MetadataRoute.Sitemap = (events ?? []).map((e) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}${l === routing.defaultLocale ? '' : `/${l}`}/events/${e.slug}`])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: e.date_start ? new Date(e.date_start) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: { languages: urls },
    }
  })

  const brandPages: MetadataRoute.Sitemap = (brands ?? []).map((b) => {
    const urls = Object.fromEntries(
      routing.locales.map((l) => [l, `${BASE}${l === routing.defaultLocale ? '' : `/${l}`}/marken/${b.slug}`])
    )
    return {
      url: urls[routing.defaultLocale],
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: { languages: urls },
    }
  })

  return [
    ...staticPages,
    ...cityHubPages,
    ...bikeStylePages,
    ...articlePages,
    ...builderPages,
    ...bikePages,
    ...eventPages,
    ...brandPages,
  ]
}
