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
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

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

      // Single stop: add a visual radius circle around the pin
      if (stops.length === 1) {
        const center = [stops[0].lon, stops[0].lat] as [number, number]
        const radiusKm = 5
        const points = 64
        const coords: [number, number][] = []
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI
          const dx = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180))
          const dy = radiusKm / 110.574
          coords.push([center[0] + dx * Math.cos(angle), center[1] + dy * Math.sin(angle)])
        }

        map.addSource('radius-circle', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [coords] },
          },
        })

        map.addLayer({
          id: 'radius-circle-fill',
          type: 'fill',
          source: 'radius-circle',
          paint: {
            'fill-color': '#2AABAB',
            'fill-opacity': 0.08,
          },
        })

        map.addLayer({
          id: 'radius-circle-border',
          type: 'line',
          source: 'radius-circle',
          paint: {
            'line-color': '#2AABAB',
            'line-width': 1.5,
            'line-opacity': 0.3,
          },
        })

        // Fit map to show entire radius circle
        const circleBounds = new mapboxgl.LngLatBounds()
        coords.forEach(c => circleBounds.extend(c))
        map.fitBounds(circleBounds, { padding: 40 })
      } else {
        const bounds = new mapboxgl.LngLatBounds()
        stops.forEach(s => bounds.extend([s.lon, s.lat]))
        map.fitBounds(bounds, { padding: 70, maxZoom: 12 })
      }

      // Fetch driving route
      if (stops.length >= 2) {
        try {
          const coords = stops.map(s => `${s.lon},${s.lat}`).join(';')
          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&exclude=motorway&access_token=${token}`
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
        .ridemap-container .mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        .ridemap-container .mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        .ridemap-container .mapboxgl-ctrl-fullscreen .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        .ridemap-container .mapboxgl-ctrl-shrink .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 14h6v6m10-10h-6V4m0 6l7-7M3 21l7-7'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
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
