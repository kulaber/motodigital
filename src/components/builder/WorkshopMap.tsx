// Light Mode only — no dark: classes
'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_LANG_SUPPORT = ['de','en','fr','es','it','pt','nl','pl','ru','zh','ar','ja','ko']

function setMapLanguage(map: mapboxgl.Map) {
  const browserLang = navigator.language?.split('-')[0] ?? 'en'
  const lang = MAPBOX_LANG_SUPPORT.includes(browserLang) ? browserLang : 'en'
  map.getStyle().layers?.forEach(layer => {
    if (layer.type !== 'symbol') return
    try {
      const field = map.getLayoutProperty(layer.id, 'text-field')
      if (field) {
        map.setLayoutProperty(layer.id, 'text-field',
          ['coalesce', ['get', `name_${lang}`], ['get', 'name']]
        )
      }
    } catch { /* layer may not support property */ }
  })
}

function applyMapStyle(map: mapboxgl.Map) {
  const layers = map.getStyle().layers ?? []
  layers.forEach(layer => {
    try {
      const id = layer.id
      if (layer.type === 'background') {
        map.setPaintProperty(id, 'background-color', '#f0fafa')
      } else if (layer.type === 'fill') {
        if (id === 'water' || id === 'water-shadow' || id.startsWith('water-')) {
          map.setPaintProperty(id, 'fill-color', '#9fd8d8')
        } else if (id === 'national-park' || id.startsWith('landuse')) {
          map.setPaintProperty(id, 'fill-color', '#d8f0f0')
        } else if (id.startsWith('building')) {
          map.setPaintProperty(id, 'fill-color', '#e4f5f5')
          if (id === 'building-outline') {
            map.setPaintProperty(id, 'fill-outline-color', '#cceaea')
          }
        } else if (id.startsWith('land-structure')) {
          map.setPaintProperty(id, 'fill-color', '#e8fafa')
        }
      } else if (layer.type === 'line') {
        if (id.startsWith('waterway')) {
          map.setPaintProperty(id, 'line-color', '#9fd8d8')
        } else if (id.startsWith('admin')) {
          map.setPaintProperty(id, 'line-color', '#aaaaaa')
          map.setPaintProperty(id, 'line-width', 0.8)
          map.setPaintProperty(id, 'line-opacity', 0.6)
        }
      }
    } catch { /* layer may not support property */ }
  })
}

export interface WorkshopMapHandle {
  map: mapboxgl.Map | null
  markers: mapboxgl.Marker[]
  clearMarkers: () => void
}

interface Props {
  className?: string
  style?: React.CSSProperties
  onMapReady?: (map: mapboxgl.Map) => void
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void
  onMoveEnd?: () => void
  onMapClick?: () => void
}

const WorkshopMap = forwardRef<WorkshopMapHandle, Props>(function WorkshopMap(
  { className, style, onMapReady, onBoundsChange, onMoveEnd, onMapClick },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useImperativeHandle(ref, () => ({
    get map() { return mapRef.current },
    get markers() { return markersRef.current },
    clearMarkers() {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    },
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || mapRef.current) return

    mapboxgl.accessToken = token.trim()
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [10.5, 51.2],
      zoom: 5,
      minZoom: 5,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.once('load', () => {
      applyMapStyle(map)
      setMapLanguage(map)
      onMapReady?.(map)
      const bounds = map.getBounds()
      if (bounds) onBoundsChange?.(bounds)
    })

    map.on('move', () => {
      const bounds = map.getBounds()
      if (bounds) onBoundsChange?.(bounds)
    })
    map.on('moveend', () => {
      const bounds = map.getBounds()
      if (bounds) onBoundsChange?.(bounds)
      onMoveEnd?.()
    })
    map.on('click', () => onMapClick?.())

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(container)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        .mapboxgl-popup-content {
          background: #ffffff !important;
          border: 1px solid #DDDDDD !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.10) !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
        .mapboxgl-ctrl-group { border: 1px solid #DDDDDD !important; border-radius: 10px !important; overflow: hidden; }
        .mapboxgl-ctrl button { background: #fff !important; }
        .mapboxgl-ctrl-logo { display: none !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
      <div ref={containerRef} className={className} style={style} />
    </>
  )
})

export default WorkshopMap
