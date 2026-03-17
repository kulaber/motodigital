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
  const [loading,   setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)

        if (currentUser) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(supabase.from('profiles') as any)
            .select('role, slug, avatar_url')
            .eq('id', currentUser.id)
            .single()
            .then(({ data }: { data: { role: UserRole; slug: string | null; avatar_url: string | null } | null }) => {
              setRole(data?.role ?? null)
              setSlug(data?.slug ?? null)
              setAvatarUrl(data?.avatar_url ?? null)
            })
        } else {
          setRole(null)
          setSlug(null)
          setAvatarUrl(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, role, slug, avatarUrl, loading }
}
