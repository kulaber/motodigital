import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, ArrowLeft, Lock, Tag } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BikeGallerySection from './BikeGallerySection'
import { createClient } from '@/lib/supabase/server'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import { sortedBikeImageUrls } from '@/lib/utils/bikeImages'
import ContactModal from './ContactModal'
import MobileCTAWrapper from './MobileCTAWrapper'
import ScrollToTop from '@/components/ui/ScrollToTop'

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Sonstiges',
}

interface Props {
  params: Promise<{ slug: string }>
}

// ISR: bike detail pages are public content, revalidate periodically
export const revalidate = 1800 // 30 minutes

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
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

  {
    const supabase = await createClient()
    const fullSelect = 'id, title, make, model, year, style, city, price, description, seller_id, workshop_id, bike_images(id, url, is_cover, position, media_type, thumbnail_url), modifications, slug, listing_type, price_amount, price_on_request'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bike: any = null

    // Try slug and UUID lookups in parallel (2 queries instead of up to 5 sequential)
    {
      const [{ data: bySlug }, { data: byId }] = await Promise.all([
        (supabase.from('bikes') as any).select(fullSelect).eq('slug', slug).maybeSingle(),
        (supabase.from('bikes') as any).select(fullSelect).eq('id', slug).maybeSingle(),
      ])
      bike = bySlug ?? byId
    }

    // Last resort: match by generated title slug (for bikes with null slug in DB)
    if (!bike) {
      const { data: nullSlugBikes } = await (supabase.from('bikes') as any)
        .select(fullSelect)
        .is('slug', null)
      const match = (nullSlugBikes ?? []).find(
        (b: any) => generateBikeSlug(b.title) === slug
      )
      if (match) bike = match
    }

    if (!bike) notFound()

    // Fetch seller profile + workshop (if linked)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ data: sellerProfile }, { data: workshop }] = await Promise.all([
      (supabase.from('profiles') as any)
        .select('full_name, city, slug, role, avatar_url')
        .eq('id', bike.seller_id)
        .maybeSingle() as Promise<{ data: { full_name: string | null; city: string | null; slug: string | null; role: string; avatar_url: string | null } | null }>,
      bike.workshop_id
        ? (supabase.from('workshops') as any)
            .select('logo_url')
            .eq('id', bike.workshop_id)
            .maybeSingle() as Promise<{ data: { logo_url: string | null } | null }>
        : Promise.resolve({ data: null }),
    ])

    // Check if user is logged in (for price visibility)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const isLoggedIn = !!currentUser

    const rawImages: { url: string; is_cover: boolean; position: number }[] = bike.bike_images ?? []
    const imageUrls = sortedBikeImageUrls(rawImages)

    const sellerName: string = sellerProfile?.full_name ?? ''
    const sellerInitials = sellerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
    const sellerProfileHref = sellerProfile?.slug
      ? sellerProfile.role === 'rider'
        ? `/rider/${sellerProfile.slug}`
        : `/custom-werkstatt/${sellerProfile.slug}`
      : null
    const styleLabel = bike.style?.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? ''

    return (
      <div className="min-h-screen bg-white text-[#222222]">
        <ScrollToTop />
        <Header activePage="bikes" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-4 pb-24">
          <Link href="/bikes" className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-4">
            <ArrowLeft size={13} /> Custom Bikes
          </Link>

          {imageUrls.length > 0 ? (
            <BikeGallerySection
              images={imageUrls}
              title={bike.title}
              bikeId={bike.id}
              sellerId={bike.seller_id}
              sellerName={sellerName}
              sellerAvatarUrl={sellerProfile?.avatar_url ?? undefined}
              sellerRole={sellerProfile?.role ?? null}
              coverImage={imageUrls[0] ?? null}
            />
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
                {bike.listing_type === 'for_sale' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#06a5a5] border border-[#06a5a5]/30 bg-[#06a5a5]/8 px-2.5 py-1 rounded-full">
                    <Tag size={10} /> Zu verkaufen
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight leading-tight mb-2">
                {bike.title}
              </h1>
              <p className="text-[#717171] text-sm">{bike.make} {bike.model} · {bike.year}</p>
            </div>

            {bike.listing_type === 'for_sale' && (
              <div className="sm:text-right flex-shrink-0 sm:pt-6">
                {isLoggedIn ? (
                  bike.price_on_request ? (
                    <p className="text-lg font-semibold text-[#222222]">Preis auf Anfrage</p>
                  ) : bike.price_amount ? (
                    <p className="text-2xl sm:text-3xl font-bold text-[#222222]">
                      {Number(bike.price_amount).toLocaleString('de-DE')} <span className="text-base font-semibold text-[#222222]/50">EUR</span>
                    </p>
                  ) : null
                ) : (
                  <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs text-[#222222]/40 hover:text-[#06a5a5] transition-colors">
                    <Lock size={12} /> Anmelden um den Preis zu sehen
                  </Link>
                )}
              </div>
            )}
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

              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Technische Daten</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  {[
                    { label: 'Marke', value: bike.make },
                    { label: 'Modell', value: bike.model },
                    { label: 'Baujahr', value: bike.year ? `${bike.year}` : null },
                    { label: 'Stil', value: styleLabel },
                    { label: 'Standort', value: bike.city },
                  ].filter((s): s is { label: string; value: string } => !!s.value).map((s, i, arr) => (
                    <div key={s.label} className={`flex items-center justify-between py-2.5 ${
                      /* border-bottom on all except last row; in 2-col layout last row = last 1–2 items */
                      i < arr.length - (arr.length % 2 === 0 ? 2 : 1) ? 'border-b border-[#F7F7F7]' : ''
                    }`}>
                      <span className="text-xs text-[#AAAAAA]">{s.label}</span>
                      <span className="text-xs font-medium text-[#222222]">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden">
                {/* Header label */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F0F0F0]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#222222]/25 mb-3">Custom Bike von</p>

                  {/* Avatar + identity row */}
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-[#EBEBEB]">
                      {workshop?.logo_url ? (
                        <Image
                          src={workshop.logo_url}
                          alt={sellerName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : sellerProfile?.avatar_url ? (
                        <Image
                          src={sellerProfile.avatar_url}
                          alt={sellerName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : sellerProfile?.role === 'custom-werkstatt' ? (
                        <div className="w-full h-full bg-[#06a5a5] flex items-center justify-center p-2">
                          <Image src="/pin-logo.svg" alt="MotoDigital" width={28} height={28} />
                        </div>
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
                  <div>
                    <ContactModal
                      sellerId={bike.seller_id}
                      sellerName={sellerName}
                      sellerAvatarUrl={sellerProfile?.avatar_url ?? undefined}
                      sellerRole={sellerProfile?.role ?? null}
                      bikeId={bike.id}
                      bikeTitle={bike.title}
                      coverImage={imageUrls[0] ?? null}
                    />
                  </div>
                  {sellerProfileHref && (
                    <Link href={sellerProfileHref} className="w-full text-center text-xs font-medium text-[#222222]/35 hover:text-[#222222] transition-colors py-1.5">
                      Profil ansehen →
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </div>

          <Suspense fallback={null}>
            <RelatedBikes excludeId={bike.id} />
          </Suspense>
        </div>

        <Footer />
      </div>
    )
  }
}

async function RelatedBikes({ excludeId }: { excludeId?: string }) {
  const supabase = await createClient()

  // Single query with JOIN — fetch bikes + seller profiles together
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('bikes') as any)
    .select('id, title, make, model, style, city, slug, seller_id, bike_images(id, url, is_cover, position, media_type, thumbnail_url), profiles!seller_id(full_name, role)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)

  if (excludeId) query = query.neq('id', excludeId)

  const { data: rows } = await query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related = (rows ?? []).map((r: any) => {
    const imgs: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = imgs.find((i: any) => i.is_cover)?.url ?? imgs.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? ''
    const profile = r.profiles
    return {
      slug:  r.id as string,
      href:  `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title: r.title as string,
      style: STYLE_LABELS[r.style] ?? (r.style as string),
      base:  `${r.make} ${r.model}`,
      city:  (r.city as string) ?? '',
      img:   cover,
      role:  profile?.role ?? 'rider',
      builder: profile?.full_name ?? '',
      sellerId: r.seller_id as string,
    }
  })

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
              <Image src={b.img} alt={b.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-500" />
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

