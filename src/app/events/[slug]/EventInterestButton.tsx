'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Users } from 'lucide-react'
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

      // Load participant profiles
      if (entries.length > 0) {
        const ids = entries.map(e => e.user_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('event_interest') as any)
        .insert({ event_slug: eventSlug, user_id: userId })

      // Add self to participants optimistically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } else {
      setParticipants(prev => prev.filter(p => p.id !== userId))
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
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#222222] flex items-center gap-1.5 mb-4">
            <Users size={14} /> {count} {count === 1 ? 'Teilnehmer' : 'Teilnehmer'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {participants.map(p => {
              const href = `/rider/${p.slug ?? p.username ?? p.id}`
              return (
                <Link key={p.id} href={href} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F7F7F7] transition-colors group">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F0F0F0] flex-shrink-0 border border-[#222222]/6">
                    {p.avatar_url ? (
                      <Image src={p.avatar_url} alt={p.full_name ?? ''} width={36} height={36} className="object-cover w-full h-full" />
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
