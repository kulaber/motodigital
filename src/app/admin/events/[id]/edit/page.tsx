import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { EVENTS } from '@/lib/data/events'
import EventEditor from '../../EventEditor'

export const metadata: Metadata = { title: 'Admin — Event bearbeiten' }

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eventId = parseInt(id, 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const event = EVENTS.find(e => e.id === eventId)
  if (!event) notFound()

  return (
    <>
      <Header />
      <div className="pt-16">
        <EventEditor initialEvent={event} />
      </div>
    </>
  )
}
