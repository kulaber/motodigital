'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Grid2x2 } from 'lucide-react'

interface MediaItem {
  url: string
  title?: string
}

interface Props {
  images: MediaItem[]
}

export default function BuilderGallery({ images }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = useCallback(() => {
    setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setLightbox(i => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (lightbox === null) return
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, prev, next])

  const main = images[0]
  const thumbs = images.slice(1, 5) // up to 4 thumbs

  return (
    <>
      {/* ── Airbnb-style grid ── */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 h-[320px] sm:h-[380px]">

          {/* Main large image */}
          {main && (
            <button
              onClick={() => setLightbox(0)}
              className="col-span-2 row-span-2 relative overflow-hidden cursor-zoom-in group"
            >
              <img
                src={main.url}
                alt={main.title ?? ''}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          )}

          {/* 4 thumbnails */}
          {thumbs.map((item, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i + 1)}
              className="relative overflow-hidden cursor-zoom-in group"
            >
              <img
                src={item.url}
                alt={item.title ?? ''}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {/* Overlay on last visible thumb if more images */}
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-[#222222] text-sm font-semibold">+{images.length - 5}</span>
                </div>
              )}
            </button>
          ))}

          {/* Fill empty slots if fewer than 4 thumbs */}
          {thumbs.length < 4 && Array.from({ length: 4 - thumbs.length }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white" />
          ))}
        </div>

        {/* "Alle Bilder ansehen" button */}
        <button
          onClick={() => setLightbox(0)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDDDDD] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md hover:border-[#222222]/20 transition-all"
        >
          <Grid2x2 size={13} />
          Alle Bilder ansehen
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={() => setLightbox(null)}>
          <div className="absolute inset-0 bg-black/92" />

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-4 py-3 flex-shrink-0">
            <span className="text-white/40 text-sm font-medium">{lightbox + 1} / {images.length}</span>
            <button
              onClick={() => setLightbox(null)}
              className="text-white/50 hover:text-white bg-white/8 hover:bg-white/15 rounded-full p-2 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image row */}
          <div className="relative z-10 flex flex-1 min-h-0 items-center">
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="flex-shrink-0 mx-2 sm:mx-4 text-white/50 hover:text-white bg-white/8 hover:bg-white/15 rounded-full p-2 sm:p-3 transition-all"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex-1 min-w-0 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="relative rounded-2xl overflow-hidden bg-white/4 shadow-2xl animate-scale-in">
                <img
                  key={lightbox}
                  src={images[lightbox].url}
                  alt={images[lightbox].title ?? ''}
                  style={{ maxHeight: 'calc(100vh - 110px)', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                  className="w-auto h-auto"
                />
              </div>
            </div>

            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="flex-shrink-0 mx-2 sm:mx-4 text-white/50 hover:text-white bg-white/8 hover:bg-white/15 rounded-full p-2 sm:p-3 transition-all"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="relative z-10 flex gap-2 justify-center px-4 pb-4 overflow-x-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className={`flex-shrink-0 w-12 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                  i === lightbox ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
