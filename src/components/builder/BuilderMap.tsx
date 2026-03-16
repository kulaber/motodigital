'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
  lat: number
  lng: number
  name: string
  address?: string
}

export default function BuilderMap({ lat, lng, name, address }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

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
      interactive: true,
      attributionControl: false,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    // Custom marker element
    const el = document.createElement('div')
    el.style.cssText = `
      width: 36px; height: 36px;
      background: #086565;
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
              <p style="font-weight: 700; font-size: 13px; color: #222222; margin: 0 0 2px;">${name}</p>
              ${address ? `<p style="font-size: 11px; color: #717171; margin: 0;">${address}</p>` : ''}
            </div>
          `)
      )
      .addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, name, address])

  return (
    <div
      ref={containerRef}
      className="w-full h-52 rounded-t-none"
      style={{ minHeight: '208px' }}
    />
  )
}
