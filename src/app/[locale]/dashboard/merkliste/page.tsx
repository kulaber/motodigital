import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { Bike, Wrench, ArrowLeft } from 'lucide-react'
import MerklisteClient, { type SavedBikeItem, type SavedBuilderItem } from './MerklisteClient'

export const metadata: Metadata = { title: 'Merkliste — MotoDigital' }

export default async function MerklistePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const activeTab = params.tab === 'bikes' ? 'bikes' : 'werkstatt'

  const [savedBikesResult, savedBuildersResult] = await Promise.all([
    (supabase.from('saved_bikes') as any)
      .select('bike_id, created_at, bikes(id, slug, title, price, make, model, year, status, bike_images(id, url, is_cover, position), profiles:seller_id(full_name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    (supabase.from('saved_builders') as any)
      .select('builder_id, created_at, builders:builder_id(id, full_name, slug, username, city, specialty, is_verified, avatar_url, builder_media(url, type, title, position))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const savedBikes: SavedBikeItem[] = ((savedBikesResult.data ?? []) as any[])
    .filter((e: any) => e.bikes != null)
    .map((e: any) => {
      const bike = e.bikes
      const images = (bike.bike_images ?? []) as { url: string; is_cover: boolean; position: number }[]
      const cover = images.find(i => i.is_cover)?.url ?? images.sort((a, b) => a.position - b.position)[0]?.url ?? null
      return {
        bike_id: e.bike_id,
        title: bike.title,
        slug: bike.slug,
        make: bike.make,
        model: bike.model,
        year: bike.year,
        price: bike.price,
        status: bike.status,
        coverImg: cover,
        sellerName: bike.profiles?.full_name ?? null,
      }
    })

  const savedBuilders: SavedBuilderItem[] = ((savedBuildersResult.data ?? []) as any[])
    .filter((e: any) => e.builders != null)
    .map((e: any) => {
      const b = e.builders
      const media = (b.builder_media ?? []) as { url: string; type: string; title?: string; position?: number }[]
      // Cover: builder_media with title='cover', or first image by position, or avatar_url
      const coverMedia = media.find(m => m.title === 'cover')
        ?? media.filter(m => m.type === 'image').sort((a, z) => (a.position ?? 0) - (z.position ?? 0))[0]
      const coverImg = coverMedia?.url ?? b.avatar_url ?? null
      return {
        builder_id: e.builder_id,
        name: b.full_name ?? b.username,
        slug: b.slug,
        city: b.city,
        specialty: b.specialty,
        is_verified: b.is_verified,
        coverImg,
      }
    })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white transition-colors">
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#222222]">Merkliste</h1>
              <p className="text-sm text-[#222222]/40 mt-1">Gespeicherte Custom Bikes und Werkstatten</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            href="/dashboard/merkliste?tab=werkstatt"
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              activeTab === 'werkstatt'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#222222]/50 border-[#222222]/12 hover:border-[#222222]/30 hover:text-[#222222]/80'
            }`}
          >
            <Wrench size={13} />
            Custom Werkstatt
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'werkstatt' ? 'bg-white/20 text-white' : 'bg-[#222222]/8 text-[#222222]/40'
            }`}>
              {savedBuilders.length}
            </span>
          </Link>
          <Link
            href="/dashboard/merkliste?tab=bikes"
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              activeTab === 'bikes'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#222222]/50 border-[#222222]/12 hover:border-[#222222]/30 hover:text-[#222222]/80'
            }`}
          >
            <Bike size={13} />
            Custom Bikes
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'bikes' ? 'bg-white/20 text-white' : 'bg-[#222222]/8 text-[#222222]/40'
            }`}>
              {savedBikes.length}
            </span>
          </Link>
        </div>

        <MerklisteClient savedBikes={savedBikes} savedBuilders={savedBuilders} activeTab={activeTab} />
    </div>
  )
}
