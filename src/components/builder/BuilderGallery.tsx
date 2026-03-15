'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

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

  return (
    <>
      {/* Original grid layout */}
      <div className={`grid gap-2 ${
        images.length === 1 ? 'grid-cols-1' :
        images.length === 2 ? 'grid-cols-2' :
        images.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      }`}>
        {images.map((item, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className={`group relative overflow-hidden rounded-xl bg-[#1C1C1C] border border-[#F0EDE4]/5 cursor-zoom-in text-left ${
              i === 0 && images.length > 2 ? 'row-span-2 col-span-2 sm:col-span-1 lg:col-span-2' : ''
            }`}
          >
            <div className={`overflow-hidden ${i === 0 && images.length > 2 ? 'aspect-[4/3] sm:aspect-square lg:aspect-[4/3]' : 'aspect-square'}`}>
              <img
                src={item.url}
                alt={item.title ?? ''}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-[#141414]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-[#F0EDE4]/80 font-medium">{item.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute inset-0 bg-black/92" />

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-4 py-3 flex-shrink-0">
            <div className="text-white/40 text-sm font-medium">
              {lightbox + 1} / {images.length}
            </div>
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

          <div className="relative z-10 h-4 flex-shrink-0" />
        </div>
      )}
    </>
  )
}
