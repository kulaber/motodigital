'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { CalendarDays, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatEventDate } from '@/lib/data/events'

const CARD_STEP = 336 // w-80 (320) + gap-4 (16)
const AUTO_ADVANCE_MS = 5000

interface EventTeaser {
  id: string
  slug: string
  name: string
  date_start: string | null
  date_end: string | null
  location: string
  tags: string[]
  image?: string | null
}

interface Props {
  events: EventTeaser[]
}

export default function EventsCarousel({ events }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const posRef = useRef(0)
  const animatingRef = useRef(false)

  const items = [...events, ...events]

  function navigate(dir: 'prev' | 'next') {
    const track = trackRef.current
    if (!track || animatingRef.current) return
    animatingRef.current = true
    const half = track.scrollWidth / 2
    let target = posRef.current + (dir === 'next' ? CARD_STEP : -CARD_STEP)
    track.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
    track.style.transform = `translateX(-${target}px)`
    window.setTimeout(() => {
      track.style.transition = ''
      if (target < 0) target += half
      if (target >= half) target -= half
      posRef.current = target
      track.style.transform = `translateX(-${target}px)`
      animatingRef.current = false
    }, 550)
  }

  useEffect(() => {
    if (paused || dragging) return
    const id = window.setInterval(() => navigate('next'), AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [paused, dragging])

  const touchStartX = useRef(0)
  const touchStartPos = useRef(0)

  function onTouchStart(e: React.TouchEvent) {
    const track = trackRef.current
    if (!track) return
    track.style.transition = ''
    setDragging(true)
    touchStartX.current = e.touches[0].clientX
    touchStartPos.current = posRef.current
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return
    const delta = touchStartX.current - e.touches[0].clientX
    const track = trackRef.current
    if (!track) return
    const half = track.scrollWidth / 2
    let next = touchStartPos.current + delta
    if (next < 0) next += half
    if (next >= half) next -= half
    posRef.current = next
    track.style.transform = `translateX(-${posRef.current}px)`
  }

  function onTouchEnd() {
    setDragging(false)
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="py-3 overflow-hidden sm:events-fade-mask">
      <div
        ref={trackRef}
        className="flex gap-4 w-max cursor-default"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((event, i) => (
          <Link
            key={`${event.slug}-${i}`}
            href={`/events/${event.slug}`}
            className="group flex-shrink-0 w-72 sm:w-80 bg-white border border-[#222222]/6 rounded-xl sm:rounded-2xl overflow-hidden hover:border-[#222222]/20 transition-all duration-200 block"
          >
            {/* Image */}
            <div className="relative aspect-[3/2] overflow-hidden bg-[#F7F7F7]">
              {event.image ? (
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CalendarDays size={32} className="text-[#DDDDDD]" />
                </div>
              )}
              {/* Bottom gradient for date-pill legibility */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
              {event.tags.length > 0 && (
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {event.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {event.date_start && (
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#222222] font-semibold text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm">
                    <CalendarDays size={11} className="text-[#06a5a5]" />
                    {formatEventDate(event)}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1 mb-1">
                {event.name}
              </h3>
              {event.location && (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#222222]/35">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      </div>

      <button
        type="button"
        aria-label="Zurück"
        onClick={() => navigate('prev')}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-[#222222]/10 text-[#222222] hover:bg-[#F7F7F7] transition-colors duration-200"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Weiter"
        onClick={() => navigate('next')}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-[#222222]/10 text-[#222222] hover:bg-[#F7F7F7] transition-colors duration-200"
      >
        <ChevronRight size={18} />
      </button>

      <style>{`
        @media (min-width: 640px) {
          .events-fade-mask {
            mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
          }
        }
      `}</style>
    </div>
  )
}
