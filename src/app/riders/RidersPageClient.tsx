'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, MapPin, SlidersHorizontal, ChevronDown, MessageCircle, LogIn } from 'lucide-react'
import { type Rider } from '@/lib/data/riders'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const STYLES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

function MessageButton({ riderId, riderName, bikeId }: { riderId: string; riderName: string; bikeId?: string }) {
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  if (!authLoading && !user) {
    return (
      <a href="/auth/login" className="flex items-center gap-1.5 text-xs font-semibold text-[#222222]/60 bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#EBEBEB] px-3.5 py-2 rounded-full transition-all">
        <LogIn size={12} /> Anmelden
      </a>
    )
  }

  if (!authLoading && user?.id === riderId) return null

  async function handleMessage() {
    if (!user || !bikeId) return
    setLoading(true)

    // Check existing conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('conversations') as any)
      .select('id')
      .eq('seller_id', riderId)
      .eq('buyer_id', user.id)
      .limit(1)
      .maybeSingle()

    if (existing?.id) {
      router.push(`/dashboard/messages?conv=${existing.id}`)
      setLoading(false)
      return
    }

    // Create new conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase.from('conversations') as any)
      .insert({ seller_id: riderId, buyer_id: user.id, bike_id: bikeId })
      .select('id')
      .single()

    router.push(`/dashboard/messages${created?.id ? `?conv=${created.id}` : ''}`)
    setLoading(false)
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading || authLoading}
      className="flex items-center gap-1.5 text-xs font-semibold text-[#222222]/60 bg-[#F7F7F7] hover:bg-[#EBEBEB] border border-[#EBEBEB] disabled:opacity-40 px-3.5 py-2 rounded-full transition-all"
    >
      <MessageCircle size={12} />
      {loading ? 'Öffnet…' : 'Nachricht'}
    </button>
  )
}

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

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

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
              const coverBike = r.bikes?.[0]
              return (
                <div
                  key={r.slug}
                  className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="flex min-h-[140px]">

                    {/* LEFT: rider info */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">

                      {/* Top block */}
                      <div>
                        {/* Avatar + Name */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-[#EBEBEB]">
                              {r.avatar ? (
                                <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#06a5a5] flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">{r.initials}</span>
                                </div>
                              )}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-[#CCCCCC]'}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-sm font-bold text-[#222222] truncate">{r.name}</p>
                            </div>
                            {r.city && (
                              <p className="text-xs text-[#717171] flex items-center gap-1">
                                <MapPin size={9} className="flex-shrink-0" />
                                {r.city}
                              </p>
                            )}
                          </div>

                          <span className={`flex-shrink-0 text-[9px] font-semibold px-2 py-1 rounded-full leading-none ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-[#F7F7F7] text-[#AAAAAA]'}`}>
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        {/* Bio */}
                        {r.bio && (
                          <p className="text-xs text-[#717171] leading-relaxed line-clamp-2 mb-3">
                            {r.bio}
                          </p>
                        )}

                        {/* Style tags */}
                        {r.styles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {r.styles.slice(0, 3).map(s => (
                              <span key={s} className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom: CTA */}
                      <div className="flex items-center gap-3">
                        {r.id && (
                          <MessageButton
                            riderId={r.id}
                            riderName={r.name.split(' ')[0]}
                            bikeId={coverBike?.id}
                          />
                        )}
                      </div>
                    </div>

                    {/* RIGHT: bike photo (fills card height) */}
                    <div className="w-36 sm:w-48 flex-shrink-0 relative overflow-hidden bg-[#F7F7F7] border-l border-[#EBEBEB]">
                      {coverBike?.coverUrl ? (
                        <>
                          <img
                            src={coverBike.coverUrl}
                            alt={coverBike.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 py-2.5">
                            <p className="text-[11px] font-semibold text-white leading-snug line-clamp-1">{coverBike.title}</p>
                            <p className="text-[10px] text-white/65 mt-0.5">{coverBike.make} · {coverBike.year}</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img src="/logo.svg" alt="MotoDigital" className="w-20 opacity-10" />
                        </div>
                      )}
                    </div>
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
