import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { ArrowLeft, Shield, Mail, MailX, BadgeCheck, Trash2, Pencil } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin — Rider' }

type RiderRow = {
  id: string
  username: string | null
  full_name: string | null
  city: string | null
  bio: string | null
  is_verified: boolean
  created_at: string
  email: string | null
  email_confirmed: boolean
  last_sign_in_at: string | null
}

export default async function AdminRidersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbRiders } = await (supabase.from('profiles') as any)
    .select('id, username, full_name, city, bio, is_verified, created_at')
    .eq('role', 'rider')
    .order('created_at', { ascending: false }) as {
      data: Omit<RiderRow, 'email' | 'email_confirmed' | 'last_sign_in_at'>[] | null
    }

  const { data: authData } = await supabase.auth.admin.listUsers()
  const authMap = new Map(authData?.users?.map(u => [u.id, u]) ?? [])

  const riders: RiderRow[] = (dbRiders ?? []).map(r => {
    const auth = authMap.get(r.id)
    return {
      ...r,
      email: auth?.email ?? null,
      email_confirmed: !!auth?.email_confirmed_at,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
    }
  })

  const verifiedCount = riders.filter(r => r.is_verified).length
  const confirmedCount = riders.filter(r => r.email_confirmed).length

  function timeAgo(iso: string | null) {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Heute'
    if (days === 1) return 'Gestern'
    if (days < 30) return `vor ${days} Tagen`
    if (days < 365) return `vor ${Math.floor(days / 30)} Mon.`
    return `vor ${Math.floor(days / 365)} J.`
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 lg:px-8">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors mb-8">
          <ArrowLeft size={13} /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
            </div>
            <h1 className="text-2xl font-bold text-[#222222]">Rider</h1>
          </div>
          <span className="text-sm text-[#222222]/30">{riders.length} gesamt</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Rider gesamt',    value: riders.length },
            { label: 'E-Mail bestätigt', value: confirmedCount },
            { label: 'Verifiziert',     value: verifiedCount },
            { label: 'Nicht bestätigt', value: riders.length - confirmedCount },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#222222]/6 rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#222222]">{s.value}</p>
              <p className="text-xs text-[#222222]/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222222]/6">
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Name</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Stadt</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">E-Mail</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Verif.</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Registriert</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Letzter Login</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/5">
                {riders.map(r => (
                  <tr key={r.id} className="hover:bg-[#222222]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-[#222222]">{r.full_name ?? '—'}</p>
                        {r.username && <p className="text-xs text-[#222222]/30">@{r.username}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#222222]/50">{r.city ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {r.email ? (
                        <div className="flex items-center gap-1.5">
                          {r.email_confirmed
                            ? <Mail size={11} className="text-green-400 flex-shrink-0" />
                            : <MailX size={11} className="text-[#222222]/20 flex-shrink-0" />
                          }
                          <span className="text-xs text-[#222222]/50 truncate max-w-[180px]">{r.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#222222]/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {r.is_verified
                        ? <BadgeCheck size={14} className="text-[#717171] mx-auto" />
                        : <span className="text-xs text-[#222222]/20">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#222222]/40">{timeAgo(r.created_at)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#222222]/40">{timeAgo(r.last_sign_in_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/riders/${r.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-white bg-[#06a5a5] hover:bg-[#058f8f] px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                        >
                          <Pencil size={10} /> Bearbeiten
                        </Link>
                        <Link
                          href={`/admin/riders/${r.id}/delete`}
                          className="inline-flex items-center gap-1 text-xs text-red-400/70 hover:text-red-500 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                          <Trash2 size={10} /> Löschen
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {riders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#222222]/25">
                      Keine Rider gefunden
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
