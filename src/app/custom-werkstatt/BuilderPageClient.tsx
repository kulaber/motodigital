'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BadgeCheck, MapPin, ChevronLeft, ChevronRight, Wrench, Star, ChevronDown, SlidersHorizontal, Bookmark, X } from 'lucide-react'
import { type Builder } from '@/lib/data/builders'
import { isOpenNow } from '@/lib/utils/openingHours'
import { createClient } from '@/lib/supabase/client'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const SPECIALTIES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

// Header 64px + filter bar ~56px
const STICKY_OFFSET = 120

interface Props { builders: Builder[] }

/* ── Save button ── */
function SaveButton({ builderId, saved, onToggle }: { builderId: string | null; saved: boolean; onToggle: (id: string | null) => void }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(builderId) }}
      className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
      aria-label={saved ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
    >
      <Bookmark
        size={14}
        className={saved ? 'text-[#06a5a5] fill-[#06a5a5]' : 'text-[#222222]/60'}
        strokeWidth={2}
      />
    </button>
  )
}

/* ── Per-card photo carousel ── */
function BuilderCardPhoto({ b, selected }: { b: Builder; selected: boolean }) {
  const images = b.media.filter(m => m.type === 'image').slice(0, 5)
  const [idx, setIdx] = useState(0)
  const [hovered, setHovered] = useState(false)

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx(i => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault()
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
              onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i) }}
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

