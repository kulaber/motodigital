import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import EditBikeForm from './EditBikeForm'

export const metadata: Metadata = { title: 'Bike bearbeiten — MotoDigital' }

type Props = { params: Promise<{ slug: string }> }

export default async function EditBikePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bike } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, style, mileage_km, price, city, description, status, seller_id, bike_images(id, url, is_cover, position)')
    .eq('id', slug)
    .maybeSingle()

  if (!bike) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role').eq('id', user.id).maybeSingle()
  if (bike.seller_id !== user.id && profile?.role !== 'superadmin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-20 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/meine-custom-bikes" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            Custom Bikes
          </Link>
          <span className="text-[#222222]/15">/</span>
          <span className="text-xs text-[#222222]/60 font-medium truncate max-w-[20ch]">{bike.title}</span>
        </div>

        <h1 className="text-2xl font-bold text-[#222222] mb-1">Bike bearbeiten</h1>
        <p className="text-sm text-[#717171] mb-8">{bike.title}</p>

        <EditBikeForm bike={bike} />
      </div>
    </div>
  )
}
