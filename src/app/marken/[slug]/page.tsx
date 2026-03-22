import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BRANDS, getBrandBySlug } from '@/lib/data/brands'
import { BUILDS } from '@/lib/data/builds'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

// Need dynamic rendering for Supabase queries (cookies)
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `Custom ${brand.name} Motorrad Builds — MotoDigital`,
    description: brand.tagline,
  }
}

export default async function MarkeDetailPage({ params }: Props) {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) notFound()

  // Static builds filtered by base name
  const staticBuilds = BUILDS.filter(b =>
    b.base.toLowerCase().startsWith(brand.name.toLowerCase())
  )

  // DB bikes filtered by make column (as set in the form dropdown)
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbBikes: any[] | null = null
  // Try with slug column first (new schema), fall back to without
  {
    const { data } = await (supabase.from('bikes') as any)
      .select('id, title, make, model, year, style, city, slug, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
      .ilike('make', brand.name)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    dbBikes = data
  }
  if (!dbBikes) {
    const { data } = await (supabase.from('bikes') as any)
      .select('id, title, make, model, year, style, city, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
      .ilike('make', brand.name)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    dbBikes = data
  }

  // Map DB bikes to a renderable format
  const dbBuilds = (dbBikes ?? []).map((bike: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = bike.bike_images ?? []
    const cover = images.sort((a: any, b: any) => {
      if (a.is_cover) return -1
      if (b.is_cover) return 1
      return a.position - b.position
    })[0]
    return {
      slug: bike.slug ?? bike.id,
      title: bike.title,
      base: `${bike.make} ${bike.model}`,
      style: bike.style?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? '',
      city: bike.city ?? '',
      coverImg: cover?.url ?? '',
      isDb: true,
    }
  })

  const builds = [
    ...staticBuilds.map(b => ({ ...b, isDb: false })),
    ...dbBuilds,
  ]

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pt-6 pb-24">

        {/* Back */}
        <Link href="/marken" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-8">
          <ArrowLeft size={13} /> Alle Marken
        </Link>

        {/* Hero */}
        <div className="flex items-start gap-5 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center flex-shrink-0 p-2.5">
            <Image
              src={`/brands/${brand.slug}.svg`}
              alt={brand.name}
              width={160}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">{brand.name}</h1>
              <span className="text-xs font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full">{brand.country}</span>
            </div>
            <p className="text-sm text-[#717171] max-w-xl">{brand.tagline}</p>
          </div>
        </div>

        {/* Models */}
        <div className="mb-12">
          <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">{brand.name} Modelle als Custom-Basis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brand.models.map(m => (
              <div key={m.model} className="bg-white border border-[#EBEBEB] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-[#222222]">{brand.name} {m.model}</p>
                  <span className="text-[10px] font-medium text-[#717171] whitespace-nowrap">
                    {m.yearFrom}–{m.yearTo ?? 'heute'}
                  </span>
                </div>
                <p className="text-xs text-[#AAAAAA] mb-3">{m.cc} cc</p>
                <div className="flex flex-wrap gap-1">
                  {m.styles.map(s => (
                    <span key={s} className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
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
            {BRANDS.filter(b => b.slug !== brand.slug).map(b => (
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
