'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId) return

    // Load existing messages
    supabase
      .from('messages')
      .select('id, conversation_id, sender_id, body, read_at, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? [])
        setLoading(false)
      })

    // Subscribe to new messages via Realtime (dedupliziert gegen optimistische Updates)
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const incoming = payload.new as Message
            if (prev.some(m => m.id === incoming.id)) return prev
            return [...prev, incoming]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage(body: string, senderId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('messages') as any)
      .insert({ conversation_id: conversationId, sender_id: senderId, body })
      .select()
      .maybeSingle()

    // Optimistisch sofort anzeigen — Realtime dedupliziert via ID-Check
    if (!error && data) {
      setMessages(prev => [...prev, data as Message])
    }

    return { error }
  }

  return { messages, loading, sendMessage }
}
