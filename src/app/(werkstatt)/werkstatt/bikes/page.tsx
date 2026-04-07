import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Meine Bikes — MotoDigital',
}

export default async function WerkstattBikesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-dvh bg-[#F7F7F7]">
      <Header />
      <div className="px-4 pt-6 pb-28 flex flex-col gap-5 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-[#222222]">
          Meine Bikes
        </h1>
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-6 text-center">
          <p className="text-sm text-[#222222]/40">
            Hier werden deine Bikes und dein Portfolio angezeigt.
          </p>
          <a
            href="/dashboard/meine-garage"
            className="inline-block mt-4 text-sm font-medium text-[#2AABAB] hover:underline"
          >
            Zur Garage →
          </a>
        </div>
      </div>
    </div>
  )
}
