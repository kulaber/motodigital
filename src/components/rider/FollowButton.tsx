'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { LoginModal } from '@/components/ui/LoginModal'

interface Props {
  riderId: string
}

export default function FollowButton({ riderId }: Props) {
  const { user, loading: authLoading } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      if (!user) return
      const { data } = await (supabase.from('followers') as any)
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', riderId)
        .maybeSingle()
      setIsFollowing(!!data)
    }
    check()
  }, [user, riderId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Don't show on own profile
  if (!authLoading && user?.id === riderId) return null

  async function handleClick() {
    if (!user) {
      setShowLogin(true)
      return
    }

    setLoading(true)
    if (isFollowing) {
      await (supabase.from('followers') as any)
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', riderId)
      setIsFollowing(false)
    } else {
      await (supabase.from('followers') as any)
        .insert({ follower_id: user.id, following_id: riderId })
      setIsFollowing(true)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={authLoading || loading}
        className={`flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-5 rounded-full transition-all disabled:opacity-50 ${
          isFollowing
            ? 'bg-[#F0F0F0] text-[#717171] hover:bg-[#E5E5E5]'
            : 'bg-[#06a5a5] text-white hover:bg-[#058f8f]'
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isFollowing ? (
          <UserCheck size={14} />
        ) : (
          <UserPlus size={14} />
        )}
        {isFollowing ? 'Folgst du' : 'Folgen'}
      </button>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="follow_rider"
      />
    </>
  )
}
