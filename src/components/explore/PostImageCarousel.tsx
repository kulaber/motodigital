'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import type { MediaItem } from '@/components/bike/MediaSlider'
import PostVideoPlayer from '@/components/explore/PostVideoPlayer'

interface PostImageCarouselProps {
  items: MediaItem[]
  alt: string
}

// Clamp ratio: min 16:9 (landscape floor), max 4:3 portrait (0.75)
function clampRatio(r: number) {
  return Math.min(16 / 9, Math.max(3 / 4, r))
}

export default function PostImageCarousel({ items, alt }: PostImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const multi = items.length > 1

  // Default 16:9 until first media loads and reports its natural ratio.
  const [ratio, setRatio] = useState<number>(16 / 9)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    if (index !== activeIndex) setActiveIndex(index)
  }

  function scrollToIndex(idx: number) {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' })
  }

  return (
    // Outer div height is driven by aspect-ratio; absolute scroll container fills it.
    <div className="relative w-full group" style={{ aspectRatio: ratio }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="snap-start flex-none w-full h-full relative bg-black overflow-hidden"
          >
            {item.media_type === 'video' ? (
              <PostVideoPlayer
                url={item.url}
                thumbnail_url={item.thumbnail_url}
                alt={alt}
                className="h-full"
                onRatio={i === 0 ? (r) => setRatio(clampRatio(r)) : undefined}
              />
            ) : (
              <Image
                src={item.url}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, 468px"
                className="object-cover object-center"
                priority={i === 0}
                onLoad={i === 0 ? (e) => {
                  const img = e.currentTarget as HTMLImageElement
                  setRatio(clampRatio(img.naturalWidth / img.naturalHeight))
                } : undefined}
              />
            )}
          </div>
        ))}
      </div>

      {multi && (
        <>
          {/* Dot indicators */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
            {items.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === activeIndex
                    ? 'w-2 h-2 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Desktop arrow buttons */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Vorheriges Bild"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M6.5 2L3.5 5l3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}
          {activeIndex < items.length - 1 && (
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Nächstes Bild"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M3.5 2L6.5 5l-3 3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
}
