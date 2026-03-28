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

    // Custom marker element
    const el = document.createElement('div')
    el.style.cssText = `
      width: 36px; height: 36px;
      background: var(--color-accent);
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(8,101,101,0.15), 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    `
    const inner = document.createElement('div')
    inner.style.cssText = `
      width: 8px; height: 8px;
      background: #ffffff;
      border-radius: 50%;
    `
    el.appendChild(inner)

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
      <style>{`.mapboxgl-ctrl-logo { display: none !important; } .mapboxgl-ctrl-attrib { display: none !important; }`}</style>
      <div className="relative">
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
