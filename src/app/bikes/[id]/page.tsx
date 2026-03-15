import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import ContactButton from '@/components/messaging/ContactButton'
import type { Database } from '@/types/database'

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
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: bike } = await supabase
    .from('bikes')
    .select('title, make, model, year, price')
    .eq('id', id)
    .maybeSingle() as { data: Pick<BikeRow, 'title' | 'make' | 'model' | 'year' | 'price'> | null, error: unknown }

  if (!bike) return { title: 'Bike nicht gefunden' }

  return {
    title: `${bike.title} — ${formatPrice(bike.price)}`,
    description: `${bike.make} ${bike.model} ${bike.year} auf MotoDigital`,
  }
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Other',
}

export default async function BikeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: bike } = await supabase
    .from('bikes')
    .select(`
      *,
      bike_images ( id, url, position, is_cover ),
      profiles:seller_id ( id, username, full_name, avatar_url, is_verified, created_at ),
      workshops:workshop_id ( id, name, slug, logo_url, city, avg_rating )
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single() as { data: BikeWithRelations | null, error: unknown }

  if (!bike) notFound()

  // Increment view count (fire and forget)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(supabase.from('bikes') as any)
    .update({ view_count: (bike.view_count ?? 0) + 1 })
    .eq('id', id)
    .then(() => {})

  const images = [...(bike.bike_images ?? [])].sort((a, b) => a.position - b.position)
  const seller = bike.profiles
  const workshop = bike.workshops

  const specs = [
    { label: 'Marke', value: bike.make },
    { label: 'Modell', value: bike.model },
    { label: 'Baujahr', value: bike.year },
    { label: 'Typ', value: STYLE_LABELS[bike.style] ?? bike.style },
    bike.cc        ? { label: 'Hubraum', value: `${bike.cc} cc` } : null,
    bike.mileage_km ? { label: 'Kilometerstand', value: `${bike.mileage_km.toLocaleString('de-DE')} km` } : null,
    bike.city      ? { label: 'Standort', value: bike.city } : null,
  ].filter(Boolean) as { label: string; value: string | number }[]

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">

        {/* Breadcrumb */}
        <Link href="/map" className="inline-flex items-center gap-1.5 text-sm text-creme/40 hover:text-creme mb-6 transition-colors">
          <ChevronLeft size={14} />
          Zurück zur Suche
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Left */}
          <div className="flex flex-col gap-4">

            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-bg-2 border border-creme/6">
              <div className="relative aspect-[4/3] bg-bg-3">
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
                <span className="absolute top-3 left-3 bg-bg/75 backdrop-blur-sm border border-creme/15 text-creme text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {STYLE_LABELS[bike.style]}
                </span>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.slice(1).map((img) => (
                    <div key={img.id} className="relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-creme/10">
                      <Image src={img.url} alt="" fill className="object-cover" sizes="64px"/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div className="bg-bg-2 border border-creme/6 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-bold text-creme">{bike.title}</h1>
                    {bike.is_verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">
                        <BadgeCheck size={11} /> Verifiziert
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-creme/40">
                    {bike.year} · {STYLE_LABELS[bike.style]} · {bike.city}
                  </p>
                </div>
                <p className="text-2xl font-bold text-creme flex-shrink-0">{formatPrice(bike.price)}</p>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {specs.map(s => (
                  <div key={s.label} className="bg-bg-3 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-creme/35 uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className="text-sm font-medium text-creme">{s.value}</p>
                  </div>
                ))}
              </div>

              {bike.description && (
                <p className="text-sm text-creme/55 leading-relaxed">{bike.description}</p>
              )}
            </div>

          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-3">

            {/* Price + CTA */}
            <div className="bg-bg-2 border border-creme/6 rounded-2xl p-5">
              <p className="text-2xl font-bold text-creme mb-0.5">{formatPrice(bike.price)}</p>
              <p className="text-xs text-creme/35 mb-4">
                {workshop ? 'Builder-Inserat' : 'Privates Inserat'} · {formatRelativeTime(bike.created_at)}
              </p>
              <div className="flex flex-col gap-2">
                <ContactButton bikeId={bike.id} sellerId={seller?.id ?? ''} />
                <button className="w-full py-2.5 text-sm border border-creme/15 rounded-full text-creme/70 hover:text-creme hover:border-creme/30 transition-all">
                  Speichern
                </button>
              </div>
              <p className="text-xs text-creme/20 text-center mt-3">Kontaktdaten werden nur dem Verkäufer gezeigt</p>
            </div>

            {/* Seller / Workshop */}
            <div className="bg-bg-2 border border-creme/6 rounded-2xl p-5">
              {workshop ? (
                <>
                  <p className="text-xs text-creme/35 uppercase tracking-widest mb-3">Builder</p>
                  <Link href={`/workshops/${workshop.slug}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-teal/15 border border-teal/20 flex items-center justify-center text-sm font-bold text-teal flex-shrink-0">
                      {workshop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-creme group-hover:text-teal transition-colors">{workshop.name}</p>
                      <p className="text-xs text-creme/35">{workshop.city}</p>
                    </div>
                  </Link>
                </>
              ) : seller && (
                <>
                  <p className="text-xs text-creme/35 uppercase tracking-widest mb-3">Verkäufer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-3 border border-creme/10 flex items-center justify-center text-sm font-bold text-creme/60 flex-shrink-0">
                      {(seller.full_name ?? seller.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-creme">{seller.full_name ?? seller.username}</p>
                        {seller.is_verified && <BadgeCheck size={13} className="text-teal" />}
                      </div>
                      <p className="text-xs text-creme/35">Privater Verkäufer</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Location */}
            {bike.city && (
              <div className="bg-bg-2 border border-creme/6 rounded-2xl p-5">
                <p className="text-xs text-creme/35 uppercase tracking-widest mb-2">Standort</p>
                <div className="h-20 bg-bg-3 rounded-xl border border-creme/8 flex items-center justify-center mb-2">
                  <span className="text-xs text-creme/20">Karte — Mapbox placeholder</span>
                </div>
                <p className="text-sm text-creme flex items-center gap-1.5">
                  <MapPin size={12} className="text-creme/40" />
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
