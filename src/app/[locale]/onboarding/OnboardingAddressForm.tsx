'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Wrench, Check } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

type MapboxFeature = {
  id: string
  place_name: string
  center: [number, number]
}

function AddressAutocomplete({
  value,
  onChange,
}: {
  value: { address: string; lat: number | null; lng: number | null }
  onChange: (v: { address: string; lat: number | null; lng: number | null }) => void
}) {
  const [query, setQuery] = useState(value.address)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  function handleInput(val: string) {
    setQuery(val)
    onChange({ address: val, lat: null, lng: null })
    if (debounce.current) clearTimeout(debounce.current)
    if (!val.trim() || !token) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&language=de&country=de,at,ch&types=address,place&limit=5`
        )
        const json = await res.json()
        setSuggestions(json.features ?? [])
        setOpen(true)
      } catch { setSuggestions([]) }
    }, 280)
  }

  function select(f: MapboxFeature) {
    setQuery(f.place_name)
    setSuggestions([])
    setOpen(false)
    onChange({ address: f.place_name, lat: f.center[1], lng: f.center[0] })
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#222222]/25 pointer-events-none" />
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="z.B. Greifswalder Str. 212, 10405 Berlin"
          className="w-full bg-white border border-[#222222]/10 rounded-xl pl-9 pr-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none focus:border-[#222222]/40 transition-colors"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-[#222222]/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(f => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={() => select(f)}
                className="w-full text-left px-4 py-2.5 text-sm text-[#222222]/70 hover:bg-[#F7F7F7] transition-colors flex items-start gap-2.5"
              >
                <MapPin size={12} className="text-[#06a5a5] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{f.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.lat && value.lng && (
        <p className="text-[10px] text-[#06a5a5] mt-1.5 flex items-center gap-1">
          <MapPin size={9} /> Koordinaten gespeichert
        </p>
      )}
    </div>
  )
}

export default function OnboardingAddressForm({ userId }: { userId: string }) {
  const supabase = createClient()
  const [addressData, setAddressData] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!addressData.address.trim()) {
      setError('Bitte gib eine Adresse ein.')
      return
    }
    if (!addressData.lat || !addressData.lng) {
      setError('Bitte wähle eine Adresse aus den Vorschlägen aus.')
      return
    }
    setSaving(true)
    setError(null)

    const { error: err } = await (supabase.from('profiles') as any)
      .update({
        address: addressData.address,
        lat: addressData.lat,
        lng: addressData.lng,
      })
      .eq('id', userId)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    // Full page reload to bypass Next.js Router Cache —
    // ohne das liest das Dashboard-Layout gecachte Profildaten (address=null)
    // und leitet zurück zum Onboarding → Loop
    window.location.href = '/dashboard'
  }

  return (
    <div className="w-full max-w-lg">

      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/">
          <Image src="/logo-dark.svg" alt="MotoDigital" width={200} height={76} className="h-12 w-auto" priority />
        </Link>
      </div>

      <div className="bg-white border border-[#222222]/6 rounded-2xl p-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-[#222222]">Fast geschafft!</h2>
            <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-semibold border bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20">
              <Wrench size={10} />
              Custom Werkstatt
            </div>
          </div>
          <p className="text-sm text-[#222222]/40">Damit Rider dich auf der Karte finden können</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#222222]/50 mb-1.5">
              Vollständige Anschrift
            </label>
            <AddressAutocomplete value={addressData} onChange={setAddressData} />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? 'Wird gespeichert...' : 'Standort speichern'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-1.5">
          {[
            'Auf der Karte sichtbar & auffindbar',
            'Rider in deiner Nähe finden dich',
          ].map(b => (
            <div key={b} className="flex items-center gap-2">
              <Check size={10} className="text-[#06a5a5] flex-shrink-0" />
              <span className="text-xs text-[#222222]/40">{b}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
