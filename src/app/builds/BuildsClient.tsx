'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ChevronDown, X } from 'lucide-react'
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
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
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
                      ? 'bg-[#06a5a5] text-white border-[#DDDDDD]'
                      : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Right side — not inside overflow container so dropdown is never clipped */}
            <div className="flex items-center gap-2 flex-shrink-0">

              <div className="w-px h-4 bg-[#222222]/10" />

              {/* Land dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCountryOpen(v => !v)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all hover:-translate-y-0.5 ${
                    activeCountry !== 'Alle'
                      ? 'bg-[#06a5a5] text-white border-[#DDDDDD]'
                      : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                  }`}
                >
                  {activeCountry === 'Alle' ? 'Land' : activeCountry}
                  <ChevronDown size={11} className={`transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                </button>

                {countryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCountryOpen(false)} />
                    <div className="absolute top-full mt-2 right-0 z-50 bg-white border border-[#222222]/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[160px]">
                      {countries.map(c => (
                        <button
                          key={c}
                          onClick={() => { setActiveCountry(c); setCountryOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors border-b border-[#222222]/5 last:border-0 ${
                            activeCountry === c
                              ? 'text-[#717171] bg-[#222222]/8'
                              : 'text-[#222222]/50 hover:text-[#222222] hover:bg-[#222222]/5'
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
                  aria-label="Filter zurücksetzen"
                  className="w-8 h-8 flex items-center justify-center text-[#222222]/35 hover:text-[#222222] transition-colors rounded-full hover:bg-[#222222]/5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#222222]/25 text-sm">Keine Builds für diese Filter gefunden.</p>
              <button
                onClick={() => { setActiveStyle('Alle'); setActiveCountry('Alle') }}
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
                  href={`/custom-bike/${build.slug}`}
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 opacity-0 animate-slide-up-sm"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
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
                    {build.verified && (
                      <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#222222]/90 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                        <BadgeCheck size={8} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1">{build.title}</h3>
                      <span className="text-xs sm:text-sm font-bold text-[#717171] flex-shrink-0">{build.price}</span>
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
              <p className="text-xs text-[#222222]/20 mb-4">{filtered.length} von {builds.length} Builds</p>
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
