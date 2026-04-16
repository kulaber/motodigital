'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return text.replace(/[&<>"']/g, m => map[m])
}

interface Props {
  lat: number
  lng: number
  name: string
  address?: string
}

export default function BuilderMap({ lat, lng, name, address }: Props) {
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

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    // Custom marker element — MotoDigital logo pin (matches MiniMap style)
    const el = document.createElement('div')
    el.style.cssText = `
      width: 40px; height: 40px;
      background: #2AABAB;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(42,171,171,0.15), 0 3px 8px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    `
    const logo = document.createElement('img')
    logo.src = '/pin-logo.svg'
    logo.style.cssText = 'width: 18px; height: 18px; opacity: 0.9;'
    el.appendChild(logo)

    new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 20, closeButton: false })
          .setHTML(`
            <div style="font-family: Inter, system-ui, sans-serif; padding: 4px 2px;">
              <p style="font-weight: 700; font-size: 13px; color: var(--color-text); margin: 0 0 2px;">${escapeHtml(name)}</p>
              ${address ? `<p style="font-size: 11px; color: var(--color-text-2); margin: 0;">${escapeHtml(address)}</p>` : ''}
            </div>
          `)
      )
      .addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, name, address])

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
        .buildermap-container .mapboxgl-ctrl-logo { display: none !important; }
        .buildermap-container .mapboxgl-ctrl-attrib { display: none !important; }
        .buildermap-container .mapboxgl-ctrl-group {
          border: 1px solid #e5e5e5 !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
        }
        .buildermap-container .mapboxgl-ctrl button { background: #fff !important; }
        .buildermap-container .mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        .buildermap-container .mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        .buildermap-container .mapboxgl-ctrl-fullscreen .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        .buildermap-container .mapboxgl-ctrl-shrink .mapboxgl-ctrl-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 14h6v6m10-10h-6V4m0 6l7-7M3 21l7-7'/%3E%3C/svg%3E") !important;
          background-size: 16px 16px !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
      `}</style>
      <div className="buildermap-container relative">
        <div
          ref={containerRef}
          className="w-full h-72 rounded-t-none"
          style={{ minHeight: '288px' }}
        />
        {!activated && (
          <div
            onClick={handleActivate}
            className="absolute inset-0 cursor-pointer z-10 flex items-end justify-center pb-4 transition-opacity"
          >
            <span className="bg-white/90 backdrop-blur-sm text-[#222222] text-xs font-medium px-3 py-1.5 rounded-full border border-[#222222]/10 shadow-sm">
              Klicken, um Karte zu bedienen
            </span>
          </div>
        )}
      </div>
    </>
  )
}
