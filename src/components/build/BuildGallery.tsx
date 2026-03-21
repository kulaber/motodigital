'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

interface Props {
  images: string[]
  title: string
}

export default function BuildGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [mobileIdx, setMobileIdx] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)

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
      {/* ── Mobile slider (< md) — Instagram-style swipe ── */}
      <div className="md:hidden relative -mx-4 sm:-mx-6 overflow-hidden">
        <div
          className="relative aspect-[4/3] w-full"
          onTouchStart={e => {
            touchStartX.current = e.touches[0].clientX
            setIsDragging(true)
            setDragOffset(0)
          }}
          onTouchMove={e => {
            const delta = e.touches[0].clientX - touchStartX.current
            setDragOffset(delta)
          }}
          onTouchEnd={() => {
            setIsDragging(false)
            if (dragOffset < -40 && mobileIdx < images.length - 1) {
              setMobileIdx(i => i + 1)
            } else if (dragOffset > 40 && mobileIdx > 0) {
              setMobileIdx(i => i - 1)
            }
            setDragOffset(0)
          }}
        >
          {/* All images side by side, translated by current index + drag */}
          <div
            className="absolute inset-0 flex"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(calc(-${mobileIdx * (100 / images.length)}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {images.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`${title} ${i + 1}`}
                className="h-full object-cover flex-shrink-0"
                style={{ width: `${100 / images.length}%` }}
                onClick={() => !isDragging && Math.abs(dragOffset) < 5 && openLightbox(i)}
                draggable={false}
              />
            ))}
          </div>

          {/* Nav arrows */}
          {mobileIdx > 0 && (
            <button
              onClick={() => setMobileIdx(i => i - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[#222]"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {mobileIdx < images.length - 1 && (
            <button
              onClick={() => setMobileIdx(i => i + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md text-[#222]"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i === mobileIdx ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          <span className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {mobileIdx + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* ── Desktop grid (md+) ── */}
      <div className="hidden md:block relative rounded-2xl overflow-hidden">
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
