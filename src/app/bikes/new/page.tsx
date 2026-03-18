import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import NewBikeForm from './NewBikeForm'

export const metadata: Metadata = { title: 'Neues Custom-Bike hinzufügen' }

export default async function NewBikePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'custom-werkstatt') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#222222]">Neues Custom-Bike hinzufügen</h1>
          <p className="text-sm text-[#222222]/40 mt-1">Erstelle ein Inserat für dein Custom Bike</p>
        </div>
        <NewBikeForm />
      </div>
    </div>
  )
}
