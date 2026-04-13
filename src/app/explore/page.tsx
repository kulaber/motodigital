import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/data/events'
import ExploreClient from './ExploreClient'

function isOnline(lastSeen: string | null | undefined): boolean {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < 3 * 60 * 1000
}

export const metadata: Metadata = {
  title: 'Explore — MotoDigital',
  description: 'Entdecke Custom Bikes, Werkstätten, Events und Rider in deiner Nähe.',
}

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isSuperadmin = false
  let userRole: string | null = null
  if (user) {
    const { data } = await (supabase.from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    isSuperadmin = data?.role === 'superadmin'
    userRole = data?.role ?? null
  }

  // Fetch riders for mobile story bar + events (server-side to avoid client fetch)
  const [{ data: storyRiders }, { data: eventsData }] = await Promise.all([
    (supabase.from('profiles') as any)
      .select('id, username, full_name, avatar_url, last_seen_at')
      .eq('role', 'rider')
      .not('username', 'is', null)
      .order('created_at', { ascending: false })
      .limit(12),
    (supabase.from('events') as any)
      .select('id, slug, name, date_start, date_end, location, image')
      .order('date_start', { ascending: true })
      .limit(100),
  ])

  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F7F7]">
      <Header activePage="explore" />
      <div className="flex flex-1 justify-center bg-[#F7F7F7]">
        <div className="flex flex-1 w-full max-w-7xl">
          <Suspense>
            <ExploreClient userId={user?.id ?? null} isAuthenticated={!!user} isSuperadmin={isSuperadmin} userRole={userRole} riders={(storyRiders ?? []).map((r: Record<string, unknown>) => ({ id: r.id as string, username: r.username as string, full_name: r.full_name as string | null, avatar_url: r.avatar_url as string | null, isOnline: isOnline(r.last_seen_at as string | null) }))} events={(eventsData ?? []) as Event[]} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
