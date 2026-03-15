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
          className="fixed inset-0 z-50 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          {/* Dark overlay */}
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
          <div className="relative z-10 flex flex-1 min-h-0 items-center overflow-hidden">

            {/* Prev */}
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="flex-shrink-0 mx-2 sm:mx-4 text-white/50 hover:text-white bg-white/8 hover:bg-white/15 rounded-full p-2 sm:p-3 transition-all"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Image */}
            <div className="flex-1 min-w-0 h-full flex items-center justify-center overflow-hidden py-4" onClick={e => e.stopPropagation()}>
              <img
                key={lightbox}
                src={images[lightbox]}
                alt={`${title} ${lightbox + 1}`}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl animate-scale-in shadow-2xl"
              />
            </div>

            {/* Next */}
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="flex-shrink-0 mx-2 sm:mx-4 text-white/50 hover:text-white bg-white/8 hover:bg-white/15 rounded-full p-2 sm:p-3 transition-all"
            >
              <ChevronRight size={22} />
            </button>

          </div>

          {/* Bottom spacer */}
          <div className="relative z-10 h-6 flex-shrink-0" />
        </div>
      )}
    </>
  )
}
