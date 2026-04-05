import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Wrench } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { sortBikeImages } from '@/lib/utils/bikeImages'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string; 'model-slug': string }>
}

export const revalidate = 3600

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

export async function generateStaticParams() {
  const supabase = await createClient()
  const { data: bikes } = await (supabase.from('base_bikes') as any)
    .select('slug, brand_id, base_bike_brands!inner(slug)')
  return (bikes ?? []).map((b: any) => ({
    slug: b.base_bike_brands?.slug ?? '',
    'model-slug': b.slug ?? '',
  })).filter((p: any) => p.slug && p['model-slug'])
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, 'model-slug': modelSlug } = await params
  const supabase = await createClient()

  const { data: brand } = await (supabase.from('base_bike_brands') as any)
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle()
  if (!brand) return {}

  const { data: bike } = await (supabase.from('base_bikes') as any)
    .select('model, engine_cc, custom_styles')
    .eq('brand_id', brand.id)
    .eq('slug', modelSlug)
    .maybeSingle()
  if (!bike) return {}

  const styles = (bike.custom_styles ?? []).map((s: string) => STYLE_LABELS[s] ?? s).join(', ')
  return {
    title: `${brand.name} ${bike.model} als Custom-Basis — MotoDigital`,
    description: `${brand.name} ${bike.model} (${bike.engine_cc} cc) — beliebte Basis fuer ${styles}. Entdecke Builds auf MotoDigital.`,
  }
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug, 'model-slug': modelSlug } = await params
  const supabase = await createClient()

  // Fetch brand
  const { data: brand } = await (supabase.from('base_bike_brands') as any)
    .select('id, name, slug, country')
    .eq('slug', slug)
    .maybeSingle()
  if (!brand) notFound()

  // Fetch model
  const { data: baseBike } = await (supabase.from('base_bikes') as any)
    .select('id, model, slug, year_from, year_to, engine_cc, engine_type, custom_styles, notes')
    .eq('brand_id', brand.id)
    .eq('slug', modelSlug)
    .maybeSingle()
  if (!baseBike) notFound()

  // Fetch builds that use this base bike (via base_bike_id)
  const { data: linkedBuilds } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, style, city, slug, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
    .eq('base_bike_id', baseBike.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const builds: { slug: string; title: string; base: string; style: string; city: string; coverImg: string }[] = (linkedBuilds ?? []).map((bike: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = bike.bike_images ?? []
    const cover = sortBikeImages(images)[0]
    return {
      slug: bike.slug ?? bike.id,
      title: bike.title,
      base: `${bike.make} ${bike.model}`,
      style: bike.style?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? '',
      city: bike.city ?? '',
      coverImg: cover?.url ?? '',
    }
  })

  // Fetch other models from same brand
  const { data: otherModels } = await (supabase.from('base_bikes') as any)
    .select('model, slug')
    .eq('brand_id', brand.id)
    .neq('slug', modelSlug)
    .order('year_from', { ascending: true })
    .limit(12)

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pt-6 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#222222]/35 mb-8">
          <Link href="/marken" className="hover:text-[#222222] transition-colors">
            <ArrowLeft size={13} className="inline mr-1" />Alle Marken
          </Link>
          <span>/</span>
          <Link href={`/marken/${brand.slug}`} className="hover:text-[#222222] transition-colors">
            {brand.name}
          </Link>
          <span>/</span>
          <span className="text-[#222222]/60">{baseBike.model}</span>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center flex-shrink-0 p-1.5">
              <Image
                src={`/brands/${brand.slug}.svg`}
                alt={brand.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight">
                {brand.name} {baseBike.model}
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#717171]">
            {baseBike.year_from}–{baseBike.year_to ?? 'heute'} · {brand.country}
          </p>
        </div>

        {/* Tech specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {baseBike.engine_cc && (
            <div className="bg-[#F7F7F7] rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA] mb-1">Hubraum</p>
              <p className="text-lg font-bold text-[#222222]">{baseBike.engine_cc} cc</p>
            </div>
          )}
          {baseBike.engine_type && (
            <div className="bg-[#F7F7F7] rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA] mb-1">Motor</p>
              <p className="text-lg font-bold text-[#222222]">{ENGINE_LABELS[baseBike.engine_type] ?? baseBike.engine_type}</p>
            </div>
          )}
          <div className="bg-[#F7F7F7] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA] mb-1">Baujahr</p>
            <p className="text-lg font-bold text-[#222222]">{baseBike.year_from}–{baseBike.year_to ?? 'heute'}</p>
          </div>
          <div className="bg-[#F7F7F7] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA] mb-1">Builds</p>
            <p className="text-lg font-bold text-[#222222]">{builds.length}</p>
          </div>
        </div>

        {/* Custom styles */}
        {(baseBike.custom_styles ?? []).length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-[#222222] mb-3">Beliebte Custom-Stile</h2>
            <div className="flex flex-wrap gap-2">
              {baseBike.custom_styles.map((s: string) => (
                <span key={s} className="text-xs font-medium text-[#06a5a5] bg-[#06a5a5]/8 border border-[#06a5a5]/15 px-3 py-1.5 rounded-full">
                  {STYLE_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {baseBike.notes && (
          <div className="mb-10 bg-[#F7F7F7] rounded-xl p-5">
            <p className="text-sm text-[#717171] leading-relaxed">{baseBike.notes}</p>
          </div>
        )}

        {/* Builds section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-[#222222] tracking-tight">
              Builds auf dieser Basis
              {builds.length > 0 && <span className="ml-2 text-sm font-normal text-[#717171]">({builds.length})</span>}
            </h2>
          </div>

          {builds.length === 0 ? (
            <div className="bg-[#F7F7F7] rounded-2xl p-10 text-center">
              <p className="text-sm text-[#717171] mb-4">Noch keine Builds auf Basis der {brand.name} {baseBike.model}.</p>
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

        {/* CTA: Dieses Bike als Basis angeben */}
        <div className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#222222] mb-1">Du baust auf einer {brand.name} {baseBike.model}?</h3>
            <p className="text-xs text-[#717171]">Lade deinen Custom Build hoch und zeige ihn der Community.</p>
          </div>
          <Link
            href={`/bikes/new?base=${baseBike.id}`}
            className="inline-flex items-center gap-2 bg-[#06a5a5] hover:bg-[#058f8f] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors flex-shrink-0"
          >
            <Wrench size={14} />
            Dieses Bike als Basis angeben
          </Link>
        </div>

        {/* Other models from this brand */}
        {(otherModels ?? []).length > 0 && (
          <div className="pt-10 border-t border-[#EBEBEB]">
            <h2 className="text-sm font-semibold text-[#222222] mb-6">Weitere {brand.name} Modelle</h2>
            <div className="flex flex-wrap gap-2">
              {otherModels.map((m: any) => (
                <Link
                  key={m.slug}
                  href={`/marken/${brand.slug}/${m.slug}`}
                  className="text-xs font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-2 rounded-full transition-all"
                >
                  {m.model}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
