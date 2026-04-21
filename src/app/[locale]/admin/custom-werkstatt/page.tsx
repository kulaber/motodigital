import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { Shield } from 'lucide-react'
import AdminBuilderClient, { type BuilderRow } from './AdminBuilderClient'

export const metadata: Metadata = { title: 'Admin — Custom Werkstatt' }

type SupabaseBuilder = {
  id: string
  username: string
  full_name: string | null
  city: string | null
  address: string | null
  specialty: string | null
  since_year: number | null
  is_verified: boolean
  created_at: string
  email: string | null
}

export default async function AdminBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // Fetch all builder profiles from Supabase
  const { data: dbBuilders } = await (supabase.from('profiles') as any)
    .select('id, username, full_name, city, address, specialty, since_year, is_verified, created_at')
    .eq('role', 'custom-werkstatt')
    .order('created_at', { ascending: false }) as { data: Omit<SupabaseBuilder, 'email' | 'email_confirmed'>[] | null }

  // Enrich with auth data (email + confirmed) — use service role key for admin API
  const authMap = new Map<string, { email?: string; email_confirmed_at?: string | null; last_sign_in_at?: string | null }>()
  try {
    const adminClient = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    let authPage = 1
    const perPage = 1000
    while (true) {
      const { data: authData } = await adminClient.auth.admin.listUsers({ page: authPage, perPage })
      if (!authData?.users?.length) break
      for (const u of authData.users) authMap.set(u.id, u)
      if (authData.users.length < perPage) break
      authPage++
    }
  } catch (e) {
    console.error('Failed to fetch auth users:', e)
  }

  const UNCLAIMED_SUFFIX = '@motodigital.local'

  const dbRows = (dbBuilders ?? []).map(b => {
    const auth = authMap.get(b.id)
    const isUnclaimed = !!auth?.email?.endsWith(UNCLAIMED_SUFFIX)
    let status: 'unclaimed' | 'invited' | 'active'
    if (isUnclaimed) status = 'unclaimed'
    else if (!auth?.last_sign_in_at) status = 'invited'
    else status = 'active'
    return {
      ...b,
      email: isUnclaimed ? null : (auth?.email ?? null),
      status,
      is_unclaimed: isUnclaimed,
    }
  })

  // Fetch workshop subscription tiers
  const { data: workshopTiers } = await (supabase.from('workshops') as any)
    .select('owner_id, subscription_tier, subscription_cancel_at') as { data: { owner_id: string; subscription_tier: string; subscription_cancel_at: string | null }[] | null }

  const tierByOwnerId = new Map<string, string>()
  const cancelAtByOwnerId = new Map<string, string | null>()
  for (const row of workshopTiers ?? []) {
    tierByOwnerId.set(row.owner_id, row.subscription_tier)
    cancelAtByOwnerId.set(row.owner_id, row.subscription_cancel_at)
  }

  // Fetch bike counts per seller from Supabase
  const { data: bikeCounts } = await (supabase.from('bikes') as any)
    .select('seller_id') as { data: { seller_id: string }[] | null }

  const bikeCountById = new Map<string, number>()
  for (const row of bikeCounts ?? []) {
    bikeCountById.set(row.seller_id, (bikeCountById.get(row.seller_id) ?? 0) + 1)
  }

  const rows: BuilderRow[] = dbRows.map(db => ({
    slug: db.username,
    name: db.full_name ?? db.username,
    city: db.city,
    address: db.address,
    specialty: db.specialty,
    dbId: db.id,
    email: db.email,
    status: db.status,
    is_verified: db.is_verified,
    bikeCount: bikeCountById.get(db.id) ?? 0,
    is_unclaimed: db.is_unclaimed,
    subscription_tier: tierByOwnerId.get(db.id) ?? null,
    subscription_cancel_at: cancelAtByOwnerId.get(db.id) ?? null,
  }))

  const activeCount = rows.filter(r => r.status === 'active').length
  const invitedCount = rows.filter(r => r.status === 'invited').length
  const unclaimedCount = rows.filter(r => r.status === 'unclaimed').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">Custom Werkstatt</h1>
          </div>
          <span className="text-sm text-[#222222]/30">{rows.length} gesamt</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Gesamt',            value: rows.length },
            { label: 'Aktiv',             value: activeCount },
            { label: 'Eingeladen',        value: invitedCount },
            { label: 'Nicht zugewiesen',  value: unclaimedCount },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#222222]/6 rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#222222]">{s.value}</p>
              <p className="text-xs text-[#222222]/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <AdminBuilderClient builders={rows} />

    </div>
  )
}
