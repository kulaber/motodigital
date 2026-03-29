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
  email_confirmed: boolean
}

export default async function AdminBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // Fetch all builder profiles from Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbBuilders } = await (supabase.from('profiles') as any)
    .select('id, username, full_name, city, address, specialty, since_year, is_verified, created_at')
    .eq('role', 'custom-werkstatt')
    .order('created_at', { ascending: false }) as { data: Omit<SupabaseBuilder, 'email' | 'email_confirmed'>[] | null }

  // Enrich with auth data (email + confirmed) — use service role key for admin API
  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const authMap = new Map<string, { email?: string; email_confirmed_at?: string | null; last_sign_in_at?: string | null }>()
  let authPage = 1
  const perPage = 1000
  while (true) {
    const { data: authData } = await adminClient.auth.admin.listUsers({ page: authPage, perPage })
    if (!authData?.users?.length) break
    for (const u of authData.users) authMap.set(u.id, u)
    if (authData.users.length < perPage) break
    authPage++
  }

  const UNCLAIMED_SUFFIX = '@motodigital.local'

  const dbRows: (SupabaseBuilder & { is_unclaimed: boolean })[] = (dbBuilders ?? []).map(b => {
    const auth = authMap.get(b.id)
    const isUnclaimed = !!auth?.email?.endsWith(UNCLAIMED_SUFFIX)
    return {
      ...b,
      email: auth?.email ?? null,
      email_confirmed: isUnclaimed ? false : !!auth?.email_confirmed_at,
      is_unclaimed: isUnclaimed,
    }
  })

  // Fetch bike counts per seller from Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    email_confirmed: db.email_confirmed,
    is_verified: db.is_verified,
    bikeCount: bikeCountById.get(db.id) ?? 0,
    is_unclaimed: db.is_unclaimed,
  }))

  const verifiedCount = rows.filter(r => r.email_confirmed).length

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Werkstätten gesamt',  value: rows.length },
            { label: 'Verifiziert',     value: verifiedCount },
            { label: 'Nicht verifiziert', value: rows.length - verifiedCount },
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
