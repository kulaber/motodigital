'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface VisitedCity {
  name: string
  lat: number
  lng: number
}

interface Props {
  lat: number
  lng: number
  locationName?: string | null
  visitedCities?: VisitedCity[]
  riderName?: string
}

export default function MiniMap({ lat, lng, locationName, visitedCities = [], riderName }: Props) {
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
      center: [lng, lat],
      zoom: 13,
      interactive: false,
      attributionControl: false,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right')

    // Custom teal marker
    const el = document.createElement('div')
    el.style.cssText = `
      width: 32px; height: 32px;
      background: #06a5a5;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(6,165,165,0.2), 0 3px 8px rgba(0,0,0,0.15);
      display: flex; align-items: center; justify-content: center;
    `
    const inner = document.createElement('div')
    inner.style.cssText = `
      width: 7px; height: 7px;
      background: #ffffff;
      border-radius: 50%;
    `
    el.appendChild(inner)

    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])

    if (locationName) {
      marker.setPopup(
        new mapboxgl.Popup({ offset: 18, closeButton: false })
          .setHTML(`
            <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 2px 0;">
              <p style="font-size: 12px; font-weight: 600; color: #222222; margin: 0;">${locationName}</p>
            </div>
          `)
      )
    }

    marker.addTo(map)

    // Visited cities markers
    const allPoints: [number, number][] = [[lng, lat]]

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
                <p style="font-size: 11px; font-weight: 600; color: #222222; margin: 0;">${riderName ?? 'Rider'} war in ${city.name}</p>
              </div>
            `)
        )
        .addTo(map)

      allPoints.push([city.lng, city.lat])
    })

    // Fit bounds to show all markers
    if (visitedCities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      allPoints.forEach(p => bounds.extend(p))
      map.fitBounds(bounds, { padding: 50, maxZoom: 8 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, locationName])

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
          <div ref={containerRef} className="w-full" style={{ height: visitedCities.length > 0 ? 300 : 200 }} />
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
