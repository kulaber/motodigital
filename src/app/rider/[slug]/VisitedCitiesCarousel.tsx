'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface City {
  name: string
  lat: number
  lng: number
  country?: string
}

export default function VisitedCitiesCarousel({ cities, riderName }: { cities: City[]; riderName: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const needsCarousel = cities.length > 3

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect() }
  }, [checkScroll])



  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.6
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const cityCard = (city: City) => (
    <div key={city.name} className={`bg-[#111111] rounded-xl p-3 flex flex-col items-center justify-center aspect-square ${needsCarousel ? 'w-[calc(33.333%-8px)] flex-shrink-0' : ''}`}>
      <div className="text-[10px] text-[#2AABAB] tracking-wide mb-1">&#9733; &#9733; &#9733; &#9733; &#9733;</div>
      <Image src="/pin-logo.svg" alt="MotoDigital" width={28} height={28} className="mb-1.5 opacity-80" />
      <span className="text-[10px] font-bold text-white text-center leading-tight truncate w-full">{city.name}</span>
      {city.country && (
        <span className="text-[8px] text-white/40 mt-0.5 truncate w-full text-center">{city.country}</span>
      )}
    </div>
  )

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5">
      <h2 className="text-base font-bold text-[#222222] tracking-tight mb-4">{riderName} war mit dem Motorrad hier:</h2>

      {needsCarousel ? (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {cities.map(cityCard)}
          </div>

          {/* Arrows — hidden on mobile (touch scroll) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow z-10"
            >
              <ChevronLeft size={16} className="text-[#222222]" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-white border border-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow z-10"
            >
              <ChevronRight size={16} className="text-[#222222]" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {cities.map(cityCard)}
        </div>
      )}
    </div>
  )
}
