'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const UMBAU_TYPEN = [
  'Café Racer',
  'Scrambler',
  'Bobber',
  'Chopper',
  'Tracker',
  'Streetfighter',
  'Brat Style',
  'Bagger',
] as const

export type UmbauTyp = typeof UMBAU_TYPEN[number]

interface Props {
  activeTab: 'bikes' | 'workshops'
  onTabChange: (t: 'bikes' | 'workshops') => void
  onSearch: (lat: number, lng: number, radius: number) => void
  selectedTypes: UmbauTyp[]
  onTypesChange: (types: UmbauTyp[]) => void
  onlyVerified: boolean
  onVerifiedChange: (v: boolean) => void
  availableTypes: readonly UmbauTyp[]
}

export default function SearchBar({
  activeTab,
  onTabChange,
  selectedTypes,
  onTypesChange,
  onlyVerified,
  onVerifiedChange,
  availableTypes,
}: Props) {
  function toggleType(type: UmbauTyp) {
    onTypesChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type)
        : [...selectedTypes, type]
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main row */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 bg-bg-2 border border-creme/10 rounded-full px-4 py-2.5">
          <Search size={14} className="text-creme/40 flex-shrink-0" />
          <input
            type="text"
            placeholder={activeTab === 'workshops' ? 'Builder suchen...' : 'Marke, Modell, Typ...'}
            className="bg-transparent text-sm text-creme placeholder:text-creme/25 outline-none w-full"
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {/* Builder / Bikes toggle */}
        <div className="flex bg-bg-2 border border-creme/10 rounded-full p-0.5 flex-shrink-0">
          <button
            onClick={() => onTabChange('workshops')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              activeTab === 'workshops' ? 'bg-creme text-bg' : 'text-creme/50'
            )}
          >
            Builder
          </button>
          <button
            onClick={() => onTabChange('bikes')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all',
              activeTab === 'bikes' ? 'bg-creme text-bg' : 'text-creme/50'
            )}
          >
            Bikes
          </button>
        </div>

        {/* Builder filters */}
        {activeTab === 'workshops' && (
          <>
            {/* Umbau-Typ chips — only show types with at least one builder */}
            {availableTypes.map(type => {
              const active = selectedTypes.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all',
                    active
                      ? 'bg-teal text-bg border-teal'
                      : 'bg-bg-2 border-creme/10 text-creme/50 hover:text-creme hover:border-creme/25'
                  )}
                >
                  {type}
                </button>
              )
            })}

            {/* Divider */}
            <div className="w-px bg-creme/8 flex-shrink-0 my-0.5" />

            {/* Nur Verifiziert */}
            <button
              onClick={() => onVerifiedChange(!onlyVerified)}
              className={cn(
                'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all whitespace-nowrap',
                onlyVerified
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                  : 'bg-bg-2 border-creme/10 text-creme/50 hover:text-creme hover:border-creme/25'
              )}
            >
              ✓ Nur Verifiziert
            </button>
          </>
        )}

        {/* Bike filters */}
        {activeTab === 'bikes' && (
          <>
            {(['Preis', 'Typ', 'Hubraum'] as const).map(label => (
              <button
                key={label}
                className="flex-shrink-0 bg-bg-2 border border-creme/10 rounded-full px-3 py-1 text-xs text-creme/50 hover:text-creme hover:border-creme/25 transition-all"
              >
                {label}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
