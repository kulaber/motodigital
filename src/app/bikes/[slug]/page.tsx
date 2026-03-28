import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, ArrowLeft, Calendar, Euro } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import ContactButton from '@/components/messaging/ContactButton'
import type { Database } from '@/types/database'
import { BUILDS } from '@/lib/data/builds'
import { BUILDERS } from '@/lib/data/builders'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BuildGallery from '@/components/build/BuildGallery'
import { sortBikeImages, sortedBikeImageUrls } from '@/lib/utils/bikeImages'

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
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Other',
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
    const styleDisplay = styleInfo.name
    const filtered = BUILDS.filter(
      b => b.style.toLowerCase() === styleDisplay.toLowerCase() ||
           b.style.toLowerCase().replace(/\s+/g, '-') === slug
    )

    // Builders who match this style via their tags
    const relatedBuilders = BUILDERS.filter(b =>
      b.tags?.some(t => t.toLowerCase().replace(/\s+/g, '-') === slug ||
                        t.toLowerCase() === styleDisplay.toLowerCase())
    ).slice(0, 4)

    const ALL_STYLES = ['cafe-racer','bobber','scrambler','tracker','chopper','street','enduro'] as const

    return (
      <div className="min-h-screen bg-white text-[#222222]">
        <Header activePage="bikes" />

        {/* PAGE HEADER — wie /bikes */}
        <section className="pt-28 pb-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-slide-up">
              <div>
                <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Custom Motorcycles</p>
                <h1 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
                  {styleInfo.name}
                </h1>
                <p className="text-[#222222]/40 text-sm mt-2 max-w-[55ch] leading-relaxed">
                  {styleInfo.description} — kuratierte Custom Builds von verifizierten Buildern.
                </p>
              </div>
              <p className="text-xs text-[#222222]/30 flex-shrink-0">
                <span className="text-[#222222]/60 font-semibold">{filtered.length} Bikes</span>
              </p>
            </div>
          </div>
        </section>

        {/* FILTER BAR — wie /bikes */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
            <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <Link
                href="/bikes"
                className="flex-shrink-0 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all duration-200 border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]"
              >
                Alle
              </Link>
              {ALL_STYLES.map(s => {
                const label = STYLES[s]?.name ?? s
                const isActive = s === slug
                return (
                  <Link
                    key={s}
                    href={`/bikes/${s}`}
                    className={`flex-shrink-0 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all duration-200 ${
                      isActive
                        ? 'bg-[#06a5a5] text-white border-[#DDDDDD]'
                        : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* GRID — 4 Spalten wie /bikes */}
        <section className="py-8 sm:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#222222]/25 text-sm">Noch keine {styleInfo.name} Bikes verfügbar.</p>
                <Link href="/bikes" className="mt-4 inline-block text-xs text-[#717171] hover:text-[#06a5a5] transition-colors">
                  Alle Bikes ansehen →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((build, i) => (
                  <Link
                    key={build.slug}
                    href={`/custom-bike/${build.slug}`}
                    className="card-interactive cursor-pointer group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 opacity-0 animate-slide-up-sm"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={build.coverImg}
                        alt={build.title}
                        loading={i < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-[#222222] text-xs font-semibold">Ansehen →</span>
                      </div>
                      <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {build.style}
                      </span>
                      {build.verified && (
                        <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#222222]/90 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                          <BadgeCheck size={8} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1">{build.title}</h3>
                      <p className="text-[10px] sm:text-xs text-[#222222]/35 mt-1 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                      <p className="text-[10px] text-[#222222]/25 mt-0.5 truncate">{build.builder.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Related builders */}
            {relatedBuilders.length > 0 && (
              <div className="mt-14 pt-10 border-t border-[#222222]/5">
                <h2 className="text-xs font-bold text-[#222222]/40 uppercase tracking-widest mb-5">
                  {styleInfo.name} Custom-Werkstätten
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedBuilders.map(b => (
                    <Link
                      key={b.slug}
                      href={`/custom-werkstatt/${b.slug}`}
                      className="group bg-white border border-[#222222]/6 hover:border-[#222222]/20 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#222222]/10 border border-[#222222]/8 flex items-center justify-center text-xs font-bold text-[#717171]">
                        {b.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#222222]">{b.name}</p>
                        <p className="text-[10px] text-[#222222]/35 mt-0.5">{b.city}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
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

        {/* Related builds */}
        <div className="mt-16 pt-10 border-t border-[#EBEBEB]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[#222222]">Weitere Custom Bikes</h2>
            <Link href="/bikes" className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] hover:text-[#222222] px-3.5 py-1.5 rounded-full transition-all">
              Alle Custom Bikes ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUILDS.slice(0, 3).map(b => (
              <Link
                key={b.slug}
                href={`/custom-bike/${b.slug}`}
                className="group rounded-xl overflow-hidden border border-[#EBEBEB] hover:border-[#DDDDDD] transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                  <Image src={b.coverImg} alt={b.title} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
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
