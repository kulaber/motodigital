'use client'

import { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ChevronLeft, ChevronRight, X, Search, SlidersHorizontal } from 'lucide-react'
import { useHideNavOnModal } from '@/hooks/useHideNavOnModal'

function isNew(publishedAt?: string): boolean {
  if (!publishedAt) return false
  const diff = Date.now() - new Date(publishedAt).getTime()
  return diff < 3 * 24 * 60 * 60 * 1000
}
import type { Build } from '@/lib/data/builds'
import BikePlaceholder from '@/components/bike/BikePlaceholder'

function getMake(b: Build) { return b.make || b.base.split(' ')[0] }
function getModel(base: string) { return base.split(' ').slice(1).join(' ') }

interface Props {
  builds: Build[]
  initialStyle?: string
  isLoggedIn?: boolean
}

export default function BikesClient({ builds, initialStyle = 'Alle', isLoggedIn = false }: Props) {
  const [activeStyle,   setActiveStyle]   = useState(initialStyle)
  const [activeCountry, setActiveCountry] = useState('Alle')
  const [activeMake,    setActiveMake]    = useState('Alle')
  const [activeModel,   setActiveModel]   = useState('Alle')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [activeListing, setActiveListing] = useState<'Alle' | 'showcase' | 'for_sale'>('Alle')
  const [activeSort,    setActiveSort]    = useState<'popular' | 'newest' | 'oldest'>('newest')
  const [showFilterModal, setShowFilterModal] = useState(false)
  useHideNavOnModal(showFilterModal)
  const [page,          setPage]          = useState(1)
  const PER_PAGE = 12

  const SORT_LABELS: Record<string, string> = { popular: 'Beliebt', newest: 'Neueste zuerst', oldest: 'Älteste zuerst' }
  const LISTING_LABELS: Record<string, string> = { Alle: 'Typ', showcase: 'Showcase', for_sale: 'Zu verkaufen' }

  const filterRef = useRef<HTMLDivElement>(null)
  const gridAnchorRef = useRef<HTMLDivElement>(null)
  const scrollToFilter = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Pre-filter by search query — all dynamic filter lists and results are based on this
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return builds
    const q = searchQuery.toLowerCase().trim()
    return builds.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.base.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.builder.name.toLowerCase().includes(q) ||
      b.style.toLowerCase().includes(q)
    )
  }, [builds, searchQuery])

  const countries = useMemo(() => {
    const unique = Array.from(new Set(searchFiltered.map(b => b.country))).sort()
    return ['Alle', ...unique]
  }, [searchFiltered])

  const styles = useMemo(() => {
    const pool = searchFiltered.filter(b =>
      (activeCountry === 'Alle' || b.country === activeCountry)
    )
    const unique = Array.from(new Set(pool.map(b => b.style))).sort()
    return ['Alle', ...unique]
  }, [searchFiltered, activeCountry])

  const makes = useMemo(() => {
    const pool = searchFiltered.filter(b =>
      (activeCountry === 'Alle' || b.country === activeCountry) &&
      (activeStyle === 'Alle' || b.style === activeStyle)
    )
    const unique = Array.from(new Set(pool.map(b => getMake(b)))).sort()
    return ['Alle', ...unique]
  }, [searchFiltered, activeCountry, activeStyle])

  const models = useMemo(() => {
    if (activeMake === 'Alle') return []
    const pool = searchFiltered.filter(b =>
      getMake(b) === activeMake &&
      (activeCountry === 'Alle' || b.country === activeCountry) &&
      (activeStyle === 'Alle' || b.style === activeStyle)
    )
    const unique = Array.from(new Set(pool.map(b => getModel(b.base)))).sort()
    return ['Alle', ...unique]
  }, [searchFiltered, activeMake, activeCountry, activeStyle])

  const filtered = useMemo(() => {
    const result = searchFiltered.filter(b => {
      const styleMatch   = activeStyle === 'Alle' || b.style === activeStyle
      const countryMatch = activeCountry === 'Alle' || b.country === activeCountry
      const makeMatch    = activeMake === 'Alle' || getMake(b) === activeMake
      const modelMatch   = activeModel === 'Alle' || getModel(b.base) === activeModel
      const listingMatch = activeListing === 'Alle' || b.listingType === activeListing
      return styleMatch && countryMatch && makeMatch && modelMatch && listingMatch
    })
    if (activeSort === 'popular') {
      result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    } else if (activeSort === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt ?? '1970').getTime() - new Date(a.publishedAt ?? '1970').getTime())
    } else if (activeSort === 'oldest') {
      result.sort((a, b) => new Date(a.publishedAt ?? '1970').getTime() - new Date(b.publishedAt ?? '1970').getTime())
    }
    return result
  }, [searchFiltered, activeStyle, activeCountry, activeMake, activeModel, activeListing, activeSort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function goToPage(p: number) {
    setPage(p)
    setTimeout(() => {
      gridAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const activeFilterCount = (activeCountry !== 'Alle' ? 1 : 0) + (activeStyle !== 'Alle' ? 1 : 0) + (activeMake !== 'Alle' ? 1 : 0) + (activeModel !== 'Alle' ? 1 : 0) + (activeListing !== 'Alle' ? 1 : 0) + (activeSort !== 'newest' ? 1 : 0)
  const resetAllFilters = () => { setActiveStyle('Alle'); setActiveCountry('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setActiveListing('Alle'); setActiveSort('newest'); setPage(1) }

  return (
    <>
      {/* FILTER BAR */}
      <div ref={filterRef} className="sticky top-12 lg:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">

            {/* Mobile: Filter button (left) */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`lg:hidden flex-shrink-0 h-8 text-[13px] font-medium px-4 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 border ${
                activeFilterCount > 0 ? 'bg-[#222222]/8 text-[#222222] border-[#222222]/25' : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-[#222222] rounded-full">{activeFilterCount}</span>
              )}
            </button>

            {/* Mobile: Reset button */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="lg:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center text-[#999] hover:text-[#333] transition-colors rounded-full border border-[#d4d4d4] hover:border-[#999] bg-white cursor-pointer"
                aria-label="Filter zurücksetzen"
              >
                <X size={14} />
              </button>
            )}

            {/* Mobile: spacer */}
            <div className="flex-1 lg:hidden" />

            {/* Search field */}
            <div className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${searchQuery ? 'w-44 lg:w-52' : 'w-32 focus-within:w-44 lg:focus-within:w-52'}`}>
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setActiveCountry('Alle'); setActiveStyle('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1) }}
                placeholder="Suchen…"
                className="w-full h-8 pl-8 pr-7 text-[12px] font-normal text-[#333] placeholder-[#999] bg-white border border-[#d4d4d4] rounded-full focus:outline-none focus:border-[#999] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setPage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333] transition-colors"
                  aria-label="Suche löschen"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Desktop: inline filters */}
            <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
              activeListing !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
            }`}>
              <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
                {LISTING_LABELS[activeListing]}
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <select value={activeListing} onChange={e => { setActiveListing(e.target.value as 'Alle' | 'showcase' | 'for_sale'); setPage(1); scrollToFilter() }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <option value="Alle">Typ</option>
                <option value="showcase">Showcase</option>
                <option value="for_sale">Zu verkaufen</option>
              </select>
            </div>

            <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
              activeCountry !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
            }`}>
              <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
                {activeCountry === 'Alle' ? 'Land' : activeCountry}
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <select value={activeCountry} onChange={e => { setActiveCountry(e.target.value); setActiveStyle('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1); scrollToFilter() }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <option value="Alle">Land</option>
                {countries.filter(c => c !== 'Alle').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
              activeStyle !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
            }`}>
              <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
                {activeStyle === 'Alle' ? 'Umbau-Stil' : activeStyle}
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <select value={activeStyle} onChange={e => { setActiveStyle(e.target.value); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1); scrollToFilter() }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <option value="Alle">Umbau-Stil</option>
                {styles.filter(s => s !== 'Alle').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
              activeMake !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
            }`}>
              <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
                {activeMake === 'Alle' ? 'Marke' : activeMake}
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <select value={activeMake} onChange={e => { setActiveMake(e.target.value); setActiveModel('Alle'); setPage(1); scrollToFilter() }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <option value="Alle">Marke</option>
                {makes.filter(m => m !== 'Alle').map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {activeMake !== 'Alle' && (
              <div className={`hidden lg:block relative flex-shrink-0 h-8 rounded-full border cursor-pointer ${
                activeModel !== 'Alle' ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
              }`}>
                <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
                  {activeModel === 'Alle' ? 'Modell' : activeModel}
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <select value={activeModel} onChange={e => { setActiveModel(e.target.value); setPage(1); scrollToFilter() }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <option value="Alle">Modell</option>
                  {models.filter(m => m !== 'Alle').map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {/* Desktop: Reset */}
            {(activeStyle !== 'Alle' || activeCountry !== 'Alle' || activeMake !== 'Alle' || activeListing !== 'Alle' || searchQuery) && (
              <button
                onClick={() => { setSearchQuery(''); resetAllFilters() }}
                aria-label="Filter zurücksetzen"
                className="hidden lg:flex flex-shrink-0 w-8 h-8 items-center justify-center text-[#999] hover:text-[#333] transition-colors rounded-full border border-[#d4d4d4] hover:border-[#999] bg-white"
              >
                <X size={14} />
              </button>
            )}

            {/* Desktop: Spacer */}
            <div className="hidden lg:block flex-1" />

            {/* Desktop: Sortieren */}
            <div className="hidden lg:block relative flex-shrink-0 h-8 rounded-full border border-[#d4d4d4] hover:border-[#999] bg-white cursor-pointer">
              <div className="flex items-center h-full pl-3.5 pr-7 text-[13px] font-medium text-[#333] pointer-events-none">
                {SORT_LABELS[activeSort]}
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <select value={activeSort} onChange={e => { setActiveSort(e.target.value as 'popular' | 'newest' | 'oldest'); setPage(1); scrollToFilter() }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                {(['popular', 'newest', 'oldest'] as const).map(key => (
                  <option key={key} value={key}>{SORT_LABELS[key]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filter modal ── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
            <h2 className="text-base font-bold text-[#222222]">Filter</h2>
            <button onClick={() => setShowFilterModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors cursor-pointer">
              <X size={18} className="text-[#222222]" />
            </button>
          </div>

          {/* Filter options */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            {/* Land */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Land</h3>
              <div className="flex flex-wrap gap-2">
                {countries.map(c => (
                  <button
                    key={c}
                    onClick={() => { setActiveCountry(c); if (c === 'Alle') { setActiveStyle('Alle'); setActiveMake('Alle'); setActiveModel('Alle') } }}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeCountry === c
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {c === 'Alle' ? 'Alle Länder' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Typ */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Typ</h3>
              <div className="flex flex-wrap gap-2">
                {(['Alle', 'showcase', 'for_sale'] as const).map(val => (
                  <button
                    key={val}
                    onClick={() => setActiveListing(val)}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeListing === val
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {val === 'Alle' ? 'Alle' : val === 'showcase' ? 'Showcase' : 'Zu verkaufen'}
                  </button>
                ))}
              </div>
            </div>

            {/* Umbau-Stil */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Umbau-Stil</h3>
              <div className="flex flex-wrap gap-2">
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => { setActiveStyle(s); if (s !== activeStyle) { setActiveMake('Alle'); setActiveModel('Alle') } }}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeStyle === s
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {s === 'Alle' ? 'Alle Stile' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Marke */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Marke</h3>
              <div className="flex flex-wrap gap-2">
                {makes.map(m => (
                  <button
                    key={m}
                    onClick={() => { setActiveMake(m); if (m === 'Alle') setActiveModel('Alle') }}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeMake === m
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {m === 'Alle' ? 'Alle Marken' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Modell (nur wenn Marke gewählt) */}
            {activeMake !== 'Alle' && models.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#222222] mb-3">Modell</h3>
                <div className="flex flex-wrap gap-2">
                  {models.map(m => (
                    <button
                      key={m}
                      onClick={() => setActiveModel(m)}
                      className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                        activeModel === m
                          ? 'bg-[#222222] text-white border-[#222222]'
                          : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                      }`}
                    >
                      {m === 'Alle' ? 'Alle Modelle' : m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sortieren */}
            <div>
              <h3 className="text-sm font-semibold text-[#222222] mb-3">Sortieren</h3>
              <div className="flex flex-wrap gap-2">
                {(['popular', 'newest', 'oldest'] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveSort(key)}
                    className={`h-9 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeSort === key
                        ? 'bg-[#222222] text-white border-[#222222]'
                        : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed bottom buttons */}
          <div className="border-t border-[#EBEBEB] px-5 py-4 flex items-center gap-3">
            <button
              onClick={resetAllFilters}
              className="flex-1 h-12 text-sm font-semibold text-[#222222] bg-white border border-[#DDDDDD] rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-pointer"
            >
              Zurücksetzen
            </button>
            <button
              onClick={() => { setShowFilterModal(false); setPage(1) }}
              className="flex-1 h-12 text-sm font-semibold text-white bg-[#222222] rounded-xl hover:bg-[#333] transition-colors cursor-pointer"
            >
              {filtered.length} Ergebnisse anzeigen
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      <div ref={gridAnchorRef} className="-mt-32 pt-32" />
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#222222]/25 text-sm">Keine Bikes für diese Filter gefunden.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveStyle('Alle'); setActiveCountry('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setActiveListing('Alle'); setPage(1) }}
                className="mt-4 text-xs text-[#717171] hover:text-[#06a5a5] transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paged.map((build, _i) => (
                <Link
                  key={build.slug}
                  href={build.href ?? `/custom-bike/${build.slug}`}
                  className="card-interactive cursor-pointer group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                    {build.coverImg ? (
                      <Image
                        src={build.coverImg}
                        alt={build.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                    ) : (
                      <BikePlaceholder />
                    )}
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                    {build.listingType === 'for_sale' ? (
                      <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-[#06a5a5]/30 text-[#06a5a5] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Zu verkaufen
                      </span>
                    ) : isNew(build.publishedAt) ? (
                      <span className="absolute top-2 right-2 bg-[#06a5a5] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Neu
                      </span>
                    ) : null}
                    {build.role && build.role !== 'superadmin' && (
                      <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {build.role === 'custom-werkstatt' ? 'Custom Werkstatt' : 'Rider'}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="min-w-0 text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1">{build.title}</h3>
                      {build.listingType === 'for_sale' && build.priceOnRequest && (
                        <span className="text-[10px] font-semibold text-[#222222]/40 flex-shrink-0">Auf Anfrage</span>
                      )}
                      {isLoggedIn && build.listingType === 'for_sale' && build.priceAmount && !build.priceOnRequest && (
                        <span className="text-xs sm:text-sm font-bold text-[#222222] flex-shrink-0">
                          {Number(build.priceAmount).toLocaleString('de-DE')} <span className="text-[10px] font-semibold text-[#222222]/40">€</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{build.base} · {build.year}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[10px] text-[#222222]/25 truncate">{build.builder.name}</p>
                      {(build.city || build.country) && (
                        <p className="text-[10px] text-[#222222]/25 flex-shrink-0">{[build.city, build.country].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-10 sm:mt-14 flex flex-col items-center gap-4">
              <p className="text-xs text-[#222222]/20">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} von {filtered.length} Bikes
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222222]/10 text-[#222222]/40 hover:text-[#222222] hover:border-[#222222]/25 transition-all disabled:opacity-25 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'dots')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1]) > 1) acc.push('dots')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, i) =>
                      item === 'dots' ? (
                        <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-[#222222]/20 text-xs">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => goToPage(item)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-semibold transition-all ${
                            page === item
                              ? 'bg-[#222222] text-white'
                              : 'border border-[#222222]/10 text-[#222222]/45 hover:text-[#222222] hover:border-[#222222]/25'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222222]/10 text-[#222222]/40 hover:text-[#222222] hover:border-[#222222]/25 transition-all disabled:opacity-25 disabled:pointer-events-none"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
