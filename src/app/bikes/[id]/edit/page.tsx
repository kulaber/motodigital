import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import EditBikeForm from './EditBikeForm'

export const metadata: Metadata = { title: 'Bike bearbeiten' }

type Props = { params: Promise<{ id: string }> }

export default async function EditBikePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bike } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, style, cc, mileage_km, price, city, lat, lng, description, status, seller_id, bike_images(id, url, is_cover, position)')
    .eq('id', id)
    .single()

  if (!bike) notFound()
  // Only owner or superadmin can edit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role').eq('id', user.id).single()
  if (bike.seller_id !== user.id && profile?.role !== 'superadmin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16 lg:px-8">
        <h1 className="text-2xl font-bold text-[#222222] mb-1">Bike bearbeiten</h1>
        <p className="text-sm text-[#717171] mb-8">{bike.title}</p>
        <EditBikeForm bike={bike} />
      </div>
    </div>
  )
}
