import { Suspense } from 'react'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import type { Builder } from '@/lib/data/builders'
import BuilderPageClientLoader from './BuilderPageClientLoader'
import { createClient } from '@/lib/supabase/server'
import { cityFromAddress, countryFromAddress } from '@/lib/utils'

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
  const country = address ? countryFromAddress(address) : ''
  return {
    id:          row.id as string,
    slug:        row.slug as string,
    initials:    name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    name,
    city,
    country,
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
/* ── Async component that fetches data (streamed via Suspense) ── */
async function BuilderContent() {
  const supabase = await createClient()

  const { data: dbRows } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, rating, featured, instagram_url, website_url, created_at, builder_media(url, type, title, position)')
    .eq('role', 'custom-werkstatt')
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)

  const dbBuilders: Builder[] = (dbRows ?? []).map(dbRowToBuilder)

  // Count custom bikes per workshop (seller_id = profile id)
  const builderIds = dbBuilders.map(b => b.id).filter(Boolean) as string[]
  if (builderIds.length > 0) {
    const { data: bikeCounts } = await (supabase.from('bikes') as any)
      .select('seller_id')
      .in('seller_id', builderIds)
      .in('status', ['active', 'draft'])
    if (bikeCounts) {
      const countMap = new Map<string, number>()
      for (const row of bikeCounts) {
        countMap.set(row.seller_id, (countMap.get(row.seller_id) ?? 0) + 1)
      }
      for (const b of dbBuilders) {
        if (b.id) b.builds = countMap.get(b.id) ?? 0
      }
    }
  }

  // Geocode builders that have a city/address but no coordinates
  // Results are persisted to DB so each builder is only geocoded once
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
  if (token) {
    const needsGeocode = dbBuilders.filter(b => !b.lat && !b.lng && (b.address || b.city))
    if (needsGeocode.length > 0) {
      await Promise.allSettled(
        needsGeocode.map(async b => {
          const query = b.address || b.city
          if (!query) return
          const coords = await geocode(query, token)
          if (coords) {
            b.lat = coords.lat
            b.lng = coords.lng
            // Persist coordinates so future loads skip geocoding (fire-and-forget)
            ;(supabase.from('profiles') as any).update({ lat: coords.lat, lng: coords.lng }).eq('id', b.id)
          }
        })
      )
    }
  }

  // Featured/sponsored first, then newest first (order from DB)
  const sponsored = dbBuilders.filter(b => b.featured)
  const nonSponsored = dbBuilders.filter(b => !b.featured)
  const sorted = [...sponsored, ...nonSponsored]

  return <BuilderPageClientLoader builders={sorted} />
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

      <Suspense fallback={
        <>
          {/* Sticky filter bar skeleton */}
          <div className="sticky top-12 lg:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
            <div className="flex px-4 sm:px-5 lg:px-6 py-3 items-center gap-2 overflow-x-auto">
              <div className="lg:hidden h-8 w-20 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
              <div className="flex-1 lg:hidden" />
              <div className="h-8 w-32 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
              <div className="hidden lg:block h-8 w-24 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
              <div className="hidden lg:block h-8 w-24 bg-[#F0F0F0] animate-pulse rounded-full flex-shrink-0" />
              <div className="hidden lg:flex h-8 items-center gap-1.5 px-3.5 rounded-full border border-[#d4d4d4] flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[13px] font-medium text-[#333]">Jetzt geöffnet</span>
              </div>
            </div>
          </div>
          {/* Desktop split */}
          <div className="hidden lg:flex" style={{ height: 'calc(100dvh - 128px)' }}>
            <div className="w-1/2 overflow-hidden border-r border-[#EBEBEB] p-4">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[4/3] rounded-xl bg-[#F0F0F0] animate-pulse" />
                    <div className="pt-2.5 pb-1">
                      <div className="h-4 w-2/3 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                      <div className="h-3 w-4/5 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                      <div className="flex gap-1 mt-1.5">
                        <div className="h-4 w-20 bg-[#F0F0F0] animate-pulse rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-1/2 relative p-3">
              <div className="absolute inset-3 rounded-2xl bg-[#F0F0F0] animate-pulse" />
            </div>
          </div>
          {/* Mobile list */}
          <div className="lg:hidden p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/3] rounded-xl bg-[#F0F0F0] animate-pulse" />
                  <div className="pt-2.5 pb-1">
                    <div className="h-4 w-2/3 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                    <div className="h-3 w-4/5 bg-[#F0F0F0] animate-pulse rounded mb-1" />
                    <div className="flex gap-1 mt-1.5">
                      <div className="h-4 w-20 bg-[#F0F0F0] animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      }>
        <BuilderContent />
      </Suspense>
    </div>
  )
}
