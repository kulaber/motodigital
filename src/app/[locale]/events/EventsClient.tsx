'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { MapPin, Calendar, X } from 'lucide-react'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import DatePicker from '@/components/ui/DatePicker'

function getTodayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function EventsClient({ events }: { events: Event[] }) {
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

  const today = useMemo(() => getTodayLocal(), [])

  const locations = useMemo(() => {
    const set = new Set(events.map(e => e.location).filter(Boolean))
    return Array.from(set).sort()
  }, [events])

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (filterFrom || filterTo) {
        const start = e.date_start ?? ''
        const end = e.date_end ?? e.date_start ?? ''
        if (filterFrom && end < filterFrom) return false
        if (filterTo && start > filterTo) return false
      }
      if (filterLocation && e.location !== filterLocation) return false
      return true
    })
  }, [events, filterFrom, filterTo, filterLocation])

  const { upcoming, past } = useMemo(() => {
    const upcoming: Event[] = []
    const past: Event[] = []
    filtered.forEach(e => {
      const end = e.date_end ?? e.date_start ?? ''
      if (end && end < today) past.push(e)
      else upcoming.push(e)
    })
    upcoming.sort((a, b) => (a.date_start ?? '').localeCompare(b.date_start ?? ''))
    past.sort((a, b) => (b.date_start ?? '').localeCompare(a.date_start ?? ''))
    return { upcoming, past }
  }, [filtered, today])

  const hasFilter = filterFrom || filterTo || filterLocation

  return (
    <>
      {/* Filter bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <DatePicker
            value={filterFrom}
            onChange={(d) => {
              setFilterFrom(d)
              if (filterTo && d > filterTo) setFilterTo(d)
            }}
            placeholder="Von"
            compact
          />
          <DatePicker
            value={filterTo}
            onChange={setFilterTo}
            min={filterFrom}
            placeholder="Bis"
            compact
          />

          <div className={`relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
            filterLocation ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
          }`}>
            <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
              {filterLocation || 'Standort'}
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <select
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="">Standort</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {hasFilter && (
            <button
              onClick={() => { setFilterFrom(''); setFilterTo(''); setFilterLocation('') }}
              aria-label="Filter zurücksetzen"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#333] transition-colors rounded-full border border-[#d4d4d4] hover:border-[#999] bg-white"
            >
              <X size={14} />
            </button>
          )}

          {hasFilter && (
            <span className="text-[13px] text-[#999]">
              {filtered.length} {filtered.length === 1 ? 'Event' : 'Events'}
            </span>
          )}
        </div>
      </div>

      {/* Masonry grids */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#222222]/10 rounded-2xl">
            <p className="text-sm text-[#222222]/30">Keine Events in diesem Zeitraum.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className={upcoming.length > 0 ? 'mt-20' : ''}>
                <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#222222]" style={{ letterSpacing: '-0.02em' }}>
                    Vergangene Events
                  </h2>
                  <span className="text-sm text-[#717171]">{past.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {past.map(event => (
                    <EventCard key={event.id} event={event} isPast />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function EventCard({
  event,
  isPast = false,
}: {
  event: Event
  isPast?: boolean
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#222222]/6 hover:border-[#222222]/15 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-all duration-300"
    >
      {event.image && (
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F0F0F0]">
          <Image
            src={event.image}
            alt={event.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
              isPast ? 'grayscale opacity-70' : ''
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Top + bottom gradients for legibility of overlays */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

          {/* Top-left: tags or "Vergangen" */}
          {isPast ? (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/75 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Vergangen
            </div>
          ) : (
            event.tags.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
                {event.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#222222]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )
          )}

          {/* Bottom-left: date pill (always on image for consistent card body) */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#222222] font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm">
              <Calendar size={11} className={isPast ? 'text-[#222222]/50' : 'text-[#06a5a5]'} />
              {formatEventDate(event)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <h3
          className={`text-base sm:text-lg font-bold mb-1.5 leading-snug ${
            isPast ? 'text-[#222222]/55' : 'text-[#222222]'
          }`}
          style={{ letterSpacing: '-0.01em' }}
        >
          {event.name}
        </h3>
        <div className={`flex items-center gap-1 text-xs mb-3 ${isPast ? 'text-[#222222]/35' : 'text-[#222222]/50'}`}>
          <MapPin size={11} className="flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <p
          className={`text-sm leading-relaxed line-clamp-2 ${
            isPast ? 'text-[#222222]/35' : 'text-[#222222]/55'
          }`}
        >
          {event.description}
        </p>
      </div>
    </Link>
  )
}
