'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'rider' | 'custom-werkstatt' | 'superadmin' | null

interface AuthContextValue {
  user: User | null
  role: UserRole
  slug: string | null
  avatarUrl: string | null
  fullName: string | null
  loading: boolean
  unreadCount: number
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  slug: null,
  avatarUrl: null,
  fullName: null,
  loading: true,
  unreadCount: 0,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const fetchUnreadRef = useRef<() => void>(() => {})

  // Auth state + profile fetch (single listener for entire app)
  useEffect(() => {
    async function fetchProfile(userId: string) {
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
          setUnreadCount(0)
        }
      }
    )

    function handleProfileUpdated(e: Event) {
      const detail = (e as CustomEvent<{ avatarUrl?: string; fullName?: string }>).detail
      if (detail.avatarUrl !== undefined) setAvatarUrl(detail.avatarUrl || null)
      if (detail.fullName !== undefined) setFullName(detail.fullName || null)
    }
    window.addEventListener('profile-updated', handleProfileUpdated)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('profile-updated', handleProfileUpdated)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Unread message count + realtime (single subscription for entire app)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setUnreadCount(0); return }
    const uid = user.id

    async function fetchUnread() {
      const { data: convs } = await (supabase.from('conversations') as any)
        .select('id')
        .or(`seller_id.eq.${uid},buyer_id.eq.${uid}`)
      if (!convs?.length) { setUnreadCount(0); return }
      const ids = convs.map((c: { id: string }) => c.id)
      const { count } = await (supabase.from('messages') as any)
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', ids)
        .neq('sender_id', uid)
        .is('read_at', null)
      setUnreadCount(count ?? 0)
    }

    fetchUnreadRef.current = fetchUnread
    fetchUnread()

    const stableListener = () => fetchUnreadRef.current()
    window.addEventListener('messages-read', stableListener)

    const channel = supabase
      .channel('unread-badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, stableListener)
      .subscribe()

    return () => {
      window.removeEventListener('messages-read', stableListener)
      supabase.removeChannel(channel)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, role, slug, avatarUrl, fullName, loading, unreadCount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
