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

export default async function BikesPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Get IDs of all custom-werkstatt users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: werkstattProfiles } = await (supabase.from('profiles') as any)
    .select('id, full_name')
    .eq('role', 'custom-werkstatt')

  const werkstattIds: string[] = (werkstattProfiles ?? []).map((p: any) => p.id)
  const werkstattNameById: Record<string, string> = Object.fromEntries(
    (werkstattProfiles ?? []).map((p: any) => [p.id, p.full_name ?? ''])
  )

  // Fetch only bikes from werkstatt users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = werkstattIds.length > 0
    ? await (supabase.from('bikes') as any)
        .select('id, title, make, model, year, style, city, price, created_at, seller_id, slug, bike_images(url, is_cover, position)')
        .eq('status', 'active')
        .in('seller_id', werkstattIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const dbBuilds: Build[] = (rows ?? []).map((r: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = images.find((i: any) => i.is_cover)?.url ?? images.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? ''
    return {
      slug:          r.id,
      href:          `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title:         r.title,
      tagline:       '',
      style:         r.style,
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
      builder:       { name: werkstattNameById[r.seller_id] ?? '', slug: '', initials: '', city: '', specialty: '', verified: false },
      coverImg:      cover,
      images:        images.map((i: any) => i.url),
      publishedAt:   r.created_at,
    }
  })

  const allBuilds = [...dbBuilds, ...BUILDS]

  return (
    <div className="min-h-screen bg-white text-[#222222]" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="bikes" />

      {/* PAGE HEADER */}
      <section className="pt-28 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-slide-up">
            <div>
              <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Custom Motorcycles</p>
              <h1 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
                Handgefertigte Unikate.
              </h1>
              <p className="text-[#222222]/40 text-sm mt-2 max-w-[55ch] leading-relaxed">
                Durchstöbere alle Custom Bikes — von Cafe Racern bis zum Chopper.
              </p>
            </div>
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
