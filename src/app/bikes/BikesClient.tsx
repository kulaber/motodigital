'use client'

import { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, Search } from 'lucide-react'

function isNew(publishedAt?: string): boolean {
  if (!publishedAt) return false
  const diff = Date.now() - new Date(publishedAt).getTime()
  return diff < 3 * 24 * 60 * 60 * 1000
}
import type { Build } from '@/lib/data/builds'

function getMake(base: string) { return base.split(' ')[0] }
function getModel(base: string) { return base.split(' ').slice(1).join(' ') }

interface Props {
  builds: Build[]
  initialStyle?: string
}

export default function BikesClient({ builds, initialStyle = 'Alle' }: Props) {
  const [activeStyle,   setActiveStyle]   = useState(initialStyle)
  const [activeCountry, setActiveCountry] = useState('Alle')
  const [activeMake,    setActiveMake]    = useState('Alle')
  const [activeModel,   setActiveModel]   = useState('Alle')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [activeSort,    setActiveSort]    = useState<'popular' | 'newest' | 'oldest'>('newest')
  const [page,          setPage]          = useState(1)
  const PER_PAGE = 12

  const SORT_LABELS: Record<string, string> = { popular: 'Beliebt', newest: 'Neueste zuerst', oldest: 'Älteste zuerst' }

  const filterRef = useRef<HTMLDivElement>(null)
  const gridAnchorRef = useRef<HTMLDivElement>(null)
  const scrollToFilter = () => {
    if (!filterRef.current) return
    const rect = filterRef.current.getBoundingClientRect()
    const offset = window.scrollY + rect.top - 64
    window.scrollTo({ top: offset, behavior: 'smooth' })
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
    const unique = Array.from(new Set(pool.map(b => getMake(b.base)))).sort()
    return ['Alle', ...unique]
  }, [searchFiltered, activeCountry, activeStyle])

  const models = useMemo(() => {
    if (activeMake === 'Alle') return []
    const pool = searchFiltered.filter(b =>
      getMake(b.base) === activeMake &&
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
      const makeMatch    = activeMake === 'Alle' || getMake(b.base) === activeMake
      const modelMatch   = activeModel === 'Alle' || getModel(b.base) === activeModel
      return styleMatch && countryMatch && makeMatch && modelMatch
    })
    if (activeSort === 'popular') {
      result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    } else if (activeSort === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt ?? '1970').getTime() - new Date(a.publishedAt ?? '1970').getTime())
    } else if (activeSort === 'oldest') {
      result.sort((a, b) => new Date(a.publishedAt ?? '1970').getTime() - new Date(b.publishedAt ?? '1970').getTime())
    }
    return result
  }, [searchFiltered, activeStyle, activeCountry, activeMake, activeModel, activeSort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function goToPage(p: number) {
    setPage(p)
    setTimeout(() => {
      gridAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <>
      {/* FILTER BAR */}
      <div ref={filterRef} className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">

            {/* Search field */}
            <div className="relative flex-shrink-0 w-44 lg:w-52">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setActiveCountry('Alle'); setActiveStyle('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1) }}
                placeholder="Custom Bike suchen…"
                className="w-full h-[34px] pl-8 pr-7 text-[13px] text-[#333] placeholder-[#999] bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#999] transition-colors"
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

            {/* Native select filters: Land → Umbau-Stil → Marke → Modell */}
            <select
              value={activeCountry}
              onChange={e => { setActiveCountry(e.target.value); setActiveStyle('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1); scrollToFilter() }}
              className={`flex-shrink-0 h-[34px] text-[13px] font-medium pl-3 pr-7 rounded-lg appearance-none bg-[right_8px_center] bg-[length:10px] bg-no-repeat cursor-pointer transition-colors border ${
                activeCountry !== 'Alle'
                  ? 'bg-[#333] text-white border-[#333]'
                  : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
              }`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${activeCountry !== 'Alle' ? 'white' : '%23999'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Alle">Land</option>
              {countries.filter(c => c !== 'Alle').map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={activeStyle}
              onChange={e => { setActiveStyle(e.target.value); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1); scrollToFilter() }}
              className={`flex-shrink-0 h-[34px] text-[13px] font-medium pl-3 pr-7 rounded-lg appearance-none bg-[right_8px_center] bg-[length:10px] bg-no-repeat cursor-pointer transition-colors border ${
                activeStyle !== 'Alle'
                  ? 'bg-[#333] text-white border-[#333]'
                  : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
              }`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${activeStyle !== 'Alle' ? 'white' : '%23999'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Alle">Umbau-Stil</option>
              {styles.filter(s => s !== 'Alle').map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={activeMake}
              onChange={e => { setActiveMake(e.target.value); setActiveModel('Alle'); setPage(1); scrollToFilter() }}
              className={`flex-shrink-0 h-[34px] text-[13px] font-medium pl-3 pr-7 rounded-lg appearance-none bg-[right_8px_center] bg-[length:10px] bg-no-repeat cursor-pointer transition-colors border ${
                activeMake !== 'Alle'
                  ? 'bg-[#333] text-white border-[#333]'
                  : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
              }`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${activeMake !== 'Alle' ? 'white' : '%23999'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Alle">Marke</option>
              {makes.filter(m => m !== 'Alle').map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {activeMake !== 'Alle' && (
              <select
                value={activeModel}
                onChange={e => { setActiveModel(e.target.value); setPage(1); scrollToFilter() }}
                className={`flex-shrink-0 h-[34px] text-[13px] font-medium pl-3 pr-7 rounded-lg appearance-none bg-[right_8px_center] bg-[length:10px] bg-no-repeat cursor-pointer transition-colors border ${
                  activeModel !== 'Alle'
                    ? 'bg-[#333] text-white border-[#333]'
                    : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#999]'
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${activeModel !== 'Alle' ? 'white' : '%23999'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
              >
                <option value="Alle">Modell</option>
                {models.filter(m => m !== 'Alle').map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {/* Reset */}
            {(activeStyle !== 'Alle' || activeCountry !== 'Alle' || activeMake !== 'Alle' || searchQuery) && (
              <button
                onClick={() => { setSearchQuery(''); setActiveStyle('Alle'); setActiveCountry('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1) }}
                aria-label="Filter zurücksetzen"
                className="flex-shrink-0 w-[34px] h-[34px] flex items-center justify-center text-[#999] hover:text-[#333] transition-colors rounded-lg border border-[#d4d4d4] hover:border-[#999] bg-white"
              >
                <X size={14} />
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sortieren */}
            <select
              value={activeSort}
              onChange={e => { setActiveSort(e.target.value as 'popular' | 'newest' | 'oldest'); setPage(1); scrollToFilter() }}
              className="flex-shrink-0 h-[34px] text-[13px] font-medium pl-3 pr-7 rounded-lg appearance-none bg-white text-[#333] border border-[#d4d4d4] hover:border-[#999] cursor-pointer transition-colors bg-[right_8px_center] bg-[length:10px] bg-no-repeat"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              {(['popular', 'newest', 'oldest'] as const).map(key => (
                <option key={key} value={key}>{SORT_LABELS[key]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div ref={gridAnchorRef} className="-mt-32 pt-32" />
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#222222]/25 text-sm">Keine Bikes für diese Filter gefunden.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveStyle('Alle'); setActiveCountry('Alle'); setActiveMake('Alle'); setActiveModel('Alle'); setPage(1) }}
                className="mt-4 text-xs text-[#717171] hover:text-[#06a5a5] transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paged.map((build, i) => (
                <Link
                  key={build.slug}
                  href={build.href ?? `/custom-bike/${build.slug}`}
                  className="card-interactive cursor-pointer group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={build.coverImg}
                      alt={build.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                    {isNew(build.publishedAt) && (
                      <span className="absolute top-2 right-2 bg-[#06a5a5] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Neu
                      </span>
                    )}
                    {build.role && (
                      <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {build.role === 'custom-werkstatt' ? 'Custom Werkstatt' : 'Rider'}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1">{build.title}</h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                    <p className="text-[10px] text-[#222222]/25 mt-0.5 truncate">{build.builder.name}</p>
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
