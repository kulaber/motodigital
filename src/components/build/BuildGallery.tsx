'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, LayoutGrid, Star, Share2, Facebook, Twitter, Link2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoginModal } from '@/components/ui/LoginModal'

interface Props {
  images: string[]
  title: string
  bikeId?: string | null
  modalContactSlot?: ReactNode
  listingType?: string | null
}

export default function BuildGallery({ images, title, bikeId, modalContactSlot, listingType }: Props) {
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
  const [showLogin, setShowLogin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)
  const shareRefDesktop = useRef<HTMLDivElement>(null)
  const shareRefModal = useRef<HTMLDivElement>(null)
  const [_modalTab, setModalTab] = useState<'fotos' | 'karte'>('fotos')
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const modalContentRef = useRef<HTMLDivElement>(null)
  // Image viewer (fullscreen single image inside masonry modal)
  const [viewerIdx, setViewerIdx] = useState<number | null>(null)
  const [viewerVisible, setViewerVisible] = useState(false)
  const viewerOpenRef = useRef(false)
  const viewerTouchStartX = useRef(0)
  const supabase = createClient()

  useEffect(() => {
    if (!bikeId) return
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
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
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const inMobile = shareRef.current && shareRef.current.contains(target)
      const inDesktop = shareRefDesktop.current && shareRefDesktop.current.contains(target)
      const inModal = shareRefModal.current && shareRefModal.current.contains(target)
      if (!inMobile && !inDesktop && !inModal) setShareOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSave() {
    if (!userId) { setShowLogin(true); return }
    if (loadingSave) return
    if (!bikeId) return
    setLoadingSave(true)
    if (saved) {
      await (supabase.from('saved_bikes') as any)
        .delete()
        .eq('user_id', userId)
        .eq('bike_id', bikeId)
      setSaved(false)
    } else {
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

  // Open with fade-in
  function openLightbox(i: number) {
    setModalTab('fotos')
    setLightbox(i)
    window.dispatchEvent(new Event('gallery-modal-open'))
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function closeLightbox() {
    setVisible(false)
    window.dispatchEvent(new Event('gallery-modal-close'))
    setTimeout(() => setLightbox(null), 220)
  }

  // ── Image Viewer (fullscreen overlay inside masonry modal) ──
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
    setViewerIdx(i => i === null ? null : (i - 1 + images.length) % images.length)
  }

  function viewerNext() {
    setViewerIdx(i => i === null ? null : (i + 1) % images.length)
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

    // Scroll to clicked image in masonry grid
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

  const [i1, i2, i3, i4] = images

  return (
    <>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="bike_save"
      />

      {/* ── Mobile sticky top bar (< md) — overlays image initially, white bg on scroll ── */}
      <div className={`md:hidden sticky top-12 lg:top-16 z-30 -mx-4 sm:-mx-6 -mb-14 px-3 py-2 flex items-center justify-between transition-colors duration-200 ${scrolled ? 'bg-white shadow-sm' : ''}`}>
        <button
          onClick={() => {
            document.documentElement.style.scrollBehavior = 'auto'
            router.back()
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${scrolled ? 'bg-[#F0F0F0] text-[#222]' : 'bg-white/90 shadow-md text-[#222]'}`}
          aria-label="Zurück"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2" ref={shareRef}>
          <button
            onClick={handleSave}
            disabled={loadingSave}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-60 ${saved ? 'bg-[#06a5a5] text-white' : scrolled ? 'bg-[#F0F0F0] text-[#222]' : 'bg-white/90 shadow-md text-[#222] hover:bg-white'}`}
            aria-label={saved ? 'Gespeichert' : 'Speichern'}
          >
            <Star size={17} className={saved ? 'fill-white' : ''} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShareOpen(v => !v)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${scrolled ? 'bg-[#F0F0F0] text-[#222]' : 'bg-white/90 shadow-md text-[#222] hover:bg-white'}`}
              aria-label="Teilen"
            >
              <Share2 size={17} />
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
      </div>

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
              // eslint-disable-next-line @next/next/no-img-element
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

          {/* Counter — bottom right */}
          <span className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {mobileIdx + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* ── Desktop grid (md+) ── */}
      <div className="hidden md:flex flex-col relative rounded-2xl overflow-hidden">
      <div className="grid gap-1.5 h-[70vh] min-h-[500px] max-h-[800px]"
        style={{ gridTemplateColumns: images.length === 1 ? '1fr' : '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}
      >
        {/* Main image — left, spans 2 rows */}
        <button
          onClick={() => openLightbox(0)}
          className="relative overflow-hidden cursor-zoom-in group focus:outline-none"
          style={{ gridRow: '1 / 3', gridColumn: images.length === 1 ? '1 / -1' : '1 / 2' }}
        >
          <Image src={i1} alt={title} fill sizes={images.length === 1 ? '100vw' : '(max-width: 768px) 100vw, 50vw'} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" priority />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </button>

        {/* Top-right — spans 2 cols */}
        {i2 && (
          <button
            onClick={() => openLightbox(1)}
            className="relative overflow-hidden cursor-zoom-in group focus:outline-none"
            style={{ gridRow: images.length === 2 ? '1 / 3' : '1 / 2', gridColumn: '2 / 4' }}
          >
            <Image src={i2} alt={`${title} 2`} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )}

        {/* Bottom-right left */}
        {i3 && (
          <button
            onClick={() => openLightbox(2)}
            className="relative overflow-hidden cursor-zoom-in group focus:outline-none"
            style={{ gridRow: '2 / 3', gridColumn: images.length === 3 ? '2 / 4' : '2 / 3' }}
          >
            <Image src={i3} alt={`${title} 3`} fill sizes="25vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )}

        {/* Bottom-right right */}
        {i4 && (
          <button
            onClick={() => openLightbox(3)}
            className="relative overflow-hidden cursor-zoom-in group focus:outline-none"
            style={{ gridRow: '2 / 3', gridColumn: '3 / 4' }}
          >
            <Image src={i4} alt={`${title} 4`} fill sizes="25vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </button>
        )}

      </div>

        {/* "Zu verkaufen" badge — top right */}
        {listingType === 'for_sale' && (
          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-[#06a5a5]/30 text-[#06a5a5] text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm">
            Zu verkaufen
          </span>
        )}

        {/* Save + Share buttons — bottom left */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2" ref={shareRefDesktop}>
          <button
            onClick={handleSave}
            disabled={loadingSave}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 ${saved ? 'bg-[#06a5a5] text-white border border-[#06a5a5]' : 'bg-white text-[#222222] border border-[#DDDDDD] hover:border-[#222222]/20'}`}
            aria-label={saved ? 'Gespeichert' : 'Speichern'}
          >
            <Star size={13} className={saved ? 'fill-white' : ''} />
            {saved ? 'Gespeichert' : 'Speichern'}
          </button>
          <div className="relative">
            <button
              onClick={() => setShareOpen(v => !v)}
              className="flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDDDDD] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md hover:border-[#222222]/20 transition-all"
              aria-label="Teilen"
            >
              <Share2 size={13} />
              Teilen
            </button>
            {shareOpen && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#EBEBEB] overflow-hidden w-52 z-50">
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

        {/* "Alle Fotos" button — bottom right */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-[#222222] border border-[#DDDDDD] text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:shadow-md hover:border-[#222222]/20 transition-all z-10"
        >
          <LayoutGrid size={13} />
          Alle {images.length} Fotos anzeigen
        </button>
      </div>

      {/* Gallery Modal — masonry grid */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}
        >
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-white border-b border-[#EBEBEB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
              {/* Left: Back */}
              <button
                onClick={closeLightbox}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F0F0F0] text-[#222222] hover:bg-[#E5E5E5] transition-all"
                aria-label="Zurück"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Right: CTAs — Nachricht, Speichern, Teilen */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {modalContactSlot}
                <button
                  onClick={handleSave}
                  disabled={loadingSave}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-60 ${
                    saved ? 'bg-[#06a5a5] text-white' : 'bg-[#F0F0F0] text-[#222222] hover:bg-[#E5E5E5]'
                  }`}
                  aria-label={saved ? 'Gespeichert' : 'Speichern'}
                >
                  <Star size={17} className={saved ? 'fill-white' : ''} />
                </button>
                <div className="relative" ref={shareRefModal}>
                  <button
                    onClick={() => setShareOpen(v => !v)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F0F0F0] text-[#222222] hover:bg-[#E5E5E5] transition-all"
                    aria-label="Teilen"
                  >
                    <Share2 size={17} />
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
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" ref={modalContentRef}>
            <div className="columns-1 sm:columns-2 gap-1">
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
                    className="w-full"
                    loading={i < 6 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Fullscreen Image Viewer ── */}
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
              {/* Image + navigation (full height) */}
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
                    style={{ maxWidth: '100%', maxHeight: '100%', animation: 'galleryFadeIn 200ms ease forwards' }}
                  />
                </div>
                <button
                  onClick={viewerNext}
                  className="hidden sm:flex flex-shrink-0 mx-4 w-11 h-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <ChevronRight size={22} />
                </button>

                {/* Close — top left */}
                <button
                  onClick={closeViewer}
                  className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all"
                  aria-label="Schließen"
                >
                  <X size={18} />
                </button>

                {/* Counter — top center */}
                <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tabular-nums tracking-widest">
                  {viewerIdx + 1} / {images.length}
                </span>
              </div>
            </div>
          )}

          <style>{`
            @keyframes galleryFadeIn {
              from { opacity: 0; transform: scale(0.97); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
