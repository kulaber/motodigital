import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin, Calendar, Wrench, ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDS, getBuildBySlug } from '@/lib/data/builds'
import BuildGallery from '@/components/build/BuildGallery'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

// Allow dynamic routes (DB bikes by slug) beyond static BUILDS
export const dynamicParams = true

export async function generateStaticParams() {
  return BUILDS.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const build = getBuildBySlug(slug)
  if (build) {
    return {
      title: `${build.title} — ${build.style} Custom Build`,
      description: build.tagline,
    }
  }
  // Try DB lookup for metadata — by slug first, then by UUID
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data } = await (supabase.from('bikes') as any)
      .select('title, style')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: byId } = await (supabase.from('bikes') as any)
        .select('title, style')
        .eq('id', slug)
        .maybeSingle()
      data = byId
    }
    if (!data) return {}
    return {
      title: `${data.title} — ${data.style} Custom Build · MotoDigital`,
    }
  } catch {
    return {}
  }
}

export default async function CustomBikePage({ params }: Props) {
  const { slug } = await params
  const build = getBuildBySlug(slug)

  if (!build) {
    // Try loading from Supabase
    const supabase = await createClient()
    const baseSelect = 'id, title, make, model, year, style, city, price, description, seller_id, bike_images(url, is_cover, position)'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bike: any = null

    // Try with slug + modifications columns first (new schema)
    {
      const { data } = await (supabase.from('bikes') as any)
        .select(`${baseSelect}, modifications, slug`)
        .eq('slug', slug)
        .maybeSingle()
      if (data) bike = data
    }

    // Fallback: try without new columns (old schema)
    if (!bike) {
      const { data } = await (supabase.from('bikes') as any)
        .select(baseSelect)
        .eq('slug', slug)
        .maybeSingle()
      if (data) bike = data
    }

    // Fallback: try as UUID with new columns
    if (!bike) {
      const { data } = await (supabase.from('bikes') as any)
        .select(`${baseSelect}, modifications, slug`)
        .eq('id', slug)
        .maybeSingle()
      if (data) bike = data
    }

    // Fallback: try as UUID with base columns only
    if (!bike) {
      const { data } = await (supabase.from('bikes') as any)
        .select(baseSelect)
        .eq('id', slug)
        .maybeSingle()
      if (data) bike = data
    }

    if (!bike) notFound()

    // Fetch seller profile — try with slug first, then without
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sellerProfile: any = null
    {
      const { data } = await (supabase.from('profiles') as any)
        .select('full_name, city, slug')
        .eq('id', bike.seller_id)
        .maybeSingle()
      if (data) {
        sellerProfile = data
      } else {
        const { data: fallback } = await (supabase.from('profiles') as any)
          .select('full_name, city')
          .eq('id', bike.seller_id)
          .maybeSingle()
        sellerProfile = fallback
      }
    }

    const rawImages: { url: string; is_cover: boolean; position: number }[] = bike.bike_images ?? []
    const imageUrls = rawImages
      .sort((a: any, b: any) => {
        if (a.is_cover) return -1
        if (b.is_cover) return 1
        return a.position - b.position
      })
      .map((i: any) => i.url)
      .filter(Boolean)

    const sellerName: string = sellerProfile?.full_name ?? ''
    const sellerInitials = sellerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
    const sellerProfileHref = sellerProfile?.slug ? `/custom-werkstatt/${sellerProfile.slug}` : null
    const price = bike.price ? `€ ${Number(bike.price).toLocaleString('de-DE')}` : null
    const styleLabel = bike.style?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? ''

    return (
      <div className="min-h-screen bg-white text-[#222222]">
        <Header activePage="bikes" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          <Link href="/bikes" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-6">
            <ArrowLeft size={13} /> Custom Bikes
          </Link>

          {imageUrls.length > 0 ? (
            <BuildGallery images={imageUrls} title={bike.title} />
          ) : (
            <div className="rounded-2xl bg-[#F7F7F7] aspect-video flex items-center justify-center text-[#AAAAAA] text-sm">
              Keine Fotos vorhanden
            </div>
          )}

          <div className="mt-8 mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#717171] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                  {styleLabel}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight leading-tight mb-2">
                {bike.title}
              </h1>
              <p className="text-[#717171] text-sm">{bike.make} {bike.model} · {bike.year}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              {bike.city && (
                <span className="flex items-center gap-1.5 text-xs text-[#717171] bg-[#F7F7F7] px-3 py-1.5 rounded-full">
                  <MapPin size={11} /> {bike.city}
                </span>
              )}
              {bike.year && (
                <span className="flex items-center gap-1.5 text-xs text-[#717171] bg-[#F7F7F7] px-3 py-1.5 rounded-full">
                  <Calendar size={11} /> {bike.year}
                </span>
              )}
              {price && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#222222] bg-[#F7F7F7] px-3 py-1.5 rounded-full">
                  {price}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            <div className="flex flex-col gap-8">
              {bike.description && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Über dieses Bike</h2>
                  <p className="text-sm text-[#717171] leading-relaxed whitespace-pre-line">{bike.description}</p>
                </div>
              )}

              {bike.modifications?.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                  <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Umbauten & Modifikationen</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bike.modifications.map((mod: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 bg-[#F7F7F7] rounded-xl px-4 py-3">
                        <span className="text-[#06a5a5] mt-0.5 flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        <span className="text-xs text-[#444] leading-snug">{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
                <p className="text-base font-bold text-[#222222] tracking-tight mb-1">Custom Werkstatt</p>
                {sellerName && (
                  <p className="text-xs text-[#717171] leading-relaxed mb-4">Gebaut von {sellerName}</p>
                )}
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#F7F7F7] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#06a5a5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {sellerInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{sellerName || '—'}</p>
                    {sellerProfile?.city && <p className="text-xs text-[#717171]">{sellerProfile.city}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {sellerProfileHref ? (
                    <Link href={sellerProfileHref} className="w-full text-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-xl px-4 py-2.5 transition-colors">
                      Werkstatt kontaktieren
                    </Link>
                  ) : (
                    <button className="w-full text-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-xl px-4 py-2.5 transition-colors">
                      Werkstatt kontaktieren
                    </button>
                  )}
                  {sellerProfileHref && (
                    <Link href={sellerProfileHref} className="w-full text-center text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors py-2">
                      Profil ansehen →
                    </Link>
                  )}
                </div>
              </div>

              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Technische Daten</h2>
                <div className="flex flex-col">
                  {[
                    { label: 'Marke', value: bike.make },
                    { label: 'Modell', value: bike.model },
                    { label: 'Baujahr', value: bike.year ? `${bike.year}` : null },
                    { label: 'Stil', value: styleLabel },
                    { label: 'Standort', value: bike.city },
                  ].filter((s): s is { label: string; value: string } => !!s.value).map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-[#F7F7F7] last:border-0">
                      <span className="text-xs text-[#AAAAAA]">{s.label}</span>
                      <span className="text-xs font-medium text-[#222222]">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-[#EBEBEB]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-[#222222]">Weitere Custom Bikes</h2>
              <Link href="/bikes" className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-1.5 rounded-full transition-all">
                Alle Custom Bikes ansehen →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BUILDS.slice(0, 3).map(b => (
                <Link key={b.slug} href={`/custom-bike/${b.slug}`} className="group rounded-xl overflow-hidden border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                    <img src={b.coverImg} alt={b.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[#222222] line-clamp-1">{b.title}</p>
                    <p className="text-[10px] text-[#AAAAAA] mt-0.5">{b.base} · {b.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white border-t border-[#EBEBEB]">
          {sellerProfileHref ? (
            <Link href={sellerProfileHref} className="flex items-center justify-center w-full text-sm font-semibold bg-[#06a5a5] text-white rounded-xl py-3">
              Werkstatt kontaktieren
            </Link>
          ) : (
            <button className="flex items-center justify-center w-full text-sm font-semibold bg-[#06a5a5] text-white rounded-xl py-3">
              Werkstatt kontaktieren
            </button>
          )}
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">

        {/* Back */}
        <Link href="/bikes" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-6">
          <ArrowLeft size={13} /> Custom Bikes
        </Link>

        {/* Gallery — hero focus */}
        <BuildGallery images={build.images} title={build.title} />

        {/* Title block */}
        <div className="mt-8 mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#717171] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                {build.style}
              </span>
              {build.verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest bg-[#222222] text-white px-2.5 py-1 rounded-full">
                  <BadgeCheck size={10} /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight leading-tight mb-2">
              {build.title}
            </h1>
            <p className="text-[#717171] text-sm">{build.tagline}</p>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {[
              { icon: <MapPin size={11} />, label: build.city },
              { icon: <Calendar size={11} />, label: `Build ${build.buildYear}` },
              { icon: <Wrench size={11} />, label: build.displacement },
            ].map(m => (
              <span key={m.label} className="flex items-center gap-1.5 text-xs text-[#717171] bg-[#F7F7F7] px-3 py-1.5 rounded-full">
                {m.icon} {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* LEFT */}
          <div className="flex flex-col gap-8">

            {/* Story */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Der Build</h2>
              <p className="text-sm text-[#717171] leading-relaxed">{build.description}</p>
            </div>

            {/* Modifications */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Umbauten & Modifikationen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {build.modifications.map((mod, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-[#F7F7F7] rounded-xl px-4 py-3">
                    <span className="text-[#06a5a5] mt-0.5 flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span className="text-xs text-[#444] leading-snug">{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video */}
            {build.videoUrl && (
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Video</h2>
                <video
                  src={build.videoUrl}
                  controls
                  poster={build.images[0]}
                  className="w-full rounded-2xl aspect-video object-cover bg-[#F7F7F7]"
                />
              </div>
            )}
          </div>

          {/* RIGHT — Sticky Sidebar */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">

            {/* Builder card */}
            <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
              <p className="text-base font-bold text-[#222222] tracking-tight mb-1">Custom Werkstatt</p>
              <p className="text-xs text-[#717171] leading-relaxed mb-4">Gebaut von {build.builder.name}</p>
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#F7F7F7] rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-[#06a5a5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {build.builder.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[#222222]">{build.builder.name}</p>
                    {build.builder.verified && <BadgeCheck size={13} className="text-[#717171]" />}
                  </div>
                  <p className="text-xs text-[#717171]">{build.builder.city}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/custom-werkstatt/${build.builder.slug}`}
                  className="w-full text-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-xl px-4 py-2.5 transition-colors"
                >
                  Werkstatt kontaktieren
                </Link>
                <Link
                  href={`/custom-werkstatt/${build.builder.slug}`}
                  className="w-full text-center text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors py-2"
                >
                  Profil ansehen →
                </Link>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Technische Daten</h2>
              <div className="flex flex-col">
                {[
                  { label: 'Basis', value: build.base },
                  { label: 'Baujahr', value: `${build.year}` },
                  { label: 'Motor', value: build.engine },
                  { label: 'Hubraum', value: build.displacement },
                  { label: 'Standort', value: build.city },
                  { label: 'Umbau-Jahr', value: `${build.buildYear}` },
                  { label: 'Bauzeit', value: build.buildDuration },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-[#F7F7F7] last:border-0">
                    <span className="text-xs text-[#AAAAAA]">{s.label}</span>
                    <span className="text-xs font-medium text-[#222222]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related builds */}
        <div className="mt-16 pt-10 border-t border-[#EBEBEB]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#222222]">Weitere Custom Bikes</h2>
            <Link href="/bikes" className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-1.5 rounded-full transition-all">
              Alle Custom Bikes ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUILDS.filter(b => b.slug !== build.slug).slice(0, 3).map(b => (
              <Link
                key={b.slug}
                href={`/custom-bike/${b.slug}`}
                className="group rounded-xl overflow-hidden border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                  <Image src={b.coverImg} alt={b.title} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#222222] line-clamp-1">{b.title}</p>
                  <p className="text-[10px] text-[#AAAAAA] mt-0.5">{b.base} · {b.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile floating CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white border-t border-[#EBEBEB]">
        <Link
          href={`/custom-werkstatt/${build.builder.slug}`}
          className="flex items-center justify-center w-full text-sm font-semibold bg-[#222222] text-white rounded-xl py-3 transition-colors"
        >
          {build.builder.name} kontaktieren
        </Link>
      </div>

      <Footer />
    </div>
  )
}
