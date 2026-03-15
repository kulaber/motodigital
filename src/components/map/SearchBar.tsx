'use client'

import { useState } from 'react'
import { Search, Map, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  view: 'map' | 'list'
  onViewChange: (v: 'map' | 'list') => void
  activeTab: 'bikes' | 'workshops'
  onTabChange: (t: 'bikes' | 'workshops') => void
  onSearch: (lat: number, lng: number, radius: number) => void
}

export default function SearchBar({ view, onViewChange, activeTab, onTabChange }: Props) {
  const [radius, setRadius] = useState(30)

  return (
    <div className="flex flex-col gap-2">
      {/* Main row */}
      <div className="flex gap-2 items-center">
        {/* Search input */}
        <div className="flex-1 flex items-center gap-2 bg-bg-2 border border-creme/10 rounded-full px-4 py-2.5">
          <Search size={14} className="text-creme/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Marke, Modell, Typ..."
            className="bg-transparent text-sm text-creme placeholder:text-creme/25 outline-none w-full"
          />
        </div>

        {/* Radius pill */}
        <div className="flex items-center gap-2 bg-bg-2 border border-creme/10 rounded-full px-4 py-2.5 text-sm text-creme/60">
          {radius} km
        </div>

        {/* View toggle */}
        <div className="flex bg-bg-2 border border-creme/10 rounded-full p-1">
          <button
            onClick={() => onViewChange('map')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              view === 'map' ? 'bg-teal text-bg' : 'text-creme/50 hover:text-creme'
            )}
          >
            <Map size={12} />
            Karte
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              view === 'list' ? 'bg-teal text-bg' : 'text-creme/50 hover:text-creme'
            )}
          >
            <List size={12} />
            Liste
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {/* Bikes / Builder toggle */}
        <div className="flex bg-bg-2 border border-creme/10 rounded-full p-0.5 flex-shrink-0">
          <button
            onClick={() => onTabChange('bikes')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              activeTab === 'bikes' ? 'bg-creme text-bg' : 'text-creme/50'
            )}
          >
            Bikes
          </button>
          <button
            onClick={() => onTabChange('workshops')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              activeTab === 'workshops' ? 'bg-creme text-bg' : 'text-creme/50'
            )}
          >
            Builder
          </button>
        </div>

        {/* Filter chips */}
        {(['Preis', 'Typ', 'Hubraum', 'Nur Verified'] as const).map(label => (
          <button
            key={label}
            className="flex-shrink-0 bg-bg-2 border border-creme/10 rounded-full px-3 py-1 text-xs text-creme/50 hover:text-creme hover:border-creme/25 transition-all"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
