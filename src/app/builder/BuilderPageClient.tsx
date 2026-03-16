'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, MapPin, ChevronLeft, ChevronRight, Wrench, Star, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { type Builder } from '@/lib/data/builders'
import { isOpenNow } from '@/lib/utils/openingHours'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const SPECIALTIES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

// Header 64px + filter bar ~56px
const STICKY_OFFSET = 120

interface Props { builders: Builder[] }

/* ── Per-card photo carousel ── */
function BuilderCardPhoto({ b, selected }: { b: Builder; selected: boolean }) {
  const images = b.media.filter(m => m.type === 'image').slice(0, 5)
  const [idx, setIdx] = useState(0)
  const [hovered, setHovered] = useState(false)

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIdx(i => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIdx(i => (i + 1) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-[#F7F7F7] flex items-center justify-center rounded-xl overflow-hidden">
        <span className="text-2xl font-bold text-[#B0B0B0]">{b.initials}</span>
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Images */}
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          alt={img.title ?? b.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Gradient overlay bottom */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Arrows — only if >1 image */}
      {images.length > 1 && hovered && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i) }}
              className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      )}

      {/* Top badge */}
      {b.featured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-bold uppercase tracking-widest bg-white text-[#222222] px-2 py-0.5 rounded-full shadow-sm">
            Top
          </span>
        </div>
      )}

      {/* Selected ring */}
      {selected && (
        <div className="absolute inset-0 ring-2 ring-[#222222] ring-inset rounded-xl pointer-events-none" />
      )}
    </div>
  )
}

