'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronLeft, ChevronRight, LayoutGrid, ArrowLeft, Star, Share2, Facebook, Twitter, Link2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  images: string[]
  title: string
  bikeId?: string | null
}

export default function BuildGallery({ images, title, bikeId }: Props) {
  const router = useRouter()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [mobileIdx, setMobileIdx] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)

  // ── Save / Share state ──
  const [saved, setSaved] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!bikeId) return
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('saved_bikes') as any)
        .select('bike_id')
        .eq('user_id', user.id)
        .eq('bike_id', bikeId)
        .maybeSingle()
      setSaved(!!data)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikeId])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSave() {
    if (!userId) { router.push('/auth/login'); return }
    if (loadingSave) return
    if (!bikeId) return
    setLoadingSave(true)
    if (saved) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('saved_bikes') as any)
        .delete()
        .eq('user_id', userId)
        .eq('bike_id', bikeId)
      setSaved(false)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('saved_bikes') as any)
        .insert({ user_id: userId, bike_id: bikeId })
      setSaved(true)
    }
    setLoadingSave(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => { setCopied(false); setShareOpen(false) }, 1800)
  }

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

          {/* Back button */}
          <button
            onClick={() => {
              document.documentElement.style.scrollBehavior = 'auto'
              router.back()
            }}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft size={13} /> Zurück
          </button>

          {/* Save + Share buttons */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2" ref={shareRef}>
            <button
              onClick={handleSave}
              disabled={loadingSave}
              className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all disabled:opacity-60 ${saved ? 'bg-[#06a5a5] text-white' : 'bg-black/50 text-white hover:bg-black/60'}`}
              aria-label={saved ? 'Gespeichert' : 'Speichern'}
            >
              <Star size={15} className={saved ? 'fill-white' : ''} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShareOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/60 transition-all"
                aria-label="Teilen"
              >
                <Share2 size={15} />
              </button>
              {shareOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#EBEBEB] overflow-hidden w-52 z-50">
                  <div className="px-4 py-3 border-b border-[#F0F0F0]">
                    <p className="text-xs font-semibold text-[#222222]">Seite teilen</p>
                  </div>
                  <div className="py-1.5">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
                    >
                      <Facebook size={15} className="text-[#1877F2] flex-shrink-0" />
                      <span className="text-sm text-[#222222]">Facebook</span>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(title + ' auf MotoDigital')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
                    >
                      <Twitter size={15} className="text-[#1DA1F2] flex-shrink-0" />
                      <span className="text-sm text-[#222222]">X / Twitter</span>
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(title + ' auf MotoDigital ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" className="flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span className="text-sm text-[#222222]">WhatsApp</span>
                    </a>
                    <button
                      onClick={copyLink}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors border-t border-[#F0F0F0]"
                    >
                      {copied ? <Check size={15} className="text-[#06a5a5] flex-shrink-0" /> : <Link2 size={15} className="text-[#717171] flex-shrink-0" />}
                      <span className={`text-sm ${copied ? 'text-[#06a5a5]' : 'text-[#222222]'}`}>
                        {copied ? 'Link kopiert!' : 'Link kopieren'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Counter — bottom right */}
          <span className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {mobileIdx + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* ── Desktop grid (md+) — adapts to image count ── */}
      <div className="hidden md:flex flex-col relative rounded-2xl overflow-hidden">
        {images.length === 1 ? (
          /* Single image — full width */
          <div className="h-[50vh] min-h-[340px] max-h-[520px]">
            <button onClick={() => openLightbox(0)} className="relative w-full h-full overflow-hidden cursor-zoom-in group">
              <img src={images[0]} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
          </div>
        ) : images.length === 2 ? (
          /* Two images — side by side */
          <div className="grid gap-1.5 h-[50vh] min-h-[340px] max-h-[520px]" style={{ gridTemplateColumns: '3fr 2fr' }}>
            <button onClick={() => openLightbox(0)} className="relative overflow-hidden cursor-zoom-in group">
              <img src={images[0]} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            <button onClick={() => openLightbox(1)} className="relative overflow-hidden cursor-zoom-in group">
              <img src={images[1]} alt={`${title} 2`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
          </div>
        ) : images.length === 3 ? (
          /* Three images — large left, two stacked right */
          <div className="grid gap-1.5 h-[50vh] min-h-[340px] max-h-[520px]" style={{ gridTemplateColumns: '3fr 2fr', gridTemplateRows: '1fr 1fr' }}>
            <button onClick={() => openLightbox(0)} className="relative overflow-hidden cursor-zoom-in group" style={{ gridRow: '1 / 3' }}>
              <img src={images[0]} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            <button onClick={() => openLightbox(1)} className="relative overflow-hidden cursor-zoom-in group">
              <img src={images[1]} alt={`${title} 2`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            <button onClick={() => openLightbox(2)} className="relative overflow-hidden cursor-zoom-in group">
              <img src={images[2]} alt={`${title} 3`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
          </div>
        ) : (
          /* Four+ images — large left (2 rows), wide top-right, two bottom-right */
          <div className="grid gap-1.5 h-[50vh] min-h-[340px] max-h-[520px]" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
            <button onClick={() => openLightbox(0)} className="relative overflow-hidden cursor-zoom-in group" style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }}>
              <img src={images[0]} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            <button onClick={() => openLightbox(1)} className="relative overflow-hidden cursor-zoom-in group" style={{ gridRow: '1 / 2', gridColumn: '2 / 4' }}>
              <img src={images[1]} alt={`${title} 2`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            <button onClick={() => openLightbox(2)} className="relative overflow-hidden cursor-zoom-in group" style={{ gridRow: '2 / 3', gridColumn: '2 / 3' }}>
              <img src={images[2]} alt={`${title} 3`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
            <button onClick={() => openLightbox(3)} className="relative overflow-hidden cursor-zoom-in group" style={{ gridRow: '2 / 3', gridColumn: '3 / 4' }}>
              <img src={images[3]} alt={`${title} 4`} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </button>
          </div>
        )}

        {/* "Alle Fotos" button */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDDDDD] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md hover:border-[#222222]/20 transition-all z-10"
          >
            <LayoutGrid size={13} />
            Alle {images.length} Fotos anzeigen
          </button>
        )}
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
