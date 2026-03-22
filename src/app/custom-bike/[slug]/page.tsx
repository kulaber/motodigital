import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, MapPin, ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDS, getBuildBySlug } from '@/lib/data/builds'
import BuildGallery from '@/components/build/BuildGallery'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import ContactModal from './ContactModal'

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Sonstiges',
}

interface Props {
  params: Promise<{ slug: string }>
}

// Force dynamic rendering — DB bikes need cookies() for Supabase auth
export const dynamic = 'force-dynamic'

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
    const baseSelect = 'id, title, make, model, year, style, city, price, description, seller_id, bike_images(id, url, is_cover, position, media_type, thumbnail_url)'

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

    // Fallback: match by generated title slug (for bikes with null slug in DB)
    if (!bike) {
      const { generateBikeSlug } = await import('@/lib/utils/bikeSlug')
      const { data: allBikes } = await (supabase.from('bikes') as any)
        .select(`id, title, ${baseSelect}, modifications, slug`)
        .is('slug', null)
      const match = (allBikes ?? []).find(
        (b: any) => generateBikeSlug(b.title) === slug
      )
      if (match) bike = match
    }

    if (!bike) notFound()

    // Fetch seller profile — try with slug first, then without
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sellerProfile: any = null
    {
      const { data } = await (supabase.from('profiles') as any)
        .select('full_name, city, slug, role, avatar_url')
        .eq('id', bike.seller_id)
        .maybeSingle()
      if (data) {
        sellerProfile = data
      } else {
        const { data: fallback } = await (supabase.from('profiles') as any)
          .select('full_name, city, role, avatar_url')
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
    const styleLabel = bike.style?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? ''

    return (
      <div className="min-h-screen bg-white text-[#222222]">
        <Header activePage="bikes" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-6 pb-24">
          <Link href="/bikes" className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-6">
            <ArrowLeft size={13} /> Custom Bikes
          </Link>

          {imageUrls.length > 0 ? (
            <BuildGallery images={imageUrls} title={bike.title} bikeId={bike.id} />
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
              <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
                {/* Header label */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#222222]/25 mb-3">Gebaut von</p>

                  {/* Avatar + identity row */}
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-[#EBEBEB]">
                      {sellerProfile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sellerProfile.avatar_url}
                          alt={sellerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#06a5a5] flex items-center justify-center text-sm font-bold text-white">
                          {sellerInitials}
                        </div>
                      )}
                    </div>

                    {/* Name + badge + city */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-bold text-[#222222] leading-tight truncate">{sellerName || '—'}</p>
                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          sellerProfile?.role === 'custom-werkstatt'
                            ? 'bg-[#06a5a5]/10 text-[#06a5a5] border border-[#06a5a5]/20'
                            : 'bg-[#222222]/6 text-[#222222]/50 border border-[#222222]/8'
                        }`}>
                          {sellerProfile?.role === 'custom-werkstatt' ? 'Werkstatt' : 'Rider'}
                        </span>
                      </div>
                      {sellerProfile?.city && (
                        <p className="text-xs text-[#222222]/35 flex items-center gap-1">
                          <MapPin size={10} /> {sellerProfile.city}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 py-4 flex flex-col gap-2">
                  <ContactModal
                    sellerId={bike.seller_id}
                    sellerName={sellerName}
                    sellerRole={sellerProfile?.role ?? null}
                    bikeId={bike.id}
                    bikeTitle={bike.title}
                    coverImage={imageUrls[0] ?? null}
                  />
                  {sellerProfileHref && (
                    <Link href={sellerProfileHref} className="w-full text-center text-xs font-medium text-[#222222]/35 hover:text-[#222222] transition-colors py-1.5">
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

          <RelatedBikes excludeId={bike.id} />
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex justify-center">
          {sellerProfileHref ? (
            <Link href={sellerProfileHref} className="inline-flex items-center justify-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-full px-8 py-3 shadow-lg transition-colors">
              Werkstatt kontaktieren
            </Link>
          ) : (
            <button className="inline-flex items-center justify-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-full px-8 py-3 shadow-lg transition-colors">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-6 pb-24">

        {/* Back */}
        <Link href="/bikes" className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-6">
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
                  className="hidden lg:block w-full text-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-xl px-4 py-2.5 transition-colors"
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
        <RelatedBikes excludeSlug={build.slug} />
      </div>

      {/* Mobile floating CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex justify-center">
        <Link
          href={`/custom-werkstatt/${build.builder.slug}`}
          className="inline-flex items-center justify-center text-sm font-semibold bg-[#06a5a5] hover:bg-[#058f8f] text-white rounded-full px-8 py-3 shadow-lg transition-colors"
        >
          {build.builder.name} kontaktieren
        </Link>
      </div>

      <Footer />
    </div>
  )
}

async function RelatedBikes({ excludeId, excludeSlug }: { excludeId?: string; excludeSlug?: string }) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('bikes') as any)
    .select('id, title, make, model, style, city, slug, seller_id, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)

  if (excludeId) query = query.neq('id', excludeId)

  const { data: rows } = await query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let related: { href: string; title: string; style: string; base: string; city: string; img: string; role: string; slug: string }[] = (rows ?? []).map((r: any) => {
    const imgs: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = imgs.find((i: any) => i.is_cover)?.url ?? imgs.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? ''
    return {
      slug:  r.id as string,
      href:  `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title: r.title as string,
      style: STYLE_LABELS[r.style] ?? (r.style as string),
      base:  `${r.make} ${r.model}`,
      city:  (r.city as string) ?? '',
      img:   cover,
      role:  '',
      sellerId: r.seller_id as string,
    }
  })

  // Fetch seller roles
  const sellerIds = [...new Set(related.map((r: any) => r.sellerId))]
  if (sellerIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles } = await (supabase.from('profiles') as any)
      .select('id, full_name, role')
      .in('id', sellerIds)
    const roleMap: Record<string, string> = Object.fromEntries(
      ((profiles ?? []) as { id: string; role: string | null }[]).map(p => [p.id, p.role ?? 'rider'])
    )
    const nameMap: Record<string, string> = Object.fromEntries(
      ((profiles ?? []) as { id: string; full_name: string | null }[]).map(p => [p.id, p.full_name ?? ''])
    )
    related = related.map((r: any) => ({ ...r, role: roleMap[r.sellerId] ?? 'rider', builder: nameMap[r.sellerId] ?? '' }))
  }

  // Fill with static BUILDS if not enough DB bikes
  if (related.length < 3) {
    const dbSlugs = new Set(related.map(r => r.slug))
    const staticFill = BUILDS
      .filter(b => b.slug !== excludeSlug && !dbSlugs.has(b.slug))
      .slice(0, 3 - related.length)
      .map(b => ({
        slug:  b.slug,
        href:  `/custom-bike/${b.slug}`,
        title: b.title,
        style: b.style,
        base:  b.base,
        city:  b.city,
        img:   b.coverImg,
        role:  '',
        builder: b.builder.name,
        sellerId: '',
      }))
    related = [...related, ...staticFill]
  }

  const cards = related.slice(0, 3)

  return (
    <div className="mt-16 pt-10 border-t border-[#EBEBEB]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-[#222222]">Weitere Custom Bikes</h2>
        <Link href="/bikes" className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-1.5 rounded-full transition-all">
          Alle Custom Bikes ansehen →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((b: any) => (
          <Link
            key={b.slug}
            href={b.href}
            className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-200"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
              <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {b.style}
              </span>
              {b.role && (
                <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {b.role === 'custom-werkstatt' ? 'Custom Werkstatt' : 'Rider'}
                </span>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1 mb-0.5">{b.title}</h3>
              <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{b.base} · {b.builder || ''} · {b.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
