import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, ArrowLeft } from 'lucide-react'
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

      <section className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">

          {/* Back */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] hover:text-[#222222] transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Alle Events
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {event.tags.map(tag => (
              <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-bold text-[#222222] leading-tight mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}>
            {event.name}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 mb-8">
            <span className="flex items-center gap-2 text-sm text-[#717171]">
              <Calendar size={15} /> {event.date}
            </span>
            <span className="flex items-center gap-2 text-sm text-[#717171]">
              <MapPin size={15} /> {event.location}
            </span>
          </div>

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
