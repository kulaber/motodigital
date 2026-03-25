'use client'

import { useRef } from 'react'
import NextImage from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type GalleryImage = { url: string; title?: string }

export default function GallerySlider({ images }: { images: GalleryImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'right' ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 snap-start w-[78%] sm:w-[55%] lg:w-[42%] relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F0F0F0]"
          >
            <NextImage
              src={img.url}
              alt={img.title ?? `Werkstatt-Bild ${i + 1}`}
              fill
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 55vw, 42vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-[#F7F7F7] transition-colors z-10"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft size={16} className="text-[#222222]" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-[#F7F7F7] transition-colors z-10"
            aria-label="Nächstes Bild"
          >
            <ChevronRight size={16} className="text-[#222222]" />
          </button>
        </>
      )}
    </div>
  )
}
