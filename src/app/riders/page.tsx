import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import RidersPageClient from './RidersPageClient'

export const metadata: Metadata = {
  title: 'Rider Community — MotoDigital',
  description: 'Die Community für Custom Motorcycle Rider. Teile deine Builds, entdecke andere Bikes und vernetze dich.',
}

export default async function RidersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch current user profile (if logged in)
  let myProfile: { id: string; full_name: string | null; avatar_url: string | null; city: string | null; bio: string | null; role: string | null; tags: string[] | null } | null = null
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('id, full_name, avatar_url, city, bio, role, tags')
      .eq('id', user.id)
      .maybeSingle()
    myProfile = data
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="riders" />
      <RidersPageClient userId={user?.id ?? null} myProfile={myProfile} />
    </div>
  )
}
