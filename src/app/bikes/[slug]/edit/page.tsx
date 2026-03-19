import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
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
    .select('id, slug, title, make, model, year, style, mileage_km, price, city, description, modifications, status, seller_id, bike_images(id, url, is_cover, position)')
    .eq('id', slug)
    .maybeSingle()

  if (!bike) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role, full_name, avatar_url').eq('id', user.id).maybeSingle()
  if (bike.seller_id !== user.id && profile?.role !== 'superadmin') redirect('/dashboard')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: baseBikes } = await (supabase.from('base_bikes') as any)
    .select('make, model, year_from, year_to')
    .order('make').order('model') as { data: { make: string; model: string; year_from: number; year_to: number | null }[] | null }

  return (
    <DashboardShell role={profile?.role ?? null} userName={profile?.full_name ?? null} avatarUrl={profile?.avatar_url ?? null}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#222222]">Bike bearbeiten</h1>
          <p className="text-sm text-[#222222]/40 mt-1">{bike.title}</p>
        </div>
        <EditBikeForm bike={bike} baseBikes={baseBikes ?? []} />
      </div>
    </DashboardShell>
  )
}
