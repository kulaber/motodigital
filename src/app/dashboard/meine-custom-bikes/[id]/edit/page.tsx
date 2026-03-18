import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BikeEditForm from './BikeEditForm'

export const metadata: Metadata = { title: 'Bike bearbeiten — MotoDigital' }

export default async function BikeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: bike } = await (supabase.from('bikes') as any)
    .select('id, title, seller_id, bike_images(url, is_cover)')
    .eq('id', id)
    .maybeSingle() as { data: { id: string; title: string; seller_id: string; bike_images: { url: string; is_cover: boolean }[] } | null }

  if (!bike || bike.seller_id !== user.id) notFound()

  const coverUrl = bike.bike_images?.find(i => i.is_cover)?.url ?? bike.bike_images?.[0]?.url ?? null

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />
      <div className="max-w-lg mx-auto px-4 pt-8 pb-16 lg:px-8">

        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/meine-custom-bikes" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            Mein Bike
          </Link>
          <span className="text-[#222222]/15">/</span>
          <span className="text-xs text-[#222222]/60 font-medium">Bearbeiten</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#222222]">Bike bearbeiten</h1>
          <p className="text-sm text-[#222222]/35 mt-0.5">{bike.title}</p>
        </div>

        <BikeEditForm bikeId={bike.id} initialTitle={bike.title} initialCoverUrl={coverUrl} />
      </div>
    </div>
  )
}
