'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Users, X, Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoginModal } from '@/components/ui/LoginModal'

interface Participant {
  id: string
  avatar_url: string | null
  full_name: string | null
  username: string | null
  slug: string | null
  initials: string
}

interface Props {
  eventSlug: string
  eventName: string
  userId: string | null
  sidebar?: boolean
}

export default function EventInterestButton({ eventSlug, eventName, userId, sidebar }: Props) {
  const router = useRouter()
  const [interested, setInterested] = useState(false)
  const [count, setCount] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [posting, setPosting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from('event_interest') as any)
        .select('user_id')
        .eq('event_slug', eventSlug)

      const entries = (data ?? []) as { user_id: string }[]
      setCount(entries.length)
      setInterested(!!userId && entries.some(e => e.user_id === userId))

      // Load participant profiles
      if (entries.length > 0) {
        const ids = entries.map(e => e.user_id)
        const { data: profiles } = await (supabase.from('profiles') as any)
          .select('id, full_name, avatar_url, username, slug')
          .in('id', ids)

        setParticipants((profiles ?? []).map((p: { id: string; full_name: string | null; avatar_url: string | null; username: string | null; slug: string | null }) => ({
          id: p.id,
          avatar_url: p.avatar_url,
          full_name: p.full_name,
          username: p.username,
          slug: p.slug,
          initials: (p.full_name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        })))
      }

      setLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug, userId])

  async function handleToggle() {
    if (!userId) return

    const next = !interested
    setInterested(next)
    setCount(prev => next ? prev + 1 : Math.max(0, prev - 1))

    if (next) {
      await (supabase.from('event_interest') as any)
        .insert({ event_slug: eventSlug, user_id: userId })

      // Add self to participants optimistically
      const { data: prof } = await (supabase.from('profiles') as any)
        .select('id, full_name, avatar_url, username, slug')
        .eq('id', userId)
        .maybeSingle()

      if (prof) {
        setParticipants(prev => prev.some(p => p.id === prof.id) ? prev : [...prev, {
          id: prof.id,
          avatar_url: prof.avatar_url,
          full_name: prof.full_name,
          username: prof.username,
          slug: prof.slug,
          initials: (prof.full_name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        }])
      }

      // Show share modal after joining
      setShowShareModal(true)
    } else {
      setParticipants(prev => prev.filter(p => p.id !== userId))
      await (supabase.from('event_interest') as any)
        .delete()
        .eq('event_slug', eventSlug)
        .eq('user_id', userId)
    }
  }

  if (loading) return null

  return (
    <div className={sidebar ? 'flex flex-col gap-4' : 'mt-10 border-t border-[#222222]/6 pt-8'}>
      {/* Participants card */}
      {count > 0 && (
        <div className={sidebar ? 'bg-white border border-[#222222]/6 rounded-2xl p-5' : 'mb-6'}>
          <p className={`font-semibold flex items-center gap-1.5 ${sidebar ? 'text-xs uppercase tracking-widest text-[#222222]/30 mb-3' : 'text-sm text-[#222222] mb-4'}`}>
            <Users size={14} /> {count} {count === 1 ? 'Teilnehmer' : 'Teilnehmer'}
          </p>
          <div className={sidebar ? 'flex flex-col gap-0.5' : 'grid grid-cols-2 sm:grid-cols-3 gap-3'}>
            {participants.map(p => {
              const href = `/rider/${p.slug ?? p.username ?? p.id}`
              return (
                <Link key={p.id} href={href} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F7F7F7] transition-colors group">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F0F0F0] flex-shrink-0 border border-[#222222]/6">
                    {p.avatar_url ? (
                      <Image src={p.avatar_url} alt={p.full_name ?? ''} width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">{p.initials}</div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate">
                    {p.full_name ?? 'Rider'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Button */}
      <button
        type="button"
        onClick={() => userId ? handleToggle() : setShowLogin(true)}
        className={`inline-flex items-center justify-center gap-2.5 text-sm font-semibold px-6 py-3 rounded-full transition-all ${
          sidebar ? 'w-full' : ''
        } ${
          interested
            ? 'bg-[#06a5a5] text-white hover:bg-[#058f8f]'
            : 'border border-[#222222]/10 text-[#222222] hover:border-[#06a5a5] hover:text-[#06a5a5]'
        }`}
      >
        <Heart size={16} className={interested ? 'fill-white' : ''} />
        {interested ? 'Du nimmst teil!' : 'Ich möchte teilnehmen'}
      </button>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="event_interest"
      />

      {/* Share-to-Community Modal — portal so it escapes any sticky/transformed parent */}
      {showShareModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#222]/40 hover:text-[#222] hover:bg-[#F0F0F0] transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#06a5a5]/10 flex items-center justify-center">
              <Calendar size={22} className="text-[#06a5a5]" />
            </div>

            <div className="text-center">
              <p className="text-base font-bold text-[#222222] mb-1">Du nimmst teil!</p>
              <p className="text-sm text-[#222222]/50">
                Zeige der Community, dass du dabei bist.
              </p>
            </div>

            <div className="w-full px-2 py-3 rounded-xl bg-[#F7F7F7] border border-[#222222]/5">
              <p className="text-xs font-semibold text-[#222222] text-center truncate">{eventName}</p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                disabled={posting}
                onClick={async () => {
                  if (!userId) return
                  setPosting(true)
                  await (supabase.from('community_posts') as any)
                    .insert({
                      user_id: userId,
                      body: `Ich bin dabei! 🏍️`,
                      event_slug: eventSlug,
                      topic: 'events',
                    })
                  setPosting(false)
                  setShowShareModal(false)
                  router.push('/explore')
                }}
                className="w-full py-3 rounded-full bg-[#06a5a5] text-white text-sm font-semibold hover:bg-[#058f8f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {posting ? <Loader2 size={16} className="animate-spin" /> : 'Posten'}
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 rounded-full text-sm font-medium text-[#222222]/40 hover:text-[#222222]/60 transition-colors"
              >
                Nicht jetzt
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
