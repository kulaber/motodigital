'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, ChevronDown } from 'lucide-react'
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
      <div className="sticky top-16 z-30 bg-[#F5F2EB]/95 backdrop-blur-md border-b border-[#1A1714]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2">

            {/* Style chips — scrollable */}
            <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStyle(s)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
                    activeStyle === s
                      ? 'bg-[#2AABAB] text-[#141414] border-[#2AABAB]'
                      : 'border-[#1A1714]/10 text-[#1A1714]/45 hover:border-[#2AABAB]/40 hover:text-[#1A1714]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Right side — not inside overflow container so dropdown is never clipped */}
            <div className="flex items-center gap-2 flex-shrink-0">

              <div className="w-px h-4 bg-[#1A1714]/10" />

              {/* Land dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCountryOpen(v => !v)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all hover:-translate-y-0.5 ${
                    activeCountry !== 'Alle'
                      ? 'bg-[#2AABAB] text-[#141414] border-[#2AABAB]'
                      : 'border-[#1A1714]/10 text-[#1A1714]/45 hover:border-[#2AABAB]/40 hover:text-[#1A1714]'
                  }`}
                >
                  {activeCountry === 'Alle' ? 'Land' : activeCountry}
                  <ChevronDown size={11} className={`transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                </button>

                {countryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCountryOpen(false)} />
                    <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-[#1A1714]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px]">
                      {countries.map(c => (
                        <button
                          key={c}
                          onClick={() => { setActiveCountry(c); setCountryOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#1A1714]/5 last:border-0 ${
                            activeCountry === c
                              ? 'text-[#2AABAB] bg-[#2AABAB]/8'
                              : 'text-[#1A1714]/50 hover:text-[#1A1714] hover:bg-[#1A1714]/5'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {(activeStyle !== 'Alle' || activeCountry !== 'Alle') && (
                <button
                  onClick={() => { setActiveStyle('Alle'); setActiveCountry('Alle') }}
                  className="text-xs text-[#1A1714]/35 hover:text-[#1A1714] transition-colors px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="py-8 sm:py-10 bg-[#F5F2EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#1A1714]/25 text-sm">Keine Builds für diese Filter gefunden.</p>
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
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#1A1714]/6 hover:border-[#1A1714]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 opacity-0 animate-slide-up-sm"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={build.coverImg}
                      alt={build.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F5F2EB]/85 via-[#F5F2EB]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[#1A1714] text-xs font-semibold">Ansehen →</span>
                    </div>
                    <span className="absolute top-2 left-2 bg-[#F5F2EB]/80 backdrop-blur-sm border border-[#1A1714]/15 text-[#1A1714] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
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
                      <h3 className="text-xs sm:text-sm font-semibold text-[#1A1714] leading-snug line-clamp-1">{build.title}</h3>
                      <span className="text-xs sm:text-sm font-bold text-[#2AABAB] flex-shrink-0">{build.price}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-[#1A1714]/35 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                    <p className="text-[10px] text-[#1A1714]/25 mt-0.5 truncate">{build.builder.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-10 sm:mt-14 text-center">
              <p className="text-xs text-[#1A1714]/20 mb-4">{filtered.length} von {builds.length} Builds</p>
              <button className="border border-[#1A1714]/12 text-[#1A1714]/50 hover:text-[#1A1714] hover:border-[#1A1714]/25 text-sm font-medium px-8 py-3 rounded-full transition-all hover:-translate-y-0.5">
                Mehr laden
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
