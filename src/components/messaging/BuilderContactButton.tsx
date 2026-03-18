'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { LogIn, MessageCircle } from 'lucide-react'

interface Props {
  builderId: string
  builderFirstName: string
  bikeId?: string // erste Bike-ID des Builders für die Konversation
}

export default function BuilderContactButton({ builderId, builderFirstName, bikeId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Nicht eingeloggt → Login-CTA zeigen
  if (!authLoading && !user) {
    return (
      <a
        href="/auth/login"
        className="flex items-center justify-center gap-2 w-full bg-[#06a5a5] text-white text-sm font-semibold py-3 rounded-xl text-center hover:bg-[#058f8f] transition-all"
      >
        <LogIn size={14} />
        Anmelden um zu schreiben
      </a>
    )
  }

  // Eigenes Profil → kein Button
  if (!authLoading && user?.id === builderId) return null

  async function handleContact() {
    if (!user || !bikeId) return
    setLoading(true)
    setError(null)

    // Prüfen ob Konversation bereits existiert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('conversations') as any)
      .select('id')
      .eq('seller_id', builderId)
      .eq('buyer_id', user.id)
      .limit(1)
      .maybeSingle()

    if (existing?.id) {
      router.push(`/dashboard/messages?conv=${existing.id}`)
      setLoading(false)
      return
    }

    // Neue Konversation anlegen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error: insertError } = await (supabase.from('conversations') as any)
      .insert({ seller_id: builderId, buyer_id: user.id, bike_id: bikeId })
      .select('id')
      .maybeSingle()

    if (insertError) {
      setError('Fehler beim Öffnen der Konversation.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/messages${created?.id ? `?conv=${created.id}` : ''}`)
    setLoading(false)
  }

  if (!bikeId) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 w-full bg-[#222222]/8 text-[#222222]/30 text-sm font-semibold py-3 rounded-xl cursor-not-allowed"
      >
        <MessageCircle size={14} />
        Noch keine Bikes gelistet
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleContact}
        disabled={loading || authLoading}
        className="flex items-center justify-center gap-2 w-full bg-[#06a5a5] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#058f8f] disabled:opacity-50 transition-all"
      >
        <MessageCircle size={14} />
        {loading ? 'Wird geöffnet…' : `${builderFirstName} kontaktieren`}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}
