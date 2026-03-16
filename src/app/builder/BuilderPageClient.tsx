'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, MapPin, List, Map as MapIcon, Wrench } from 'lucide-react'
import { type Builder } from '@/lib/data/builders'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const SPECIALTIES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

interface BuilderPageClientProps {
  builders: Builder[]
}

export default function BuilderPageClient({ builders }: BuilderPageClientProps) {
  const [view, setView] = useState<'list' | 'map'>('list')
  const [activeSpecialty, setActiveSpecialty] = useState('Alle')
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const filtered = useMemo(() => {
    return builders.filter(b => {
      const specialtyMatch =
        activeSpecialty === 'Alle' ||
        b.tags.some(t => t.toLowerCase() === activeSpecialty.toLowerCase()) ||
        b.specialty.toLowerCase().includes(activeSpecialty.toLowerCase())
      const verifiedMatch = !onlyVerified || b.verified
      return specialtyMatch && verifiedMatch
    })
  }, [builders, activeSpecialty, onlyVerified])

  const totalBuilds = useMemo(() => builders.reduce((a, b) => a + b.builds, 0), [builders])
  const verifiedCount = useMemo(() => builders.filter(b => b.verified).length, [builders])

  // Init map when view switches to 'map'
  useEffect(() => {
    if (view !== 'map') return
    const timer = setTimeout(() => {
      if (mapRef.current || !mapContainerRef.current) return
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) return
      mapboxgl.accessToken = token
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [10.5, 51.2],
        zoom: 5.5,
        attributionControl: false,
      })
      mapRef.current = map
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    }, 50)
    return () => {
      clearTimeout(timer)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [view])

  // Update markers when filtered builders change
  useEffect(() => {
    const map = mapRef.current
    if (!map || view !== 'map') return

    const addMarkers = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      for (const b of filtered) {
        if (!b.lat || !b.lng) continue
        const isSelected = selectedBuilder?.slug === b.slug

        const el = document.createElement('div')
        el.setAttribute('aria-label', b.name)
        el.style.cssText = `
          width:44px;height:44px;
          background:${isSelected ? '#2AABAB' : '#1C1C1C'};
          border:2px solid ${b.verified ? '#2AABAB' : 'rgba(240,237,228,0.3)'};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;
          color:${isSelected ? '#141414' : '#F0EDE4'};
          cursor:pointer;
          box-shadow:0 2px 12px rgba(0,0,0,0.6);
          font-family:Inter,system-ui,sans-serif;
          transition:all 0.15s;
        `
        el.textContent = b.initials
        el.onmouseenter = () => { el.style.transform = 'scale(1.15)'; el.style.zIndex = '10' }
        el.onmouseleave = () => { el.style.transform = 'scale(1)'; el.style.zIndex = '' }

        const popup = new mapboxgl.Popup({
          offset: 24, closeButton: false, maxWidth: '220px',
        }).setHTML(`
          <div style="font-family:Inter,system-ui,sans-serif;padding:2px 0;background:transparent;">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
              <span style="font-weight:700;font-size:13px;color:#F0EDE4;">${b.name}</span>
              ${b.verified ? '<span style="color:#2AABAB;font-size:10px;">✓</span>' : ''}
            </div>
            <p style="font-size:11px;color:rgba(240,237,228,0.45);margin:0 0 8px;">${b.city} · ${b.specialty}</p>
            <a href="/builder/${b.slug}" style="font-size:11px;color:#2AABAB;font-weight:600;text-decoration:none;">Profil ansehen →</a>
          </div>
        `)

        el.addEventListener('click', () => setSelectedBuilder(b))

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([b.lng, b.lat])
          .setPopup(popup)
          .addTo(map)

        markersRef.current.push(marker)
      }
    }

    if (map.loaded()) {
      addMarkers()
    } else {
      map.once('load', addMarkers)
    }
  }, [filtered, view, selectedBuilder])

  // Fly to selected builder
  const handleBuilderClick = useCallback((b: Builder) => {
    setSelectedBuilder(b)
    if (b.lat && b.lng && mapRef.current) {
      mapRef.current.flyTo({ center: [b.lng, b.lat], zoom: 13, duration: 800 })
    }
  }, [])

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: #1C1C1C !important;
          border: 1px solid rgba(240,237,228,0.1) !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
      `}</style>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-[#141414]/95 backdrop-blur-md border-b border-[#F0EDE4]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-3 flex items-center gap-3">
          {/* Specialty chips — scrollable */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              {SPECIALTIES.map(spec => (
                <button
                  key={spec}
                  onClick={() => setActiveSpecialty(spec)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeSpecialty === spec
                      ? 'bg-[#2AABAB] text-[#141414]'
                      : 'bg-[#1C1C1C] text-[#F0EDE4]/40 border border-[#F0EDE4]/10 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/20'
                  }`}
                >
                  {spec}
                </button>
              ))}
              <button
                onClick={() => setOnlyVerified(v => !v)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                  onlyVerified
                    ? 'bg-[#2AABAB]/15 text-[#2AABAB] border border-[#2AABAB]/40'
                    : 'bg-[#1C1C1C] text-[#F0EDE4]/40 border border-[#F0EDE4]/10 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/20'
                }`}
              >
                <BadgeCheck size={11} />
                Verifiziert
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-[#F0EDE4]/10 flex-shrink-0" />

          {/* View toggle */}
          <div className="bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-xl p-1 flex gap-0.5 flex-shrink-0">
            <button
              onClick={() => setView('list')}
              aria-label="Listenansicht"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer min-h-[44px] ${
                view === 'list'
                  ? 'bg-[#2AABAB] text-[#141414]'
                  : 'text-[#F0EDE4]/40 hover:text-[#F0EDE4]'
              }`}
            >
              <List size={13} />
              <span className="hidden sm:inline">Liste</span>
            </button>
            <button
              onClick={() => setView('map')}
              aria-label="Kartenansicht"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer min-h-[44px] ${
                view === 'map'
                  ? 'bg-[#2AABAB] text-[#141414]'
                  : 'text-[#F0EDE4]/40 hover:text-[#F0EDE4]'
              }`}
            >
              <MapIcon size={13} />
              <span className="hidden sm:inline">Karte</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <section className="py-8 sm:py-10 bg-[#141414]">
          <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-8 items-start">

              {/* Cards grid */}
              <div>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-[#F0EDE4]/30 text-sm mb-4">Keine Builder für diesen Filter gefunden.</p>
                    <button
                      onClick={() => { setActiveSpecialty('Alle'); setOnlyVerified(false) }}
                      className="text-xs font-semibold text-[#2AABAB] border border-[#2AABAB]/30 px-4 py-2 rounded-full hover:bg-[#2AABAB]/10 transition-all cursor-pointer"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filtered.map((b, i) => (
                        <Link
                          key={b.slug}
                          href={`/builder/${b.slug}`}
                          className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-4 sm:p-5 hover:border-[#2AABAB]/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group block"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          {/* Top row */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl bg-[#2AABAB]/12 border border-[#2AABAB]/20 flex items-center justify-center text-sm font-bold text-[#2AABAB] flex-shrink-0 group-hover:bg-[#2AABAB]/20 transition-colors">
                              {b.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <p className="text-sm font-semibold text-[#F0EDE4] truncate">{b.name}</p>
                                {b.verified && <BadgeCheck size={12} className="text-[#2AABAB] flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-[#F0EDE4]/35 flex items-center gap-1">
                                <MapPin size={9} /> {b.city} · seit {b.since}
                              </p>
                            </div>
                            {b.featured && (
                              <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest bg-[#2AABAB]/12 text-[#2AABAB] border border-[#2AABAB]/20 px-2 py-0.5 rounded-full">
                                Top
                              </span>
                            )}
                          </div>

                          {/* Bio */}
                          <p className="text-xs text-[#F0EDE4]/40 leading-relaxed mb-3 line-clamp-2">{b.bio}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {b.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-medium text-[#F0EDE4]/40 bg-[#F0EDE4]/5 border border-[#F0EDE4]/8 px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Bottom */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#F0EDE4]/6">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#F0EDE4]/30">
                                <span className="text-[#F0EDE4]/60 font-semibold">{b.builds}</span> Builds
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[#F0EDE4]/30">
                                <svg width="10" height="10" viewBox="0 0 14 14" fill="#2AABAB"><path d="M7 1L8.5 5.5H13L9.5 8L11 12L7 9.5L3 12L4.5 8L1 5.5H5.5Z"/></svg>
                                <span className="text-[#F0EDE4]/60 font-semibold">{b.rating}</span>
                              </span>
                            </div>
                            <span className="text-xs text-[#2AABAB] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Profil ansehen →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <p className="text-xs text-[#F0EDE4]/25 mt-6 text-center">{filtered.length} Builder</p>
                  </>
                )}
              </div>

              {/* Sidebar — desktop only */}
              <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-24">
                <SidebarContent totalBuilds={totalBuilds} verifiedCount={verifiedCount} />
              </div>
            </div>

            {/* Mobile sidebar below cards */}
            <div className="lg:hidden mt-8 flex flex-col gap-4">
              <SidebarContent totalBuilds={totalBuilds} verifiedCount={verifiedCount} />
            </div>
          </div>
        </section>
      )}

      {/* MAP VIEW */}
      {view === 'map' && (
        <div
          className="relative flex bg-[#141414]"
          style={{ height: 'calc(100dvh - 128px)' }}
        >
          {/* Desktop left panel */}
          <div className="hidden lg:flex w-[340px] flex-shrink-0 bg-[#141414] border-r border-[#F0EDE4]/6 flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F0EDE4]/5 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-[#F0EDE4]/40 uppercase tracking-widest">
                {filtered.length} Builder
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(b => (
                <div key={b.slug} className="border-b border-[#F0EDE4]/5 last:border-0">
                  <button
                    onClick={() => handleBuilderClick(b)}
                    className={`w-full text-left px-4 py-3 hover:bg-[#1C1C1C] transition-colors cursor-pointer ${
                      selectedBuilder?.slug === b.slug
                        ? 'bg-[#2AABAB]/8 border-l-2 border-[#2AABAB]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2AABAB]/12 border border-[#2AABAB]/20 flex items-center justify-center text-xs font-bold text-[#2AABAB] flex-shrink-0">
                        {b.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <p className="text-sm font-semibold text-[#F0EDE4] truncate">{b.name}</p>
                          {b.verified && <BadgeCheck size={11} className="text-[#2AABAB] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[#F0EDE4]/35 truncate">{b.city} · {b.specialty}</p>
                      </div>
                      <Link
                        href={`/builder/${b.slug}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-[#2AABAB]/60 hover:text-[#2AABAB] transition-colors flex-shrink-0 cursor-pointer"
                      >
                        →
                      </Link>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Map container */}
          <div className="flex-1 relative">
            {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1C1C1C]">
                <div className="text-center">
                  <MapIcon size={32} className="text-[#F0EDE4]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#F0EDE4]/40">Karte nicht verfügbar</p>
                  <p className="text-xs text-[#F0EDE4]/20 mt-1">NEXT_PUBLIC_MAPBOX_TOKEN nicht gesetzt</p>
                </div>
              </div>
            ) : (
              <div ref={mapContainerRef} className="absolute inset-0" />
            )}
          </div>

          {/* Mobile bottom drawer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#141414] rounded-t-2xl border-t border-[#F0EDE4]/10 h-52 overflow-y-auto">
            <div className="px-4 py-2 border-b border-[#F0EDE4]/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
              <span className="text-xs font-semibold text-[#F0EDE4]/40 uppercase tracking-widest">
                {filtered.length} Builder
              </span>
              <div className="w-8 h-1 bg-[#F0EDE4]/15 rounded-full mx-auto" />
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex flex-row gap-3 px-4 py-3 min-w-max">
                {filtered.map(b => (
                  <button
                    key={b.slug}
                    onClick={() => handleBuilderClick(b)}
                    className={`flex-shrink-0 w-40 text-left bg-[#1C1C1C] border rounded-xl p-3 transition-all cursor-pointer ${
                      selectedBuilder?.slug === b.slug
                        ? 'border-[#2AABAB]/50 bg-[#2AABAB]/8'
                        : 'border-[#F0EDE4]/8 hover:border-[#2AABAB]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#2AABAB]/12 border border-[#2AABAB]/20 flex items-center justify-center text-[10px] font-bold text-[#2AABAB] flex-shrink-0">
                        {b.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F0EDE4] truncate">{b.name}</p>
                        <p className="text-[10px] text-[#F0EDE4]/35 truncate">{b.city}</p>
                      </div>
                    </div>
                    <Link
                      href={`/builder/${b.slug}`}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] text-[#2AABAB] font-semibold"
                    >
                      Profil →
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SidebarContent({ totalBuilds, verifiedCount }: { totalBuilds: number; verifiedCount: number }) {
  return (
    <>
      <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-36 h-36 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(42,171,171,0.10) 0%, transparent 70%)', transform: 'translate(35%,-35%)' }}
        />
        <div className="w-10 h-10 bg-[#2AABAB]/12 border border-[#2AABAB]/20 rounded-xl flex items-center justify-center mb-4">
          <Wrench size={18} className="text-[#2AABAB]" />
        </div>
        <h3 className="text-sm font-bold text-[#F0EDE4] mb-2">Du bist Builder?</h3>
        <p className="text-xs text-[#F0EDE4]/40 leading-relaxed mb-5">
          Registriere dich kostenlos, zeige deine Builds und werde direkt von Riders kontaktiert.
        </p>
        <Link
          href="/auth/register"
          className="block w-full bg-[#2AABAB] text-[#141414] text-sm font-semibold py-3 rounded-full text-center hover:bg-[#3DBFBF] transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          Als Builder registrieren
        </Link>
      </div>

      <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
        <p className="text-[10px] text-[#F0EDE4]/25 uppercase tracking-widest font-semibold mb-4">Plattform</p>
        {[
          { label: 'Aktive Builder', value: 6 },
          { label: 'Verifiziert', value: verifiedCount },
          { label: 'Builds gesamt', value: totalBuilds },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-[#F0EDE4]/5 last:border-0">
            <span className="text-xs text-[#F0EDE4]/40">{s.label}</span>
            <span className="text-sm font-bold text-[#F0EDE4]">{s.value}</span>
          </div>
        ))}
      </div>
    </>
  )
}
