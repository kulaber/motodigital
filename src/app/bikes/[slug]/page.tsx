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

    return (
      <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
        {/* Hero */}
        <div className="relative border-b border-[#F0EDE4]/5 pt-16 pb-14 px-5 lg:px-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C8A96E]/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto relative">
            <Breadcrumbs crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Bikes', href: '/bikes' },
              { label: styleInfo.name },
            ]} />
            <div className="mt-5">
              <span className="text-xs font-semibold text-[#C8A96E] uppercase tracking-widest">Custom Style</span>
              <h1 className="font-bold text-[#F0EDE4] mt-2 mb-3" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em' }}>
                {styleInfo.name} Motorcycles
              </h1>
              <p className="text-[#F0EDE4]/45 text-sm max-w-xl">
                {styleInfo.description} — kuratierte Custom Builds von verifizierten Buildern weltweit.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10">

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[#F0EDE4]/40">
              <span className="text-[#F0EDE4] font-semibold">{filtered.length}</span> {styleInfo.name} Bikes
            </p>
            <Link href="/bikes" className="text-xs text-[#C8A96E] hover:text-[#D4B87A] transition-colors">
              ← Alle Stile
            </Link>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {filtered.map(build => (
                <Link
                  key={build.slug}
                  href={`/custom-bike/${build.slug}`}
                  className="group rounded-2xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={build.coverImg}
                      alt={build.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                    {build.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-[#C8A96E]/90 text-[#141414] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                        <BadgeCheck size={9} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#C8A96E] font-semibold mb-1">{build.base}</p>
                    <p className="text-sm font-semibold text-[#F0EDE4] line-clamp-1 mb-1">{build.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#F0EDE4]/35">{build.city} · {build.buildYear}</p>
                      <p className="text-sm font-bold text-[#F0EDE4]">{build.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#F0EDE4]/30">
              <p className="text-base">Noch keine {styleInfo.name} Bikes verfügbar.</p>
              <Link href="/bikes" className="mt-4 inline-block text-sm text-[#C8A96E] hover:text-[#D4B87A]">
                Alle Bikes ansehen →
              </Link>
            </div>
          )}

          {/* Related builders */}
          {relatedBuilders.length > 0 && (
            <div className="border-t border-[#F0EDE4]/5 pt-10">
              <h2 className="text-base font-semibold text-[#F0EDE4] mb-5">
                {styleInfo.name} Builder
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedBuilders.map(b => (
                  <Link
                    key={b.slug}
                    href={`/builder/${b.slug}`}
                    className="group bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#C8A96E]/30 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#C8A96E]/10 border border-[#C8A96E]/20 flex items-center justify-center text-sm font-bold text-[#C8A96E]">
                      {b.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#F0EDE4]">{b.name}</p>
                      <p className="text-[10px] text-[#F0EDE4]/35 mt-0.5">{b.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
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
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">

        <Link href="/bikes" className="inline-flex items-center gap-1.5 text-sm text-[#F0EDE4]/40 hover:text-[#F0EDE4] mb-6 transition-colors">
          <ChevronLeft size={14} />
          Zurück zur Suche
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Left */}
          <div className="flex flex-col gap-4">

            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6">
              <div className="relative aspect-[4/3] bg-[#1C1C1C]">
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
                <span className="absolute top-3 left-3 bg-[#141414]/75 backdrop-blur-sm border border-[#F0EDE4]/15 text-[#F0EDE4] text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {STYLE_LABELS[bike.style]}
                </span>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.slice(1).map((img) => (
                    <div key={img.id} className="relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-[#F0EDE4]/10">
                      <Image src={img.url} alt="" fill className="object-cover" sizes="64px"/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-bold text-[#F0EDE4]">{bike.title}</h1>
                    {bike.is_verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">
                        <BadgeCheck size={11} /> Verifiziert
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#F0EDE4]/40">
                    {bike.year} · {STYLE_LABELS[bike.style]} · {bike.city}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#F0EDE4] flex-shrink-0">{formatPrice(bike.price)}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {specs.map(s => (
                  <div key={s.label} className="bg-[#141414] rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-[#F0EDE4]/35 uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className="text-sm font-medium text-[#F0EDE4]">{s.value}</p>
                  </div>
                ))}
              </div>

              {bike.description && (
                <p className="text-sm text-[#F0EDE4]/55 leading-relaxed">{bike.description}</p>
              )}
            </div>

          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-3">

            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
              <p className="text-2xl font-bold text-[#F0EDE4] mb-0.5">{formatPrice(bike.price)}</p>
              <p className="text-xs text-[#F0EDE4]/35 mb-4">
                {workshop ? 'Builder-Inserat' : 'Privates Inserat'} · {formatRelativeTime(bike.created_at)}
              </p>
              <div className="flex flex-col gap-2">
                <ContactButton bikeId={bike.id} sellerId={seller?.id ?? ''} />
                <button className="w-full py-2.5 text-sm border border-[#F0EDE4]/15 rounded-full text-[#F0EDE4]/70 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/30 transition-all">
                  Speichern
                </button>
              </div>
              <p className="text-xs text-[#F0EDE4]/20 text-center mt-3">Kontaktdaten werden nur dem Verkäufer gezeigt</p>
            </div>

            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
              {workshop ? (
                <>
                  <p className="text-xs text-[#F0EDE4]/35 uppercase tracking-widest mb-3">Builder</p>
                  <Link href={`/builder/${workshop.slug}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-[#C8A96E]/15 border border-[#C8A96E]/20 flex items-center justify-center text-sm font-bold text-[#C8A96E] flex-shrink-0">
                      {workshop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F0EDE4] group-hover:text-[#C8A96E] transition-colors">{workshop.name}</p>
                      <p className="text-xs text-[#F0EDE4]/35">{workshop.city}</p>
                    </div>
                  </Link>
                </>
              ) : seller && (
                <>
                  <p className="text-xs text-[#F0EDE4]/35 uppercase tracking-widest mb-3">Verkäufer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#F0EDE4]/10 flex items-center justify-center text-sm font-bold text-[#F0EDE4]/60 flex-shrink-0">
                      {(seller.full_name ?? seller.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#F0EDE4]">{seller.full_name ?? seller.username}</p>
                        {seller.is_verified && <BadgeCheck size={13} className="text-[#C8A96E]" />}
                      </div>
                      <p className="text-xs text-[#F0EDE4]/35">Privater Verkäufer</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {bike.city && (
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                <p className="text-xs text-[#F0EDE4]/35 uppercase tracking-widest mb-2">Standort</p>
                <p className="text-sm text-[#F0EDE4] flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#F0EDE4]/40" />
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
