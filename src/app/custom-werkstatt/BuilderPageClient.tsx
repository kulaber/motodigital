// Light Mode only — no dark: classes
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin, ChevronLeft, ChevronRight, Star, X, Map as MapIcon, List as ListIcon, Search, SlidersHorizontal } from 'lucide-react'
import SwipeableImages from '@/components/ui/SwipeableImages'
import WorkshopBottomSheet from '@/components/builder/WorkshopBottomSheet'
import { type Builder } from '@/lib/data/builders'
import { isOpenNow } from '@/lib/utils/openingHours'
import { createClient } from '@/lib/supabase/client'
import { LoginModal } from '@/components/ui/LoginModal'
import { useHideNavOnModal } from '@/hooks/useHideNavOnModal'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const LEISTUNGEN = [
  'Komplettumbau', 'Teileumbau', 'Elektrik', 'Lackierung', 'Folierung',
  'Pulverbeschichtung', 'Schweißen', 'Fräsen', 'Sandstrahlen', 'Verzinken',
  'Vergaser', 'TÜV-Einzelabnahme', 'TÜV-Untersuchung', 'Motorinstandsetzung',
  'Motorrevision', 'Motordiagnose', 'Sattlerarbeiten',
]

// Header 64px + filter bar ~56px
const STICKY_OFFSET = 120

const MAPBOX_LANG_SUPPORT = ['de','en','fr','es','it','pt','nl','pl','ru','zh','ar','ja','ko']

function setMapLanguage(map: mapboxgl.Map) {
  const browserLang = navigator.language?.split('-')[0] ?? 'en'
  const lang = MAPBOX_LANG_SUPPORT.includes(browserLang) ? browserLang : 'en'
  map.getStyle().layers?.forEach(layer => {
    if (layer.type !== 'symbol') return
    try {
      const field = map.getLayoutProperty(layer.id, 'text-field')
      if (field) {
        map.setLayoutProperty(layer.id, 'text-field',
          ['coalesce', ['get', `name_${lang}`], ['get', 'name']]
        )
      }
    } catch { /* layer may not support property */ }
  })
}

function applyMapStyle(map: mapboxgl.Map) {
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
        } else if (id.startsWith('admin')) {
          map.setPaintProperty(id, 'line-color', '#aaaaaa')
          map.setPaintProperty(id, 'line-width', 0.8)
          map.setPaintProperty(id, 'line-opacity', 0.6)
        }
      }
    } catch { /* layer may not support property */ }
  })
}

interface Props { builders: Builder[] }

/* ── Save button ── */
function SaveButton({ builderId, saved, onToggle }: { builderId: string | null; saved: boolean; onToggle: (id: string | null) => void }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(builderId) }}
      className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
      aria-label={saved ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
    >
      <Star
        size={14}
        className={saved ? 'text-[#06a5a5] fill-[#06a5a5]' : 'text-[#222222]/60'}
        strokeWidth={2}
      />
    </button>
  )
}

/* ── Per-card photo carousel ── */
function BuilderCardPhoto({ b, selected }: { b: Builder; selected: boolean }) {
  const images = b.media.filter(m => m.type === 'image').slice(0, 5).map(m => ({ url: m.url, alt: m.title ?? b.name }))

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative">
        <Image src="/images/workshop-default.png" alt={b.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
      </div>
    )
  }

  return (
    <div className="relative">
      <SwipeableImages images={images} aspectClass="aspect-[4/3]" />
      {b.featured && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="text-[10px] font-semibold bg-[#06a5a5]/20 border border-[#06a5a5]/30 text-[#06a5a5] px-2.5 py-0.5 rounded-full">Gesponsert</span>
        </div>
      )}
      {selected && (
        <div className="absolute inset-0 ring-2 ring-[#222222] ring-inset rounded-xl pointer-events-none" />
      )}
    </div>
  )
}

/* ── Map overlay card (desktop only) ── */
function MapBuilderCard({ b, onClose }: { b: Builder; onClose: () => void }) {
  const images = useMemo(() => b.media.filter(m => m.type === 'image').slice(0, 8), [b.media])
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
            <Image src="/images/workshop-default.png" alt={b.name} fill sizes="360px" className="object-cover" />
          )}

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

