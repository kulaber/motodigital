'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import { formatEventDate } from '@/lib/data/events'

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
  const rafRef = useRef<number>(0)
  const posRef = useRef(0)

  const items = [...events, ...events]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const speed = 0.5

    function step() {
      if (!paused && !dragging && track) {
        posRef.current += speed
        const half = track.scrollWidth / 2
        if (posRef.current >= half) posRef.current -= half
        track.style.transform = `translateX(-${posRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, dragging])

  const touchStartX = useRef(0)
  const touchStartPos = useRef(0)

  function onTouchStart(e: React.TouchEvent) {
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
      className="relative py-3 overflow-hidden sm:events-fade-mask"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1 mb-1">
                {event.name}
              </h3>
              <div className="flex items-center gap-3 text-[10px] sm:text-xs text-[#222222]/35">
                {event.date_start && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={10} className="text-[#06a5a5]" />
                    {formatEventDate(event)}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={10} className="flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

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
