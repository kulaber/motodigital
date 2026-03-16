import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { BadgeCheck, ArrowLeft, Mail, MailX, Shield, ExternalLink, Pencil, Database, FileText, Bike } from 'lucide-react'
import { BUILDERS } from '@/lib/data/builders'
import { BUILDS } from '@/lib/data/builds'

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
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // Fetch all builder profiles from Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbBuilders } = await (supabase.from('profiles') as any)
    .select('id, username, full_name, city, specialty, since_year, is_verified, created_at')
    .eq('role', 'builder')
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
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 lg:px-8">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors mb-8">
          <ArrowLeft size={13} /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
            </div>
            <h1 className="text-2xl font-bold text-[#F0EDE4]">Builder</h1>
          </div>
          <span className="text-sm text-[#F0EDE4]/30">{merged.length} gesamt</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Builder gesamt',  value: merged.length },
            { label: 'In Datenbank',    value: dbCount },
            { label: 'Nur statisch',    value: staticOnlyCount },
            { label: 'Verifiziert',     value: verifiedCount },
          ].map(s => (
            <div key={s.label} className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#F0EDE4]">{s.value}</p>
              <p className="text-xs text-[#F0EDE4]/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE4]/6">
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">Name</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest table-cell">Stadt</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest table-cell">Spezialisierung</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest table-cell">Bikes</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest table-cell">E-Mail</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">Quelle</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">Verif.</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]/5">
                {merged.map(b => (
                  <tr key={b.slug} className="hover:bg-[#F0EDE4]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-[#F0EDE4]">{b.name}</p>
                        <p className="text-xs text-[#F0EDE4]/30">@{b.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="text-xs text-[#F0EDE4]/50">{b.city ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="text-xs text-[#F0EDE4]/50">{b.specialty ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 table-cell text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        {b.staticBikeCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#F0EDE4]/50 bg-[#F0EDE4]/6 border border-[#F0EDE4]/10 px-2 py-0.5 rounded-full">
                            <Bike size={8} /> {b.staticBikeCount} statisch
                          </span>
                        )}
                        {b.dbBikeCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2AABAB] bg-[#2AABAB]/8 border border-[#2AABAB]/15 px-2 py-0.5 rounded-full">
                            <Bike size={8} /> {b.dbBikeCount} DB
                          </span>
                        )}
                        {b.staticBikeCount === 0 && b.dbBikeCount === 0 && (
                          <span className="text-xs text-[#F0EDE4]/20">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      {b.email ? (
                        <div className="flex items-center gap-1.5">
                          {b.email_confirmed
                            ? <Mail size={11} className="text-green-400 flex-shrink-0" />
                            : <MailX size={11} className="text-[#F0EDE4]/20 flex-shrink-0" />
                          }
                          <span className="text-xs text-[#F0EDE4]/50 truncate max-w-[160px]">{b.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#F0EDE4]/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {b.hasStaticProfile && (
                          <span title="Statisches Profil" className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#F0EDE4]/40 bg-[#F0EDE4]/6 border border-[#F0EDE4]/10 px-1.5 py-0.5 rounded-full">
                            <FileText size={8} /> Statisch
                          </span>
                        )}
                        {b.hasDbProfile && (
                          <span title="Supabase Profil" className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#2AABAB] bg-[#2AABAB]/8 border border-[#2AABAB]/15 px-1.5 py-0.5 rounded-full">
                            <Database size={8} /> DB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {b.is_verified
                        ? <BadgeCheck size={14} className="text-[#2AABAB] mx-auto" />
                        : <span className="text-xs text-[#F0EDE4]/20">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Profil ansehen */}
                        <a
                          href={`/builder/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#F0EDE4]/40 hover:text-[#F0EDE4] border border-[#F0EDE4]/10 hover:border-[#F0EDE4]/25 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                          <ExternalLink size={10} /> Profil
                        </a>
                        {/* Bearbeiten */}
                        <Link
                          href={`/admin/builder/${b.slug}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-[#141414] bg-[#2AABAB] hover:bg-[#3DBFBF] px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                        >
                          <Pencil size={10} /> Bearbeiten
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {merged.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#F0EDE4]/25">
                      Keine Builder gefunden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
