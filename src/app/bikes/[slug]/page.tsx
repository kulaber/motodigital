import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, ArrowLeft, Calendar, Euro } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import ContactButton from '@/components/messaging/ContactButton'
import type { Database } from '@/types/database'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BuildGallery from '@/components/build/BuildGallery'
import { sortBikeImages } from '@/lib/utils/bikeImages'
import type { Build } from '@/lib/data/builds'
import BikePlaceholder from '@/components/bike/BikePlaceholder'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import BikesClient from '../BikesClient'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type BikeImageRow = Database['public']['Tables']['bike_images']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type WorkshopRow = Database['public']['Tables']['workshops']['Row']

type BikeWithRelations = BikeRow & {
  bike_images: BikeImageRow[]
  profiles: ProfileRow | null
  workshops: WorkshopRow | null
}

interface Props {
  params: Promise<{ slug: string }>
}

// Known style slugs → display name + description
const STYLES: Record<string, { name: string; description: string; keywords: string }> = {
  'cafe-racer':    { name: 'Cafe Racer',    description: 'Handgefertigte Cafe Racer Motorräder', keywords: 'Cafe Racer for sale, buy cafe racer motorcycle' },
  'bobber':        { name: 'Bobber',        description: 'Custom Bobber Motorräder weltweit',    keywords: 'Bobber motorcycle for sale, custom bobber' },
  'scrambler':     { name: 'Scrambler',     description: 'Custom Scrambler Motorräder',          keywords: 'Scrambler motorcycle custom' },
  'tracker':       { name: 'Tracker',       description: 'Flat Track & Tracker Motorräder',      keywords: 'Tracker motorcycle custom' },
  'chopper':       { name: 'Chopper',       description: 'Custom Chopper Motorräder',            keywords: 'Custom chopper for sale' },
  'brat-style':    { name: 'Brat Style',    description: 'Brat Style Custom Bikes',              keywords: 'Brat style motorcycle' },
  'street-fighter':{ name: 'Street Fighter',description: 'Custom Street Fighter Bikes',          keywords: 'Street fighter motorcycle custom' },
  'enduro':        { name: 'Enduro',        description: 'Custom Enduro & Adventure Bikes',      keywords: 'Custom enduro motorcycle' },
  'old-school':    { name: 'Old School',    description: 'Old School Custom Motorcycles',        keywords: 'Old school custom motorcycle' },
  'street':        { name: 'Street',        description: 'Custom Street Motorräder',             keywords: 'Street motorcycle custom' },
  'naked':         { name: 'Naked',         description: 'Custom Naked Bikes',                   keywords: 'Naked motorcycle custom' },
  'basis-bike':    { name: 'Basis-Bike',   description: 'Basis-Bikes & Stock Motorcycles',       keywords: 'Basis bike motorcycle' },
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Basis-Bike',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  // Style page
  const style = STYLES[slug]
  if (style) {
    return {
      title: `${style.name} Motorcycles for sale — MotoDigital`,
      description: `${style.description}. Kaufe und verkaufe Custom ${style.name} Motorräder auf MotoDigital.`,
    }
  }

  // Supabase bike
  const supabase = await createClient()
  const { data: bike } = await supabase
    .from('bikes')
    .select('title, make, model, year, price')
    .eq('id', slug)
    .maybeSingle() as { data: Pick<BikeRow, 'title' | 'make' | 'model' | 'year' | 'price'> | null; error: unknown }

  if (!bike) return { title: 'Bike nicht gefunden' }
  return {
    title: `${bike.title} — ${formatPrice(bike.price)}`,
    description: `${bike.make} ${bike.model} ${bike.year} auf MotoDigital`,
  }
}

