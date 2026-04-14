import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
          <div className="flex items-center gap-3">
            <Link href="/dashboard/meine-garage" className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors" aria-label="Zurück">
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#222222]">Neues Custom-Bike</h1>
              <p className="text-sm text-[#222222]/40 mt-1">Füge dein Custom Bike hinzu</p>
            </div>
          </div>
        </div>
        <NewBikeForm />
      </div>
    </DashboardShell>
  )
}
