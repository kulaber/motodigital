'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { Build } from '@/lib/data/builds'

const STYLES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

interface Props {
  builds: Build[]
}

export default function BuildsClient({ builds }: Props) {
  const [activeStyle, setActiveStyle] = useState('Alle')
  const [activeCountry, setActiveCountry] = useState('Alle')
  const [countryOpen, setCountryOpen] = useState(false)

  // Derive available countries from data
  const countries = useMemo(() => {
    const unique = Array.from(new Set(builds.map(b => b.country))).sort()
    return ['Alle', ...unique]
  }, [builds])

  const filtered = useMemo(() => builds.filter(b => {
    const styleMatch   = activeStyle === 'Alle' || b.style === activeStyle
    const countryMatch = activeCountry === 'Alle' || b.country === activeCountry
    return styleMatch && countryMatch
  }), [builds, activeStyle, activeCountry])

  return (
    <>
      {/* FILTER BAR */}
      <div className="sticky top-16 z-30 bg-[#141414]/95 backdrop-blur-md border-b border-[#F0EDE4]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

            {/* Style chips */}
            {STYLES.map(s => (
              <button
                key={s}
                onClick={() => setActiveStyle(s)}
                className={`flex-shrink-0 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
                  activeStyle === s
                    ? 'bg-[#2AABAB] text-[#141414] border-[#2AABAB]'
                    : 'border-[#F0EDE4]/10 text-[#F0EDE4]/45 hover:border-[#2AABAB]/40 hover:text-[#F0EDE4]'
                }`}
              >
                {s}
              </button>
            ))}

            {/* Divider */}
            <div className="flex-shrink-0 w-px h-4 bg-[#F0EDE4]/10 mx-1" />

            {/* Land dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setCountryOpen(v => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all hover:-translate-y-0.5 ${
                  activeCountry !== 'Alle'
                    ? 'bg-[#2AABAB] text-[#141414] border-[#2AABAB]'
                    : 'border-[#F0EDE4]/10 text-[#F0EDE4]/45 hover:border-[#2AABAB]/40 hover:text-[#F0EDE4]'
                }`}
              >
                {activeCountry === 'Alle' ? 'Land' : activeCountry}
                <ChevronDown size={11} className={`transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
              </button>

              {countryOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setCountryOpen(false)} />
                  <div className="absolute top-full mt-2 left-0 z-50 bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[150px]">
                    {countries.map(c => (
                      <button
                        key={c}
                        onClick={() => { setActiveCountry(c); setCountryOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#F0EDE4]/5 last:border-0 ${
                          activeCountry === c
                            ? 'text-[#2AABAB] bg-[#2AABAB]/8'
                            : 'text-[#F0EDE4]/50 hover:text-[#F0EDE4] hover:bg-[#F0EDE4]/5'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Active filter count */}
            {(activeStyle !== 'Alle' || activeCountry !== 'Alle') && (
              <button
                onClick={() => { setActiveStyle('Alle'); setActiveCountry('Alle') }}
                className="flex-shrink-0 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors px-2"
              >
                Zurücksetzen
              </button>
            )}

            <button className="flex-shrink-0 ml-auto flex items-center gap-1.5 text-xs text-[#F0EDE4]/40 hover:text-[#F0EDE4] transition-colors border border-[#F0EDE4]/10 hover:border-[#F0EDE4]/25 px-3 py-2 rounded-full">
              <SlidersHorizontal size={11} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="py-8 sm:py-10 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#F0EDE4]/25 text-sm">Keine Builds für diese Filter gefunden.</p>
              <button
                onClick={() => { setActiveStyle('Alle'); setActiveCountry('Alle') }}
                className="mt-4 text-xs text-[#2AABAB] hover:text-[#3DBFBF] transition-colors"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((build, i) => (
                <Link
                  key={build.slug}
                  href={`/builds/${build.slug}`}
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 opacity-0 animate-slide-up-sm"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={build.coverImg}
                      alt={build.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/85 via-[#141414]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[#F0EDE4] text-xs font-semibold">Ansehen →</span>
                    </div>
                    <span className="absolute top-2 left-2 bg-[#141414]/80 backdrop-blur-sm border border-[#F0EDE4]/15 text-[#F0EDE4] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                    {build.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#2AABAB]/90 text-[#141414] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                        <BadgeCheck size={8} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#F0EDE4] leading-snug line-clamp-1">{build.title}</h3>
                      <span className="text-xs sm:text-sm font-bold text-[#2AABAB] flex-shrink-0">{build.price}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#F0EDE4]/35 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                    <p className="text-[10px] text-[#F0EDE4]/25 mt-0.5 truncate">{build.builder.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-10 sm:mt-14 text-center">
              <p className="text-xs text-[#F0EDE4]/20 mb-4">{filtered.length} von {builds.length} Builds</p>
              <button className="border border-[#F0EDE4]/12 text-[#F0EDE4]/50 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 text-sm font-medium px-8 py-3 rounded-full transition-all hover:-translate-y-0.5">
                Mehr laden
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
