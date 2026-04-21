import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { MapPin, Calendar, ArrowLeft, ChevronLeft, Navigation } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import { localizedText } from '@/lib/i18n/localizedText'
import EventInterestButton from './EventInterestButton'
import EventLocationMap from './EventLocationMap'
import EventGallery from '@/components/events/EventGallery'
import EventVideos from '@/components/events/EventVideos'

export const revalidate = 3600 // ISR: event details change infrequently

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
  const locale = await getLocale()
  const t = await getTranslations('EventsPage')
  const supabase = await createClient()
  const { data: event } = await (supabase.from('events') as any)
    .select('name, description, name_i18n, description_i18n')
    .eq('slug', slug)
    .maybeSingle() as {
      data: {
        name: string
        description: string
        name_i18n?: Record<string, string> | null
        description_i18n?: Record<string, string> | null
      } | null
    }

  if (!event) return { title: `${t('notFound')} — MotoDigital` }
  const name = localizedText(event.name_i18n, locale, event.name)
  const description = localizedText(event.description_i18n, locale, event.description)
  return {
    title: `${name} — MotoDigital`,
    description,
  }
}

function getTodayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('EventsPage')
  const supabase = await createClient()

  // Try with new columns first; fall back if migrations haven't fully run yet
  let { data, error } = await (supabase.from('events') as any)
    .select('id, slug, name, date_start, date_end, location, description, tags, url, image, gallery_images, videos, name_i18n, description_i18n, location_i18n')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    const fallback = await (supabase.from('events') as any)
      .select('id, slug, name, date_start, date_end, location, description, tags, url, image')
      .eq('slug', slug)
      .maybeSingle()
    data = fallback.data
  }

  const rawEvent = data as Event | null
  if (!rawEvent) notFound()
  const event: Event = {
    ...rawEvent,
    name:        localizedText(rawEvent.name_i18n,        locale, rawEvent.name),
    description: localizedText(rawEvent.description_i18n, locale, rawEvent.description),
    location:    localizedText(rawEvent.location_i18n,    locale, rawEvent.location),
  }

  const { data: { user } } = await supabase.auth.getUser()
  const dateStr = formatEventDate(event)
  const coords = event.location ? await geocode(event.location) : null

  const today = getTodayLocal()
  const endDate = event.date_end ?? event.date_start ?? ''
  const isPast = !!endDate && endDate < today

  const galleryImages = event.gallery_images ?? []
  const videos = event.videos ?? []

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="events" />

      {/* Hero Image — taller, more prominent */}
      {event.image ? (
        <div className="relative w-full h-[68vh] min-h-[440px] max-h-[680px] overflow-hidden">
          <Image
            src={event.image}
            alt={event.name}
            fill
            priority
            className={`object-cover ${isPast ? 'grayscale opacity-80' : ''}`}
            sizes="100vw"
          />
          {/* Stronger bottom gradient for legibility on tall hero */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />

          {/* Mobile: Back button */}
          <div className="sm:hidden absolute top-0 left-0 right-0 z-10 pt-4 px-4">
            <Link href="/events"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[#222] hover:bg-white transition-all"
              aria-label={t('back')}>
              <ChevronLeft size={20} />
            </Link>
          </div>

          {/* Desktop: Back link */}
          <div className="hidden sm:block absolute top-0 left-0 right-0 pt-5 px-4 sm:px-5 lg:px-8 z-10">
            <div className="max-w-6xl mx-auto">
              <Link href="/events"
                className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors">
                <ArrowLeft size={13} /> {t('allEvents')}
              </Link>
            </div>
          </div>

          {/* Bottom: Event title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 lg:px-8 pb-8 sm:pb-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isPast && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 text-white/90 border border-white/20">
                    {t('past')}
                  </span>
                )}
                {event.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/15 text-white/80 border border-white/20">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-bold text-white leading-[1.05] mb-5" style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)', letterSpacing: '-0.035em' }}>
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm px-4 py-2 rounded-full">
                  <Calendar size={14} /> {dateStr}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm px-4 py-2 rounded-full">
                  <MapPin size={14} /> {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-28" />
      )}

      {/* Mobile-only: Participants + Teilnehmen-Button directly under hero */}
      <section className="lg:hidden px-4 sm:px-5 pt-6">
        <div className="max-w-6xl mx-auto">
          <EventInterestButton eventSlug={event.slug} eventName={event.name} userId={user?.id ?? null} sidebar />
        </div>
      </section>

      <section className="pt-12 sm:pt-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">

          {/* Back (only when no hero image) */}
          {!event.image && (
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] hover:text-[#222222] transition-colors mb-8"
            >
              <ArrowLeft size={14} /> {t('allEvents')}
            </Link>
          )}

          {/* Tags/Title/Meta (only when no hero image) */}
          {!event.image && (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isPast && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#222222]/5 text-[#222222]/55 border border-[#222222]/10">
                    {t('past')}
                  </span>
                )}
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12 items-start">

            {/* Left: Description, Gallery, Videos, Map */}
            <div className="min-w-0 space-y-14">

              {/* Intro */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#222222] mb-4" style={{ letterSpacing: '-0.02em' }}>
                  {t('aboutEvent')}
                </h2>
                <p className="text-base text-[#222222]/70 leading-relaxed max-w-[68ch]">
                  {event.description}
                </p>
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div>
                  <EventGallery images={galleryImages} title={event.name} />
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div>
                  <EventVideos videos={videos} title={event.name} />
                </div>
              )}

              {/* Location map */}
              {coords && (
                <div>
                  <div className="flex items-end justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#222222]" style={{ letterSpacing: '-0.02em' }}>
                        {t('location')}
                      </h2>
                      <p className="text-sm text-[#717171] mt-1">{event.location}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06a5a5] hover:text-[#058f8f] border border-[#06a5a5]/20 hover:border-[#06a5a5]/40 px-3.5 py-2 rounded-full transition-all flex-shrink-0"
                    >
                      <Navigation size={11} /> {t('planRoute')}
                    </a>
                  </div>
                  <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
                    <EventLocationMap lat={coords.lat} lng={coords.lng} locationName={event.location} />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Participants (sticky) — desktop only, mobile version is above the content */}
            <div className="hidden lg:block lg:sticky lg:top-24">
              <EventInterestButton eventSlug={event.slug} eventName={event.name} userId={user?.id ?? null} sidebar />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
