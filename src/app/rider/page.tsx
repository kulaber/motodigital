import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthGate from './[slug]/AuthGate'
import RiderListClient from './RiderListClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Rider — MotoDigital',
  description: 'Entdecke Rider aus der Custom-Motorrad-Community auf MotoDigital.',
}

export interface RiderCard {
  slug: string
  name: string
  city: string
  ridingStyle: string
  avatar?: string
  initials: string
  bikeCount: number
  bikeStyles: string[]
}

export default async function RiderOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <AuthGate />

  // Fetch riders + all rider bikes in parallel (avoids sequential waterfall)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: dbRiders }, { data: allBikeRows }] = await Promise.all([
    (supabase.from('profiles') as any)
      .select('id, full_name, slug, username, city, address, avatar_url, riding_style')
      .eq('role', 'rider')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('bikes')
      .select('seller_id, style'),
  ])

  const filteredRiders = (dbRiders ?? []).filter((r: Record<string, unknown>) => r.slug || r.username || r.full_name)
  const riderIds = new Set(filteredRiders.map((r: Record<string, unknown>) => r.id as string))

  // Filter bike rows to only relevant riders (done in memory instead of second query)
  const bikeRows = (allBikeRows ?? []).filter((b: { seller_id: string }) => riderIds.has(b.seller_id))

  const countMap = new Map<string, number>()
  const styleMap = new Map<string, Set<string>>()
  ;(bikeRows ?? []).forEach((b: { seller_id: string; style: string | null }) => {
    countMap.set(b.seller_id, (countMap.get(b.seller_id) ?? 0) + 1)
    if (b.style) {
      if (!styleMap.has(b.seller_id)) styleMap.set(b.seller_id, new Set())
      styleMap.get(b.seller_id)!.add(b.style)
    }
  })

  const dbCards: RiderCard[] = filteredRiders.map((r: Record<string, unknown>) => {
      const name = (r.full_name as string | null) ?? 'Unbekannt'
      const slug = (r.slug as string | null)
        ?? (r.username as string | null)
        ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return {
        slug,
        name,
        city: (r.city as string | null) ?? (r.address as string | null) ?? '',
        ridingStyle: (r.riding_style as string | null) ?? '',
        avatar: (r.avatar_url as string | null) ?? undefined,
        initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        bikeCount: countMap.get(r.id as string) ?? 0,
        bikeStyles: [...(styleMap.get(r.id as string) ?? [])],
      }
    })

  const allRiders = dbCards

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="explore" />

      <section className="pt-10 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">Rider</h1>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          <RiderListClient riders={allRiders} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