/* ── Map overlay card ── */
function MapBuilderCard({ b, onClose }: { b: Builder; onClose: () => void }) {
  const images = b.media.filter(m => m.type === 'image').slice(0, 8)
  const [idx, setIdx] = useState(0)

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
      <div
        className="pointer-events-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EBEBEB] animate-in slide-in-from-bottom-3 fade-in duration-200"
        style={{ maxWidth: 360, margin: '0 auto' }}
      >
        {/* Gallery */}
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          {images.length > 0 ? (
            <>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={img.title ?? b.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform z-10"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform z-10"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.slice(0, 6).map((_, i) => (
                      <button
                        key={i}
                        onClick={e => { e.stopPropagation(); setIdx(i) }}
                        className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-[#F7F7F7] flex items-center justify-center">
              <span className="text-3xl font-bold text-[#B0B0B0]">{b.initials}</span>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Info */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-bold text-[#222222] truncate">{b.name}</p>
              {b.verified && <BadgeCheck size={13} className="text-[#06a5a5] flex-shrink-0" />}
            </div>
            <p className="text-xs text-[#717171] flex items-center gap-1 truncate">
              <MapPin size={9} className="flex-shrink-0" />
              {b.city}{b.specialty ? ` · ${b.specialty}` : ''}
            </p>
            {b.rating && (
              <p className="text-xs text-[#222222] flex items-center gap-0.5 font-medium mt-0.5">
                <Star size={10} className="fill-[#222222] text-[#222222]" />
                {b.rating.toFixed(1)}
              </p>
            )}
          </div>
          <Link
            href={`/custom-werkstatt/${b.slug}`}
            className="flex-shrink-0 bg-[#06a5a5] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#058f8f] transition-all"
          >
            Profil ansehen
          </Link>
        </div>
      </div>
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
  const [hoveredBuilder,  setHoveredBuilder]  = useState<Builder | null>(null)
  const [savedIds,        setSavedIds]        = useState<Set<string>>(new Set())
  const [userId,          setUserId]          = useState<string | null>(null)
  const [mapBounds,       setMapBounds]       = useState<mapboxgl.LngLatBounds | null>(null)
  const [mapReady,        setMapReady]        = useState(false)
  const [markerEpoch,     setMarkerEpoch]     = useState(0)  // increments on moveend to trigger cluster redraw
  const router = useRouter()
  const supabase = createClient()

  // Hydration-safe clock
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Load current user + saved builders
  useEffect(() => {
    async function loadSaved() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('saved_builders') as any)
        .select('builder_id')
        .eq('user_id', user.id) as { data: { builder_id: string }[] | null }
      if (data) setSavedIds(new Set(data.map(r => r.builder_id)))
    }
    loadSaved()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleSave(builderId: string | null) {
    if (!userId) { router.push('/auth/login'); return }
    if (!builderId) return   // static builder without DB id — cannot save
    const isSaved = savedIds.has(builderId)
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(builderId) : next.add(builderId)
      return next
    })
    if (isSaved) {
      await supabase.from('saved_builders').delete()
        .eq('user_id', userId).eq('builder_id', builderId)
    } else {
      await supabase.from('saved_builders').insert({ user_id: userId, builder_id: builderId })
    }
  }

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

  const visible = useMemo(() => {
    if (!mapReady || !mapBounds) return []
    const sw = mapBounds.getSouthWest()
    const ne = mapBounds.getNorthEast()
    const lngPad = (ne.lng - sw.lng) * 0.08
    const latPad = (ne.lat - sw.lat) * 0.08
    return filtered.filter(b => {
      if (!b.lat || !b.lng) return false
      return b.lng >= sw.lng - lngPad && b.lng <= ne.lng + lngPad &&
             b.lat >= sw.lat - latPad && b.lat <= ne.lat + latPad
    })
  }, [filtered, mapBounds, mapReady])

  /* ── markers ── */
  useEffect(() => {
    addMarkersRef.current = () => {
      const map = mapRef.current
      if (!map) return
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // Pixel-space clustering: group pins within 40px of each other
      const PIXEL_RADIUS = 40
      const withCoords = filtered.filter(b => b.lat && b.lng)
      const projected = withCoords.map(b => ({ b, px: map.project([b.lng!, b.lat!]) }))

      type Cluster = { members: typeof withCoords; centerLng: number; centerLat: number }
      const clusters: Cluster[] = []
      const assigned = new Set<number>()

      for (let i = 0; i < projected.length; i++) {
        if (assigned.has(i)) continue
        const members = [projected[i].b]
        let sumLng = projected[i].b.lng!
        let sumLat = projected[i].b.lat!
        for (let j = i + 1; j < projected.length; j++) {
          if (assigned.has(j)) continue
          const dx = projected[i].px.x - projected[j].px.x
          const dy = projected[i].px.y - projected[j].px.y
          if (Math.sqrt(dx * dx + dy * dy) < PIXEL_RADIUS) {
            members.push(projected[j].b)
            sumLng += projected[j].b.lng!
            sumLat += projected[j].b.lat!
            assigned.add(j)
          }
        }
        assigned.add(i)
        clusters.push({ members, centerLng: sumLng / members.length, centerLat: sumLat / members.length })
      }

      for (const cluster of clusters) {
        const el = document.createElement('div')
        el.style.cssText = 'width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;'

        const inner = document.createElement('div')

        const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="18" height="18"><path fill="white" d="M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z"/></svg>`

        if (cluster.members.length > 1) {
          // ── Cluster marker ──
          inner.style.cssText = `
            width:40px;height:40px;
            background:#06a5a5;
            border:2px solid #06a5a5;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.20);
            transition:transform 0.15s,box-shadow 0.15s;
            pointer-events:none;
            position:relative;
          `
          inner.innerHTML = logoSvg
          // Count badge
          const badge = document.createElement('div')
          badge.style.cssText = `
            position:absolute;top:-4px;right:-4px;
            width:16px;height:16px;
            background:#ffffff;
            border:1.5px solid #06a5a5;
            border-radius:50%;
            font-size:9px;font-weight:800;
            color:#06a5a5;
            display:flex;align-items:center;justify-content:center;
            font-family:Inter,system-ui,sans-serif;
          `
          badge.textContent = String(cluster.members.length)
          inner.appendChild(badge)
          el.appendChild(inner)
          el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.15)'; inner.style.boxShadow = '0 4px 16px rgba(6,165,165,0.4)' })
          el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)'; inner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.20)' })
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            const bounds = new mapboxgl.LngLatBounds()
            cluster.members.forEach(b => bounds.extend([b.lng!, b.lat!]))
            map.fitBounds(bounds, { padding: 100, maxZoom: 14, duration: 600 })
          })
        } else {
          // ── Individual marker ──
          const b = cluster.members[0]
          const isActive = selectedBuilder?.slug === b.slug || hoveredBuilder?.slug === b.slug
          inner.style.cssText = `
            width:40px;height:40px;
            background:${isActive ? '#06a5a5' : '#06a5a5'};
            border:2px solid ${isActive ? '#048e8e' : '#06a5a5'};
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:${isActive ? '0 4px 16px rgba(6,165,165,0.5)' : '0 2px 8px rgba(0,0,0,0.18)'};
            transition:transform 0.15s cubic-bezier(0.16,1,0.3,1),box-shadow 0.15s;
            pointer-events:none;
            opacity:${isActive ? '1' : '0.92'};
          `
          inner.innerHTML = logoSvg
          el.appendChild(inner)
          el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.2)'; inner.style.boxShadow = '0 4px 16px rgba(6,165,165,0.45)'; inner.style.opacity = '1' })
          el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)'; inner.style.boxShadow = isActive ? '0 4px 16px rgba(6,165,165,0.5)' : '0 2px 8px rgba(0,0,0,0.18)'; inner.style.opacity = isActive ? '1' : '0.92' })
          el.addEventListener('click', (e) => { e.stopPropagation(); setSelectedBuilder(b) })
        }

        const m = new mapboxgl.Marker({ element: el })
          .setLngLat([cluster.centerLng, cluster.centerLat])
          .addTo(map)
        markersRef.current.push(m)
      }
    }
  }, [filtered, selectedBuilder, hoveredBuilder, markerEpoch])

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
      zoom: 5,
      minZoom: 5,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.once('load', () => {
      // Apply teal accent theme to map layers
      const layers = map.getStyle().layers ?? []
      layers.forEach(layer => {
        try {
          const id = layer.id
          if (layer.type === 'background') {
            map.setPaintProperty(id, 'background-color', '#f0fafa')
          } else if (layer.type === 'fill') {
            if (id === 'water' || id === 'water-shadow' || id.startsWith('water-')) {
              map.setPaintProperty(id, 'fill-color', '#9fd8d8')
            } else if (id === 'national-park' || id.startsWith('landuse')) {
              map.setPaintProperty(id, 'fill-color', '#d8f0f0')
            } else if (id.startsWith('building')) {
              map.setPaintProperty(id, 'fill-color', '#e4f5f5')
              if (id === 'building-outline') {
                map.setPaintProperty(id, 'fill-outline-color', '#cceaea')
              }
            } else if (id.startsWith('land-structure')) {
              map.setPaintProperty(id, 'fill-color', '#e8fafa')
            }
          } else if (layer.type === 'line') {
            if (id.startsWith('waterway')) {
              map.setPaintProperty(id, 'line-color', '#9fd8d8')
            } else if (id.startsWith('road') || id.startsWith('bridge') || id.startsWith('tunnel')) {
              // keep roads as-is (white/light gray) for readability
            } else if (id.startsWith('admin')) {
              map.setPaintProperty(id, 'line-color', '#7bc5c5')
            }
          }
        } catch { /* layer may not support property */ }
      })
      addMarkersRef.current()
      setMapBounds(map.getBounds())
      setMapReady(true)
    })
    map.on('move',    () => setMapBounds(map.getBounds() ?? null))
    map.on('moveend', () => { setMapBounds(map.getBounds() ?? null); setMarkerEpoch(e => e + 1) })
    map.on('click', () => setSelectedBuilder(null))

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── redraw markers on filter/hover/zoom change ── */
  useEffect(() => {
    const map = mapRef.current
    if (map?.loaded()) addMarkersRef.current()
  }, [filtered, selectedBuilder, hoveredBuilder, markerEpoch])

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
          {!mapReady ? (
            <div className="p-4 grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-[4/3] bg-[#F0F0F0] rounded-xl mb-2" />
                  <div className="h-3 bg-[#F0F0F0] rounded w-3/4 mb-1.5" />
                  <div className="h-2.5 bg-[#F0F0F0] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <p className="text-[#717171] text-sm mb-4">Keine Custom-Werkstatt in diesem Kartenbereich.</p>
              <button
                onClick={() => {
                  setActiveSpecialty('Alle')
                  setOnlyVerified(false)
                  setOnlyOpen(false)
                  const map = mapRef.current
                  if (!map) return
                  const withCoords = builders.filter(b => b.lat && b.lng)
                  if (withCoords.length === 0) return
                  const bounds = new mapboxgl.LngLatBounds()
                  withCoords.forEach(b => bounds.extend([b.lng!, b.lat!]))
                  map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 800 })
                }}
                className="text-xs font-semibold text-[#222222] border border-[#DDDDDD] px-4 py-2 rounded-full hover:bg-[#F7F7F7] transition-all cursor-pointer"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-[#717171] mb-4 px-0.5">{visible.length} Builder</p>

              {/* 2-column grid */}
              <div className="grid grid-cols-2 gap-4">
                {visible.map(b => (
                  <Link
                    key={b.slug}
                    href={`/custom-werkstatt/${b.slug}`}
                    className="group"
                    onMouseEnter={() => setHoveredBuilder(b)}
                    onMouseLeave={() => setHoveredBuilder(null)}
                  >
                    {/* Photo carousel + save button */}
                    <div className="relative">
                      <BuilderCardPhoto b={b} selected={selectedBuilder?.slug === b.slug} />
                      <SaveButton
                        builderId={b.id ?? null}
                        saved={b.id ? savedIds.has(b.id) : false}
                        onToggle={toggleSave}
                      />
                    </div>

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

                      <p className="mt-2 text-[10px] font-semibold text-[#06a5a5] group-hover:text-[#058f8f] transition-colors">
                        Profil ansehen →
                      </p>
                    </div>
                  </Link>
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
                  className="block w-full bg-[#06a5a5] text-white text-xs font-semibold py-2.5 rounded-full text-center hover:bg-[#058f8f] transition-all">
                  Als Builder registrieren
                </Link>
              </div>

              <p className="text-[10px] text-[#B0B0B0] text-center py-4">{visible.length} Builder · MotoDigital</p>
            </div>
          )}
        </div>

        {/* RIGHT — sticky map */}
        <div className="hidden lg:block w-1/2 relative">
          <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
          {selectedBuilder && (
            <MapBuilderCard b={selectedBuilder} onClose={() => setSelectedBuilder(null)} />
          )}
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
