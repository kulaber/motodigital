import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDERS, type Builder } from '@/lib/data/builders'
import BuilderPageClient from './BuilderPageClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Builder Directory — Custom Motorcycle Builder finden',
  description: 'Finde verifizierte Custom Motorcycle Builder in ganz Europa auf MotoDigital.',
}

function dbRowToBuilder(row: Record<string, unknown>): Builder {
  const name = (row.full_name as string | null) ?? 'Unbekannt'
  return {
    slug:        row.slug as string,
    initials:    name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    name,
    city:        (row.city as string | null) ?? '',
    address:     (row.address as string | null) ?? undefined,
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
    media:       [],
    featuredBuilds: [],
  }
}

export default async function BuilderPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbRows } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, bio, bio_long, city, specialty, since_year, tags, bases, address, lat, lng, rating, featured, instagram_url, website_url')
    .eq('role', 'builder')
    .not('slug', 'is', null)

  const dbBuilders: Builder[] = (dbRows ?? []).map(dbRowToBuilder)

  // Merge: DB takes precedence over static for matching slugs
  const dbSlugs = new Set(dbBuilders.map(b => b.slug))
  const staticOnly = BUILDERS.filter(b => !dbSlugs.has(b.slug))
  const merged = [...dbBuilders, ...staticOnly]

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1714]">
      <Header activePage="builder" />

      <BuilderPageClient builders={merged} />

      <Footer />
    </div>
  )
}
