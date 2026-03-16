import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { ArrowLeft, Shield, Plus, Pencil, ExternalLink, FileText } from 'lucide-react'
import { ARTICLES } from '@/lib/data/magazine'

export const metadata: Metadata = { title: 'Admin — Magazin' }

const CATEGORY_COLOR: Record<string, string> = {
  'Build Story': 'bg-[#2AABAB]/10 text-[#2AABAB] border-[#2AABAB]/20',
  'Interview':   'bg-[#2AABAB]/8  text-[#2AABAB]/80 border-[#2AABAB]/15',
  'Guide':       'bg-[#1A1714]/5  text-[#1A1714]/40 border-[#1A1714]/10',
}

export default async function AdminMagazinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const buildStory = ARTICLES.filter(a => a.category === 'build-story').length
  const interview  = ARTICLES.filter(a => a.category === 'interview').length
  const guide      = ARTICLES.filter(a => a.category === 'guide').length

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1714]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 lg:px-8">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#1A1714]/35 hover:text-[#1A1714] transition-colors mb-8">
          <ArrowLeft size={13} /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
            </div>
            <h1 className="text-2xl font-bold text-[#1A1714]">Magazin</h1>
          </div>
          <Link href="/admin/magazine/new"
            className="inline-flex items-center gap-2 bg-[#2AABAB] text-[#141414] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#3DBFBF] transition-all">
            <Plus size={14} /> Neuer Beitrag
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Gesamt',        value: ARTICLES.length },
            { label: 'Build Stories', value: buildStory },
            { label: 'Interviews',    value: interview },
            { label: 'Guides',        value: guide },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#1A1714]/6 rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#1A1714]">{s.value}</p>
              <p className="text-xs text-[#1A1714]/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#1A1714]/6 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1714]/6">
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest">Beitrag</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest table-cell">Kategorie</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest table-cell">Autor</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest table-cell">Veröffentlicht</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1714]/5">
                {ARTICLES.map(a => (
                  <tr key={a.slug} className="hover:bg-[#1A1714]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5F2EB]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1A1714] line-clamp-1">{a.title}</p>
                          <p className="text-xs text-[#1A1714]/30 mt-0.5 flex items-center gap-1">
                            <FileText size={9} /> {a.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${CATEGORY_COLOR[a.categoryLabel] ?? ''}`}>
                        {a.categoryLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="text-xs text-[#1A1714]/45">{a.author}</span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="text-xs text-[#1A1714]/45">
                        {new Date(a.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/magazine/${a.slug}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1A1714]/40 hover:text-[#1A1714] border border-[#1A1714]/10 hover:border-[#1A1714]/25 px-3 py-1.5 rounded-full transition-all">
                          <ExternalLink size={10} /> Live
                        </a>
                        <Link href={`/admin/magazine/${a.slug}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-[#141414] bg-[#2AABAB] hover:bg-[#3DBFBF] px-3 py-1.5 rounded-full transition-all font-semibold">
                          <Pencil size={10} /> Bearbeiten
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