/* ── Builder card list (shared between desktop & mobile) ── */
function BuilderList({
  builders: _builders,
  visible,
  mapReady: _mapReady,
  selectedBuilder,
  savedIds,
  onToggleSave,
  onHover,
  onHoverEnd,
  isMobile,
  userId,
  authReady,
}: {
  builders: Builder[]
  visible: Builder[]
  mapReady: boolean
  selectedBuilder: Builder | null
  savedIds: Set<string>
  onToggleSave: (id: string | null) => void
  onHover?: (b: Builder) => void
  onHoverEnd?: () => void
  isMobile?: boolean
  userId?: string | null
  authReady?: boolean
}) {
  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <p className="text-[#717171] text-sm">Keine Custom-Werkstatt in diesem Kartenbereich.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-xs text-[#717171] mb-4 px-0.5">{visible.length} {visible.length === 1 ? 'Custom Werkstatt' : 'Custom Werkstätten'}</p>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {visible.map(b => (
          <Link
            key={b.slug}
            href={`/custom-werkstatt/${b.slug}`}
            className="group"
            onMouseEnter={() => onHover?.(b)}
            onMouseLeave={() => onHoverEnd?.()}
          >
            <div className="relative">
              <BuilderCardPhoto b={b} selected={!isMobile && selectedBuilder?.slug === b.slug} />
              <SaveButton
                builderId={b.id ?? null}
                saved={b.id ? savedIds.has(b.id) : false}
                onToggle={onToggleSave}
              />
            </div>
            <div className="pt-2.5 pb-1">
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <p className="text-sm font-semibold text-[#222222] leading-tight line-clamp-1 flex-1">{b.name}</p>
                {b.verified && <BadgeCheck size={13} className="text-[#717171] flex-shrink-0 mt-0.5" />}
              </div>
              <p className="text-xs text-[#717171] flex items-center gap-1 mb-1">
                <MapPin size={9} className="flex-shrink-0" />
                <span className="truncate">{b.city}{b.specialty ? ` · ${b.specialty}` : ''}</span>
              </p>
              {b.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {b.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-1.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* CTA card — only for logged-out users (guarded by authReady to prevent FOUC) */}
      {authReady && !userId && (
        <Link href="/auth/register" className="group mt-6 rounded-2xl overflow-hidden relative bg-[#111111] block">
          <div className="absolute inset-0">
            <Image
              src="/custom-werkstatt.png"
              alt="Custom Werkstatt"
              fill
              sizes="400px"
              className="object-cover opacity-30 scale-100 group-hover:scale-110 transition-transform duration-[1200ms] ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-transparent" />
          </div>
          <div className="relative z-10 p-5 pt-14">
            <h3 className="text-sm font-bold text-white mb-1">Du betreibst eine Custom Werkstatt?</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-4">Registriere dich kostenlos und werde direkt von Riders gefunden.</p>
            <span className="inline-flex bg-[#06a5a5] hover:bg-[#058f8f] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors">Als Custom Werkstatt registrieren</span>
          </div>
        </Link>
      )}

      <p className="text-[10px] text-[#B0B0B0] text-center py-4">{visible.length} {visible.length === 1 ? 'Custom Werkstatt' : 'Custom Werkstätten'} · MotoDigital</p>
    </div>
  )
}

export default function BuilderPageClient({ builders }: Props) {
  const [searchQuery,         setSearchQuery]        = useState('')
  const [activeSpecialty,    setActiveSpecialty]    = useState('Alle')
  const [activeLeistung,     setActiveLeistung]     = useState('Alle')
  const [onlyVerified,       _setOnlyVerified]       = useState(false)
  const [onlyOpen,           setOnlyOpen]           = useState(false)
  const [showFilterModal,   setShowFilterModal]    = useState(false)
  useHideNavOnModal(showFilterModal)
  const [now,                setNow]                = useState<Date | null>(null)
  const [selectedBuilder,    setSelectedBuilder]    = useState<Builder | null>(null)
  const [hoveredBuilder,     setHoveredBuilder]     = useState<Builder | null>(null)
  const [savedIds,           setSavedIds]           = useState<Set<string>>(new Set())
  const [userId,             setUserId]             = useState<string | null>(null)
  const [authReady,          setAuthReady]          = useState(false)
  const [mapBounds,          setMapBounds]          = useState<mapboxgl.LngLatBounds | null>(null)
  const [mapReady,           setMapReady]           = useState(false)
  const [markerEpoch,        setMarkerEpoch]        = useState(0)
  const [mobileView,         setMobileView]         = useState<'map' | 'list'>('list')
  const [listExiting,        setListExiting]        = useState(false)
  const [mobileSheetBuilder, setMobileSheetBuilder] = useState<Builder | null>(null)
  const [showLogin, setShowLogin]                   = useState(false)
  const supabase = createClient()

  const listRef          = useRef<HTMLDivElement>(null)
  const mapContainerRef  = useRef<HTMLDivElement>(null)
  const desktopMapSlot   = useRef<HTMLDivElement>(null)
  const mobileMapSlot    = useRef<HTMLDivElement>(null)
  const mapRef           = useRef<mapboxgl.Map | null>(null)
  const markersRef       = useRef<mapboxgl.Marker[]>([])
  const addMarkersRef    = useRef<() => void>(() => {})
  const isMobileRef      = useRef(false)

  // Hydration-safe clock
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Track mobile breakpoint + move map between slots on resize
  useEffect(() => {
    const check = () => {
      const wasMobile = isMobileRef.current
      isMobileRef.current = window.innerWidth < 1024
      if (wasMobile !== isMobileRef.current) {
        const mapEl = mapContainerRef.current
        const slot = isMobileRef.current ? mobileMapSlot.current : desktopMapSlot.current
        if (mapEl && slot && mapEl.parentElement !== slot) {
          slot.appendChild(mapEl)
          setTimeout(() => mapRef.current?.resize(), 50)
        }
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Load current user + saved builders
  useEffect(() => {
    async function loadSaved() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthReady(true); return }
      setUserId(user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('saved_builders') as any)
        .select('builder_id')
        .eq('user_id', user.id) as { data: { builder_id: string }[] | null }
      if (data) setSavedIds(new Set(data.map(r => r.builder_id)))
      setAuthReady(true)
    }
    loadSaved()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleSave(builderId: string | null) {
    if (!userId) { setShowLogin(true); return }
    if (!builderId) return
    const isSaved = savedIds.has(builderId)
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(builderId) : next.add(builderId)
      return next
    })
    if (isSaved) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('saved_builders') as any).delete()
        .eq('user_id', userId).eq('builder_id', builderId)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('saved_builders') as any).insert({ user_id: userId, builder_id: builderId })
    }
  }

  // Pre-filter by search query
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return builders
    const q = searchQuery.toLowerCase().trim()
    return builders.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.specialty.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [builders, searchQuery])

  // Dynamic Stil options
  const availableSpecialties = useMemo(() => {
    const pool = activeLeistung === 'Alle' ? searchFiltered : searchFiltered.filter(b => b.tags.includes(activeLeistung))
    const unique = Array.from(new Set(
      pool.flatMap(b => b.specialty.split('·').map(s => s.trim())).filter(Boolean)
    )).sort()
    return ['Alle', ...unique]
  }, [searchFiltered, activeLeistung])

  // Dynamic Leistungen options
  const availableLeistungen = useMemo(() => {
    const pool = activeSpecialty === 'Alle'
      ? searchFiltered
      : searchFiltered.filter(b =>
          b.specialty.split('·').map(s => s.trim()).includes(activeSpecialty)
        )
    const unique = Array.from(new Set(pool.flatMap(b => b.tags))).sort()
    return unique.filter(l => LEISTUNGEN.includes(l))
  }, [searchFiltered, activeSpecialty])

  const effectiveLeistung  = availableLeistungen.includes(activeLeistung)   ? activeLeistung   : 'Alle'
  const effectiveSpecialty = availableSpecialties.includes(activeSpecialty) ? activeSpecialty : 'Alle'

  const filtered = useMemo(() => {
    const results = searchFiltered.filter(b => {
      const specOk     = effectiveSpecialty === 'Alle' ||
        b.specialty.split('·').map(s => s.trim()).includes(effectiveSpecialty)
      const leistungOk = effectiveLeistung === 'Alle' || b.tags.includes(effectiveLeistung)
      const verifiedOk = !onlyVerified || b.verified
      const openOk     = !onlyOpen || !now || isOpenNow(b.openingHours, now)
      return specOk && leistungOk && verifiedOk && openOk
    })
    return [...results.filter(b => b.featured), ...results.filter(b => !b.featured)]
  }, [searchFiltered, effectiveSpecialty, effectiveLeistung, onlyVerified, onlyOpen, now])

  const visible = useMemo(() => {
    // Show all filtered builders immediately; only apply map-bounds filter once map is ready
    if (!mapReady || !mapBounds) return filtered
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
  const logoSvgWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="18" height="18"><path fill="white" d="M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z"/></svg>`
  const logoSvgTeal  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="18" height="18"><path fill="#06a5a5" d="M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z"/></svg>`

  useEffect(() => {
    addMarkersRef.current = () => {
      const map = mapRef.current
      if (!map) return
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

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

        if (cluster.members.length > 1) {
          inner.style.cssText = `
            width:40px;height:40px;
            background:#ffffff;
            border:2px solid #DDDDDD;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.15);
            transition:transform 0.15s,box-shadow 0.15s,background 0.15s;
            pointer-events:none;
            position:relative;
          `
          inner.innerHTML = logoSvgTeal
          const badge = document.createElement('div')
          badge.style.cssText = `
            position:absolute;top:-4px;right:-4px;
            width:16px;height:16px;
            background:#06a5a5;
            border:1.5px solid #ffffff;
            border-radius:50%;
            font-size:9px;font-weight:800;
            color:#ffffff;
            display:flex;align-items:center;justify-content:center;
            font-family:Inter,system-ui,sans-serif;
          `
          badge.textContent = String(cluster.members.length)
          inner.appendChild(badge)
          el.appendChild(inner)
          el.addEventListener('mouseenter', () => {
            inner.style.background = '#06a5a5'
            inner.style.borderColor = '#06a5a5'
            inner.innerHTML = logoSvgWhite
            inner.appendChild(badge)
            inner.style.transform = 'scale(1.15)'
            inner.style.boxShadow = '0 4px 16px rgba(6,165,165,0.45)'
          })
          el.addEventListener('mouseleave', () => {
            inner.style.background = '#ffffff'
            inner.style.borderColor = '#DDDDDD'
            inner.innerHTML = logoSvgTeal
            inner.appendChild(badge)
            inner.style.transform = 'scale(1)'
            inner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
          })
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            const bounds = new mapboxgl.LngLatBounds()
            cluster.members.forEach(b => bounds.extend([b.lng!, b.lat!]))
            map.fitBounds(bounds, { padding: 100, maxZoom: 14, duration: 600 })
          })
        } else {
          const b = cluster.members[0]
          const isActive = selectedBuilder?.slug === b.slug || hoveredBuilder?.slug === b.slug
          inner.style.cssText = `
            width:40px;height:40px;
            background:${isActive ? '#06a5a5' : '#ffffff'};
            border:2px solid ${isActive ? '#06a5a5' : '#DDDDDD'};
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:${isActive ? '0 4px 16px rgba(6,165,165,0.5)' : '0 2px 8px rgba(0,0,0,0.15)'};
            transition:transform 0.15s cubic-bezier(0.16,1,0.3,1),box-shadow 0.15s,background 0.15s;
            pointer-events:none;
          `
          inner.innerHTML = isActive ? logoSvgWhite : logoSvgTeal
          el.appendChild(inner)
          el.addEventListener('mouseenter', () => {
            inner.style.background = '#06a5a5'
            inner.style.borderColor = '#06a5a5'
            inner.innerHTML = logoSvgWhite
            inner.style.transform = 'scale(1.2)'
            inner.style.boxShadow = '0 4px 16px rgba(6,165,165,0.5)'
          })
          el.addEventListener('mouseleave', () => {
            inner.style.background = isActive ? '#06a5a5' : '#ffffff'
            inner.style.borderColor = isActive ? '#06a5a5' : '#DDDDDD'
            inner.innerHTML = isActive ? logoSvgWhite : logoSvgTeal
            inner.style.transform = 'scale(1)'
            inner.style.boxShadow = isActive ? '0 4px 16px rgba(6,165,165,0.5)' : '0 2px 8px rgba(0,0,0,0.15)'
          })
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            if (isMobileRef.current) {
              setMobileSheetBuilder(b)
            } else {
              setSelectedBuilder(b)
            }
          })
        }

        const m = new mapboxgl.Marker({ element: el })
          .setLngLat([cluster.centerLng, cluster.centerLat])
          .addTo(map)
        markersRef.current.push(m)
      }
    }
  }, [filtered, selectedBuilder, hoveredBuilder, markerEpoch]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Move map canvas into the correct slot (desktop vs mobile) ── */
  useEffect(() => {
    const mapEl = mapContainerRef.current
    if (!mapEl) return
    const slot = isMobileRef.current ? mobileMapSlot.current : desktopMapSlot.current
    if (slot && mapEl.parentElement !== slot) {
      slot.appendChild(mapEl)
      setTimeout(() => mapRef.current?.resize(), 50)
    }
  }, [mobileView])

  /* ── init map once ── */
  useEffect(() => {
    // Create the map canvas element
    const mapEl = document.createElement('div')
    if (isMobileRef.current) {
      mapEl.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    } else {
      mapEl.style.cssText = 'position:absolute;inset:12px;border-radius:16px;overflow:hidden;'
    }
    mapContainerRef.current = mapEl

    // Place it in the right slot
    const slot = isMobileRef.current ? mobileMapSlot.current : desktopMapSlot.current
    if (!slot) return
    slot.appendChild(mapEl)

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token.trim()
    const map = new mapboxgl.Map({
      container: mapEl,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10.5, 51.2],
      zoom: 5,
      minZoom: 4,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.once('load', () => {
      applyMapStyle(map)
      setMapLanguage(map)
      addMarkersRef.current()
      setMapBounds(map.getBounds())
      setMapReady(true)
      // Initial fitBounds is handled by the filter-change effect
    })
    map.on('move',    () => setMapBounds(map.getBounds() ?? null))
    map.on('moveend', () => { setMapBounds(map.getBounds() ?? null); setMarkerEpoch(e => e + 1) })
    map.on('click', () => { setSelectedBuilder(null); setMobileSheetBuilder(null) })

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(mapEl)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markersRef.current = []
      mapEl.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── scroll list to top on filter change ── */
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchQuery, activeSpecialty, activeLeistung, onlyVerified, onlyOpen])

  /* ── redraw markers on filter/hover/zoom change ── */
  useEffect(() => {
    const map = mapRef.current
    if (map?.loaded()) addMarkersRef.current()
  }, [filtered, selectedBuilder, hoveredBuilder, markerEpoch])

  /* ── fit map bounds when filtered builders change ── */
  const prevFilteredRef = useRef(filtered)
  useEffect(() => {
    const map = mapRef.current
    if (!map?.loaded()) return
    // Skip if only hover/selection changed (same filtered list)
    if (prevFilteredRef.current === filtered && mapReady) {
      prevFilteredRef.current = filtered
      return
    }
    prevFilteredRef.current = filtered
    const withCoords = filtered.filter(b => b.lat && b.lng)
    if (withCoords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      withCoords.forEach(b => bounds.extend([b.lng!, b.lat!]))
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 400 })
    } else if (withCoords.length === 1) {
      map.flyTo({ center: [withCoords[0].lng!, withCoords[0].lat!], zoom: 12, duration: 400 })
    }
  }, [filtered, mapReady])

  /* ── Resize map + adjust inset when mobile view changes ── */
  useEffect(() => {
    const mapEl = mapContainerRef.current
    if (!mapEl) return
    // On mobile: map fills entire slot. On desktop: 12px inset with rounded corners.
    if (isMobileRef.current) {
      mapEl.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    } else {
      mapEl.style.cssText = 'position:absolute;inset:12px;border-radius:16px;overflow:hidden;'
    }
    setTimeout(() => mapRef.current?.resize(), 50)
  }, [mobileView])

  const mapHeight = `calc(100dvh - ${STICKY_OFFSET}px)`

  const activeFilterCount = (activeSpecialty !== 'Alle' ? 1 : 0) + (activeLeistung !== 'Alle' ? 1 : 0) + (onlyOpen ? 1 : 0)

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
        .mapboxgl-ctrl-logo { display: none !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
      `}</style>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="flex px-4 sm:px-5 lg:px-6 py-3 items-center gap-2 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Mobile: Filter button (left) */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={`lg:hidden flex-shrink-0 h-8 text-[13px] font-medium px-4 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 border ${
              activeFilterCount > 0 ? 'bg-[#222222]/8 text-[#222222] border-[#222222]/25' : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-[#222222] rounded-full">{activeFilterCount}</span>
            )}
          </button>

          {/* Mobile: Reset button (next to filter) */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setActiveSpecialty('Alle'); setActiveLeistung('Alle'); setOnlyOpen(false) }}
              className="lg:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center text-[#999] hover:text-[#333] transition-colors rounded-full border border-[#d4d4d4] hover:border-[#999] bg-white cursor-pointer"
              aria-label="Filter zurücksetzen"
            >
              <X size={14} />
            </button>
          )}

          {/* Mobile: spacer to push search right */}
          <div className="flex-1 lg:hidden" />

          {/* Search field */}
          <div className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${searchQuery ? 'w-44 lg:w-52' : 'w-32 focus-within:w-44 lg:focus-within:w-52'}`}>
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setActiveSpecialty('Alle'); setActiveLeistung('Alle') }}
              placeholder="Suchen…"
              className="w-full h-8 pl-8 pr-7 text-[12px] font-normal text-[#333] placeholder-[#999] bg-white border border-[#d4d4d4] rounded-full focus:outline-none focus:border-[#999] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333] transition-colors"
                aria-label="Suche löschen"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Desktop: inline filters */}
          {/* Umbaustil */}
          <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
            activeSpecialty !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
          }`}>
            <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
              {activeSpecialty === 'Alle' ? 'Umbaustil' : activeSpecialty}
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <select value={activeSpecialty} onChange={e => setActiveSpecialty(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="Alle">Umbaustil</option>
              {availableSpecialties.filter(s => s !== 'Alle').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Leistungen */}
          <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
            activeLeistung !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
          }`}>
            <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
              {activeLeistung === 'Alle' ? 'Leistungen' : activeLeistung}
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <select value={activeLeistung} onChange={e => setActiveLeistung(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="Alle">Leistungen</option>
              {availableLeistungen.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Jetzt geöffnet */}
          {now && (
            <button onClick={() => setOnlyOpen(v => !v)}
              className={`hidden lg:flex flex-shrink-0 h-8 text-[13px] font-medium px-3.5 rounded-full transition-colors cursor-pointer whitespace-nowrap items-center gap-1.5 border ${
                onlyOpen
                  ? 'bg-[#222222]/8 text-[#222222] border-[#222222]/25'
                  : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${onlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
              Jetzt geöffnet
            </button>
          )}

          {/* Desktop: Reset */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setActiveSpecialty('Alle'); setActiveLeistung('Alle'); setOnlyOpen(false) }}
              className="hidden lg:flex w-8 h-8 flex-shrink-0 items-center justify-center text-[#999] hover:text-[#333] transition-colors rounded-full border border-[#d4d4d4] hover:border-[#999] bg-white cursor-pointer"
              aria-label="Filter zurücksetzen"
            >
              <X size={14} />
            </button>
          )}

        </div>
      </div>

      {/* ── Mobile filter modal ── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
            <h2 className="text-base font-bold text-[#222222]">Filter</h2>
            <button onClick={() => setShowFilterModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors cursor-pointer">
              <X size={18} className="text-[#222222]" />
            </button>
          </div>

          {/* Filter options */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            {/* Umbaustil */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Umbaustil</h3>
              <div className="flex flex-wrap gap-2">
                {['Alle', ...availableSpecialties.filter(s => s !== 'Alle')].map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSpecialty(s)}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeSpecialty === s
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {s === 'Alle' ? 'Alle Stile' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Leistungen */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Leistungen</h3>
              <div className="flex flex-wrap gap-2">
                {['Alle', ...availableLeistungen].map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLeistung(l)}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeLeistung === l
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {l === 'Alle' ? 'Alle Leistungen' : l}
                  </button>
                ))}
              </div>
            </div>

            {/* Jetzt geöffnet */}
            {now && (
              <div>
                <h3 className="text-sm font-semibold text-[#222222] mb-3">Verfügbarkeit</h3>
                <button
                  onClick={() => setOnlyOpen(v => !v)}
                  className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer flex items-center gap-2 ${
                    onlyOpen
                      ? 'bg-[#222222] text-white border-[#222222]'
                      : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${onlyOpen ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                  Jetzt geöffnet
                </button>
              </div>
            )}
          </div>

          {/* Fixed bottom buttons */}
          <div className="border-t border-[#EBEBEB] px-5 py-4 flex items-center gap-3">
            <button
              onClick={() => { setActiveSpecialty('Alle'); setActiveLeistung('Alle'); setOnlyOpen(false) }}
              className="flex-1 h-12 text-sm font-semibold text-[#222222] bg-white border border-[#DDDDDD] rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-pointer"
            >
              Zurücksetzen
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="flex-1 h-12 text-sm font-semibold text-white bg-[#222222] rounded-xl hover:bg-[#333] transition-colors cursor-pointer"
            >
              {filtered.length} Ergebnisse anzeigen
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop: Split layout (List left 50% | Map right 50%) ── */}
      <div className="hidden lg:flex" style={{ height: mapHeight }}>
        {/* LEFT — scrollable list */}
        <div ref={listRef} className="w-1/2 overflow-y-scroll border-r border-[#EBEBEB]">
          <BuilderList
            builders={builders}
            visible={visible}
            mapReady={mapReady}
            selectedBuilder={selectedBuilder}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onHover={setHoveredBuilder}
            onHoverEnd={() => setHoveredBuilder(null)}

            userId={userId}
            authReady={authReady}
          />
        </div>

        {/* RIGHT — map */}
        <div ref={desktopMapSlot} className="w-1/2 relative p-3">
          {selectedBuilder && (
            <MapBuilderCard b={selectedBuilder} onClose={() => setSelectedBuilder(null)} />
          )}
        </div>
      </div>

      {/* ── Mobile: Map view ── */}
      <div className={`lg:hidden relative ${mobileView === 'map' || listExiting ? '' : 'hidden'}`} style={{ height: mapHeight }}>
        <div ref={mobileMapSlot} className="absolute inset-0" />

        {/* White overlay that slides down to reveal map */}
        {listExiting && (
          <div
            className="absolute inset-0 bg-white z-10"
            style={{ animation: 'slideDown 300ms ease-in-out forwards' }}
          />
        )}

        {mobileView === 'map' && !showFilterModal && (
          <button
            onClick={() => { setMobileView('list'); setMobileSheetBuilder(null) }}
            className={`fixed ${userId ? 'bottom-28' : 'bottom-6'} sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-[#E5E5E5] shadow-md px-5 py-3 rounded-full transition-all active:scale-95`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <ListIcon size={16} className="text-[#1A1A1A]" />
            <span className="text-sm font-semibold text-[#1A1A1A]">Liste anzeigen</span>
          </button>
        )}

        {mobileSheetBuilder && mobileView === 'map' && (
          <WorkshopBottomSheet
            builder={mobileSheetBuilder}
            onClose={() => setMobileSheetBuilder(null)}
          />
        )}
      </div>

      {/* ── Mobile: List view (normal page flow) ── */}
      <div className={`lg:hidden ${mobileView === 'list' && !listExiting ? '' : 'hidden'}`}>
        <BuilderList
          builders={builders}
          visible={filtered}
          mapReady={mapReady}
          selectedBuilder={null}
          savedIds={savedIds}
          onToggleSave={toggleSave}
          isMobile
          userId={userId}
          authReady={authReady}
        />

        {!showFilterModal && (
          <div className={`fixed ${userId ? 'bottom-28' : 'bottom-6'} sm:bottom-6 left-1/2 -translate-x-1/2 z-50`}>
            <button
              onClick={() => {
                window.scrollTo({ top: 0 })
                setListExiting(true)
                setMobileSheetBuilder(null)
                setTimeout(() => {
                  setMobileView('map')
                  setListExiting(false)
                }, 300)
              }}
              className="flex items-center gap-2 bg-white border border-[#E5E5E5] shadow-md px-5 py-3 rounded-full transition-all active:scale-95"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <MapIcon size={16} className="text-[#1A1A1A]" />
              <span className="text-sm font-semibold text-[#1A1A1A]">Karte anzeigen</span>
            </button>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="bike_save"
      />
    </>
  )
}
