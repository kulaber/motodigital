import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, ArrowLeft, ChevronLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { EVENTS, getEventBySlug } from '@/lib/data/events'
import EventInterestButton from './EventInterestButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return EVENTS.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = getEventBySlug(slug)
  if (!event) return { title: 'Event nicht gefunden — MotoDigital' }
  return {
    title: `${event.name} — MotoDigital`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = getEventBySlug(slug)
  if (!event) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
              <div className="flex flex-wrap items-center gap-5 mt-3">
                <span className="flex items-center gap-2 text-sm text-white/75">
                  <Calendar size={15} /> {event.date}
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
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">

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
              <div className="flex flex-wrap items-center gap-5 mb-8">
                <span className="flex items-center gap-2 text-sm text-[#717171]">
                  <Calendar size={15} /> {event.date}
                </span>
                <span className="flex items-center gap-2 text-sm text-[#717171]">
                  <MapPin size={15} /> {event.location}
                </span>
              </div>
            </>
          )}

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-base text-[#222222]/70 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* External link */}
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

          {/* Interest / Teilnehmen */}
          <EventInterestButton eventSlug={event.slug} userId={user?.id ?? null} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
