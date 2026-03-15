'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'rider' | 'builder' | 'superadmin' | null

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Use onAuthStateChange as primary source — fires immediately with INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false) // unblock UI immediately

        if (currentUser) {
          // fetch role non-blocking in background
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(supabase.from('profiles') as any)
            .select('role')
            .eq('id', currentUser.id)
            .single()
            .then(({ data }: { data: { role: UserRole } | null }) => {
              setRole(data?.role ?? null)
            })
        } else {
          setRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, role, loading }
}
