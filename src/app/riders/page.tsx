import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { RIDERS, type Rider, type RiderBike } from '@/lib/data/riders'
import RidersPageClient from './RidersPageClient'
import { createClient } from '@/lib/supabase/server'
import { cityFromAddress } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Motorcycle Rider Community — Profile & Custom Bikes | MotoDigital',
  description: 'Vernetze dich mit leidenschaftlichen Custom Motorcycle Ridern in Europa. Profile, Bikes und Community auf MotoDigital.',
}

export default async function RidersPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbRows } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, bio, city, since_year, tags, address, avatar_url, instagram_url, last_seen_at')
    .eq('role', 'rider')
    .not('full_name', 'is', null)

  // Fetch all rider bikes with cover images
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bikesRows } = await (supabase.from('bikes') as any)
    .select('id, seller_id, title, make, model, year, bike_images(url, is_cover)')
    .eq('status', 'active')

  // Group bikes by seller_id
  const bikesBySeller = new Map<string, RiderBike[]>()
  for (const b of (bikesRows ?? [])) {
    const coverImg = b.bike_images?.find((img: { is_cover: boolean; url: string }) => img.is_cover)
    const riderBike: RiderBike = {
      id: b.id,
      title: b.title,
      make: b.make,
      model: b.model,
      year: b.year,
      coverUrl: coverImg?.url ?? b.bike_images?.[0]?.url ?? undefined,
    }
    const list = bikesBySeller.get(b.seller_id) ?? []
    list.push(riderBike)
    bikesBySeller.set(b.seller_id, list)
  }

  const dbRiders: Rider[] = (dbRows ?? []).map((row: Record<string, unknown>) => {
    const name    = (row.full_name as string | null) ?? 'Unbekannt'
    const address = (row.address as string | null) ?? undefined
    const rawCity = (row.city as string | null)
    const city    = address ? cityFromAddress(address) : (rawCity ?? '')
    const tags    = (row.tags as string[] | null) ?? []
    const id      = row.id as string
    return {
      id,
      slug:        row.slug as string,
      initials:    name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      name,
      city,
      bike:        '',
      style:       tags[0] ?? '',
      styles:      tags,
      avatar:      (row.avatar_url as string | null) ?? undefined,
      bio:         (row.bio as string | null) ?? '',
      verified:    false,
      since:       (row.since_year as number | null)?.toString() ?? '',
      instagram:   (row.instagram_url as string | null) ?? undefined,
      lastSeenAt:  (row.last_seen_at as string | null) ?? undefined,
      bikes:       bikesBySeller.get(id) ?? [],
    } as Rider
  })

  const dbSlugs = new Set(dbRiders.map(r => r.slug))
  const staticOnly = RIDERS.filter(r => !dbSlugs.has(r.slug))
  const merged = [...dbRiders, ...staticOnly]

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="riders" />
      <RidersPageClient riders={merged} />
      <Footer />
    </div>
  )
}
