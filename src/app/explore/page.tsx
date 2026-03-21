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

  let userCity: string | null = null
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('city')
      .eq('id', user.id)
      .maybeSingle()
    userCity = data?.city ?? null
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F7F7]">
      <Header activePage="explore" />
      <div className="flex flex-1 justify-center bg-[#F7F7F7]">
        <div className="flex flex-1 w-full max-w-7xl">
          <ExploreClient userId={user?.id ?? null} userCity={userCity} />
        </div>
      </div>
    </div>
  )
}
