import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CreateWerkstattForm from './CreateWerkstattForm'

export const metadata: Metadata = { title: 'Admin — Neue Werkstatt anlegen' }

export default async function NewWerkstattPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      <CreateWerkstattForm />
    </div>
  )
}
