'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import BikeCard from '@/components/bike/BikeCard'
import SearchBar, { type UmbauTyp } from '@/components/map/SearchBar'
import { formatPrice } from '@/lib/utils'
import { BadgeCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import type { Database } from '@/types/database'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type Bike = Pick<BikeRow, 'id' | 'title' | 'make' | 'model' | 'year' | 'price' | 'style' | 'city' | 'mileage_km' | 'is_verified'> & {
  bike_images: { url: string; is_cover: boolean }[]
}

type Builder = {
  id: string
  slug: string
  name: string
  initials: string
  city: string
  specialty: string
  builds: number
  rating: number
  verified: boolean
  lat: number
  lng: number
}

const MOCK_BUILDERS: Builder[] = [
  { id: 'b1', slug: 'jakob-kraft',       name: 'Jakob Kraft',       initials: 'JK', city: 'Berlin',    specialty: 'Cafe Racer · Scrambler', builds: 14, rating: 4.9, verified: true,  lat: 52.520,  lng: 13.405 },
  { id: 'b2', slug: 'studio-nord',       name: 'Studio Nord',       initials: 'SN', city: 'Hamburg',   specialty: 'Street · Tracker',        builds: 8,  rating: 4.7, verified: true,  lat: 53.551,  lng: 9.993  },
  { id: 'b3', slug: 'max-steiner',       name: 'Max Steiner',       initials: 'MS', city: 'München',   specialty: 'Bobber · Chopper',        builds: 22, rating: 5.0, verified: true,  lat: 48.137,  lng: 11.576 },
  { id: 'b4', slug: 'rene-bauer-cycles', name: 'René Bauer Cycles', initials: 'RB', city: 'Köln',      specialty: 'Tracker · Flat Track',    builds: 6,  rating: 4.6, verified: false, lat: 50.938,  lng: 6.960  },
  { id: 'b5', slug: 'kai-fuchs-custom',  name: 'Kai Fuchs Custom',  initials: 'KF', city: 'Stuttgart', specialty: 'Chopper · Old School',    builds: 18, rating: 4.9, verified: true,  lat: 48.775,  lng: 9.182  },
  { id: 'b6', slug: 'anna-wolff-moto',   name: 'Anna Wolff Moto',   initials: 'AW', city: 'Hamburg',   specialty: 'Scrambler · Enduro',      builds: 11, rating: 4.8, verified: false, lat: 53.565,  lng: 10.010 },
]

interface Props {
  initialBikes: Bike[]
}

export default function MapView({ initialBikes }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const bikeMarkers = useRef<mapboxgl.Marker[]>([])
  const builderMarkers = useRef<mapboxgl.Marker[]>([])
  const [bikes, setBikes] = useState<Bike[]>(initialBikes)
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null)
  const [activeTab, setActiveTab] = useState<'bikes' | 'workshops'>('workshops')
  const [selectedTypes, setSelectedTypes] = useState<UmbauTyp[]>([])
  const [onlyVerified, setOnlyVerified] = useState(false)
  const supabase = createClient()

  // Init Mapbox
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [13.405, 52.52],
      zoom: 11,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    map.current.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }),
      'bottom-right'
    )

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Bike markers
  useEffect(() => {
    if (!map.current) return
    bikeMarkers.current.forEach(m => m.remove())
    bikeMarkers.current = []

    if (activeTab !== 'bikes') return

    bikes.forEach(bike => {
      // Bikes need lat/lng from DB — placeholder logic
      // In production: use bike.latitude / bike.longitude from the geography column
    })
  }, [bikes, activeTab])

  // Builder markers
  useEffect(() => {
    if (!map.current) return
    builderMarkers.current.forEach(m => m.remove())
    builderMarkers.current = []

    if (activeTab !== 'workshops') return

    // Fly out to show all of Germany
    map.current.flyTo({ center: [10.5, 51.2], zoom: 5.5, duration: 1400 })

    MOCK_BUILDERS.forEach(builder => {
      const el = document.createElement('div')
      el.style.cssText = `
        background: #2AABAB; color: #141414;
        border: 2.5px solid #141414;
        border-radius: 50%; width: 38px; height: 38px;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700; cursor: pointer;
        box-shadow: 0 2px 16px rgba(42,171,171,0.4);
        transition: background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        font-family: var(--font-sans);
        position: relative; z-index: 1;
      `
      el.textContent = builder.initials
      el.title = builder.name

      el.addEventListener('mouseenter', () => {
        el.style.background = '#3DBFBF'
        el.style.boxShadow = '0 4px 24px rgba(42,171,171,0.7)'
        el.style.borderColor = '#fff'
      })
      el.addEventListener('mouseleave', () => {
        el.style.background = '#2AABAB'
        el.style.boxShadow = '0 2px 16px rgba(42,171,171,0.4)'
        el.style.borderColor = '#141414'
      })
      el.addEventListener('click', () => setSelectedBuilder(builder))

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([builder.lng, builder.lat])
        .addTo(map.current!)

      // Mapbox wraps the element in a div with overflow:hidden — fix it
      const wrapper = el.parentElement
      if (wrapper) wrapper.style.overflow = 'visible'

      builderMarkers.current.push(marker)
    })
  }, [activeTab])

  // Fly back to Berlin when switching back to bikes
  useEffect(() => {
    if (activeTab === 'bikes' && map.current) {
      map.current.flyTo({ center: [13.405, 52.52], zoom: 11, duration: 1200 })
    }
    setSelectedBuilder(null)
    setSelectedBike(null)
  }, [activeTab])

  // Proximity search
  const searchNearby = useCallback(async (lat: number, lng: number, radiusM = 30000) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.rpc as any)('search_bikes_nearby', {
      lat,
      lng,
      radius_m: radiusM,
    })
    if (data) setBikes(data as Bike[])
  }, [supabase])

  const filteredBuilders = MOCK_BUILDERS.filter(b => {
    if (onlyVerified && !b.verified) return false
    if (selectedTypes.length === 0) return true
    return selectedTypes.some(t => b.specialty.toLowerCase().includes(t.toLowerCase()))
  })

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">

      {/* Header */}
      <Header activePage="map" />

      {/* SearchBar */}
      <div className="px-4 py-3 border-b border-creme/5 bg-bg z-10 flex-shrink-0">
        <SearchBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={searchNearby}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          onlyVerified={onlyVerified}
          onVerifiedChange={setOnlyVerified}
        />
      </div>

      {/* Split: List left (2/3) + Map right (1/3) */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Results list */}
        <div className="w-1/2 overflow-y-auto border-r border-creme/5">

          {/* Builder list */}
          {activeTab === 'workshops' && (
            <div className="px-5 py-4">
              <p className="text-xs text-creme/35 mb-4 uppercase tracking-widest">{filteredBuilders.length} Builder</p>
              <div className="flex flex-col gap-3">
                {filteredBuilders.map(b => (
                  <Link
                    key={b.id}
                    href={`/builder/${b.slug}`}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                      selectedBuilder?.id === b.id
                        ? 'bg-teal/8 border-teal/30'
                        : 'bg-bg-2 border-creme/6 hover:border-teal/20'
                    }`}
                    onClick={() => {
                      setSelectedBuilder(b)
                      map.current?.flyTo({ center: [b.lng, b.lat], zoom: 13, duration: 1000 })
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-teal/12 border border-teal/20 flex items-center justify-center text-sm font-bold text-teal flex-shrink-0">
                      {b.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-creme truncate">{b.name}</p>
                        {b.verified && <BadgeCheck size={12} className="text-teal flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-creme/40 truncate">{b.city} · {b.specialty}</p>
                      <p className="text-xs text-creme/30 mt-0.5">{b.builds} Builds · ★ {b.rating}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bike list */}
          {activeTab === 'bikes' && (
            <div className="px-5 py-4">
              <p className="text-xs text-creme/35 mb-4 uppercase tracking-widest">{bikes.length} Bikes</p>
              <div className="flex flex-col gap-3">
                {bikes.map(bike => (
                  <button
                    key={bike.id}
                    onClick={() => setSelectedBike(bike)}
                    className={`text-left p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                      selectedBike?.id === bike.id
                        ? 'bg-teal/8 border-teal/30'
                        : 'bg-bg-2 border-creme/6 hover:border-teal/20'
                    }`}
                  >
                    <p className="text-sm font-semibold text-creme">{bike.title}</p>
                    <p className="text-xs text-creme/40 mt-0.5">{bike.year} · {bike.city} · {formatPrice(bike.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Map */}
        <div ref={mapContainer} className="w-1/2 h-full" />

        {/* Selected builder popup */}
        {selectedBuilder && (
          <div className="absolute bottom-6 right-6 z-30 bg-bg-2 border border-teal/20 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-slide-up-sm max-w-xs">
            <div className="w-11 h-11 rounded-xl bg-teal/15 border border-teal/20 flex items-center justify-center text-sm font-bold text-teal flex-shrink-0">
              {selectedBuilder.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-semibold text-creme truncate">{selectedBuilder.name}</p>
                {selectedBuilder.verified && <BadgeCheck size={12} className="text-teal flex-shrink-0" />}
              </div>
              <p className="text-xs text-creme/40 truncate">{selectedBuilder.city} · {selectedBuilder.specialty}</p>
            </div>
            <Link
              href={`/builder/${selectedBuilder.slug}`}
              className="text-xs text-teal font-semibold hover:text-teal-light transition-colors whitespace-nowrap flex-shrink-0"
            >
              Profil →
            </Link>
            <button onClick={() => setSelectedBuilder(null)} className="text-creme/25 hover:text-creme transition-colors text-lg leading-none flex-shrink-0">×</button>
          </div>
        )}

      </div>
    </div>
  )
}
