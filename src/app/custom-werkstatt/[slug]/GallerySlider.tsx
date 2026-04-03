'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import NextImage from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useHideNavOnModal } from '@/hooks/useHideNavOnModal'

type GalleryImage = { url: string; title?: string }

/* ── Fullscreen Modal ── */
function GalleryModal({ images, startIndex, onClose }: { images: GalleryImage[]; startIndex: number; onClose: () => void }) {
  useHideNavOnModal(true)
  const [idx, setIdx] = useState(startIndex)

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose, prev, next])

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center" onClick={onClose}>
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors" aria-label="Schließen">
        <X size={18} className="text-white" />
      </button>

      {/* Counter */}
      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-white/40 font-medium tabular-nums tracking-widest">{idx + 1} / {images.length}</span>

      {/* Image */}
      <div className="relative w-[92vw] h-[85vh]" onClick={e => e.stopPropagation()}>
        <NextImage
          src={images[idx].url}
          alt={images[idx].title ?? `Bild ${idx + 1}`}
          fill
          sizes="92vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Nächstes Bild"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </>
      )}
    </div>
  )
}

/* ── Slider ── */
export default function GallerySlider({ images }: { images: GalleryImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const item = el.querySelector<HTMLElement>('[data-gallery-item]')
    if (!item) return
    const step = item.offsetWidth + 10 // image width + gap (gap-2.5 = 10px)
    el.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' })
  }

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              data-gallery-item
              onClick={() => setModalIndex(i)}
              className="flex-shrink-0 snap-start w-[85%] sm:w-[60%] lg:w-[48%] relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F0F0F0] cursor-pointer group"
            >
              <NextImage
                src={img.url}
                alt={img.title ?? `Werkstatt-Bild ${i + 1}`}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 48vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-[#F7F7F7] transition-colors z-10"
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft size={16} className="text-[#222222]" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-[#F7F7F7] transition-colors z-10"
              aria-label="Nächstes Bild"
            >
              <ChevronRight size={16} className="text-[#222222]" />
            </button>
          </>
        )}
      </div>

      {modalIndex !== null && (
        <GalleryModal images={images} startIndex={modalIndex} onClose={() => setModalIndex(null)} />
      )}
    </>
  )
}
