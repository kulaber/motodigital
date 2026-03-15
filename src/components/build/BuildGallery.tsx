'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  title: string
}

export default function BuildGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = useCallback(() => {
    setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setLightbox(i => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  const [cover, ...gallery] = images

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Cover — full width */}
        <button
          onClick={() => setLightbox(0)}
          className="col-span-2 aspect-[16/7] overflow-hidden rounded-xl cursor-zoom-in"
        >
          <img
            src={cover}
            alt={`${title} 1`}
            className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
          />
        </button>

        {/* Rest */}
        {gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i + 1)}
            className="aspect-square overflow-hidden rounded-xl cursor-zoom-in"
          >
            <img
              src={img}
              alt={`${title} ${i + 2}`}
              className="w-full h-full object-cover hover:scale-[1.05] transition-transform duration-500"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium">
            {lightbox + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 sm:p-3 transition-all"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] mx-auto px-14 sm:px-20" onClick={e => e.stopPropagation()}>
            <img
              key={lightbox}
              src={images[lightbox]}
              alt={`${title} ${lightbox + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 sm:p-3 transition-all"
            >
              <ChevronRight size={22} />
            </button>
          )}

        </div>
      )}
    </>
  )
}
