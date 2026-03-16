'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, MapPin, Wrench } from 'lucide-react'
import { type Builder } from '@/lib/data/builders'
import { isOpenNow } from '@/lib/utils/openingHours'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const SPECIALTIES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

// Header 64px + filter bar ~56px
const STICKY_OFFSET = 120

interface Props { builders: Builder[] }

export default function BuilderPageClient({ builders }: Props) {
  const [activeSpecialty, setActiveSpecialty] = useState('Alle')
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

  const totalBuilds    = useMemo(() => builders.reduce((a, b) => a + b.builds, 0), [builders])
  const verifiedCount  = useMemo(() => builders.filter(b => b.verified).length, [builders])

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

    // ResizeObserver so the map fills its container as soon as it's painted
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
        <div className="px-4 sm:px-5 lg:px-6 py-3">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              {SPECIALTIES.map(spec => (
                <button key={spec} onClick={() => setActiveSpecialty(spec)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    activeSpecialty === spec
                      ? 'bg-[#222222] text-white'
                      : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
                  }`}>
                  {spec}
                </button>
              ))}

              <button onClick={() => setOnlyVerified(v => !v)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  onlyVerified
                    ? 'bg-[#222222] text-white'
                    : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
                }`}>
                <BadgeCheck size={11} /> Verifiziert
              </button>

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
        </div>
      </div>

      {/* ── Split layout: List left | Map right ── */}
      <div className="flex" style={{ height: mapHeight }}>

        {/* LEFT — scrollable builder list */}
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
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#717171] mb-3 px-1">{filtered.length} Builder</p>

              {filtered.map(b => (
                <button
                  key={b.slug}
                  onClick={() => handleBuilderClick(b)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 cursor-pointer group ${
                    selectedBuilder?.slug === b.slug
                      ? 'bg-[#F7F7F7] border-[#222222]/15'
                      : 'bg-white border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                      selectedBuilder?.slug === b.slug
                        ? 'bg-[#222222] text-white'
                        : 'bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB]'
                    }`}>
                      {b.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-semibold text-[#222222] truncate">{b.name}</p>
                        {b.verified && <BadgeCheck size={12} className="text-[#717171] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[#717171] flex items-center gap-1">
                        <MapPin size={9} className="flex-shrink-0" />
                        {b.city}{b.since ? ` · seit ${b.since}` : ''}
                      </p>
                    </div>
                    {b.featured && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-[#F7F7F7] text-[#717171] border border-[#DDDDDD] px-2 py-0.5 rounded-full flex-shrink-0">
                        Top
                      </span>
                    )}
                  </div>

                  {b.bio && (
                    <p className="text-xs text-[#717171] leading-relaxed mb-2.5 line-clamp-2 pl-[52px]">{b.bio}</p>
                  )}

                  <div className="flex items-center justify-between pl-[52px]">
                    <div className="flex flex-wrap gap-1">
                      {b.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/builder/${b.slug}`}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] font-semibold text-[#086565] hover:text-[#075555] transition-colors flex-shrink-0 ml-2"
                    >
                      Profil →
                    </Link>
                  </div>
                </button>
              ))}

              {/* CTA card at bottom of list */}
              <div className="mt-4 bg-white border border-[#EBEBEB] rounded-2xl p-5">
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
