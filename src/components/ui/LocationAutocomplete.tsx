'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'

export type LocationResult = {
  placeName: string   // Anzeigename, z.B. "Berlin, Deutschland"
  city: string        // Kurzname, z.B. "Berlin"
  lat: number
  lng: number
}

interface Props {
  value: string
  onChange: (result: LocationResult | null) => void
  placeholder?: string
  className?: string
}

interface MapboxFeature {
  id: string
  place_name: string
  text: string
  center: [number, number]   // [lng, lat]
  place_type: string[]
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export default function LocationAutocomplete({ value, onChange, placeholder = 'Berlin, München, Hamburg…', className }: Props) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2 || !TOKEN) { setSuggestions([]); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        access_token: TOKEN,
        autocomplete:  'true',
        types:         'place,locality,district',
        language:      'de',
        country:       'DE,AT,CH',
        limit:         '6',
      })
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params}`
      )
      const json = await res.json()
      setSuggestions(json.features ?? [])
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (!q) {
      onChange(null)
      setSuggestions([])
      setOpen(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 280)
  }

  function onSelect(feature: MapboxFeature) {
    const city = feature.text
    const placeName = feature.place_name
    const [lng, lat] = feature.center
    setQuery(city)
    setSuggestions([])
    setOpen(false)
    onChange({ placeName, city, lat, lng })
  }

  function onClear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    onChange(null)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0EDE4]/25 pointer-events-none" />
        <input
          value={query}
          onChange={onInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`${className} pl-10 pr-10`}
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EDE4]/30 animate-spin" />
        )}
        {!loading && query && (
          <button onClick={onClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EDE4]/25 hover:text-[#F0EDE4] transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1.5 w-full bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
          {suggestions.map(f => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => onSelect(f)}
                className="w-full text-left px-4 py-3 text-sm text-[#F0EDE4]/70 hover:bg-[#F0EDE4]/5 hover:text-[#F0EDE4] transition-colors flex items-center gap-2.5 border-b border-[#F0EDE4]/5 last:border-0"
              >
                <MapPin size={12} className="text-[#2AABAB] flex-shrink-0" />
                <span>
                  <span className="font-medium text-[#F0EDE4]">{f.text}</span>
                  <span className="text-[#F0EDE4]/35 text-xs ml-1.5">
                    {f.place_name.split(',').slice(1).join(',').trim()}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
