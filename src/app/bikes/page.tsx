import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDS, type Build } from '@/lib/data/builds'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import BikesClient from './BikesClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Custom Bikes kaufen — MotoDigital',
  description: 'Kaufe und verkaufe handgefertigte Custom Motorcycles — Cafe Racer, Bobber, Scrambler, Tracker und Chopper aus ganz Europa.',
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Sonstiges',
}

export default async function BikesPage() {
  const supabase = await createClient()

  // Fetch all active bikes (werkstatt + rider)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, style, city, price, created_at, seller_id, slug, view_count, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch seller names for all bikes
  const sellerIds: string[] = [...new Set<string>((rows ?? []).map((r: any) => r.seller_id))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sellerProfiles } = sellerIds.length > 0
    ? await (supabase.from('profiles') as any)
        .select('id, full_name, role')
        .in('id', sellerIds)
    : { data: [] }
  const sellerNameById: Record<string, string> = Object.fromEntries(
    (sellerProfiles ?? []).map((p: any) => [p.id, p.full_name ?? ''])
  )
  const sellerRoleById: Record<string, string> = Object.fromEntries(
    (sellerProfiles ?? []).map((p: any) => [p.id, p.role ?? 'rider'])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbBuilds: Build[] = (rows ?? []).map((r: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = images.find((i: any) => i.is_cover)?.url ?? images.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? ''
    return {
      slug:          r.id,
      href:          `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title:         r.title,
      tagline:       '',
      style:         STYLE_LABELS[r.style] ?? r.style,
      base:          `${r.make} ${r.model}`,
      year:          r.year,
      price:         r.price ? `€ ${Number(r.price).toLocaleString('de-DE')}` : '',
      city:          r.city ?? '',
      country:       'Deutschland',
      verified:      false,
      buildYear:     r.year,
      buildDuration: '',
      description:   '',
      modifications: [],
      engine:        '',
      displacement:  '',
      builder:       { name: sellerNameById[r.seller_id] ?? '', slug: '', initials: '', city: '', specialty: '', verified: false },
      coverImg:      cover,
      images:        images.map((i: any) => i.url),
      publishedAt:   r.created_at,
      role:          sellerRoleById[r.seller_id] ?? 'rider',
      viewCount:     r.view_count ?? 0,
    }
  })

  const allBuilds = [...dbBuilds, ...BUILDS]

  return (
    <div className="min-h-screen bg-white text-[#222222] overflow-x-clip" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="bikes" />

      {/* PAGE HEADER */}
      <section className="pt-28 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-end justify-between gap-4 animate-slide-up">
            <h1 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
              Custom Bikes
            </h1>
            <p className="text-xs text-[#222222]/30 flex-shrink-0">
              <span className="text-[#222222]/60 font-semibold">{allBuilds.length} Bikes</span> · täglich aktualisiert
            </p>
          </div>
        </div>
      </section>

      <BikesClient builds={allBuilds} />

      <Footer />
    </div>
  )
}
