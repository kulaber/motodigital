'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return text.replace(/[&<>"']/g, m => map[m])
}

interface VisitedCity {
  name: string
  lat: number
  lng: number
}

interface Props {
  lat?: number
  lng?: number
  locationName?: string | null
  visitedCities?: VisitedCity[]
  riderName?: string
}

export default function MiniMap({ lat, lng, locationName, visitedCities = [], riderName }: Props) {
  // Determine map center: rider location > first visited city > fallback
  const hasRiderLocation = lat !== undefined && lng !== undefined
  const centerLat = lat ?? visitedCities[0]?.lat ?? 51
  const centerLng = lng ?? visitedCities[0]?.lng ?? 10
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [centerLng, centerLat],
      zoom: hasRiderLocation ? 13 : 4,
      interactive: false,
      attributionControl: false,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right')

    // Rider home marker (only if rider has a location)
    const allPoints: [number, number][] = []

    if (hasRiderLocation) {
      const el = document.createElement('div')
      el.style.cssText = `
        width: 40px; height: 40px;
        position: relative;
        display: flex; align-items: center; justify-content: center;
      `
      const pulse = document.createElement('div')
      pulse.style.cssText = `
        position: absolute; inset: 0;
        border-radius: 50%;
        background: rgba(6,165,165,0.15);
        animation: minimap-pulse 2.5s ease-out infinite;
      `
      el.appendChild(pulse)
      const circle = document.createElement('div')
      circle.style.cssText = `
        position: relative;
        width: 32px; height: 32px;
        background: #06a5a5;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: flex; align-items: center; justify-content: center;
      `
      const logo = document.createElement('img')
      logo.src = '/pin-logo.svg'
      logo.style.cssText = 'width: 16px; height: 16px; opacity: 0.9;'
      circle.appendChild(logo)
      el.appendChild(circle)

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([centerLng, centerLat])

      if (locationName) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 18, closeButton: false })
            .setHTML(`
              <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 2px 0;">
                <p style="font-size: 12px; font-weight: 600; color: var(--color-text); margin: 0;">${escapeHtml(locationName)}</p>
              </div>
            `)
        )
      }

      marker.addTo(map)
      allPoints.push([centerLng, centerLat])
    }

    // Visited cities markers

    visitedCities.forEach(city => {
      const pin = document.createElement('div')
      pin.style.cssText = `
        width: 36px; height: 36px;
        background: #111111;
        border: 2.5px solid #2AABAB;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(42,171,171,0.15), 0 3px 8px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
      `
      const logo = document.createElement('img')
      logo.src = '/pin-logo.svg'
      logo.style.cssText = 'width: 18px; height: 18px; opacity: 0.9;'
      pin.appendChild(logo)

      new mapboxgl.Marker({ element: pin, anchor: 'center' })
        .setLngLat([city.lng, city.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 20, closeButton: false })
            .setHTML(`
              <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 2px 0;">
                <p style="font-size: 11px; font-weight: 600; color: var(--color-text); margin: 0;">${escapeHtml(riderName ?? 'Rider')} war in ${escapeHtml(city.name)}</p>
              </div>
            `)
        )
        .addTo(map)

      allPoints.push([city.lng, city.lat])
    })

    // Fit bounds to show all markers
    if (allPoints.length > 1 || (!hasRiderLocation && allPoints.length > 0)) {
      const bounds = new mapboxgl.LngLatBounds()
      allPoints.forEach(p => bounds.extend(p))
      map.fitBounds(bounds, { padding: 50, maxZoom: 8 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLat, centerLng, locationName])

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
        @keyframes minimap-pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .minimap-container .mapboxgl-ctrl-logo { display: none !important; }
        .minimap-container .mapboxgl-ctrl-attrib { display: none !important; }
        .minimap-container .mapboxgl-popup-content {
          background: #fff !important;
          border: 1px solid #e5e5e5 !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1) !important;
        }
        .minimap-container .mapboxgl-popup-tip { display: none !important; }
        .minimap-container .mapboxgl-ctrl-group {
          border: 1px solid #e5e5e5 !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        }
        .minimap-container .mapboxgl-ctrl button { background: #fff !important; }
      `}</style>
      <div className="minimap-container">
        <div className="relative">
          <div ref={containerRef} className="w-full" style={{ height: visitedCities.length > 0 ? 300 : 260 }} />
          {!activated && (
            <div
              onClick={handleActivate}
              className="absolute inset-0 cursor-pointer z-10 flex items-end justify-center pb-3 transition-opacity"
            >
              <span className="bg-white/90 backdrop-blur-sm text-[#222222] text-xs font-medium px-3 py-1.5 rounded-full border border-[#222222]/10 shadow-sm">
                Klicken, um Karte zu bedienen
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
