'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ChevronDown, X } from 'lucide-react'
import type { RiderCard } from './page'

const STYLE_LABELS: Record<string, string> = {
  cafe_racer: 'Cafe Racer', bobber: 'Bobber', scrambler: 'Scrambler',
  tracker: 'Tracker', chopper: 'Chopper', naked: 'Naked',
  street: 'Street', enduro: 'Enduro', other: 'Basis-Bike',
}
function formatStyle(s: string): string {
  return STYLE_LABELS[s] ?? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface Props {
  riders: RiderCard[]
}

const RIDING_STYLES = [
  { value: 'cruiser', label: '☀️ Ruhiger Cruiser' },
  { value: 'flott', label: '💨☀️ Flotter Fahrer' },
  { value: 'legende', label: '🏍💨☀️ Lebensmüde Legende' },
]

export default function RiderListClient({ riders }: Props) {
  const [cityFilter, setCityFilter] = useState('Alle')
  const [styleFilter, setStyleFilter] = useState('Alle')
  const [bikeStyleFilter, setBikeStyleFilter] = useState('Alle')

  const [cityOpen, setCityOpen] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)
  const [bikeStyleOpen, setBikeStyleOpen] = useState(false)

  const cities = useMemo(() => {
    const set = new Set<string>()
    riders.forEach(r => { if (r.city) set.add(r.city.split(',')[0].trim()) })
    return ['Alle', ...[...set].sort()]
  }, [riders])

  const bikeStyles = useMemo(() => {
    const set = new Set<string>()
    riders.forEach(r => r.bikeStyles.forEach(s => set.add(s)))
    return ['Alle', ...[...set].sort()]
  }, [riders])

  const filtered = useMemo(() => {
    return riders.filter(r => {
      if (cityFilter !== 'Alle' && r.city?.split(',')[0].trim() !== cityFilter) return false
      if (styleFilter !== 'Alle' && r.ridingStyle !== styleFilter) return false
      if (bikeStyleFilter !== 'Alle' && !r.bikeStyles.includes(bikeStyleFilter)) return false
      return true
    })
  }, [riders, cityFilter, styleFilter, bikeStyleFilter])

  const hasFilters = cityFilter !== 'Alle' || styleFilter !== 'Alle' || bikeStyleFilter !== 'Alle'

  function resetAll() {
    setCityFilter('Alle')
    setStyleFilter('Alle')
    setBikeStyleFilter('Alle')
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-6">

        {/* Standort */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setCityOpen(v => !v); setStyleOpen(false); setBikeStyleOpen(false) }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
              cityFilter !== 'Alle'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
            }`}
          >
            {cityFilter === 'Alle' ? 'Standort' : cityFilter}
            <ChevronDown size={11} className={`transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
          </button>
          {cityOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCityOpen(false)} />
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px] max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {cities.map(c => (
                  <button key={c} onClick={() => { setCityFilter(c); setCityOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${cityFilter === c ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                    {c === 'Alle' ? 'Alle Standorte' : c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fahrstil */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setStyleOpen(v => !v); setCityOpen(false); setBikeStyleOpen(false) }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
              styleFilter !== 'Alle'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
            }`}
          >
            {styleFilter === 'Alle' ? 'Fahrstil' : RIDING_STYLES.find(s => s.value === styleFilter)?.label ?? styleFilter}
            <ChevronDown size={11} className={`transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
          </button>
          {styleOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStyleOpen(false)} />
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[200px]">
                <button onClick={() => { setStyleFilter('Alle'); setStyleOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 ${styleFilter === 'Alle' ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                  Alle Fahrstile
                </button>
                {RIDING_STYLES.map(s => (
                  <button key={s.value} onClick={() => { setStyleFilter(s.value); setStyleOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${styleFilter === s.value ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bike-Stil */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setBikeStyleOpen(v => !v); setCityOpen(false); setStyleOpen(false) }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
              bikeStyleFilter !== 'Alle'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
            }`}
          >
            {bikeStyleFilter === 'Alle' ? 'Bike-Stil' : formatStyle(bikeStyleFilter)}
            <ChevronDown size={11} className={`transition-transform ${bikeStyleOpen ? 'rotate-180' : ''}`} />
          </button>
          {bikeStyleOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBikeStyleOpen(false)} />
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px] max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {bikeStyles.map(s => (
                  <button key={s} onClick={() => { setBikeStyleFilter(s); setBikeStyleOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${bikeStyleFilter === s ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                    {s === 'Alle' ? 'Alle Bike-Stile' : formatStyle(s)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={resetAll}
            aria-label="Filter zurücksetzen"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#222222]/35 hover:text-[#222222] transition-colors rounded-full hover:bg-[#222222]/5"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-[#717171] mb-4">
        {filtered.length} Rider {hasFilters ? 'gefunden' : 'in der Community'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(rider => (
          <Link
            key={rider.slug}
            href={`/rider/${rider.slug}`}
            className="bg-white rounded-2xl border border-[#222222]/6 p-5 hover:border-[#222222]/15 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#2AABAB] overflow-hidden flex items-center justify-center">
                  {rider.avatar ? (
                    <Image src={rider.avatar} alt={rider.name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/pin-logo.svg" alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
                {rider.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate leading-tight">
                  {rider.name}
                </p>
                {rider.city && (
                  <p className="text-xs text-[#717171] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {rider.city}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {rider.ridingStyle && (
                <span className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                  {rider.ridingStyle === 'cruiser' && '☀️ Ruhiger Cruiser'}
                  {rider.ridingStyle === 'flott' && '💨☀️ Flotter Fahrer'}
                  {rider.ridingStyle === 'legende' && '🏍💨☀️ Lebensmüde Legende'}
                </span>
              )}
              <span className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2.5 py-1 rounded-full">
                Garage: {rider.bikeCount === 0 ? 'Kein Custom Bike' : `${rider.bikeCount} Custom Bike${rider.bikeCount > 1 ? 's' : ''}`}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#222222]/25 text-sm">Keine Rider für diese Filter gefunden.</p>
          <button
            onClick={resetAll}
            className="text-sm text-[#06a5a5] hover:underline mt-2"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </>
  )
}
