import type { Metadata } from 'next'
import { MapPin, Calendar } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { EVENTS } from '@/lib/data/events'

export const metadata: Metadata = {
  title: 'Custom Motorcycle Events 2026 — MotoDigital',
  description: 'Die wichtigsten Custom-Motorcycle-Events in Europa 2026 — Glemseck 101, Wheels & Waves, Cafe Racer Festival und mehr.',
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="events" />

      {/* Hero */}
      <section className="pt-28 pb-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-3">Events 2026</p>
          <h1 className="font-bold text-[#222222] leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
            Custom Motorcycle Events
          </h1>
          <p className="text-[#222222]/40 text-base max-w-lg leading-relaxed">
            Die besten Custom-Moto-Events in Europa — festivals, shows und races für die Community.
          </p>
        </div>
      </section>

      {/* Events list */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col gap-4">
            {EVENTS.map(event => (
              <a
                key={event.id}
                href={event.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-white border border-[#222222]/6 hover:border-[#DDDDDD]/20 rounded-2xl p-6 transition-all duration-200 block ${event.url ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {event.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-lg font-bold text-[#222222] mb-2">{event.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-[#717171]">
                        <Calendar size={12} /> {event.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#222222]/40">
                        <MapPin size={12} /> {event.location}
                      </span>
                    </div>
                    <p className="text-sm text-[#222222]/45 leading-relaxed max-w-2xl">{event.description}</p>
                  </div>

                  {event.url && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] border border-[#DDDDDD]/25 group-hover:border-[#DDDDDD]/60 group-hover:bg-[#222222]/5 px-4 py-2.5 rounded-full transition-all whitespace-nowrap">
                        Mehr Info →
                      </span>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
