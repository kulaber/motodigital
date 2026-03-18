'use client'

import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, MapPin, SlidersHorizontal, ChevronDown, MessageCircle, LogIn } from 'lucide-react'
import { type Rider } from '@/lib/data/riders'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const COUNTRIES = ['Alle', 'Deutschland', 'Österreich', 'Schweiz']

function MessageButton({ riderId, riderName: _riderName, bikeId }: { riderId: string; riderName: string; bikeId?: string }) {
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
      .maybeSingle()

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
  const [activeCountry, setActiveCountry] = useState('Alle')
  const [countryOpen,   setCountryOpen]   = useState(false)
  const [onlyVerified,  setOnlyVerified]  = useState(false)
  const [onlyOnline,    setOnlyOnline]    = useState(false)
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
    return Date.now() - new Date(ts).getTime() < 3 * 60_000 // eslint-disable-line react-hooks/purity
  }

  const filtered = useMemo(() => riders.filter(r => {
    const countryOk  = activeCountry === 'Alle' || r.country === activeCountry
    const verifiedOk = !onlyVerified || r.verified
    const onlineOk   = !onlyOnline || isOnline(r)
    return countryOk && verifiedOk && onlineOk
  }), [riders, activeCountry, onlyVerified, onlyOnline, lastSeenMap]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#222222]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
          {/* Land dropdown */}
          <div className="relative">
            <button
              onClick={() => setCountryOpen(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCountry !== 'Alle'
                  ? 'bg-[#222222] text-white'
                  : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
              }`}
            >
              <SlidersHorizontal size={11} />
              {activeCountry === 'Alle' ? 'Land' : activeCountry}
              <ChevronDown size={11} className={`transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
            </button>
            {countryOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCountryOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#DDDDDD] rounded-2xl shadow-lg overflow-hidden min-w-[160px] py-1">
                  {COUNTRIES.map(c => (
                    <button
                      key={c}
                      onClick={() => { setActiveCountry(c); setCountryOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between gap-3 ${
                        activeCountry === c
                          ? 'text-[#222222] font-semibold bg-[#F7F7F7]'
                          : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]'
                      }`}
                    >
                      {c}
                      {activeCountry === c && <span className="w-1.5 h-1.5 rounded-full bg-[#222222] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Online toggle */}
          <button
            onClick={() => setOnlyOnline(v => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              onlyOnline
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-[#717171] border border-[#DDDDDD] hover:text-[#222222] hover:border-[#222222]/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${onlyOnline ? 'bg-white animate-pulse' : 'bg-[#717171]'}`} />
            Online
          </button>

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
              onClick={() => { setActiveCountry('Alle'); setOnlyVerified(false); setOnlyOnline(false) }}
              className="text-xs text-[#06a5a5] hover:underline"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(r => {
              const online = isOnline(r)
              const coverBike = r.bikes?.[0]
              return (
                <div
                  key={r.slug}
                  className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between"
                >
                  {/* Top block */}
                  <div>
                    {/* Avatar + Name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative flex-shrink-0">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#EBEBEB]">
                          {r.avatar ? (
                            <Image src={r.avatar} alt={r.name} fill sizes="44px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#06a5a5] flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{r.initials}</span>
                            </div>
                          )}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-[#CCCCCC]'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#222222] truncate">{r.name}</p>
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
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
