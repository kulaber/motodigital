import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/data/events'
import EventEditor from '../../EventEditor'

export const metadata: Metadata = { title: 'Admin — Event bearbeiten' }

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('events') as any)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const event = data as Event | null
  if (!event) notFound()

  return <EventEditor initialEvent={event} />
}
