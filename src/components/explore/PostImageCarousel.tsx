'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { MediaItem } from '@/components/bike/MediaSlider'
import PostVideoPlayer from '@/components/explore/PostVideoPlayer'

interface PostImageCarouselProps {
  items: MediaItem[]
  alt: string
  /** 'fixed' = 360/468 px; '16:9' = aspect-video responsive */
  aspect?: '16:9' | 'fixed'
}

export default function PostImageCarousel({ items, alt, aspect = 'fixed' }: PostImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const multi = items.length > 1

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

  // On iOS, a horizontal overflow container captures ALL touch events — including
  // vertical swipes — and prevents the page from scrolling.
  // Fix: detect swipe direction on first movement; if vertical, set overflow-x:hidden
  // so the container releases the touch and the page scroll takes over.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let startX = 0
    let startY = 0
    let direction: 'x' | 'y' | null = null

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      direction = null
    }

    function onTouchMove(e: TouchEvent) {
      if (direction) return
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (dx < 4 && dy < 4) return // too small to determine yet

      direction = dy > dx ? 'y' : 'x'
      if (direction === 'y') {
        // Release horizontal scroll so the browser can scroll the page
        el.style.overflowX = 'hidden'
      }
    }

    function onTouchEnd() {
      if (direction === 'y') {
        // Restore after paint — instant enough to not glitch
        requestAnimationFrame(() => {
          el.style.overflowX = ''
        })
      }
      direction = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  return (
    <div className="relative w-full group">
      {/* Scroll container — CSS scroll-snap, no scrollbar */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden ${
          aspect === '16:9' ? 'aspect-video' : 'h-[360px] sm:h-[468px]'
        }`}
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
              />
            ) : (
              <Image
                src={item.url}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, 468px"
                className="object-cover object-center"
                priority={i === 0}
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

          {/* Desktop arrow buttons — visible on group-hover */}
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
