import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createPublicClient } from '@/lib/supabase/public'
import type { Event } from '@/lib/data/events'
import { eventDatePhrase, formatEventDate, isAwaitingNextDate } from '@/lib/data/events'
import { EVENT_CONTENT, EVENT_HUB_FAQ_STATIC, EVENT_HUB_GROUPS } from '@/lib/data/eventContent'
import { localizedText } from '@/lib/i18n/localizedText'
import EventsClient from './EventsClient'

type HubGroup = { heading: string; intro: string; items: { slug: string; name: string; when: string; location: string }[] }

/**
 * German-only SEO overview under the list: events grouped by kind, plus an FAQ
 * whose dates come from the rows, so the text never goes stale.
 */
function buildHub(events: Event[], today: string) {
  const bySlug = new Map(events.map(e => [e.slug, e]))
  const byDate = (a: Event, b: Event) => (a.date_start ?? '9999').localeCompare(b.date_start ?? '9999')
  const item = (e: Event) => ({
    slug: e.slug,
    name: e.name,
    when: isAwaitingNextDate(e, today) ? 'Termin folgt' : formatEventDate(e),
    location: e.location,
  })

  const grouped = new Set(EVENT_HUB_GROUPS.flatMap(g => g.slugs))
  const groups: HubGroup[] = EVENT_HUB_GROUPS.map(g => ({
    heading: g.heading,
    intro: g.intro,
    items: g.slugs.map(s => bySlug.get(s)).filter((e): e is Event => !!e).sort(byDate).map(item),
  }))
  const rest = events.filter(e => !grouped.has(e.slug)).sort(byDate)
  if (rest.length) groups.push({ heading: 'Weitere Events', intro: '', items: rest.map(item) })

  // "Which fairs are next?" — upcoming fairs in date order, named as in running text
  const nextFairs = (EVENT_HUB_GROUPS[0]?.slugs ?? [])
    .map(s => bySlug.get(s))
    .filter((e): e is Event => !!e && !isAwaitingNextDate(e, today))
    .sort(byDate)
    .map(e => `${EVENT_CONTENT[e.slug]?.nameInText ?? e.name} ${eventDatePhrase(e, 'de')}`)
  const list = nextFairs.length > 1 ? `${nextFairs.slice(0, -1).join(', ')} und ${nextFairs[nextFairs.length - 1]}` : nextFairs[0]

  const faq = [
    ...(list ? [{ q: 'Welche Motorradmessen stehen als Nächstes an?', a: `Die nächsten Termine: ${list}.` }] : []),
    ...EVENT_HUB_FAQ_STATIC,
  ]
  return { groups: groups.filter(g => g.items.length > 0), faq }
}

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'EventsPage' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/events' },
  }
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('EventsPage')
  const supabase = createPublicClient()
  const { data } = await (supabase.from('events') as any)
    .select('id, slug, name, date_start, date_end, location, description, tags, url, image, name_i18n, description_i18n, location_i18n')
    .order('date_start', { ascending: true })
    .limit(200)
    .throwOnError()

  const rawEvents = (data ?? []) as Event[]
  // Resolve i18n JSONB fields server-side so client code stays locale-agnostic.
  const events: Event[] = rawEvents.map((e) => ({
    ...e,
    name:        localizedText(e.name_i18n,        locale, e.name),
    description: localizedText(e.description_i18n, locale, e.description),
    location:    localizedText(e.location_i18n,    locale, e.location),
  }))

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://motodigital.io'

  const today = new Date().toISOString().slice(0, 10)
  const hub = locale === 'de' ? buildHub(events, today) : null
  const hubFaqLd = hub && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hub.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  const eventListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('heading'),
    url: `${BASE_URL}/events`,
    numberOfItems: events.length,
    itemListElement: events.slice(0, 30).map((e, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${BASE_URL}/events/${e.slug}`,
      name: e.name,
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MotoDigital', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: t('heading'), item: `${BASE_URL}/events` },
    ],
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {hubFaqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hubFaqLd) }}
        />
      )}
      <Header activePage="events" />

      {/* Hero */}
      <section className="pt-28 pb-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/explore" className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[#F0F0F0] transition-colors" aria-label={t('back')}>
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest">{t('kicker')}</p>
          </div>
          <h1 className="font-bold text-[#222222] leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
            {t('heading')}
          </h1>
          <p className="text-[#222222]/40 text-base max-w-[55ch] leading-relaxed">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* Filtered events list */}
      <section className="pb-20">
        <EventsClient events={events} />
      </section>

      {hub && (
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="border-t border-[#222222]/8 pt-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-4" style={{ letterSpacing: '-0.02em' }}>
                Custom-Motorrad-Events und Messen im Überblick
              </h2>
              <p className="text-base text-[#222222]/65 leading-relaxed max-w-[68ch]">
                Hier findest du die Termine, die für die Custom-Szene zählen: Messen zum Saisonstart, auf denen Hersteller
                ihre Neuheiten und Builder ihre Umbauten zeigen, Treffen und Festivals im Sommer, Sprintrennen,
                Charity-Rides und Teilemärkte. Zu jedem Event gibt es Termin, Ort, Anreise, Preise und Tipps,
                recherchiert aus den Angaben der Veranstalter.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
                {hub.groups.map(g => (
                  <div key={g.heading}>
                    <h3 className="text-lg font-bold text-[#222222] mb-2">{g.heading}</h3>
                    {g.intro && <p className="text-sm text-[#222222]/55 leading-relaxed mb-4">{g.intro}</p>}
                    <ul className="divide-y divide-[#222222]/6">
                      {g.items.map(i => (
                        <li key={i.slug}>
                          <Link href={`/events/${i.slug}`} className="group flex flex-col py-3">
                            <span className="text-[15px] font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors">
                              {i.name}
                            </span>
                            <span className="text-xs text-[#222222]/50 mt-0.5 truncate">
                              {i.when} · {i.location}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-[#222222] mb-5" style={{ letterSpacing: '-0.02em' }}>
                  {t('faqTitle')}
                </h2>
                <dl className="space-y-5 max-w-[68ch]">
                  {hub.faq.map(f => (
                    <div key={f.q} className="border-b border-[#222222]/6 pb-5 last:border-0 last:pb-0">
                      <dt className="text-base font-semibold text-[#222222] mb-1.5">{f.q}</dt>
                      <dd className="text-[15px] text-[#222222]/65 leading-relaxed">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
