'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { BadgeCheck, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { type Rider } from '@/lib/data/riders'
import { createClient } from '@/lib/supabase/client'

const STYLES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

export default function RidersPageClient({ riders }: { riders: Rider[] }) {
  const [activeStyle,  setActiveStyle]  = useState('Alle')
  const [styleOpen,    setStyleOpen]    = useState(false)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [lastSeenMap,  setLastSeenMap]  = useState<Map<string, string>>(() => {
    const m = new Map<string, string>()
    riders.forEach(r => { if (r.id && r.lastSeenAt) m.set(r.id, r.lastSeenAt) })
    return m
  })
  const [, setTick] = useState(0)
  const supabase = createClient()

  // Re-evaluate online status every 30s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  // Realtime: watch last_seen_at updates
  useEffect(() => {
    const channel = supabase
      .channel('rider-last-seen')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.rider',
      }, (payload) => {
        const { id, last_seen_at } = payload.new as { id: string; last_seen_at: string | null }
        if (id && last_seen_at) {
          setLastSeenMap(prev => new Map(prev).set(id, last_seen_at))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function isOnline(r: Rider): boolean {
    if (!r.id) return false
    const ts = lastSeenMap.get(r.id)
    if (!ts) return false
    return Date.now() - new Date(ts).getTime() < 3 * 60_000
  }

  const filtered = useMemo(() => riders.filter(r => {
    const styleOk    = activeStyle === 'Alle' ||
      r.styles.some(s => s.toLowerCase() === activeStyle.toLowerCase()) ||
      r.style.toLowerCase().includes(activeStyle.toLowerCase())
    const verifiedOk = !onlyVerified || r.verified
    return styleOk && verifiedOk
  }), [riders, activeStyle, onlyVerified])

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">

          {/* Stil dropdown */}
          <div className="relative">
            <button
              onClick={() => setStyleOpen(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeStyle !== 'Alle'
                  ? 'bg-[#222222] text-white'
                  : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
              }`}
            >
              <SlidersHorizontal size={11} />
              {activeStyle === 'Alle' ? 'Stil' : activeStyle}
              <ChevronDown size={11} className={`transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
            </button>
            {styleOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStyleOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#DDDDDD] rounded-2xl shadow-lg overflow-hidden min-w-[160px] py-1">
                  {STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => { setActiveStyle(s); setStyleOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between gap-3 ${
                        activeStyle === s
                          ? 'text-[#222222] font-semibold bg-[#F7F7F7]'
                          : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]'
                      }`}
                    >
                      {s}
                      {activeStyle === s && <span className="w-1.5 h-1.5 rounded-full bg-[#222222] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Verifiziert */}
          <button
            onClick={() => setOnlyVerified(v => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              onlyVerified
                ? 'bg-[#222222] text-white'
                : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
            }`}
          >
            <BadgeCheck size={11} /> Verifiziert
          </button>

          <span className="ml-auto text-xs text-[#717171]">{filtered.length} Rider</span>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#717171] text-sm mb-3">Keine Rider für diesen Filter.</p>
            <button
              onClick={() => { setActiveStyle('Alle'); setOnlyVerified(false) }}
              className="text-xs text-[#06a5a5] hover:underline"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(r => {
              const online = isOnline(r)
              return (
                <div
                  key={r.slug}
                  className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-sm transition-all p-4 sm:p-5"
                >
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#EBEBEB]">
                        {r.avatar ? (
                          <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#06a5a5] flex items-center justify-center">
                            <img src="/pin-logo.svg" alt="" className="w-7 h-7 opacity-70" />
                          </div>
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-[#CCCCCC]'}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-[#222222]">{r.name}</p>
                        {r.verified && <BadgeCheck size={13} className="text-[#06a5a5] flex-shrink-0" />}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-[#F7F7F7] text-[#AAAAAA]'}`}>
                          {online ? 'Online' : 'Offline'}
                        </span>
                        {r.since && (
                          <span className="text-[9px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-1.5 py-0.5 rounded-full">
                            seit {r.since}
                          </span>
                        )}
                      </div>

                      {r.city && (
                        <p className="text-xs text-[#717171] flex items-center gap-1 mb-1.5">
                          <MapPin size={9} className="flex-shrink-0" />
                          {r.city}
                        </p>
                      )}

                      {r.bio && (
                        <p className="text-xs text-[#717171] leading-relaxed line-clamp-2 mb-3">
                          {r.bio}
                        </p>
                      )}

                      {/* Bikes */}
                      {r.bikes && r.bikes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {r.bikes.map(b => (
                            <div key={b.id} className="flex items-center gap-1.5 bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-2.5 py-1.5">
                              {b.coverUrl && (
                                <img src={b.coverUrl} alt={b.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-[10px] font-semibold text-[#222222] leading-tight">{b.title}</p>
                                <p className="text-[9px] text-[#717171]">{b.make} · {b.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Style tags */}
                      {r.styles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.styles.slice(0, 3).map(s => (
                            <span key={s} className="text-[9px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-1.5 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Profile link */}
                    {r.slug && (
                      <Link
                        href={`/riders/${r.slug}`}
                        className="flex-shrink-0 text-xs font-semibold text-[#06a5a5] hover:text-[#058f8f] transition-colors whitespace-nowrap"
                      >
                        Profil →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
