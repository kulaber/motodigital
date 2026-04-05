import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import ExploreClient from './ExploreClient'

export const metadata: Metadata = {
  title: 'Explore — MotoDigital',
  description: 'Entdecke Custom Bikes, Werkstätten, Events und Rider in deiner Nähe.',
}

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isSuperadmin = false
  if (user) {
    const { data } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    isSuperadmin = data?.role === 'superadmin'
  }

  // Fetch riders for mobile story bar
  const { data: storyRiders } = await (supabase.from('profiles') as any)
    .select('id, username, full_name, avatar_url')
    .eq('role', 'rider')
    .not('username', 'is', null)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F7F7]">
      <Header activePage="explore" />
      <div className="flex flex-1 justify-center bg-[#F7F7F7]">
        <div className="flex flex-1 w-full max-w-7xl">
          <ExploreClient userId={user?.id ?? null} isSuperadmin={isSuperadmin} riders={storyRiders ?? []} />
        </div>
      </div>
    </div>
  )
}
