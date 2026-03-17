'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'

type Suggestion = {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
  city: string | null
}

type SelectedPlace = {
  address: string
  lng: number
  lat: number
  city: string | null
}

interface Props {
  initialValue?: string
  onSelect: (place: SelectedPlace | null) => void
  placeholder?: string
}

export default function MapboxAddressInput({ initialValue = '', onSelect, placeholder = 'Straße, Stadt, Land…' }: Props) {
  const [query,       setQuery]       = useState(initialValue)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading,     setLoading]     = useState(false)
  const [open,        setOpen]        = useState(false)
  const [selected,    setSelected]    = useState(!!initialValue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // If nothing selected, reset to empty to force a selection
        if (!selected) { setQuery(''); onSelect(null) }
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selected, onSelect])

  const fetchSuggestions = useCallback(async (value: string) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || value.length < 3) { setSuggestions([]); setOpen(false); return }

    setLoading(true)
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${token}&autocomplete=true&language=de&limit=5&types=address,place,locality,neighborhood`
      const res  = await fetch(url)
      const json = await res.json()
      const results: Suggestion[] = (json.features ?? []).map((f: Record<string, unknown>) => {
        // Extract city from context array (place or locality type)
        const context = (f.context as { id: string; text: string }[] | undefined) ?? []
        const cityCtx = context.find(c => c.id.startsWith('place.') || c.id.startsWith('locality.'))
        return {
          id:         f.id as string,
          place_name: f.place_name as string,
          center:     f.center as [number, number],
          city:       cityCtx?.text ?? null,
        }
      })
      setSuggestions(results)
      setOpen(results.length > 0)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setSelected(false)
    onSelect(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  function handleSelect(s: Suggestion) {
    setQuery(s.place_name)
    setSelected(true)
    setOpen(false)
    setSuggestions([])
    onSelect({ address: s.place_name, lng: s.center[0], lat: s.center[1], city: s.city })
  }

  function handleClear() {
    setQuery('')
    setSelected(false)
    setSuggestions([])
    setOpen(false)
    onSelect(null)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#222222]/25 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-white border rounded-xl pl-9 pr-9 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none transition-colors ${
            selected
              ? 'border-[#06a5a5]/50 bg-[#06a5a5]/3'
              : 'border-[#222222]/10 focus:border-[#222222]/30'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading
            ? <Loader2 size={13} className="animate-spin text-[#222222]/25" />
            : query
            ? <button type="button" onClick={handleClear} className="text-[#222222]/25 hover:text-[#222222]/60 transition-colors"><X size={13} /></button>
            : null
          }
        </div>
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-[#222222]/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={`${s.id}-${i}`}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(s) }}
              className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors border-b border-[#222222]/5 last:border-0"
            >
              <MapPin size={12} className="text-[#222222]/25 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#222222] leading-snug">{s.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hint when typing but not selected */}
      {query.length >= 2 && !selected && !loading && !open && (
        <p className="text-[11px] text-amber-500/80 mt-1">Bitte einen Vorschlag aus der Liste auswählen</p>
      )}
      {selected && (
        <p className="text-[11px] text-[#06a5a5] mt-1 flex items-center gap-1"><MapPin size={10} /> Standort gespeichert</p>
      )}
    </div>
  )
}
