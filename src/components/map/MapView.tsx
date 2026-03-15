'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import BikeCard from '@/components/bike/BikeCard'
import SearchBar from '@/components/map/SearchBar'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'

type Bike = Database['public']['Tables']['bikes']['Row'] & {
  bike_images: { url: string; is_cover: boolean }[]
}

interface Props {
  initialBikes: Bike[]
}

export default function MapView({ initialBikes }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [bikes, setBikes] = useState<Bike[]>(initialBikes)
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [activeTab, setActiveTab] = useState<'bikes' | 'workshops'>('bikes')
  const supabase = createClient()

  // Init Mapbox
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [13.405, 52.52], // Berlin
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

  // Place markers when bikes change
  useEffect(() => {
    if (!map.current) return

    // Clear old markers
    markers.current.forEach(m => m.remove())
    markers.current = []

    bikes.forEach(bike => {
      // NOTE: bikes need lat/lng columns for markers
      // Using city centroid lookup or PostGIS point — omitted here for brevity
      // In production: bike.latitude / bike.longitude from the geography column
    })
  }, [bikes])

  // Proximity search via PostGIS function
  const searchNearby = useCallback(async (lat: number, lng: number, radiusM = 30000) => {
    const { data } = await supabase.rpc('search_bikes_nearby', {
      lat,
      lng,
      radius_m: radiusM,
    })
    if (data) setBikes(data as Bike[])
  }, [supabase])

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* Search + filter bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3">
        <SearchBar
          view={view}
          onViewChange={setView}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearch={searchNearby}
        />
      </div>

      {/* Map */}
      <div
        ref={mapContainer}
        className="flex-1"
        style={{ display: view === 'map' ? 'block' : 'none' }}
      />

      {/* List view */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto pt-20 px-4 pb-6">
          <p className="text-sm text-creme/40 mb-4">{bikes.length} Bikes in der Nähe</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bikes.map(bike => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        </div>
      )}

      {/* Side panel (map mode) */}
      {view === 'map' && (
        <div className="w-72 border-l border-creme/5 overflow-y-auto bg-bg-2 pt-20">
          <div className="px-3 py-2 border-b border-creme/5 flex justify-between items-center">
            <span className="text-xs text-creme/40">{bikes.length} Bikes</span>
          </div>
          <div className="divide-y divide-creme/5">
            {bikes.map(bike => (
              <button
                key={bike.id}
                onClick={() => setSelectedBike(bike)}
                className="w-full text-left px-3 py-3 hover:bg-bg-3 transition-colors"
              >
                <p className="text-sm font-medium text-creme">{bike.title}</p>
                <p className="text-xs text-creme/40 mt-0.5">
                  {bike.year} · {bike.city} · {formatPrice(bike.price)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
