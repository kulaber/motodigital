import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/data/events'
import { localizedText } from '@/lib/i18n/localizedText'
import EventsClient from './EventsClient'

export const revalidate = 3600 // ISR: events change infrequently

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('EventsPage')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function EventsPage() {
  const locale = await getLocale()
  const t = await getTranslations('EventsPage')
  const supabase = await createClient()
  const { data } = await (supabase.from('events') as any)
    .select('id, slug, name, date_start, date_end, location, description, tags, url, image, name_i18n, description_i18n, location_i18n')
    .order('date_start', { ascending: true })
    .limit(200)

  const rawEvents = (data ?? []) as Event[]
  // Resolve i18n JSONB fields server-side so client code stays locale-agnostic.
  const events: Event[] = rawEvents.map((e) => ({
    ...e,
    name:        localizedText(e.name_i18n,        locale, e.name),
    description: localizedText(e.description_i18n, locale, e.description),
    location:    localizedText(e.location_i18n,    locale, e.location),
  }))

  return (
    <div className="min-h-screen bg-white text-[#222222]">
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

      <Footer />
    </div>
  )
}
