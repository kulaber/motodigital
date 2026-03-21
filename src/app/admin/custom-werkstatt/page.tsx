import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Shield } from 'lucide-react'
import { BUILDERS } from '@/lib/data/builders'
import { BUILDS } from '@/lib/data/builds'
import AdminBuilderClient, { type BuilderRow } from './AdminBuilderClient'

export const metadata: Metadata = { title: 'Admin — Builder' }

type SupabaseBuilder = {
  id: string
  username: string
  full_name: string | null
  city: string | null
  specialty: string | null
  since_year: number | null
  is_verified: boolean
  created_at: string
  email: string | null
  email_confirmed: boolean
}

type MergedRow = {
  slug: string
  name: string
  city: string | null
  specialty: string | null
  hasStaticProfile: boolean
  hasDbProfile: boolean
  dbId: string | null
  email: string | null
  email_confirmed: boolean
  is_verified: boolean
  created_at: string | null
  staticBikeCount: number
  dbBikeCount: number
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
    .select('id, username, full_name, city, specialty, since_year, is_verified, created_at')
    .eq('role', 'custom-werkstatt')
    .order('created_at', { ascending: false }) as { data: Omit<SupabaseBuilder, 'email' | 'email_confirmed'>[] | null }

  // Enrich with auth data (email + confirmed)
  const { data: authData } = await supabase.auth.admin.listUsers()
  const authMap = new Map(authData?.users?.map(u => [u.id, u]) ?? [])

  const dbRows: SupabaseBuilder[] = (dbBuilders ?? []).map(b => {
    const auth = authMap.get(b.id)
    return {
      ...b,
      email: auth?.email ?? null,
      email_confirmed: !!auth?.email_confirmed_at,
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

  // Precompute static build counts per builder slug
  const staticBuildCountBySlug = new Map<string, number>()
  for (const build of BUILDS) {
    const slug = build.builder.slug
    staticBuildCountBySlug.set(slug, (staticBuildCountBySlug.get(slug) ?? 0) + 1)
  }

  // Build a map of Supabase builders keyed by username/slug
  const dbBySlug = new Map(dbRows.map(r => [r.username, r]))

  // Merge: start with static BUILDERS, then append DB-only builders
  const staticSlugs = new Set(BUILDERS.map(b => b.slug))
  const merged: MergedRow[] = []

  for (const sb of BUILDERS) {
    const db = dbBySlug.get(sb.slug)
    merged.push({
      slug: sb.slug,
      name: db?.full_name ?? sb.name,
      city: db?.city ?? sb.city,
      specialty: db?.specialty ?? sb.specialty,
      hasStaticProfile: true,
      hasDbProfile: !!db,
      dbId: db?.id ?? null,
      email: db?.email ?? null,
      email_confirmed: db?.email_confirmed ?? false,
      is_verified: db?.is_verified ?? sb.verified,
      created_at: db?.created_at ?? null,
      staticBikeCount: staticBuildCountBySlug.get(sb.slug) ?? 0,
      dbBikeCount: db?.id ? (bikeCountById.get(db.id) ?? 0) : 0,
    })
  }

  // Append DB-only builders (not in static data)
  for (const db of dbRows) {
    if (!staticSlugs.has(db.username)) {
      merged.push({
        slug: db.username,
        name: db.full_name ?? db.username,
        city: db.city,
        specialty: db.specialty,
        hasStaticProfile: false,
        hasDbProfile: true,
        dbId: db.id,
        email: db.email,
        email_confirmed: db.email_confirmed,
        is_verified: db.is_verified,
        created_at: db.created_at,
        staticBikeCount: 0,
        dbBikeCount: bikeCountById.get(db.id) ?? 0,
      })
    }
  }

  const verifiedCount  = merged.filter(r => r.is_verified).length
  const dbCount        = merged.filter(r => r.hasDbProfile).length
  const staticOnlyCount = merged.filter(r => r.hasStaticProfile && !r.hasDbProfile).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">Builder</h1>
          </div>
          <span className="text-sm text-[#222222]/30">{merged.length} gesamt</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Builder gesamt',  value: merged.length },
            { label: 'In Datenbank',    value: dbCount },
            { label: 'Nur statisch',    value: staticOnlyCount },
            { label: 'Verifiziert',     value: verifiedCount },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#222222]/6 rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#222222]">{s.value}</p>
              <p className="text-xs text-[#222222]/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <AdminBuilderClient builders={merged as BuilderRow[]} />

    </div>
  )
}
