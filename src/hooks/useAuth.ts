'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'rider' | 'custom-werkstatt' | 'superadmin' | null

export function useAuth() {
  const [user,      setUser]      = useState<User | null>(null)
  const [role,      setRole]      = useState<UserRole>(null)
  const [slug,      setSlug]      = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [fullName,  setFullName]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile(userId: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('role, slug, username, avatar_url, full_name')
        .eq('id', userId)
        .maybeSingle() as { data: { role: UserRole; slug: string | null; username: string | null; avatar_url: string | null; full_name: string | null } | null }
      setRole(data?.role ?? null)
      setSlug(data?.slug ?? data?.username ?? null)
      setAvatarUrl(data?.avatar_url ?? null)
      setFullName(data?.full_name ?? null)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)

        if (currentUser) {
          fetchProfile(currentUser.id)
        } else {
          setRole(null)
          setSlug(null)
          setAvatarUrl(null)
          setFullName(null)
        }
      }
    )

    function handleProfileUpdated(e: Event) {
      const detail = (e as CustomEvent<{ avatarUrl?: string; fullName?: string }>).detail
      if (detail.avatarUrl !== undefined) setAvatarUrl(detail.avatarUrl || null)
      if (detail.fullName  !== undefined) setFullName(detail.fullName  || null)
    }
    window.addEventListener('profile-updated', handleProfileUpdated)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('profile-updated', handleProfileUpdated)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { user, role, slug, avatarUrl, fullName, loading }
}
