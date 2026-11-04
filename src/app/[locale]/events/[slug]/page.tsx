import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { MapPin, Calendar, ArrowLeft, ChevronLeft, Navigation } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createPublicClient } from '@/lib/supabase/public'
import { eventDatePhrase, formatEventDate, isAwaitingNextDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import { localizedText } from '@/lib/i18n/localizedText'
import { fitTitle, truncateAtWord } from '@/lib/seo'
import { EVENT_CONTENT } from '@/lib/data/eventContent'
import EventInterestButton from './EventInterestButton'
import EventLocationMap from './EventLocationMap'
import EventGallery from '@/components/events/EventGallery'
import EventVideos from '@/components/events/EventVideos'

// Rendered on first request, then served from the ISR cache
export function generateStaticParams() {
  return []
}

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
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'EventsPage' })
  const supabase = createPublicClient()
  const { data: event } = await (supabase.from('events') as any)
    .select('name, description, image, date_start, date_end, location, name_i18n, description_i18n, location_i18n')
    .eq('slug', slug)
    .maybeSingle()
    .throwOnError() as {
      data: Pick<Event, 'name' | 'description' | 'image' | 'date_start' | 'date_end' | 'location' | 'name_i18n' | 'description_i18n' | 'location_i18n'> | null
    }

  if (!event) return { title: `${t('notFound')} — MotoDigital` }
  const name = localizedText(event.name_i18n, locale, event.name)
  const teaser = localizedText(event.description_i18n, locale, event.description)
  const location = localizedText(event.location_i18n, locale, event.location)
  // People search "<event> <year>" and "<event> datum" — lead with name, year and dates
  const awaiting = isAwaitingNextDate(event, getTodayLocal())
  const year = event.date_start?.slice(0, 4) ?? ''
  const title = awaiting
    ? t('eventMetaTitleTba', { name })
    : fitTitle([t('eventMetaTitle', { name, year }), t('eventMetaTitleShort', { name, year }), `${name} ${year}`])
  const description = truncateAtWord(
    awaiting
      ? t('eventMetaDescriptionTba', { name, location, teaser })
      : t('eventMetaDescription', { name, date: eventDatePhrase(event, locale), teaser }),
    155,
  )
  const ogImage = event.image ?? '/og-image.jpg'
  return {
    title,
    description,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://motodigital.io/events/${slug}`,
      images: [{ url: ogImage, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function getTodayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('EventsPage')
  const supabase = createPublicClient()

  const { data } = await (supabase.from('events') as any)
    .select('id, slug, name, date_start, date_end, location, description, tags, url, image, gallery_images, videos, name_i18n, description_i18n, location_i18n')
    .eq('slug', slug)
    .maybeSingle()
    .throwOnError()

  const rawEvent = data as Event | null
  if (!rawEvent) notFound()
  const event: Event = {
    ...rawEvent,
    name:        localizedText(rawEvent.name_i18n,        locale, rawEvent.name),
    description: localizedText(rawEvent.description_i18n, locale, rawEvent.description),
    location:    localizedText(rawEvent.location_i18n,    locale, rawEvent.location),
  }

  const dateStr = formatEventDate(event)
  // Locale-independent parts of the researched content: map switch and photo licence credit
  const meta = EVENT_CONTENT[event.slug]
  const coords = event.location && !meta?.hideMap ? await geocode(event.location) : null
  const imageCredit = meta?.imageCredit && meta.imageCredit.image === event.image ? meta.imageCredit : null

  const today = getTodayLocal()
  const endDate = event.date_end ?? event.date_start ?? ''
  const isPast = !!endDate && endDate < today
  // Past or undated: show "next date to be announced" instead of a stale date
  const awaiting = isAwaitingNextDate(event, today)
  const dateLabel = awaiting ? t('nextDateTba') : dateStr
  const datePhrase = eventDatePhrase(event, locale)

  const galleryImages = event.gallery_images ?? []
  const videos = event.videos ?? []

  // Researched long-form content (German only); edition-bound facts drop out once the date moves on
  const content = locale === 'de' ? EVENT_CONTENT[event.slug] : undefined
  const forThisEdition = (x: { edition?: string }) => !x.edition || x.edition === event.date_start
  const facts = content?.facts && forThisEdition(content.facts) ? content.facts.items : []
  // "die Custombike-Show" in questions, "Die Custombike-Show" at the start of answers
  const nameInText = content?.nameInText ?? event.name
  const nameAtStart = nameInText.charAt(0).toUpperCase() + nameInText.slice(1)

  // Answers searches like "<event> datum" — visible on the page and as FAQPage data
  const faq: { q: string; a: string; link?: { href: string; host: string } }[] = [
    awaiting
      ? {
          q: t('faqWhenTbaQ', { name: nameInText }),
          a: [t('faqWhenTbaA'), isPast && datePhrase ? t('faqLastEdition', { date: datePhrase }) : ''].filter(Boolean).join(' '),
        }
      : { q: t('faqWhenQ', { name: nameInText, year: event.date_start!.slice(0, 4) }), a: t('faqWhenA', { name: nameAtStart, date: datePhrase }) },
    ...(event.location ? [{ q: t('faqWhereQ', { name: nameInText }), a: t('faqWhereA', { location: event.location }) }] : []),
    ...(content?.faq ?? []).filter(forThisEdition).map(({ q, a }) => ({ q, a })),
    ...(event.url
      ? [{ q: t('faqInfoQ'), a: t('faqInfoA', { site: hostOf(event.url) }), link: { href: event.url, host: hostOf(event.url) } }]
      : []),
  ]

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.io'
  const eventUrl = `${BASE_URL}/events/${event.slug}`
  // Only for an upcoming edition: Event data without a future startDate gets flagged in Search Console
  const eventLd: Record<string, unknown> | null = awaiting ? null : {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    url: eventUrl,
    ...(event.description && { description: String(event.description).slice(0, 5000) }),
    ...(event.date_start && { startDate: event.date_start }),
    ...(event.date_end && { endDate: event.date_end }),
    ...(event.image && { image: [event.image] }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.location && {
      location: {
        '@type': 'Place',
        name: event.location,
        ...(coords && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: coords.lat,
            longitude: coords.lng,
          },
        }),
        address: event.location,
      },
    }),
    // MotoDigital only lists these events — the event itself is organizer/performer
    organizer: {
      '@type': 'Organization',
      name: event.name,
      url: event.url || eventUrl,
    },
    performer: {
      '@type': 'PerformingGroup',
      name: event.name,
    },
    // No ticket prices in our data — point to the official site instead of inventing one
    offers: {
      '@type': 'Offer',
      url: event.url || eventUrl,
      availability: 'https://schema.org/InStock',
      ...(event.date_start && { validFrom: event.date_start }),
    },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MotoDigital', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Events', item: `${BASE_URL}/events` },
      { '@type': 'ListItem', position: 3, name: event.name, item: eventUrl },
    ],
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      {eventLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
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
                  <Calendar size={14} /> {dateLabel}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm px-4 py-2 rounded-full">
                  <MapPin size={14} /> {event.location}
                </span>
              </div>
            </div>
          </div>

          {imageCredit && (
            <p className="absolute bottom-2 right-3 sm:right-5 z-10 text-[10px] text-white/60">
              Foto:{' '}
              <a href={imageCredit.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                {imageCredit.author}
              </a>
              {imageCredit.license && imageCredit.licenseUrl && (
                <>
                  ,{' '}
                  <a href={imageCredit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline hover:text-white">
                    {imageCredit.license}
                  </a>
                </>
              )}
            </p>
          )}
        </div>
      ) : (
        <div className="pt-28" />
      )}

      {/* Mobile-only: Participants + Teilnehmen-Button directly under hero */}
      <section className="lg:hidden px-4 sm:px-5 pt-6">
        <div className="max-w-6xl mx-auto">
          <EventInterestButton eventSlug={event.slug} eventName={event.name} sidebar />
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
                  <Calendar size={14} /> {dateLabel}
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

              {/* At a glance — only facts that belong to the edition on record */}
              {facts.length > 0 && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-[#F7F7F7] border border-[#222222]/6 rounded-2xl p-5 sm:p-6 max-w-[68ch]">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-widest text-[#222222]/40 mb-1">Termin</dt>
                    <dd className="text-sm font-semibold text-[#222222]">{dateLabel}</dd>
                  </div>
                  {facts.map(f => (
                    <div key={f.label}>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-[#222222]/40 mb-1">{f.label}</dt>
                      <dd className="text-sm font-semibold text-[#222222]">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Long-form content */}
              {content?.sections.map(s => (
                <div key={s.heading}>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#222222] mb-4" style={{ letterSpacing: '-0.02em' }}>
                    {s.heading}
                  </h2>
                  <div className="space-y-4 max-w-[68ch]">
                    {s.paragraphs.map(p => (
                      <p key={p.slice(0, 40)} className="text-base text-[#222222]/70 leading-relaxed">{p}</p>
                    ))}
                    {s.list && (
                      <ul className="space-y-2">
                        {s.list.map(item => (
                          <li key={item} className="flex items-start gap-3 text-base text-[#222222]/70 leading-relaxed">
                            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#06a5a5]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}

              {content?.links && (
                <div className="flex flex-wrap gap-2">
                  {content.links.map(l => (
                    <Link
                      key={l.href}
                      href={l.href as any}
                      className="inline-flex items-center gap-1.5 border border-[#222222]/10 hover:border-[#06a5a5] text-sm font-medium text-[#222222] px-4 py-2 rounded-full transition-colors"
                    >
                      <span className="text-[#06a5a5]">→</span> {l.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* FAQ */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#222222] mb-5" style={{ letterSpacing: '-0.02em' }}>
                  {t('faqTitle')}
                </h2>
                <dl className="space-y-5 max-w-[68ch]">
                  {faq.map(f => (
                    <div key={f.q} className="border-b border-[#222222]/6 pb-5 last:border-0 last:pb-0">
                      <dt className="text-base font-semibold text-[#222222] mb-1.5">{f.q}</dt>
                      <dd className="text-[15px] text-[#222222]/65 leading-relaxed">
                        {f.link ? (
                          <>
                            {f.a.slice(0, f.a.indexOf(f.link.host))}
                            <a href={f.link.href} target="_blank" rel="noopener noreferrer" className="text-[#06a5a5] hover:text-[#058f8f] font-medium">
                              {f.link.host}
                            </a>
                            {f.a.slice(f.a.indexOf(f.link.host) + f.link.host.length)}
                          </>
                        ) : f.a}
                      </dd>
                    </div>
                  ))}
                </dl>
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
              <EventInterestButton eventSlug={event.slug} eventName={event.name} sidebar />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
