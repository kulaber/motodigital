import { Suspense } from 'react'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { BUILDERS, type Builder } from '@/lib/data/builders'
import BuilderPageClientLoader from './BuilderPageClientLoader'
import { createClient } from '@/lib/supabase/server'
import { cityFromAddress } from '@/lib/utils'

export const revalidate = 3600 // ISR: revalidate every hour

const BASE_URL = 'https://motodigital.vercel.app'

const seoTitle = 'Custom Werkstatt finden — Verzeichnis'
const seoDescription = 'Entdecke verifizierte Custom-Werkstätten in Deutschland, Österreich und der Schweiz. Mit Galerie, Builds und Direktkontakt — kostenlos auf MotoDigital.'

export const metadata: Metadata = {
  title: seoTitle,
  description: seoDescription,
  alternates: { canonical: `${BASE_URL}/custom-werkstatt` },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: `${BASE_URL}/custom-werkstatt`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
  },
}

function dbRowToBuilder(row: Record<string, unknown>): Builder {
  const name    = (row.full_name as string | null) ?? 'Unbekannt'
  const address = (row.address   as string | null) ?? undefined
  const rawCity = (row.city as string | null)
  // If address is set, extract city from it (always up-to-date); fall back to DB city field
  const city    = address ? cityFromAddress(address) : (rawCity ?? '')
  return {
    id:          row.id as string,
    slug:        row.slug as string,
    initials:    name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    name,
    city,
    address,
    lat:         (row.lat as number | null) ?? undefined,
    lng:         (row.lng as number | null) ?? undefined,
    specialty:   (row.specialty as string | null) ?? '',
    builds:      0,
    rating:      (row.rating as number | null) ?? 5.0,
    verified:    false,
    featured:    (row.featured as boolean | null) ?? false,
    since:       (row.since_year as number | null)?.toString() ?? '',
    tags:        (row.tags as string[] | null) ?? [],
    bio:         (row.bio as string | null) ?? '',
    bioLong:     (row.bio_long as string | null) ?? '',
    bases:       (row.bases as string[] | null) ?? [],
    instagram:   (row.instagram_url as string | null) ?? undefined,
    website:     (row.website_url as string | null) ?? undefined,
    media:       ((row.builder_media as {url:string;type:string;title?:string;position?:number}[] | null) ?? [])
                   .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                   .map(m => ({ url: m.url, type: m.type as 'image'|'video', title: m.title ?? undefined })),
    featuredBuilds: [],
  }
}

/** Geocode a city/address string via Mapbox — returns [lng, lat] or null */
async function geocode(query: string, token: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&types=place,address&language=de`
    const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h
    if (!res.ok) return null
    const json = await res.json()
    const [lng, lat] = json.features?.[0]?.center ?? []
    if (!lng || !lat) return null
    return { lat, lng }
  } catch {
    return null
  }
}

/* ── Skeleton shown inline while data streams ── */
function BuilderSkeleton() {
  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="flex px-4 sm:px-5 lg:px-6 py-3 items-center gap-2">
          <div className="h-[30px] w-[90px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
          <div className="h-[30px] w-[100px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
          <div className="h-[30px] w-[110px] rounded-full border border-[#DDDDDD] bg-white animate-pulse" />
        </div>
      </div>

      {/* Desktop: Split layout */}
      <div className="hidden lg:flex" style={{ height: 'calc(100dvh - 120px)' }}>
        <div className="w-1/2 overflow-hidden border-r border-[#EBEBEB]">
          <div className="p-4">
            <div className="h-3 w-28 rounded bg-[#F0F0F0] mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="w-full aspect-[4/3] rounded-xl bg-[#F0F0F0] animate-pulse" />
                  <div className="pt-2.5 pb-1 animate-pulse">
                    <div className="h-3.5 w-3/4 rounded bg-[#EBEBEB] mb-1.5" />
                    <div className="h-3 w-1/2 rounded bg-[#F0F0F0] mb-2" />
                    <div className="flex gap-1">
                      <div className="h-[18px] w-16 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]" />
                      <div className="h-[18px] w-20 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 relative p-3">
          <div className="absolute inset-3 rounded-2xl bg-[#f0fafa] animate-pulse" />
        </div>
      </div>

      {/* Mobile: List view */}
      <div className="lg:hidden p-4">
        <div className="h-3 w-28 rounded bg-[#F0F0F0] mb-4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="w-full aspect-[4/3] rounded-xl bg-[#F0F0F0] animate-pulse" />
              <div className="pt-2.5 pb-1 animate-pulse">
                <div className="h-3.5 w-3/4 rounded bg-[#EBEBEB] mb-1.5" />
                <div className="h-3 w-1/2 rounded bg-[#F0F0F0]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Async component that fetches data (streamed via Suspense) ── */
async function BuilderContent() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbRows } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, rating, featured, instagram_url, website_url, builder_media(url, type, title, position)')
    .eq('role', 'custom-werkstatt')
    .not('slug', 'is', null)

  const dbBuilders: Builder[] = (dbRows ?? []).map(dbRowToBuilder)

  // Geocode builders that have a city/address but no coordinates
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
  if (token) {
    await Promise.allSettled(
      dbBuilders.map(async b => {
        if (b.lat && b.lng) return
        const query = b.address || b.city
        if (!query) return
        const coords = await geocode(query, token)
        if (coords) {
          b.lat = coords.lat
          b.lng = coords.lng
        }
      })
    )
  }

  // Merge: DB takes precedence over static for matching slugs
  const dbSlugs = new Set(dbBuilders.map(b => b.slug))
  const staticOnly = BUILDERS.filter(b => !dbSlugs.has(b.slug))
  const merged = [...dbBuilders, ...staticOnly]

  // Shuffle non-sponsored server-side (Math.random OK in server component)
  const sponsored = merged.filter(b => b.featured)
  const nonSponsored = merged.filter(b => !b.featured)
  // eslint-disable-next-line react-hooks/purity
  const rest = nonSponsored.map(b => ({ b, r: Math.random() })).sort((a, z) => a.r - z.r).map(({ b }) => b)
  const shuffled = [...sponsored, ...rest]

  return <BuilderPageClientLoader builders={shuffled} />
}

/* ── Page component — Header renders instantly, data streams in ── */
export default function BuilderPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MotoDigital', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Custom Werkstatt' },
    ],
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header activePage="custom-werkstatt" />

      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Werkstatt</h1>
      </div>

      <Suspense fallback={<BuilderSkeleton />}>
        <BuilderContent />
      </Suspense>
    </div>
  )
}
