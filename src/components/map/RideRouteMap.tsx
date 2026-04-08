'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface RideStop {
  name: string
  lon: number
  lat: number
}

interface Props {
  stops: RideStop[]
}

export default function RideRouteMap({ stops }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || stops.length === 0) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [stops[0].lon, stops[0].lat],
      zoom: 6,
      interactive: false,
      attributionControl: false,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right')

    // Add markers + route after map loads
    map.on('load', async () => {
      // Add markers for each stop
      stops.forEach((stop, i) => {
        const isFirst = i === 0
        const isLast = i === stops.length - 1
        const size = isFirst || isLast ? 36 : 30

        const el = document.createElement('div')
        el.style.cssText = `
          width: ${size}px; height: ${size}px;
          display: flex; align-items: center; justify-content: center;
        `

        const circle = document.createElement('div')
        circle.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          background: #111111;
          border: 2.5px solid #2AABAB;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(42,171,171,0.15), 0 3px 8px rgba(0,0,0,0.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        `
        const logo = document.createElement('img')
        logo.src = '/pin-logo.svg'
        logo.style.cssText = `width: ${isFirst || isLast ? '18' : '14'}px; height: ${isFirst || isLast ? '18' : '14'}px; opacity: 0.9;`
        circle.appendChild(logo)
        el.appendChild(circle)

        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([stop.lon, stop.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 22, closeButton: false })
              .setHTML(`
                <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 2px 0;">
                  <p style="font-size: 11px; font-weight: 600; color: #222; margin: 0;">${stop.name}</p>
                </div>
              `)
          )
          .addTo(map)
      })

      // Fit bounds to show all stops
      const bounds = new mapboxgl.LngLatBounds()
      stops.forEach(s => bounds.extend([s.lon, s.lat]))
      map.fitBounds(bounds, { padding: 70, maxZoom: 12 })

      // Fetch driving route
      if (stops.length >= 2) {
        try {
          const coords = stops.map(s => `${s.lon},${s.lat}`).join(';')
          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${token}`
          )
          const json = await res.json()
          const route = json.routes?.[0]?.geometry
          if (!route) return

          map.addSource('ride-route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: route },
          })

          map.addLayer({
            id: 'ride-route-outline',
            type: 'line',
            source: 'ride-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': 5,
              'line-opacity': 0.8,
            },
          })

          map.addLayer({
            id: 'ride-route-line',
            type: 'line',
            source: 'ride-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#2AABAB',
              'line-width': 3,
              'line-opacity': 0.9,
            },
          })
        } catch {
          // If directions API fails, just show markers without a line
        }
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleActivate() {
    setActivated(true)
    const map = mapRef.current
    if (!map) return
    map.scrollZoom.enable()
    map.dragPan.enable()
    map.dragRotate.enable()
    map.doubleClickZoom.enable()
    map.touchZoomRotate.enable()
    map.keyboard.enable()
  }

  return (
    <>
      <style>{`
        .ridemap-container .mapboxgl-ctrl-logo { display: none !important; }
        .ridemap-container .mapboxgl-ctrl-attrib { display: none !important; }
        .ridemap-container .mapboxgl-popup-content {
          background: #fff !important;
          border: 1px solid #e5e5e5 !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1) !important;
        }
        .ridemap-container .mapboxgl-popup-tip { display: none !important; }
        .ridemap-container .mapboxgl-ctrl-group {
          border: 1px solid #e5e5e5 !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        }
        .ridemap-container .mapboxgl-ctrl button { background: #fff !important; }
      `}</style>
      <div className="ridemap-container">
        <div className="relative">
          <div ref={containerRef} className="w-full" style={{ height: 320 }} />
          {!activated && (
            <div
              onClick={handleActivate}
              className="absolute inset-0 z-10 flex items-end justify-center pb-3 transition-opacity"
              style={{ touchAction: 'pan-y' }}
            >
              <span className="bg-white/90 backdrop-blur-sm text-[#222222] text-xs font-medium px-3 py-1.5 rounded-full border border-[#222222]/10 shadow-sm cursor-pointer">
                Klicken, um Karte zu bedienen
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
