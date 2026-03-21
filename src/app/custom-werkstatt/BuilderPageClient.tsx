// Light Mode only — no dark: classes
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BadgeCheck, MapPin, ChevronLeft, ChevronRight, Wrench, Star, ChevronDown, SlidersHorizontal, X, Map as MapIcon, List as ListIcon } from 'lucide-react'
import SwipeableImages from '@/components/ui/SwipeableImages'
import WorkshopBottomSheet from '@/components/builder/WorkshopBottomSheet'
import { type Builder } from '@/lib/data/builders'
import { isOpenNow } from '@/lib/utils/openingHours'
import { createClient } from '@/lib/supabase/client'
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
      <div className="w-full aspect-[4/3] bg-[#F7F7F7] flex items-center justify-center rounded-xl overflow-hidden">
        <span className="text-2xl font-bold text-[#B0B0B0]">{b.initials}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <SwipeableImages images={images} aspectClass="aspect-[4/3]" />
      {b.featured && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="text-[11px] font-semibold bg-[#06a5a5]/20 border border-[#06a5a5]/30 text-[#06a5a5] px-2.5 py-0.5 rounded-full">Gesponsert</span>
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
            <div className="absolute inset-0 bg-[#F7F7F7] flex items-center justify-center">
              <span className="text-3xl font-bold text-[#B0B0B0]">{b.initials}</span>
            </div>
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

/* ── Builder card list (shared between desktop & mobile) ── */
function BuilderList({
  builders: allBuilders,
  visible,
  mapReady,
  selectedBuilder,
  savedIds,
  onToggleSave,
  onHover,
  onHoverEnd,
  onReset,
  isMobile,
}: {
  builders: Builder[]
  visible: Builder[]
  mapReady: boolean
  selectedBuilder: Builder | null
  savedIds: Set<string>
  onToggleSave: (id: string | null) => void
  onHover?: (b: Builder) => void
  onHoverEnd?: () => void
  onReset: () => void
  isMobile?: boolean
}) {
  if (!mapReady) {
    return (
      <div className={`p-4 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-full aspect-[4/3] bg-[#F0F0F0] rounded-xl mb-2" />
            <div className="h-3 bg-[#F0F0F0] rounded w-3/4 mb-1.5" />
            <div className="h-2.5 bg-[#F0F0F0] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <p className="text-[#717171] text-sm mb-4">Keine Custom-Werkstatt in diesem Kartenbereich.</p>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-[#222222] border border-[#DDDDDD] px-4 py-2 rounded-full hover:bg-[#F7F7F7] transition-all cursor-pointer"
        >
          Filter zurücksetzen
        </button>
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
              {b.rating && (
                <p className="text-xs text-[#222222] flex items-center gap-0.5 font-medium">
                  <Star size={10} className="fill-[#222222] text-[#222222]" />
                  {b.rating.toFixed(1)}
                </p>
              )}
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

      {/* CTA card */}
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

      <p className="text-[10px] text-[#B0B0B0] text-center py-4">{visible.length} {visible.length === 1 ? 'Custom Werkstatt' : 'Custom Werkstätten'} · MotoDigital</p>
    </div>
  )
}

export default function BuilderPageClient({ builders }: Props) {
  const [activeSpecialty,    setActiveSpecialty]    = useState('Alle')
  const [styleOpen,          setStyleOpen]          = useState(false)
  const [leistungenOpen,     setLeistungenOpen]     = useState(false)
  const [activeLeistung,     setActiveLeistung]     = useState('Alle')
  const [onlyVerified,       setOnlyVerified]       = useState(false)
  const [onlyOpen,           setOnlyOpen]           = useState(false)
  const [now,                setNow]                = useState<Date | null>(null)
  const [selectedBuilder,    setSelectedBuilder]    = useState<Builder | null>(null)
  const [hoveredBuilder,     setHoveredBuilder]     = useState<Builder | null>(null)
  const [savedIds,           setSavedIds]           = useState<Set<string>>(new Set())
  const [userId,             setUserId]             = useState<string | null>(null)
  const [mapBounds,          setMapBounds]          = useState<mapboxgl.LngLatBounds | null>(null)
  const [mapReady,           setMapReady]           = useState(false)
  const [markerEpoch,        setMarkerEpoch]        = useState(0)
  const [mobileView,         setMobileView]         = useState<'map' | 'list'>('map')
  const [mobileSheetBuilder, setMobileSheetBuilder] = useState<Builder | null>(null)
  const router = useRouter()
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

  // Dynamic Stil options
  const availableSpecialties = useMemo(() => {
    const pool = activeLeistung === 'Alle' ? builders : builders.filter(b => b.tags.includes(activeLeistung))
    const unique = Array.from(new Set(
      pool.flatMap(b => b.specialty.split('·').map(s => s.trim())).filter(Boolean)
    )).sort()
    return ['Alle', ...unique]
  }, [builders, activeLeistung])

  // Dynamic Leistungen options
  const availableLeistungen = useMemo(() => {
    const pool = activeSpecialty === 'Alle'
      ? builders
      : builders.filter(b =>
          b.specialty.split('·').map(s => s.trim()).includes(activeSpecialty)
        )
    const unique = Array.from(new Set(pool.flatMap(b => b.tags))).sort()
    return unique.filter(l => LEISTUNGEN.includes(l))
  }, [builders, activeSpecialty])

  const effectiveLeistung  = availableLeistungen.includes(activeLeistung)   ? activeLeistung   : 'Alle'
  const effectiveSpecialty = availableSpecialties.includes(activeSpecialty) ? activeSpecialty : 'Alle'

  const filtered = useMemo(() => {
    const results = builders.filter(b => {
      const specOk     = effectiveSpecialty === 'Alle' ||
        b.specialty.split('·').map(s => s.trim()).includes(effectiveSpecialty)
      const leistungOk = effectiveLeistung === 'Alle' || b.tags.includes(effectiveLeistung)
      const verifiedOk = !onlyVerified || b.verified
      const openOk     = !onlyOpen || !now || isOpenNow(b.openingHours, now)
      return specOk && leistungOk && verifiedOk && openOk
    })
    return [...results.filter(b => b.featured), ...results.filter(b => !b.featured)]
  }, [builders, effectiveSpecialty, effectiveLeistung, onlyVerified, onlyOpen, now])

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
      minZoom: 5,
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
  }, [activeSpecialty, activeLeistung, onlyVerified, onlyOpen])

  /* ── redraw markers on filter/hover/zoom change ── */
  useEffect(() => {
    const map = mapRef.current
    if (map?.loaded()) addMarkersRef.current()
  }, [filtered, selectedBuilder, hoveredBuilder, markerEpoch])

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

  const resetAllFilters = useCallback(() => {
    setActiveSpecialty('Alle')
    setActiveLeistung('Alle')
    setOnlyVerified(false)
    setOnlyOpen(false)
  }, [])

  const resetAndFitMap = useCallback(() => {
    resetAllFilters()
    const map = mapRef.current
    if (!map) return
    const withCoords = builders.filter(b => b.lat && b.lng)
    if (withCoords.length === 0) return
    const bounds = new mapboxgl.LngLatBounds()
    withCoords.forEach(b => bounds.extend([b.lng!, b.lat!]))
    map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 800 })
  }, [builders, resetAllFilters])

  const hasActiveFilter = activeSpecialty !== 'Alle' || activeLeistung !== 'Alle' || onlyVerified || onlyOpen

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
      `}</style>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        {/* Desktop filters */}
        <div className="hidden lg:flex px-4 sm:px-5 lg:px-6 py-3 items-center gap-2">
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
              {activeSpecialty === 'Alle' ? 'Umbaustil' : activeSpecialty}
              <ChevronDown size={11} className={`transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
            </button>

            {styleOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStyleOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#DDDDDD] rounded-2xl shadow-lg overflow-hidden min-w-[160px] py-1">
                  {availableSpecialties.map(spec => (
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

          {/* Leistungen dropdown */}
          <div className="relative">
            <button
              onClick={() => setLeistungenOpen(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeLeistung !== 'Alle'
                  ? 'bg-[#222222] text-white'
                  : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
              }`}
            >
              <Wrench size={11} />
              {activeLeistung === 'Alle' ? 'Leistungen' : activeLeistung}
              <ChevronDown size={11} className={`transition-transform ${leistungenOpen ? 'rotate-180' : ''}`} />
            </button>

            {leistungenOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLeistungenOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#DDDDDD] rounded-2xl shadow-lg min-w-[200px] py-1 max-h-72 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {['Alle', ...availableLeistungen].map(l => (
                    <button
                      key={l}
                      onClick={() => { setActiveLeistung(l); setLeistungenOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between gap-3 ${
                        activeLeistung === l
                          ? 'text-[#222222] font-semibold bg-[#F7F7F7]'
                          : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]'
                      }`}
                    >
                      {l}
                      {activeLeistung === l && <span className="w-1.5 h-1.5 rounded-full bg-[#222222] flex-shrink-0" />}
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

          {/* Reset */}
          {hasActiveFilter && (
            <button
              onClick={resetAllFilters}
              className="w-8 h-8 flex items-center justify-center text-[#222222]/35 hover:text-[#222222] transition-colors rounded-full hover:bg-[#222222]/5 cursor-pointer"
              aria-label="Filter zurücksetzen"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Mobile filter chips */}
        <div className="lg:hidden">
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {availableSpecialties.map(spec => (
              <button
                key={spec}
                onClick={() => setActiveSpecialty(spec)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap border ${
                  activeSpecialty === spec
                    ? 'bg-[#2AABAB] text-white border-[#2AABAB]'
                    : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'
                }`}
              >
                {spec === 'Alle' ? 'Alle Stile' : spec}
              </button>
            ))}

            <div className="flex-shrink-0 w-px bg-[#E5E5E5] my-1" />

            <button
              onClick={() => setOnlyVerified(v => !v)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap border flex items-center gap-1 ${
                onlyVerified
                  ? 'bg-[#2AABAB] text-white border-[#2AABAB]'
                  : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'
              }`}
            >
              <BadgeCheck size={11} /> Verifiziert
            </button>

            {now && (
              <button
                onClick={() => setOnlyOpen(v => !v)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                  onlyOpen
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-[#1A1A1A] border-[#E5E5E5]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${onlyOpen ? 'bg-white animate-pulse' : 'bg-[#717171]'}`} />
                Geöffnet
              </button>
            )}

            {hasActiveFilter && (
              <button
                onClick={resetAllFilters}
                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap bg-white text-[#1A1A1A] border border-[#E5E5E5] flex items-center gap-1"
              >
                <X size={11} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop: Split layout (List left 40% | Map right 60%) ── */}
      <div className="hidden lg:flex" style={{ height: mapHeight }}>
        {/* LEFT — scrollable list */}
        <div ref={listRef} className="w-[40%] overflow-y-scroll border-r border-[#EBEBEB]">
          <BuilderList
            builders={builders}
            visible={visible}
            mapReady={mapReady}
            selectedBuilder={selectedBuilder}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onHover={setHoveredBuilder}
            onHoverEnd={() => setHoveredBuilder(null)}
            onReset={resetAndFitMap}
          />
        </div>

        {/* RIGHT — map */}
        <div ref={desktopMapSlot} className="w-[60%] relative p-3">
          {selectedBuilder && (
            <MapBuilderCard b={selectedBuilder} onClose={() => setSelectedBuilder(null)} />
          )}
        </div>
      </div>

      {/* ── Mobile: Toggle between Map and List ── */}
      <div className="lg:hidden relative" style={{ height: mapHeight }}>
        {/* Map slot */}
        <div
          ref={mobileMapSlot}
          className="absolute inset-0"
          style={{ visibility: mobileView === 'map' ? 'visible' : 'hidden' }}
        />

        {/* List overlay (slides over map when in list view) */}
        <div
          className="absolute inset-0 bg-white overflow-y-auto transition-transform duration-300 ease-in-out z-10"
          style={{
            transform: mobileView === 'list' ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          <BuilderList
            builders={builders}
            visible={visible}
            mapReady={mapReady}
            selectedBuilder={null}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onReset={resetAndFitMap}
            isMobile
          />
        </div>

        {/* Floating toggle button */}
        <button
          onClick={() => {
            setMobileView(v => v === 'map' ? 'list' : 'map')
            setMobileSheetBuilder(null)
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-[#E5E5E5] shadow-md px-5 py-3 rounded-full transition-all active:scale-95"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {mobileView === 'map' ? (
            <>
              <ListIcon size={16} className="text-[#1A1A1A]" />
              <span className="text-sm font-semibold text-[#1A1A1A]">Liste anzeigen</span>
            </>
          ) : (
            <>
              <MapIcon size={16} className="text-[#1A1A1A]" />
              <span className="text-sm font-semibold text-[#1A1A1A]">Karte anzeigen</span>
            </>
          )}
        </button>

        {/* Mobile bottom sheet on marker tap */}
        {mobileSheetBuilder && mobileView === 'map' && (
          <WorkshopBottomSheet
            builder={mobileSheetBuilder}
            onClose={() => setMobileSheetBuilder(null)}
          />
        )}
      </div>
    </>
  )
}
