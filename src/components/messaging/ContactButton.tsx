'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  bikeId: string
  sellerId: string
}

export default function ContactButton({ bikeId, sellerId }: Props) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  async function handleContact() {
    if (!user) {
      router.push(`/auth/login?redirectTo=/bikes/${bikeId}`)
      return
    }
    if (user.id === sellerId) return // Can't message yourself

    setLoading(true)

    // Upsert conversation (unique constraint: bike_id + buyer_id)
    const { data, error } = await supabase
      .from('conversations')
      .upsert(
        { bike_id: bikeId, buyer_id: user.id, seller_id: sellerId },
        { onConflict: 'bike_id,buyer_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (!error && data) {
      router.push(`/dashboard?conversation=${data.id}`)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading || user?.id === sellerId}
      className="w-full py-3 bg-teal text-bg text-sm font-semibold rounded-full hover:bg-teal-light disabled:opacity-50 transition-all"
    >
      {loading ? 'Wird geöffnet...' : 'Verkäufer kontaktieren'}
    </button>
  )
}
