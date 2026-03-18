import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import RiderBikeForm from './RiderBikeForm'

export const metadata: Metadata = { title: 'Bike hinzufügen — MotoDigital' }

export default async function NeuBikePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Load unique makes from base_bikes for autocomplete
  const { data: baseBikes, error: baseBikesError } = await (supabase.from('base_bikes') as any)
    .select('make, model, year_from, year_to')
    .order('make', { ascending: true }) as { data: { make: string; model: string; year_from: number; year_to: number | null }[] | null, error: unknown }

  if (baseBikesError) console.error('[meine-custom-bikes/neu] base_bikes query error:', baseBikesError)

  const makes = [...new Set((baseBikes ?? []).map(b => b.make))].sort()

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />
      <div className="max-w-lg mx-auto px-4 pt-8 pb-16 lg:px-8">

        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/meine-custom-bikes" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            Mein Bike
          </Link>
          <span className="text-[#222222]/15">/</span>
          <span className="text-xs text-[#222222]/60 font-medium">Hinzufügen</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#222222]">Bike hinzufügen</h1>
          <p className="text-sm text-[#222222]/35 mt-0.5">Trag dein Bike ein und zeig es der Community</p>
        </div>

        <RiderBikeForm userId={user.id} makes={makes} baseBikes={baseBikes ?? []} />
      </div>
    </div>
  )
}
