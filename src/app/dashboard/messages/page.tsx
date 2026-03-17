import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import MessagesClient from './MessagesClient'

export const metadata: Metadata = { title: 'Nachrichten — Dashboard' }

export type Conversation = {
  id: string
  last_message_at: string | null
  unread_count: number
  bike: { id: string; title: string } | null
  other: { id: string; full_name: string | null; username: string | null; avatar_url: string | null } | null
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: rows }, { data: unreadRows }] = await Promise.all([
    (supabase.from('conversations') as any)
      .select(`
        id,
        last_message_at,
        seller_id,
        buyer_id,
        deleted_for,
        bikes ( id, title ),
        seller:profiles!conversations_seller_id_fkey ( id, full_name, username, avatar_url ),
        buyer:profiles!conversations_buyer_id_fkey  ( id, full_name, username, avatar_url )
      `)
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .not('deleted_for', 'cs', `{${user.id}}`)
      .order('last_message_at', { ascending: false }),
    // unread counts per conversation
    (supabase.from('messages') as any)
      .select('conversation_id')
      .neq('sender_id', user.id)
      .is('read_at', null),
  ])

  // Build a map: conversation_id → unread count
  const unreadMap: Record<string, number> = {}
  for (const m of (unreadRows ?? [])) {
    unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1
  }

  const conversations: Conversation[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const isSeller = (r.seller_id as string) === user.id
    const other = isSeller
      ? (r.buyer  as { id: string; full_name: string | null; username: string | null; avatar_url: string | null } | null)
      : (r.seller as { id: string; full_name: string | null; username: string | null; avatar_url: string | null } | null)
    const bike = r.bikes as { id: string; title: string } | null
    return {
      id: r.id as string,
      last_message_at: r.last_message_at as string | null,
      unread_count: unreadMap[r.id as string] ?? 0,
      bike,
      other,
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <MessagesClient conversations={conversations} userId={user.id} />
    </div>
  )
}
