import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminCreateBikeForm, { type WorkshopOption } from './AdminCreateBikeForm'

export const metadata: Metadata = { title: 'Admin — Neues Bike anlegen' }

export default async function AdminNewBikePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // Fetch all werkstatt profiles + their workshops
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: werkstaetten } = await (admin.from('profiles') as any)
    .select('id, full_name, username, city')
    .eq('role', 'custom-werkstatt')
    .order('full_name') as {
      data: { id: string; full_name: string | null; username: string | null; city: string | null }[] | null
    }

  // Fetch workshops to get workshop_id for each profile
  const { data: workshops } = await admin
    .from('workshops')
    .select('id, owner_id, name, city')

  const workshopByOwner = new Map(
    (workshops ?? []).map((w: { id: string; owner_id: string; name: string; city: string | null }) => [w.owner_id, w])
  )

  const options: WorkshopOption[] = (werkstaetten ?? []).map(p => {
    const ws = workshopByOwner.get(p.id)
    return {
      profileId: p.id,
      workshopId: ws?.id ?? null,
      name: p.full_name ?? p.username ?? 'Unbenannt',
      city: ws?.city ?? p.city ?? null,
    }
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      <AdminCreateBikeForm workshops={options} />
    </div>
  )
}
