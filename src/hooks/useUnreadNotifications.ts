'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadNotifications(userId: string | null) {
  const [count, setCount] = useState(0)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!userId) { setCount(0); return }
    const { count: c } = await (supabase.from('notifications') as any)
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null)
    setCount(c ?? 0)
  }, [userId, supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!userId) { setCount(0); return }

    fetch()

    const channel = supabase
      .channel('notifications-badge')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      }, () => setCount(c => c + 1))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      }, () => fetch())
      .subscribe()

    const handler = () => fetch()
    window.addEventListener('notifications-read', handler)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('notifications-read', handler)
    }
  }, [userId, supabase, fetch])

  return count
}