export default async function BikeSlugPage({ params }: Props) {
  const { slug } = await params

  // ── Style category page ──────────────────────────────────────────────────
  const styleInfo = STYLES[slug]
  if (styleInfo) {
    const styleSupabase = await createSupabaseClient()

    // Fetch ALL active bikes (same as /bikes page) so BikesClient filters work fully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (styleSupabase.from('bikes') as any)
      .select('id, title, make, model, year, style, city, price, created_at, seller_id, slug, view_count, bike_images(id, url, is_cover, position, media_type, thumbnail_url), profiles!seller_id(full_name, role)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBuilds: Build[] = (rows ?? []).map((r: any) => {
      const images: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cover = images.find((i: any) => i.is_cover)?.url ?? images.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null
      const profile = r.profiles
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
        builder:       { name: profile?.full_name ?? '', slug: '', initials: '', city: '', specialty: '', verified: false },
        coverImg:      cover,
        images:        images.map((i: any) => i.url), // eslint-disable-line @typescript-eslint/no-explicit-any
        publishedAt:   r.created_at,
        role:          profile?.role ?? 'rider',
        viewCount:     r.view_count ?? 0,
      }
    })

    return (
      <div className="min-h-screen bg-white text-[#222222] overflow-x-clip" style={{ fontFamily: 'var(--font-sans)' }}>
        <Header activePage="bikes" />

        {/* PAGE HEADER — same as /bikes */}
        <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
          <h1 className="text-xl font-bold text-[#222222] text-center">Custom Bikes</h1>
        </div>

        <BikesClient builds={allBuilds} initialStyle={styleInfo.name} />

        <Footer />
      </div>
    )
  }

  // ── Supabase bike detail page ─────────────────────────────────────────────
  const supabase = await createClient()

  const { data: bike } = await supabase
    .from('bikes')
    .select(`
      id, title, make, model, year, style, city, price, description,
      cc, mileage_km, is_verified, view_count, created_at, seller_id, workshop_id, slug,
      bike_images ( id, url, position, is_cover, media_type, thumbnail_url ),
      profiles:seller_id ( id, username, full_name, avatar_url, is_verified, created_at ),
      workshops:workshop_id ( id, name, slug, logo_url, city, avg_rating )
    `)
    .eq('id', slug)
    .eq('status', 'active')
    .maybeSingle() as { data: BikeWithRelations | null; error: unknown }

  if (!bike) notFound()

  ;(supabase.from('bikes') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .update({ view_count: (bike.view_count ?? 0) + 1 })
    .eq('id', slug)
    .then(() => {})

  const rawImages = sortBikeImages(bike.bike_images ?? [])
  const imageUrls = rawImages.map(i => i.url).filter(Boolean)
  const seller = bike.profiles
  const workshop = bike.workshops
  const price = formatPrice(bike.price)

  const specs = [
    { label: 'Marke', value: bike.make },
    { label: 'Modell', value: bike.model },
    { label: 'Baujahr', value: bike.year ? `${bike.year}` : null },
    { label: 'Stil', value: STYLE_LABELS[bike.style] ?? bike.style },
    bike.cc         ? { label: 'Hubraum',       value: `${bike.cc} cc` } : null,
    bike.mileage_km ? { label: 'Kilometerstand', value: `${bike.mileage_km.toLocaleString('de-DE')} km` } : null,
    bike.city       ? { label: 'Standort',       value: bike.city } : null,
  ].filter((s): s is { label: string; value: string } => !!s && !!s.value)

  const sellerName = seller?.full_name ?? seller?.username ?? ''
  const sellerInitials = sellerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="bikes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">

        <Link href="/bikes" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-6">
          <ArrowLeft size={13} /> Custom Bikes
        </Link>

        {/* Gallery */}
        {imageUrls.length > 0 ? (
          <BuildGallery images={imageUrls} title={bike.title} />
        ) : (
          <div className="rounded-2xl bg-[#F7F7F7] aspect-video flex items-center justify-center text-[#AAAAAA] text-sm">
            Keine Fotos vorhanden
          </div>
        )}

        {/* Title block */}
        <div className="mt-8 mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#717171] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                {STYLE_LABELS[bike.style] ?? bike.style}
              </span>
              {bike.is_verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest bg-[#222222] text-white px-2.5 py-1 rounded-full">
                  <BadgeCheck size={10} /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight leading-tight mb-2">
              {bike.title}
            </h1>
            <p className="text-[#717171] text-sm">{bike.make} {bike.model} · {bike.year}</p>
          </div>

          {/* Meta pills */}
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
                <Euro size={11} /> {price}
              </span>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* LEFT */}
          <div className="flex flex-col gap-8">
            {bike.description && (
              <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Über dieses Bike</h2>
                <p className="text-sm text-[#717171] leading-relaxed whitespace-pre-line">{bike.description}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Sticky Sidebar */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">

            {/* Seller / workshop card */}
            <div className="bg-white border border-[#DDDDDD] rounded-2xl p-5">
              <p className="text-base font-bold text-[#222222] tracking-tight mb-1">
                {workshop ? 'Custom Werkstatt' : 'Verkäufer'}
              </p>

              {workshop ? (
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#F7F7F7] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#06a5a5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {workshop.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{workshop.name}</p>
                    <p className="text-xs text-[#717171]">{workshop.city}</p>
                  </div>
                </div>
              ) : sellerName ? (
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#F7F7F7] rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#06a5a5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {sellerInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-[#222222]">{sellerName}</p>
                      {seller?.is_verified && <BadgeCheck size={13} className="text-[#717171]" />}
                    </div>
                    {bike.city && <p className="text-xs text-[#717171]">{bike.city}</p>}
                  </div>
                </div>
              ) : null}

              {price && (
                <div className="mb-4 text-center py-3 bg-[#F7F7F7] rounded-xl">
                  <p className="text-2xl font-bold text-[#222222] tracking-tight">{price}</p>
                  <p className="text-xs text-[#AAAAAA] mt-0.5">
                    {workshop ? 'Builder-Inserat' : 'Privates Inserat'} · {formatRelativeTime(bike.created_at)}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <ContactButton bikeId={bike.id} sellerId={seller?.id ?? ''} />
                {workshop && (
                  <Link
                    href={`/custom-werkstatt/${workshop.slug}`}
                    className="w-full text-center text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors py-2"
                  >
                    Werkstatt-Profil ansehen →
                  </Link>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
              <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">Technische Daten</h2>
              <div className="flex flex-col">
                {specs.map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-[#F7F7F7] last:border-0">
                    <span className="text-xs text-[#AAAAAA]">{s.label}</span>
                    <span className="text-xs font-medium text-[#222222]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related builds — rendered via RelatedBikesSection */}
        <RelatedBikesSection excludeId={slug} />
      </div>

      {/* Mobile floating CTA */}
      {price && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white border-t border-[#EBEBEB]">
          <div className="flex items-center justify-center w-full text-sm font-semibold bg-[#222222] text-white rounded-xl py-3">
            {price} · Verkäufer kontaktieren
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

async function RelatedBikesSection({ excludeId }: { excludeId: string }) {
  const supabase = await createSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, style, year, city, slug, seller_id, listing_type, price_amount, price_on_request, created_at, bike_images(id, url, is_cover, position), profiles!seller_id(full_name, role)')
    .eq('status', 'active')
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(3)

  const related = (rows ?? []).map((r: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const imgs: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = imgs.find((i: any) => i.is_cover)?.url ?? imgs.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null // eslint-disable-line @typescript-eslint/no-explicit-any
    const profile = r.profiles
    return {
      slug: r.slug ?? r.id,
      href: `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title: r.title as string,
      style: STYLE_LABELS[r.style] ?? (r.style as string),
      base: `${r.make} ${r.model}`,
      year: r.year as number | null,
      city: (r.city as string) ?? '',
      img: cover,
      listingType: r.listing_type as string | null,
      priceAmount: r.price_amount as number | null,
      priceOnRequest: r.price_on_request as boolean | null,
      publishedAt: r.created_at as string | undefined,
      role: profile?.role ?? 'rider',
      builder: profile?.full_name ?? '',
    }
  })

  if (related.length === 0) return null

  return (
    <div className="mt-16 pt-10 border-t border-[#EBEBEB]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-[#222222]">Weitere Custom Bikes</h2>
        <Link href="/bikes" className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-1.5 rounded-full transition-all">
          Alle Custom Bikes ansehen →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {related.map((b: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <Link
            key={b.slug}
            href={b.href}
            className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-200"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
              {b.img ? (
                <Image src={b.img} alt={b.title} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-500" />
              ) : (
                <BikePlaceholder />
              )}
              <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {b.style}
              </span>
              {b.listingType === 'for_sale' && (
                <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-[#06a5a5]/30 text-[#06a5a5] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Zu verkaufen
                </span>
              )}
              {b.role && (
                <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {b.role === 'custom-werkstatt' ? 'Custom Werkstatt' : 'Rider'}
                </span>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1">{b.title}</h3>
                {b.listingType === 'for_sale' && b.priceAmount && !b.priceOnRequest && (
                  <span className="text-xs sm:text-sm font-bold text-[#222222] flex-shrink-0">
                    {Number(b.priceAmount).toLocaleString('de-DE')} <span className="text-[10px] font-semibold text-[#222222]/40">EUR</span>
                  </span>
                )}
                {b.listingType === 'for_sale' && b.priceOnRequest && (
                  <span className="text-[10px] font-semibold text-[#222222]/40 flex-shrink-0">Auf Anfrage</span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{b.base} · {b.year}</p>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[10px] text-[#222222]/25 truncate">{b.builder}</p>
                {b.city && (
                  <p className="text-[10px] text-[#222222]/25 flex-shrink-0">{b.city}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
