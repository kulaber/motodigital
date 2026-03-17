import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDERS, type Builder } from '@/lib/data/builders'
import BuilderPageClient from './BuilderPageClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Custom Werkstatt finden — Verzeichnis | MotoDigital',
  description: 'Entdecke verifizierte Custom-Werkstätten in Deutschland, Österreich und der Schweiz. Mit Galerie, Builds und Direktkontakt — kostenlos auf MotoDigital.',
}

/** Extract city from a Mapbox address string, e.g. "Frankfurter Straße 20, 03185 Peitz, Deutschland" → "Peitz" */
function cityFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    // Second-to-last part before country, strip leading postal code
    const segment = parts[parts.length - 2]
    const match = segment.match(/^\d+\s+(.+)$/)
    return match ? match[1] : segment
  }
  return address
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

export default async function BuilderPage() {
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
    await Promise.all(
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

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="custom-werkstatt" />

      <BuilderPageClient builders={merged} />

      <Footer />
    </div>
  )
}
