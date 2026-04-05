import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import NewBikeForm from './NewBikeForm'

export const metadata: Metadata = { title: 'Neues Custom-Bike hinzufügen' }

export default async function NewBikePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role, full_name, avatar_url').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'custom-werkstatt' && profile?.role !== 'rider') redirect('/dashboard')

  return (
    <DashboardShell role={profile?.role ?? null} userName={profile?.full_name ?? null} avatarUrl={profile?.avatar_url ?? null}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#222222]">Neues Custom-Bike</h1>
          <p className="text-sm text-[#222222]/40 mt-1">Erstelle ein Inserat für dein Custom Bike</p>
        </div>
        <NewBikeForm />
      </div>
    </DashboardShell>
  )
}
