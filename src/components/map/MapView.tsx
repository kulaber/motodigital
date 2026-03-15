'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import BikeCard from '@/components/bike/BikeCard'
import SearchBar from '@/components/map/SearchBar'
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
  const [view, setView] = useState<'map' | 'list'>('map')
  const [activeTab, setActiveTab] = useState<'bikes' | 'workshops'>('workshops')
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
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        font-family: var(--font-sans);
      `
      el.textContent = builder.initials
      el.title = builder.name

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
        el.style.boxShadow = '0 4px 20px rgba(42,171,171,0.6)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 16px rgba(42,171,171,0.4)'
      })
      el.addEventListener('click', () => setSelectedBuilder(builder))

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([builder.lng, builder.lat])
        .addTo(map.current!)

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

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">

      {/* Header in normal flow */}
      <Header activePage="map" />

      {/* SearchBar below header */}
      <div className="px-4 py-3 border-b border-creme/5 bg-bg z-10 flex-shrink-0">
        <SearchBar
          view={view}
          onViewChange={setView}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={searchNearby}
        />
      </div>

      {/* Map + Sidebar row — fills remaining height */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Map */}
        <div
          ref={mapContainer}
          className="flex-1 h-full"
          style={{ display: view === 'map' ? 'block' : 'none' }}
        />

        {/* List view — bikes */}
        {view === 'list' && activeTab === 'bikes' && (
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="text-sm text-creme/40 mb-4">{bikes.length} Bikes in der Nähe</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bikes.map(bike => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          </div>
        )}

        {/* List view — builders */}
        {view === 'list' && activeTab === 'workshops' && (
          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="text-sm text-creme/40 mb-4">{MOCK_BUILDERS.length} Builder in Deutschland</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_BUILDERS.map(b => (
                <div key={b.id} className="bg-bg-2 border border-creme/6 rounded-2xl p-5 hover:border-teal/25 transition-all hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-teal/12 border border-teal/20 flex items-center justify-center text-sm font-bold text-teal flex-shrink-0">
                      {b.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-creme">{b.name}</p>
                        {b.verified && <BadgeCheck size={12} className="text-teal" />}
                      </div>
                      <p className="text-xs text-creme/35">{b.city}</p>
                    </div>
                  </div>
                  <p className="text-xs text-creme/40 mb-3">{b.specialty}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-creme/5 text-xs text-creme/35">
                    <span><span className="text-creme/60 font-semibold">{b.builds}</span> Builds</span>
                    <span className="flex items-center gap-1">
                      <svg width="9" height="9" viewBox="0 0 14 14" fill="#2AABAB"><path d="M7 1L8.5 5.5H13L9.5 8L11 12L7 9.5L3 12L4.5 8L1 5.5H5.5Z"/></svg>
                      {b.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side panel — bikes */}
        {view === 'map' && activeTab === 'bikes' && (
          <div className="hidden md:block w-72 border-l border-creme/5 overflow-y-auto bg-bg-2">
            <div className="px-3 py-2 border-b border-creme/5">
              <span className="text-xs text-creme/40">{bikes.length} Bikes</span>
            </div>
            <div className="divide-y divide-creme/5">
              {bikes.map(bike => (
                <button
                  key={bike.id}
                  onClick={() => setSelectedBike(bike)}
                  className={`w-full text-left px-3 py-3 hover:bg-bg-3 transition-colors ${selectedBike?.id === bike.id ? 'bg-bg-3' : ''}`}
                >
                  <p className="text-sm font-medium text-creme">{bike.title}</p>
                  <p className="text-xs text-creme/40 mt-0.5">{bike.year} · {bike.city} · {formatPrice(bike.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Side panel — builders */}
        {view === 'map' && activeTab === 'workshops' && (
          <div className="hidden md:block w-72 border-l border-creme/5 overflow-y-auto bg-bg-2">
            <div className="px-3 py-2 border-b border-creme/5">
              <span className="text-xs text-creme/40">{MOCK_BUILDERS.length} Builder in DE</span>
            </div>
            <div className="divide-y divide-creme/5">
              {MOCK_BUILDERS.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBuilder(b)
                    map.current?.flyTo({ center: [b.lng, b.lat], zoom: 13, duration: 1000 })
                  }}
                  className={`w-full text-left px-3 py-3 hover:bg-bg-3 transition-colors ${selectedBuilder?.id === b.id ? 'bg-bg-3 border-l-2 border-teal' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal/12 border border-teal/20 flex items-center justify-center text-xs font-bold text-teal flex-shrink-0">
                      {b.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-creme truncate">{b.name}</p>
                      <p className="text-xs text-creme/40">{b.city} · {b.builds} Builds</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected builder popup */}
        {selectedBuilder && view === 'map' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-bg-2 border border-teal/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-slide-up-sm">
            <div className="w-12 h-12 rounded-xl bg-teal/15 border border-teal/20 flex items-center justify-center text-base font-bold text-teal flex-shrink-0">
              {selectedBuilder.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-semibold text-creme">{selectedBuilder.name}</p>
                {selectedBuilder.verified && <BadgeCheck size={12} className="text-teal" />}
              </div>
              <p className="text-xs text-creme/40">{selectedBuilder.city} · {selectedBuilder.specialty}</p>
              <p className="text-xs text-creme/35 mt-0.5">{selectedBuilder.builds} Builds · ★ {selectedBuilder.rating}</p>
            </div>
            <Link
              href={`/builder/${selectedBuilder.slug}`}
              className="ml-1 text-xs text-teal font-semibold hover:text-teal-light transition-colors whitespace-nowrap"
            >
              Profil →
            </Link>
            <button
              onClick={() => setSelectedBuilder(null)}
              className="ml-1 text-creme/25 hover:text-creme transition-colors text-lg leading-none"
            >×</button>
          </div>
        )}

      </div>
    </div>
  )
}
