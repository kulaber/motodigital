import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { BadgeCheck, ArrowLeft, Mail, MailX, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin — Builder' }

type BuilderRow = {
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

export default async function AdminBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check superadmin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  // Fetch all builders with auth user data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: builders } = await (supabase.from('profiles') as any)
    .select('id, username, full_name, city, specialty, since_year, is_verified, created_at')
    .eq('role', 'builder')
    .order('created_at', { ascending: false }) as { data: Omit<BuilderRow, 'email' | 'email_confirmed'>[] | null }

  // Fetch auth users to get email + confirmation status via service role
  const { data: authData } = await supabase.auth.admin.listUsers()
  const authMap = new Map(authData?.users?.map(u => [u.id, u]) ?? [])

  const rows: BuilderRow[] = (builders ?? []).map(b => {
    const auth = authMap.get(b.id)
    return {
      ...b,
      email: auth?.email ?? null,
      email_confirmed: !!auth?.email_confirmed_at,
    }
  })

  const verifiedCount    = rows.filter(r => r.is_verified).length
  const confirmedCount   = rows.filter(r => r.email_confirmed).length

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 lg:px-8">

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
          <span className="text-sm text-[#F0EDE4]/30">{rows.length} gesamt</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Builder gesamt', value: rows.length },
            { label: 'E-Mail bestätigt', value: confirmedCount },
            { label: 'Verifiziert', value: verifiedCount },
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
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">E-Mail</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest hidden sm:table-cell">Stadt</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest hidden lg:table-cell">Spezialisierung</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">Mail</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest">Verifiziert</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#F0EDE4]/30 uppercase tracking-widest hidden md:table-cell">Registriert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]/5">
                {rows.map(b => (
                  <tr key={b.id} className="hover:bg-[#F0EDE4]/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <Link href={`/builder/${b.username}`} className="text-sm font-medium text-[#F0EDE4] hover:text-[#2AABAB] transition-colors">
                          {b.full_name ?? b.username}
                        </Link>
                        <p className="text-xs text-[#F0EDE4]/30">@{b.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#F0EDE4]/50">{b.email ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-[#F0EDE4]/50">{b.city ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-[#F0EDE4]/50">{b.specialty ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {b.email_confirmed
                        ? <Mail size={14} className="text-green-400 mx-auto" />
                        : <MailX size={14} className="text-[#F0EDE4]/20 mx-auto" />
                      }
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {b.is_verified
                        ? <BadgeCheck size={14} className="text-[#2AABAB] mx-auto" />
                        : <span className="text-xs text-[#F0EDE4]/20">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-[#F0EDE4]/35">
                        {new Date(b.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#F0EDE4]/25">
                      Noch keine Builder registriert
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
