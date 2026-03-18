'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

interface Props {
  images: string[]
  title: string
}

export default function BuildGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  const prev = useCallback(() => {
    setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setLightbox(i => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  // Open with fade-in
  function openLightbox(i: number) {
    setLightbox(i)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function closeLightbox() {
    setVisible(false)
    setTimeout(() => setLightbox(null), 220)
  }

  useEffect(() => {
    if (lightbox === null) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, prev, next]) // eslint-disable-line react-hooks/exhaustive-deps

  const [i1, i2, i3, i4] = images

  return (
    <>
      {/* Airbnb-style grid — wrapper is relative+overflow-hidden, button is sibling of grid */}
      <div className="relative rounded-2xl overflow-hidden">
      <div className="grid gap-1.5 h-[50vh] min-h-[340px] max-h-[520px]"
        style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}
      >
        {/* Main image — left, spans 2 rows */}
        <button
          onClick={() => openLightbox(0)}
          className="relative overflow-hidden cursor-zoom-in group"
          style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }}
        >
          <img src={i1} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </button>

        {/* Top-right — spans 2 cols */}
        {i2 && (
          <button
            onClick={() => openLightbox(1)}
            className="relative overflow-hidden cursor-zoom-in group"
            style={{ gridRow: '1 / 2', gridColumn: '2 / 4' }}
          >
            <img src={i2} alt={`${title} 2`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )}

        {/* Bottom-right left */}
        {i3 && (
          <button
            onClick={() => openLightbox(2)}
            className="relative overflow-hidden cursor-zoom-in group"
            style={{ gridRow: '2 / 3', gridColumn: '2 / 3' }}
          >
            <img src={i3} alt={`${title} 3`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )}

        {/* Bottom-right right */}
        {i4 && (
          <button
            onClick={() => openLightbox(3)}
            className="relative overflow-hidden cursor-zoom-in group"
            style={{ gridRow: '2 / 3', gridColumn: '3 / 4' }}
          >
            <img src={i4} alt={`${title} 4`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )}

      </div>

        {/* "Alle Fotos" button — sibling of grid, absolute within the rounded wrapper */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDDDDD] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md hover:border-[#222222]/20 transition-all z-10"
        >
          <LayoutGrid size={13} />
          Alle {images.length} Fotos anzeigen
        </button>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-white/35 text-xs font-medium tabular-nums tracking-widest">
              {String(lightbox + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
            <button
              onClick={closeLightbox}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all"
              aria-label="Schließen"
            >
              <X size={15} />
            </button>
          </div>

          {/* Main image */}
          <div className="flex flex-1 min-h-0 items-center overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="flex-shrink-0 mx-3 sm:mx-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center p-2">
              <img
                key={lightbox}
                src={images[lightbox]}
                alt={`${title} ${lightbox + 1}`}
                className="block max-w-full max-h-full w-auto h-auto object-contain rounded-xl"
                style={{ animation: 'galleryFadeIn 200ms ease forwards' }}
              />
            </div>
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="flex-shrink-0 mx-3 sm:mx-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div
            className="flex-shrink-0 px-5 py-4 flex gap-2 overflow-x-auto justify-center"
            style={{ scrollbarWidth: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setLightbox(i)}
                className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden transition-all duration-200 ${
                  i === lightbox
                    ? 'ring-2 ring-[#06a5a5] ring-offset-2 ring-offset-black opacity-100 scale-105'
                    : 'opacity-30 hover:opacity-60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes galleryFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