export default function BuilderPageClient({ builders }: Props) {
  const [activeSpecialty, setActiveSpecialty] = useState('Alle')
  const [styleOpen,       setStyleOpen]       = useState(false)
  const [onlyVerified,    setOnlyVerified]    = useState(false)
  const [onlyOpen,        setOnlyOpen]        = useState(false)
  const [now,             setNow]             = useState<Date | null>(null)
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null)

  // Hydration-safe clock
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<mapboxgl.Map | null>(null)
  const markersRef      = useRef<mapboxgl.Marker[]>([])
  const addMarkersRef   = useRef<() => void>(() => {})

  const filtered = useMemo(() => builders.filter(b => {
    const specOk     = activeSpecialty === 'Alle' ||
      b.tags.some(t => t.toLowerCase() === activeSpecialty.toLowerCase()) ||
      b.specialty.toLowerCase().includes(activeSpecialty.toLowerCase())
    const verifiedOk = !onlyVerified || b.verified
    const openOk     = !onlyOpen || !now || isOpenNow(b.openingHours, now)
    return specOk && verifiedOk && openOk
  }), [builders, activeSpecialty, onlyVerified, onlyOpen, now])

  /* ── markers ── */
  useEffect(() => {
    addMarkersRef.current = () => {
      const map = mapRef.current
      if (!map) return
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      for (const b of filtered) {
        if (!b.lat || !b.lng) continue
        const isSelected = selectedBuilder?.slug === b.slug

        const el = document.createElement('div')
        el.style.cssText = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;'

        const inner = document.createElement('div')
        inner.style.cssText = `
          width:36px;height:36px;
          background:${isSelected ? '#086565' : '#ffffff'};
          border:2px solid ${isSelected ? '#086565' : '#DDDDDD'};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:700;
          color:${isSelected ? '#ffffff' : '#222222'};
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          font-family:Inter,system-ui,sans-serif;
          transition:transform 0.15s cubic-bezier(0.16,1,0.3,1),box-shadow 0.15s;
          pointer-events:none;
        `
        inner.textContent = b.initials
        el.appendChild(inner)

        el.addEventListener('mouseenter', () => {
          inner.style.transform = 'scale(1.2)'
          inner.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'
        })
        el.addEventListener('mouseleave', () => {
          inner.style.transform = 'scale(1)'
          inner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
        })

        const popup = new mapboxgl.Popup({ offset: 22, closeButton: false, maxWidth: '220px' })
          .setHTML(`
            <div style="font-family:Inter,system-ui,sans-serif;padding:2px 0;">
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
                <span style="font-weight:700;font-size:13px;color:#222222;">${b.name}</span>
                ${b.verified ? '<span style="color:#086565;font-size:10px;">✓</span>' : ''}
              </div>
              <p style="font-size:11px;color:#717171;margin:0 0 8px;">${b.city} · ${b.specialty}</p>
              <a href="/builder/${b.slug}" style="font-size:11px;color:#086565;font-weight:600;text-decoration:none;">Profil ansehen →</a>
            </div>
          `)

        el.addEventListener('click', () => setSelectedBuilder(b))
        const m = new mapboxgl.Marker({ element: el })
          .setLngLat([b.lng, b.lat])
          .setPopup(popup)
          .addTo(map)
        markersRef.current.push(m)
      }
    }
  }, [filtered, selectedBuilder])

  /* ── init map once ── */
  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || mapRef.current) return

    mapboxgl.accessToken = token.trim()
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10.5, 51.2],
      zoom: 5.5,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.once('load', () => addMarkersRef.current())

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── redraw markers on filter change ── */
  useEffect(() => {
    const map = mapRef.current
    if (map?.loaded()) addMarkersRef.current()
  }, [filtered, selectedBuilder])

  /* ── fly to selected ── */
  const handleBuilderClick = useCallback((b: Builder) => {
    setSelectedBuilder(b)
    if (b.lat && b.lng && mapRef.current) {
      mapRef.current.flyTo({ center: [b.lng, b.lat], zoom: 13, duration: 800 })
    }
  }, [])

  const mapHeight = `calc(100dvh - ${STICKY_OFFSET}px)`

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: #ffffff !important;
          border: 1px solid #DDDDDD !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.10) !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
        .mapboxgl-ctrl-group { border: 1px solid #DDDDDD !important; border-radius: 10px !important; overflow: hidden; }
        .mapboxgl-ctrl button { background: #fff !important; }
      `}</style>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="px-4 sm:px-5 lg:px-6 py-3 flex items-center gap-2">

          {/* Stil dropdown */}
          <div className="relative">
            <button
              onClick={() => setStyleOpen(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSpecialty !== 'Alle'
                  ? 'bg-[#222222] text-white'
                  : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
              }`}
            >
              <SlidersHorizontal size={11} />
              {activeSpecialty === 'Alle' ? 'Stil' : activeSpecialty}
              <ChevronDown size={11} className={`transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
            </button>

            {styleOpen && (
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setStyleOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#DDDDDD] rounded-2xl shadow-lg overflow-hidden min-w-[160px] py-1">
                  {SPECIALTIES.map(spec => (
                    <button
                      key={spec}
                      onClick={() => { setActiveSpecialty(spec); setStyleOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between gap-3 ${
                        activeSpecialty === spec
                          ? 'text-[#222222] font-semibold bg-[#F7F7F7]'
                          : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]'
                      }`}
                    >
                      {spec}
                      {activeSpecialty === spec && <span className="w-1.5 h-1.5 rounded-full bg-[#222222] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Verifiziert */}
          <button onClick={() => setOnlyVerified(v => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              onlyVerified
                ? 'bg-[#222222] text-white'
                : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
            }`}>
            <BadgeCheck size={11} /> Verifiziert
          </button>

          {/* Jetzt geöffnet */}
          {now && (
            <button onClick={() => setOnlyOpen(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                onlyOpen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${onlyOpen ? 'bg-white animate-pulse' : 'bg-[#717171]'}`} />
              Jetzt geöffnet
            </button>
          )}
        </div>
      </div>

      {/* ── Split layout: List left | Map right ── */}
      <div className="flex" style={{ height: mapHeight }}>

        {/* LEFT — scrollable 2-col grid */}
        <div className="w-full lg:w-1/2 overflow-y-auto border-r border-[#EBEBEB]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <p className="text-[#717171] text-sm mb-4">Keine Builder für diesen Filter.</p>
              <button
                onClick={() => { setActiveSpecialty('Alle'); setOnlyVerified(false); setOnlyOpen(false) }}
                className="text-xs font-semibold text-[#222222] border border-[#DDDDDD] px-4 py-2 rounded-full hover:bg-[#F7F7F7] transition-all cursor-pointer"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-[#717171] mb-4 px-0.5">{filtered.length} Builder</p>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {filtered.map(b => (
                  <div
                    key={b.slug}
                    onClick={() => handleBuilderClick(b)}
                    className="cursor-pointer group"
                  >
                    {/* Photo carousel */}
                    <BuilderCardPhoto b={b} selected={selectedBuilder?.slug === b.slug} />

                    {/* Card info */}
                    <div className="pt-2.5 pb-1">
                      {/* Name row */}
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <p className="text-sm font-semibold text-[#222222] leading-tight line-clamp-1 flex-1">
                          {b.name}
                        </p>
                        {b.verified && (
                          <BadgeCheck size={13} className="text-[#717171] flex-shrink-0 mt-0.5" />
                        )}
                      </div>

                      {/* City + specialty */}
                      <p className="text-xs text-[#717171] flex items-center gap-1 mb-1">
                        <MapPin size={9} className="flex-shrink-0" />
                        <span className="truncate">{b.city}{b.specialty ? ` · ${b.specialty}` : ''}</span>
                      </p>

                      {/* Rating */}
                      {b.rating && (
                        <p className="text-xs text-[#222222] flex items-center gap-0.5 font-medium">
                          <Star size={10} className="fill-[#222222] text-[#222222]" />
                          {b.rating.toFixed(1)}
                          {b.since && <span className="text-[#717171] font-normal ml-1">seit {b.since}</span>}
                        </p>
                      )}

                      {/* Tags */}
                      {b.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {b.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Profile link */}
                      <Link
                        href={`/builder/${b.slug}`}
                        onClick={e => e.stopPropagation()}
                        className="mt-2 text-[10px] font-semibold text-[#086565] hover:text-[#075555] transition-colors inline-block"
                      >
                        Profil ansehen →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA card */}
              <div className="mt-6 bg-white border border-[#EBEBEB] rounded-2xl p-5">
                <div className="w-9 h-9 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl flex items-center justify-center mb-3">
                  <Wrench size={16} className="text-[#717171]" />
                </div>
                <h3 className="text-sm font-bold text-[#222222] mb-1">Du bist Builder?</h3>
                <p className="text-xs text-[#717171] leading-relaxed mb-4">
                  Registriere dich kostenlos und werde direkt von Riders gefunden.
                </p>
                <Link href="/auth/register"
                  className="block w-full bg-[#086565] text-white text-xs font-semibold py-2.5 rounded-full text-center hover:bg-[#075555] transition-all">
                  Als Builder registrieren
                </Link>
              </div>

              <p className="text-[10px] text-[#B0B0B0] text-center py-4">{filtered.length} Builder · MotoDigital</p>
            </div>
          )}
        </div>

        {/* RIGHT — sticky map */}
        <div className="hidden lg:block w-1/2 relative">
          <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
        </div>
      </div>

      {/* Mobile map — below list on small screens */}
      <div className="lg:hidden w-full relative" style={{ height: '50vh' }}>
        <div className="absolute inset-0 flex items-center justify-center bg-[#F7F7F7] text-xs text-[#B0B0B0]">
          Karte nur auf Desktop verfügbar
        </div>
      </div>
    </>
  )
}
