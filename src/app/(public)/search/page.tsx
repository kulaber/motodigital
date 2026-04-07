import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

export const metadata: Metadata = {
  title: 'Suchergebnisse — MotoDigital',
  description: 'Suche nach Custom Bikes, Werkstätten und Events auf MotoDigital.',
}

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------
interface BikeRow {
  id: string
  title: string
  make: string
  model: string
  city: string | null
  slug: string | null
  style: string
  price: number
  bike_images: { url: string; is_cover: boolean; position: number }[]
}

interface BuilderRow {
  id: string
  full_name: string | null
  city: string | null
  specialty: string | null
  slug: string
  avatar_url: string | null
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  let bikes: BikeRow[] = []
  let builders: BuilderRow[] = []

  if (query.length >= 2) {
    const supabase = await createClient()
    const pattern = `%${query}%`

    const [bikeRes, builderRes] = await Promise.all([
      (supabase.from('bikes') as any)
        .select('id, title, make, model, city, slug, style, price, bike_images(url, is_cover, position)')
        .eq('status', 'active')
        .or(`title.ilike.${pattern},make.ilike.${pattern},model.ilike.${pattern},city.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(12),

      (supabase.from('profiles') as any)
        .select('id, full_name, city, specialty, slug, avatar_url')
        .eq('role', 'custom-werkstatt')
        .not('slug', 'is', null)
        .or(`full_name.ilike.${pattern},city.ilike.${pattern},specialty.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(12),
    ])

    bikes = (bikeRes.data ?? []) as BikeRow[]
    builders = (builderRes.data ?? []) as BuilderRow[]
  }

  // Search events from Supabase
  let matchedEvents: Event[] = []
  if (query.length >= 2) {
    const supabase = await createClient()
    const pattern = `%${query}%`
    const { data: eventData } = await (supabase.from('events') as any)
      .select('id, slug, name, date_start, date_end, location, description, tags, url, image')
      .or(`name.ilike.${pattern},location.ilike.${pattern}`)
      .order('date_start', { ascending: true })
      .limit(6)

    matchedEvents = (eventData ?? []) as Event[]
  }

  const totalResults = bikes.length + builders.length + matchedEvents.length

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      <section className="pt-28 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#222222]/40 hover:text-[#222222]/60 transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Zurück
          </Link>

          <h1
            className="font-bold text-[#222222] leading-tight mb-2"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}
          >
            {query ? (
              <>Ergebnisse für &ldquo;{query}&rdquo;</>
            ) : (
              'Suche'
            )}
          </h1>
          <p className="text-sm text-[#222222]/40 mb-10">
            {query
              ? `${totalResults} Ergebnis${totalResults !== 1 ? 'se' : ''} gefunden`
              : 'Gib einen Suchbegriff ein, um Bikes, Werkstätten und Events zu finden.'}
          </p>
        </div>
      </section>

      {/* ── Bikes ── */}
      {bikes.length > 0 && (
        <section className="pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-bold text-[#222222]">Custom Bikes</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#06a5a5] text-white">
                {bikes.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bikes.map((bike) => {
                const imgs = bike.bike_images ?? []
                const cover =
                  imgs.find((i) => i.is_cover)?.url ??
                  imgs.sort((a, z) => a.position - z.position)[0]?.url
                const href = `/custom-bike/${bike.slug ?? generateBikeSlug(bike.title, bike.id)}`
                return (
                  <Link
                    key={bike.id}
                    href={href}
                    className="group block rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-200"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7] rounded-t-2xl">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={bike.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#222222]/10 text-sm">
                          Kein Bild
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {bike.style}
                      </span>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1 mb-0.5">
                        {bike.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">
                        {bike.make} {bike.model} {bike.city ? `· ${bike.city}` : ''}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Workshops ── */}
      {builders.length > 0 && (
        <section className="pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-bold text-[#222222]">Custom Werkstätten</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#1A1A1A] text-white">
                {builders.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {builders.map((w) => (
                <Link
                  key={w.id}
                  href={`/custom-werkstatt/${w.slug}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-200"
                >
                  {w.avatar_url ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#F7F7F7]">
                      <Image src={w.avatar_url} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[#F7F7F7] flex items-center justify-center">
                      <span className="text-sm font-bold text-[#222222]/15">
                        {(w.full_name ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#222222] truncate">
                      {w.full_name ?? 'Unbekannt'}
                    </h3>
                    <p className="text-xs text-[#222222]/35 truncate">
                      {[w.specialty, w.city].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Events ── */}
      {matchedEvents.length > 0 && (
        <section className="pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-bold text-[#222222]">Events</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#F59E0B] text-white">
                {matchedEvents.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {matchedEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group bg-white border border-[#222222]/6 hover:border-[#222222]/20 rounded-2xl p-6 transition-all duration-200 block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-[#222222] mb-2">{event.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <span className="flex items-center gap-1.5 text-xs text-[#717171]">
                          <Calendar size={12} /> {formatEventDate(event)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#222222]/40">
                          <MapPin size={12} /> {event.location}
                        </span>
                      </div>
                      <p className="text-sm text-[#222222]/45 leading-relaxed max-w-2xl line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── No results ── */}
      {query.length >= 2 && totalResults === 0 && (
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 text-center">
            <p className="text-[#222222]/30 text-sm">
              Keine Ergebnisse für &ldquo;{query}&rdquo; gefunden.
            </p>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
