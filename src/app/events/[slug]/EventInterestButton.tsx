'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoginModal } from '@/components/ui/LoginModal'

interface Participant {
  avatar_url: string | null
  initials: string
}

interface Props {
  eventSlug: string
  userId: string | null
}

export default function EventInterestButton({ eventSlug, userId }: Props) {
  const [interested, setInterested] = useState(false)
  const [count, setCount] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('event_interest') as any)
        .select('user_id')
        .eq('event_slug', eventSlug)

      const entries = (data ?? []) as { user_id: string }[]
      setCount(entries.length)
      setInterested(!!userId && entries.some(e => e.user_id === userId))

      // Load participant avatars (max 8)
      if (entries.length > 0) {
        const ids = entries.slice(0, 8).map(e => e.user_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profiles } = await (supabase.from('profiles') as any)
          .select('id, full_name, avatar_url')
          .in('id', ids)

        setParticipants((profiles ?? []).map((p: { full_name: string | null; avatar_url: string | null }) => ({
          avatar_url: p.avatar_url,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('event_interest') as any)
        .insert({ event_slug: eventSlug, user_id: userId })

      // Add self to participants optimistically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prof } = await (supabase.from('profiles') as any)
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle()

      if (prof) {
        setParticipants(prev => [...prev, {
          avatar_url: prof.avatar_url,
          initials: (prof.full_name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        }])
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('event_interest') as any)
        .delete()
        .eq('event_slug', eventSlug)
        .eq('user_id', userId)
    }
  }

  if (loading) return null

  return (
    <div className="mt-10 border-t border-[#222222]/6 pt-8">
      {/* Participants */}
      {count > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="flex -space-x-2">
            {participants.slice(0, 6).map((p, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-[#F0F0F0] flex-shrink-0">
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt="" width={32} height={32} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">{p.initials}</div>
                )}
              </div>
            ))}
          </div>
          <span className="text-sm text-[#717171] flex items-center gap-1.5">
            <Users size={14} /> {count} {count === 1 ? 'Teilnehmer' : 'Teilnehmer'}
          </span>
        </div>
      )}

      {/* Button */}
      <button
        type="button"
        onClick={() => userId ? handleToggle() : setShowLogin(true)}
        className={`inline-flex items-center gap-2.5 text-sm font-semibold px-6 py-3 rounded-full transition-all ${
          interested
            ? 'bg-[#06a5a5] text-white hover:bg-[#058f8f]'
            : 'border border-[#222222]/10 text-[#222222] hover:border-[#06a5a5] hover:text-[#06a5a5]'
        }`}
      >
        <Heart size={16} className={interested ? 'fill-white' : ''} />
        {interested ? 'Du nimmst teil!' : 'Ich habe Interesse und möchte teilnehmen'}
      </button>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="event_interest"
      />
    </div>
  )
}
