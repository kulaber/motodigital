'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

interface Props {
  images: string[]
  title: string
}

export default function EventGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [viewerIdx, setViewerIdx] = useState<number | null>(null)
  const [viewerVisible, setViewerVisible] = useState(false)
  const viewerOpenRef = useRef(false)
  const viewerTouchStartX = useRef(0)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  function openLightbox(i: number) {
    setLightbox(i)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function closeLightbox() {
    setVisible(false)
    setTimeout(() => setLightbox(null), 220)
  }

  function openViewer(i: number) {
    setViewerIdx(i)
    viewerOpenRef.current = true
    requestAnimationFrame(() => requestAnimationFrame(() => setViewerVisible(true)))
  }

  function closeViewer() {
    setViewerVisible(false)
    viewerOpenRef.current = false
    setTimeout(() => setViewerIdx(null), 220)
  }

  function viewerPrev() {
    setViewerIdx(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }

  function viewerNext() {
    setViewerIdx(i => (i === null ? null : (i + 1) % images.length))
  }

  useEffect(() => {
    if (viewerIdx === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') viewerPrev()
      else if (e.key === 'ArrowRight') viewerNext()
      else if (e.key === 'Escape') closeViewer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewerIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lightbox === null) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    function onKey(e: KeyboardEvent) {
      if (viewerOpenRef.current) return
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    const timer = setTimeout(() => {
      if (lightbox > 0 && imageRefs.current[lightbox]) {
        imageRefs.current[lightbox]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 120)
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', onKey)
      clearTimeout(timer)
    }
  }, [lightbox])

  if (!images || images.length === 0) return null

  // Preview: show up to 6 images in masonry, rest hidden behind "Alle Fotos" button
  const previewCount = Math.min(images.length, 6)
  const previewImages = images.slice(0, previewCount)

  return (
    <>
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#222222]" style={{ letterSpacing: '-0.02em' }}>
            Galerie
          </h2>
          <p className="text-sm text-[#717171] mt-1">{images.length} Fotos vom Event</p>
        </div>
        {images.length > previewCount && (
          <button
            onClick={() => openLightbox(0)}
            className="flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDDDDD] text-xs font-semibold px-3.5 py-2 rounded-full shadow-sm hover:shadow-md hover:border-[#222222]/20 transition-all flex-shrink-0"
          >
            <LayoutGrid size={13} />
            Alle {images.length} Fotos
          </button>
        )}
      </div>

      {/* Equal-height grid — Next/Image for Vercel optimisation (AVIF/WebP, responsive sizes) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {previewImages.map((img, i) => (
          <button
            key={img}
            onClick={() => openLightbox(i)}
            className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-[#F0F0F0] cursor-zoom-in"
          >
            <Image
              src={img}
              alt={`${title} ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading={i < 3 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Gallery Modal — full masonry */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-[#EBEBEB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
              <button
                onClick={closeLightbox}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F0F0F0] text-[#222222] hover:bg-[#E5E5E5] transition-all"
                aria-label="Zurück"
              >
                <ChevronLeft size={20} />
              </button>
              <p className="text-sm font-semibold text-[#222222] truncate">{title} — Galerie</p>
              <div className="w-10 h-10" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-1 max-w-7xl mx-auto p-1">
              {images.map((img, i) => (
                <div
                  key={img}
                  ref={el => { imageRefs.current[i] = el }}
                  className="break-inside-avoid mb-1 cursor-zoom-in"
                  onClick={() => openViewer(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${title} ${i + 1}`}
                    className="w-full block"
                    loading={i < 6 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fullscreen Viewer */}
          {viewerIdx !== null && (
            <div
              className="fixed inset-0 z-[60] flex flex-col"
              style={{
                background: 'rgba(0, 0, 0, 0.92)',
                opacity: viewerVisible ? 1 : 0,
                transition: 'opacity 220ms ease',
              }}
              onClick={closeViewer}
            >
              <div
                className="relative flex-1 flex items-center min-h-0 overflow-hidden w-full"
                onClick={e => e.stopPropagation()}
                onTouchStart={e => { viewerTouchStartX.current = e.touches[0].clientX }}
                onTouchEnd={e => {
                  const delta = e.changedTouches[0].clientX - viewerTouchStartX.current
                  if (delta < -50) viewerNext()
                  else if (delta > 50) viewerPrev()
                }}
              >
                <button
                  onClick={viewerPrev}
                  className="hidden sm:flex flex-shrink-0 mx-4 w-11 h-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <ChevronLeft size={22} />
                </button>
                <div className="flex-1 min-w-0 h-full flex items-center justify-center p-4 sm:p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={viewerIdx}
                    src={images[viewerIdx]}
                    alt={`${title} ${viewerIdx + 1}`}
                    className="block w-auto h-auto object-contain"
                    style={{ maxWidth: '100%', maxHeight: '100%', animation: 'eventGalleryFadeIn 200ms ease forwards' }}
                  />
                </div>
                <button
                  onClick={viewerNext}
                  className="hidden sm:flex flex-shrink-0 mx-4 w-11 h-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <ChevronRight size={22} />
                </button>
                <button
                  onClick={closeViewer}
                  className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all"
                  aria-label="Schließen"
                >
                  <X size={18} />
                </button>
                <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tabular-nums tracking-widest">
                  {viewerIdx + 1} / {images.length}
                </span>
              </div>
            </div>
          )}

          <style>{`
            @keyframes eventGalleryFadeIn {
              from { opacity: 0; transform: scale(0.97); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
