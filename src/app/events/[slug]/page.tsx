import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, ArrowLeft, ChevronLeft, Navigation } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import EventInterestButton from './EventInterestButton'
import EventLocationMap from './EventLocationMap'

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&types=place,address,region&language=de`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const [lng, lat] = json.features?.[0]?.center ?? []
    if (!lng || !lat) return null
    return { lat, lng }
  } catch { return null }
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await (supabase.from('events') as any)
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle() as { data: { name: string; description: string } | null }

  if (!event) return { title: 'Event nicht gefunden — MotoDigital' }
  return {
    title: `${event.name} — MotoDigital`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await (supabase.from('events') as any)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  const event = data as Event | null
  if (!event) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const dateStr = formatEventDate(event)
  const coords = event.location ? await geocode(event.location) : null

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="events" />

      {/* Hero Image */}
      {event.image ? (
        <div className="relative w-full h-[52vh] min-h-[340px] max-h-[520px] overflow-hidden">
          <Image
            src={event.image}
            alt={event.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          {/* Mobile: Back button */}
          <div className="sm:hidden absolute top-0 left-0 right-0 z-10 pt-4 px-4">
            <Link href="/events"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[#222] hover:bg-white transition-all"
              aria-label="Zurück">
              <ChevronLeft size={20} />
            </Link>
          </div>

          {/* Desktop: Back link */}
          <div className="hidden sm:block absolute top-0 left-0 right-0 pt-4 px-4 sm:px-5 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <Link href="/events"
                className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={13} /> Alle Events
              </Link>
            </div>
          </div>

          {/* Bottom: Event title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 lg:px-8 pb-6 sm:pb-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {event.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 text-white/80 border border-white/20">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-bold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}>
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm px-4 py-2 rounded-full">
                  <Calendar size={14} /> {dateStr}
                </span>
                <span className="flex items-center gap-2 text-sm text-white/75">
                  <MapPin size={15} /> {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-28" />
      )}

      <section className="pt-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">

          {/* Back (only when no hero image) */}
          {!event.image && (
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] hover:text-[#222222] transition-colors mb-8"
            >
              <ArrowLeft size={14} /> Alle Events
            </Link>
          )}

          {/* Tags/Title/Meta (only when no hero image) */}
          {!event.image && (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {event.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-bold text-[#222222] leading-tight mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}>
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 bg-[#06a5a5]/8 border border-[#06a5a5]/15 text-[#06a5a5] font-semibold text-sm px-4 py-2 rounded-full">
                  <Calendar size={14} /> {dateStr}
                </span>
                <span className="flex items-center gap-2 text-sm text-[#717171]">
                  <MapPin size={15} /> {event.location}
                </span>
              </div>
            </>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

            {/* Left: Description + Link + Map */}
            <div>
              <div className="prose prose-sm max-w-none">
                <p className="text-base text-[#222222]/70 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 bg-[#06a5a5] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#058f8f] transition-colors"
                >
                  Offizielle Website →
                </a>
              )}

              {/* Location map */}
              {coords && (
                <div className="mt-6 bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
                  <div className="px-5 pt-4 pb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#06a5a5]" /> Standort
                      </h3>
                      <p className="text-sm text-[#222222]/60 mt-1">{event.location}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06a5a5] hover:text-[#058f8f] border border-[#06a5a5]/20 hover:border-[#06a5a5]/40 px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                    >
                      <Navigation size={11} /> Route planen
                    </a>
                  </div>
                  <EventLocationMap lat={coords.lat} lng={coords.lng} locationName={event.location} />
                </div>
              )}
            </div>

            {/* Right: Participants (sticky) */}
            <div className="lg:sticky lg:top-24">
              <EventInterestButton eventSlug={event.slug} userId={user?.id ?? null} sidebar />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
