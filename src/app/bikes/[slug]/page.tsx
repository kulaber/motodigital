import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import ContactButton from '@/components/messaging/ContactButton'
import type { Database } from '@/types/database'
import { BUILDS } from '@/lib/data/builds'
import { BUILDERS } from '@/lib/data/builders'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import Header from '@/components/layout/Header'

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
      *,
      bike_images ( id, url, position, is_cover ),
      profiles:seller_id ( id, username, full_name, avatar_url, is_verified, created_at ),
      workshops:workshop_id ( id, name, slug, logo_url, city, avg_rating )
    `)
    .eq('id', slug)
    .eq('status', 'active')
    .single() as { data: BikeWithRelations | null; error: unknown }

  if (!bike) notFound()

  ;(supabase.from('bikes') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .update({ view_count: (bike.view_count ?? 0) + 1 })
    .eq('id', slug)
    .then(() => {})

  const images = [...(bike.bike_images ?? [])].sort((a, b) => a.position - b.position)
  const seller = bike.profiles
  const workshop = bike.workshops

  const specs = [
    { label: 'Marke', value: bike.make },
    { label: 'Modell', value: bike.model },
    { label: 'Baujahr', value: bike.year },
    { label: 'Typ', value: STYLE_LABELS[bike.style] ?? bike.style },
    bike.cc         ? { label: 'Hubraum',       value: `${bike.cc} cc` } : null,
    bike.mileage_km ? { label: 'Kilometerstand', value: `${bike.mileage_km.toLocaleString('de-DE')} km` } : null,
    bike.city       ? { label: 'Standort',       value: bike.city } : null,
  ].filter(Boolean) as { label: string; value: string | number }[]

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">

        <Link href="/bikes" className="inline-flex items-center gap-1.5 text-sm text-[#222222]/40 hover:text-[#222222] mb-6 transition-colors">
          <ChevronLeft size={14} />
          Zurück zur Suche
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Left */}
          <div className="flex flex-col gap-4">

            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-white border border-[#222222]/6">
              <div className="relative aspect-[4/3] bg-white">
                {images[0] ? (
                  <Image src={images[0].url} alt={bike.title} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 700px"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <svg width="80" height="56" viewBox="0 0 80 56" fill="none">
                      <circle cx="14" cy="44" r="11" stroke="white" strokeWidth="1.5"/>
                      <circle cx="66" cy="44" r="11" stroke="white" strokeWidth="1.5"/>
                      <path d="M14 44 L28 18 L42 20 L56 14 L66 44" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/75 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {STYLE_LABELS[bike.style]}
                </span>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.slice(1).map((img) => (
                    <div key={img.id} className="relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-[#222222]/10">
                      <Image src={img.url} alt="" fill className="object-cover" sizes="64px"/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-bold text-[#222222]">{bike.title}</h1>
                    {bike.is_verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">
                        <BadgeCheck size={11} /> Verifiziert
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#222222]/40">
                    {bike.year} · {STYLE_LABELS[bike.style]} · {bike.city}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#222222] flex-shrink-0">{formatPrice(bike.price)}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {specs.map(s => (
                  <div key={s.label} className="bg-white rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-[#222222]/35 uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className="text-sm font-medium text-[#222222]">{s.value}</p>
                  </div>
                ))}
              </div>

              {bike.description && (
                <p className="text-sm text-[#222222]/55 leading-relaxed">{bike.description}</p>
              )}
            </div>

          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-3">

            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <p className="text-2xl font-bold text-[#222222] mb-0.5">{formatPrice(bike.price)}</p>
              <p className="text-xs text-[#222222]/35 mb-4">
                {workshop ? 'Builder-Inserat' : 'Privates Inserat'} · {formatRelativeTime(bike.created_at)}
              </p>
              <div className="flex flex-col gap-2">
                <ContactButton bikeId={bike.id} sellerId={seller?.id ?? ''} />
                <button className="w-full py-2.5 text-sm border border-[#222222]/15 rounded-full text-[#222222]/70 hover:text-[#222222] hover:border-[#222222]/30 transition-all">
                  Speichern
                </button>
              </div>
              <p className="text-xs text-[#222222]/20 text-center mt-3">Kontaktdaten werden nur dem Verkäufer gezeigt</p>
            </div>

            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              {workshop ? (
                <>
                  <p className="text-xs text-[#222222]/35 uppercase tracking-widest mb-3">Builder</p>
                  <Link href={`/custom-werkstatt/${workshop.slug}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-[#222222]/15 border border-[#DDDDDD]/20 flex items-center justify-center text-sm font-bold text-[#717171] flex-shrink-0">
                      {workshop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#222222] group-hover:text-[#717171] transition-colors">{workshop.name}</p>
                      <p className="text-xs text-[#222222]/35">{workshop.city}</p>
                    </div>
                  </Link>
                </>
              ) : seller && (
                <>
                  <p className="text-xs text-[#222222]/35 uppercase tracking-widest mb-3">Verkäufer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#222222]/10 flex items-center justify-center text-sm font-bold text-[#222222]/60 flex-shrink-0">
                      {(seller.full_name ?? seller.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#222222]">{seller.full_name ?? seller.username}</p>
                        {seller.is_verified && <BadgeCheck size={13} className="text-[#717171]" />}
                      </div>
                      <p className="text-xs text-[#222222]/35">Privater Verkäufer</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {bike.city && (
              <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
                <p className="text-xs text-[#222222]/35 uppercase tracking-widest mb-2">Standort</p>
                <p className="text-sm text-[#222222] flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#222222]/40" />
                  {bike.city}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
