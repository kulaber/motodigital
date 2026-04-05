import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { sortBikeImages } from '@/lib/utils/bikeImages'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

// Map engine_type DB values to German display labels
const ENGINE_LABELS: Record<string, string> = {
  single: 'Einzylinder',
  parallel_twin: 'Parallel-Twin',
  inline_four: 'Reihen-Vierzylinder',
  v_twin: 'V-Twin',
  triple: 'Dreizylinder',
  inline_six: 'Reihen-Sechszylinder',
  flat_twin: 'Boxer-Twin',
  flat_four: 'Flat Four',
  v_four: 'V4',
  two_stroke: 'Zweitakter',
  two_stroke_triple: 'Zweitakt-Dreizylinder',
}

// Map custom_style DB values to display labels
const STYLE_LABELS: Record<string, string> = {
  cafe_racer: 'Cafe Racer',
  scrambler: 'Scrambler',
  tracker: 'Tracker',
  bobber: 'Bobber',
  chopper: 'Chopper',
  streetfighter: 'Streetfighter',
  brat: 'Brat Style',
  bagger: 'Bagger',
  supermoto: 'Supermoto',
  adventure: 'Adventure',
  custom: 'Custom',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: brand } = await (supabase.from('base_bike_brands') as any)
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()
  if (!brand) return {}
  return {
    title: `Custom ${brand.name} Motorrad Builds — MotoDigital`,
    description: brand.description || `Entdecke alle ${brand.name} Modelle als Custom-Basis auf MotoDigital.`,
  }
}

export default async function MarkeDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch brand
  const { data: brand } = await (supabase.from('base_bike_brands') as any)
    .select('id, name, slug, country, founded, description')
    .eq('slug', slug)
    .maybeSingle()
  if (!brand) notFound()

  // Fetch models for this brand
  const { data: models } = await (supabase.from('base_bikes') as any)
    .select('id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles')
    .eq('brand_id', brand.id)
    .order('year_from', { ascending: true })

  // Fetch custom builds from bikes table matching this brand
  const { data: dbBikes } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, style, city, slug, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
    .ilike('make', brand.name)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const builds: { slug: string; title: string; base: string; style: string; city: string; coverImg: string }[] = (dbBikes ?? []).map((bike: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = bike.bike_images ?? []
    const cover = sortBikeImages(images)[0]
    return {
      slug: bike.slug ?? bike.id,
      title: bike.title,
      base: `${bike.make} ${bike.model}`,
      style: ({ cafe_racer: 'Cafe Racer', bobber: 'Bobber', scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper', naked: 'Naked', street: 'Street', enduro: 'Enduro', other: 'Basis-Bike' } as Record<string, string>)[bike.style] ?? bike.style?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? '',
      city: bike.city ?? '',
      coverImg: cover?.url ?? '',
    }
  })

  // Fetch other brands for "Weitere Marken" section
  const { data: allBrands } = await (supabase.from('base_bike_brands') as any)
    .select('name, slug')
    .neq('slug', slug)
    .order('name')

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pt-6 pb-24">

        {/* Back */}
        <Link href="/marken" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-8">
          <ArrowLeft size={13} /> Alle Marken
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">{brand.name}</h1>
            <span className="text-xs font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full">{brand.country}</span>
          </div>
          {brand.founded && (
            <p className="text-xs text-[#AAAAAA] mb-1">Gegr. {brand.founded}</p>
          )}
          {brand.description && (
            <p className="text-sm text-[#717171] max-w-xl">{brand.description}</p>
          )}
        </div>

        {/* Models */}
        <div className="mb-12">
          <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">
            {brand.name} Modelle als Custom-Basis
            {(models?.length ?? 0) > 0 && <span className="ml-2 text-sm font-normal text-[#717171]">({models.length})</span>}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(models ?? []).map((m: any) => (
              <Link
                key={m.slug}
                href={`/marken/${brand.slug}/${m.slug}`}
                className="group bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-sm rounded-xl p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors">{brand.name} {m.model}</p>
                  <span className="text-[10px] font-medium text-[#717171] whitespace-nowrap">
                    {m.year_from}–{m.year_to ?? 'heute'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {m.engine_cc && <span className="text-xs text-[#AAAAAA]">{m.engine_cc} cc</span>}
                  {m.engine_type && (
                    <>
                      <span className="text-[#EBEBEB]">·</span>
                      <span className="text-xs text-[#AAAAAA]">{ENGINE_LABELS[m.engine_type] ?? m.engine_type}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(m.custom_styles ?? []).map((s: string) => (
                    <span key={s} className="text-[10px] font-medium text-[#06a5a5] bg-[#06a5a5]/8 border border-[#06a5a5]/15 px-2 py-0.5 rounded-full">
                      {STYLE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Builds */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-[#222222] tracking-tight">
              Custom Bikes auf {brand.name}-Basis
              {builds.length > 0 && <span className="ml-2 text-sm font-normal text-[#717171]">({builds.length})</span>}
            </h2>
            <Link href="/bikes" className="text-xs text-[#717171] hover:text-[#222222] transition-colors">
              Alle Custom Bikes →
            </Link>
          </div>

          {builds.length === 0 ? (
            <div className="bg-[#F7F7F7] rounded-2xl p-10 text-center">
              <p className="text-sm text-[#717171] mb-4">Noch keine {brand.name} Builds auf MotoDigital.</p>
              <Link href="/custom-werkstatt" className="text-xs font-semibold text-[#06a5a5] hover:underline">
                Custom Werkstatt finden →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {builds.map(build => (
                <Link
                  key={build.slug}
                  href={`/custom-bike/${build.slug}`}
                  className="group rounded-2xl overflow-hidden border border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                    {build.coverImg ? (
                      <Image
                        src={build.coverImg}
                        alt={build.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#AAAAAA] text-xs">Kein Foto</div>
                    )}
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-[#222222] line-clamp-1 mb-0.5">{build.title}</p>
                    <p className="text-xs text-[#AAAAAA]">{build.base} · {build.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Other brands */}
        <div className="mt-16 pt-10 border-t border-[#EBEBEB]">
          <h2 className="text-sm font-semibold text-[#222222] mb-6">Weitere Marken</h2>
          <div className="flex flex-wrap gap-2">
            {(allBrands ?? []).map((b: any) => (
              <Link
                key={b.slug}
                href={`/marken/${b.slug}`}
                className="text-xs font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-2 rounded-full transition-all"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
