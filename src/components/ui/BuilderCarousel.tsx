'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Builder } from '@/lib/data/builders'

const CARD_STEP = 336 // w-80 (320) + gap-4 (16)
const AUTO_ADVANCE_MS = 5000

interface Props {
  builders: Builder[]
}

export default function BuilderCarousel({ builders }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const posRef = useRef(0)
  const animatingRef = useRef(false)

  // Duplicate items for seamless wrap-around
  const items = [...builders, ...builders]

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

  // Touch drag support for mobile
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
      <div className="py-3 overflow-hidden sm:fade-mask">
      <div
        ref={trackRef}
        className="flex gap-4 w-max cursor-default"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((b, i) => {
          const coverImg = b.media.find(m => m.type === 'image')?.url
          return (
            <Link
              key={`${b.slug}-${i}`}
              href={`/custom-werkstatt/${b.slug}`}
              className="group flex-shrink-0 w-80 bg-white border border-[#222222]/6 rounded-xl sm:rounded-2xl overflow-hidden hover:border-[#222222]/20 transition-all duration-200 block"
            >
              {/* Cover image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                {coverImg ? (
                  <Image
                    src={coverImg}
                    alt={b.name}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#DDDDDD]">{b.initials}</span>
                  </div>
                )}
                {b.featured && (
                  <span className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] px-2 py-0.5 rounded-full">
                    Top Builder
                  </span>
                )}
                {b.builds > 0 && (
                  <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {b.builds} Custom {b.builds === 1 ? 'Bike' : 'Bikes'}
                  </span>
                )}
              </div>

              {/* Card body */}
              <div className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1 mb-0.5">{b.name}</h3>
                <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{b.city}{b.country ? `, ${b.country}` : ''}</p>
              </div>
            </Link>
          )
        })}
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
          .fade-mask {
            mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
          }
        }
      `}</style>
    </div>
  )
}
