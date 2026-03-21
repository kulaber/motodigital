'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, X, ArrowUpDown } from 'lucide-react'

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
  const [countryOpen,   setCountryOpen]   = useState(false)
  const [activeMake,    setActiveMake]    = useState('Alle')
  const [makeOpen,      setMakeOpen]      = useState(false)
  const [activeModel,   setActiveModel]   = useState('Alle')
  const [modelOpen,     setModelOpen]     = useState(false)
  const [styleOpen,     setStyleOpen]     = useState(false)
  const [activeSort,    setActiveSort]    = useState<'popular' | 'newest' | 'oldest'>('newest')
  const [sortOpen,      setSortOpen]      = useState(false)

  const SORT_LABELS: Record<string, string> = { popular: 'Beliebt', newest: 'Neueste zuerst', oldest: 'Älteste zuerst' }

  const filterRef = useRef<HTMLDivElement>(null)
  const scrollToFilter = () => {
    if (!filterRef.current) return
    const top = filterRef.current.offsetTop - 64 // subtract sticky header height
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const countries = useMemo(() => {
    const unique = Array.from(new Set(builds.map(b => b.country))).sort()
    return ['Alle', ...unique]
  }, [builds])

  const makes = useMemo(() => {
    const pool = activeCountry === 'Alle' ? builds : builds.filter(b => b.country === activeCountry)
    const unique = Array.from(new Set(pool.map(b => getMake(b.base)))).sort()
    return ['Alle', ...unique]
  }, [builds, activeCountry])

  const models = useMemo(() => {
    if (activeMake === 'Alle') return []
    const pool = builds.filter(b =>
      getMake(b.base) === activeMake &&
      (activeCountry === 'Alle' || b.country === activeCountry)
    )
    const unique = Array.from(new Set(pool.map(b => getModel(b.base)))).sort()
    return ['Alle', ...unique]
  }, [builds, activeMake, activeCountry])

  const styles = useMemo(() => {
    const pool = builds.filter(b =>
      (activeCountry === 'Alle' || b.country === activeCountry) &&
      (activeMake === 'Alle' || getMake(b.base) === activeMake) &&
      (activeModel === 'Alle' || getModel(b.base) === activeModel)
    )
    const unique = Array.from(new Set(pool.map(b => b.style))).sort()
    return ['Alle', ...unique]
  }, [builds, activeCountry, activeMake, activeModel])

  const filtered = useMemo(() => {
    const result = builds.filter(b => {
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
  }, [builds, activeStyle, activeCountry, activeMake, activeModel, activeSort])

  return (
    <>
      {/* FILTER BAR */}
      <div ref={filterRef} className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">

            {/* Dropdowns — outside overflow container so they're not clipped */}
            <div className="flex items-center gap-2 flex-shrink-0">

            {/* Land */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setCountryOpen(v => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
                  activeCountry !== 'Alle'
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                }`}
              >
                {activeCountry === 'Alle' ? 'Land' : activeCountry}
                <ChevronDown size={11} className={`transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
              </button>
              {countryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCountryOpen(false)} />
                  <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px]">
                    {countries.map(c => (
                      <button key={c} onClick={() => { setActiveCountry(c); setActiveMake('Alle'); setActiveModel('Alle'); setActiveStyle('Alle'); setCountryOpen(false); scrollToFilter() }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${activeCountry === c ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Marke */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMakeOpen(v => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
                  activeMake !== 'Alle'
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                }`}
              >
                {activeMake === 'Alle' ? 'Marke' : activeMake}
                <ChevronDown size={11} className={`transition-transform ${makeOpen ? 'rotate-180' : ''}`} />
              </button>
              {makeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMakeOpen(false)} />
                  <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px] max-h-64 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
                    {makes.map(m => (
                      <button key={m} onClick={() => { setActiveMake(m); setActiveModel('Alle'); setActiveStyle('Alle'); setMakeOpen(false); scrollToFilter() }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${activeMake === m ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modell — nur nach Marken-Auswahl */}
            {activeMake !== 'Alle' && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setModelOpen(v => !v)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
                    activeModel !== 'Alle'
                      ? 'bg-[#222222] text-white border-[#222222]'
                      : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                  }`}
                >
                  {activeModel === 'Alle' ? 'Modell' : activeModel}
                  <ChevronDown size={11} className={`transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
                </button>
                {modelOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setModelOpen(false)} />
                    <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[180px] max-h-64 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
                      {models.map(m => (
                        <button key={m} onClick={() => { setActiveModel(m); setModelOpen(false); scrollToFilter() }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${activeModel === m ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            </div>{/* end dropdowns wrapper */}

            {/* Divider */}
            <div className="w-px h-4 bg-[#222222]/10 flex-shrink-0" />

            {/* Umbau-Stil dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setStyleOpen(v => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all ${
                  activeStyle !== 'Alle'
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                }`}
              >
                {activeStyle === 'Alle' ? 'Umbau-Stil' : activeStyle}
                <ChevronDown size={11} className={`transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
              </button>
              {styleOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setStyleOpen(false)} />
                  <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px]">
                    {styles.map(s => (
                      <button key={s} onClick={() => { setActiveStyle(s); setStyleOpen(false); scrollToFilter() }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${activeStyle === s ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reset */}
            {(activeStyle !== 'Alle' || activeCountry !== 'Alle' || activeMake !== 'Alle') && (
              <button
                onClick={() => { setActiveStyle('Alle'); setActiveCountry('Alle'); setActiveMake('Alle'); setActiveModel('Alle') }}
                aria-label="Filter zurücksetzen"
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#222222]/35 hover:text-[#222222] transition-colors rounded-full hover:bg-[#222222]/5"
              >
                <X size={14} />
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Sortieren */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222] transition-all"
              >
                <ArrowUpDown size={11} />
                <span className="hidden sm:inline">{SORT_LABELS[activeSort]}</span>
                <span className="sm:hidden">Sortieren</span>
                <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[170px]">
                    {(['popular', 'newest', 'oldest'] as const).map(key => (
                      <button key={key} onClick={() => { setActiveSort(key); setSortOpen(false); scrollToFilter() }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${activeSort === key ? 'text-[#717171] bg-[#222222]/8' : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'}`}>
                        {SORT_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#222222]/25 text-sm">Keine Bikes für diese Filter gefunden.</p>
              <button
                onClick={() => { setActiveStyle('Alle'); setActiveCountry('Alle'); setActiveMake('Alle'); setActiveModel('Alle') }}
                className="mt-4 text-xs text-[#717171] hover:text-[#06a5a5] transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((build, i) => (
                <Link
                  key={build.slug}
                  href={build.href ?? `/custom-bike/${build.slug}`}
                  className="card-interactive cursor-pointer group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 opacity-0 animate-slide-up-sm"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={build.coverImg}
                      alt={build.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
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
            <div className="mt-10 sm:mt-14 text-center">
              <p className="text-xs text-[#222222]/20 mb-4">{filtered.length} von {builds.length} Bikes</p>
              <button className="border border-[#222222]/12 text-[#222222]/50 hover:text-[#222222] hover:border-[#222222]/25 text-sm font-medium px-8 py-3 rounded-full transition-all hover:-translate-y-0.5">
                Mehr laden
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
