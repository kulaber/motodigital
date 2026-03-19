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
  let myBikes: { title: string; make: string; model: string; cover_url: string | null }[] = []

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('id, full_name, avatar_url, city, bio, role, tags')
      .eq('id', user.id)
      .maybeSingle()
    myProfile = data

    // Fetch all bikes with cover image
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bikesData } = await (supabase.from('bikes') as any)
      .select('title, make, model, bike_images(url, is_cover)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (bikesData) {
      myBikes = (bikesData as { title: string; make: string; model: string; bike_images: { url: string; is_cover: boolean }[] }[]).map(b => {
        const images = b.bike_images ?? []
        const cover = images.find(i => i.is_cover) ?? images[0] ?? null
        return { title: b.title, make: b.make, model: b.model, cover_url: cover?.url ?? null }
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="riders" />
      <RidersPageClient userId={user?.id ?? null} myProfile={myProfile} myBikes={myBikes} />
    </div>
  )
}
