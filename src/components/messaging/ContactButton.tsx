'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/ui/LoginModal'

interface Props {
  bikeId: string
  sellerId: string
}

export default function ContactButton({ bikeId, sellerId }: Props) {
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  async function handleContact() {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (user.id === sellerId) return // Can't message yourself

    setLoading(true)

    // Find existing conversation (check both directions)
    let { data: conv } = await (supabase.from('conversations') as any)
      .select('id')
      .or(`and(seller_id.eq.${sellerId},buyer_id.eq.${user.id}),and(seller_id.eq.${user.id},buyer_id.eq.${sellerId})`)
      .limit(1)
      .maybeSingle()

    if (!conv?.id) {
      const { data: created } = await (supabase.from('conversations') as any)
        .insert({ seller_id: sellerId, buyer_id: user.id, bike_id: bikeId })
        .select('id')
        .maybeSingle()
      conv = created
    }

    if (conv?.id) {
      router.push(`/dashboard/messages?conv=${conv.id}`)
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={handleContact}
        disabled={loading || user?.id === sellerId}
        className="w-full py-3 bg-[#06a5a5] text-[#222222] text-sm font-semibold rounded-full hover:bg-[#06a5a5]-light disabled:opacity-50 transition-all"
      >
        {loading ? 'Wird geöffnet...' : 'Verkäufer kontaktieren'}
      </button>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="message"
      />
    </>
  )
}
