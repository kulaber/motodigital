'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, X } from 'lucide-react'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import DatePicker from '@/components/ui/DatePicker'

export default function EventsClient({ events }: { events: Event[] }) {
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

  // Unique locations for dropdown
  const locations = useMemo(() => {
    const set = new Set(events.map(e => e.location).filter(Boolean))
    return Array.from(set).sort()
  }, [events])

  const filtered = useMemo(() => {
    return events.filter(e => {
      // Date filter
      if (filterFrom || filterTo) {
        const start = e.date_start ?? ''
        const end = e.date_end ?? e.date_start ?? ''
        if (filterFrom && end < filterFrom) return false
        if (filterTo && start > filterTo) return false
      }
      // Location filter
      if (filterLocation && e.location !== filterLocation) return false
      return true
    })
  }, [events, filterFrom, filterTo, filterLocation])

  const hasFilter = filterFrom || filterTo || filterLocation

  return (
    <>
      {/* Filter bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 mb-8">
        <div className="flex items-center gap-2">
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

          {/* Standort — bikes-style overlay select */}
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

          {/* Reset */}
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

      {/* Events list */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#222222]/10 rounded-2xl">
            <p className="text-sm text-[#222222]/30">Keine Events in diesem Zeitraum.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(event => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group bg-white border border-[#222222]/6 hover:border-[#DDDDDD]/20 rounded-2xl overflow-hidden transition-all duration-200 block"
              >
                <div className="flex flex-col sm:flex-row">
                  {event.image && (
                    <div className="relative w-full sm:w-48 md:w-56 h-40 sm:h-auto flex-shrink-0">
                      <Image
                        src={event.image}
                        alt={event.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 224px"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 flex-1 p-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {event.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-lg font-bold text-[#222222] mb-2">{event.name}</h2>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-[#06a5a5]/8 border border-[#06a5a5]/15 text-[#06a5a5] font-semibold text-xs px-3 py-1 rounded-full">
                          <Calendar size={12} /> {formatEventDate(event)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#222222]/40">
                          <MapPin size={12} /> {event.location}
                        </span>
                      </div>
                      <p className="text-sm text-[#222222]/45 leading-relaxed max-w-2xl line-clamp-2">{event.description}</p>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#717171] border border-[#DDDDDD]/25 group-hover:border-[#DDDDDD]/60 group-hover:bg-[#222222]/5 px-4 py-2.5 rounded-full transition-all whitespace-nowrap">
                        Mehr Info →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
