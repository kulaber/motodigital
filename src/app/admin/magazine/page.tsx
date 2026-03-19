import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Shield, Plus, Pencil, ExternalLink, FileText } from 'lucide-react'
import { ARTICLES } from '@/lib/data/magazine'

export const metadata: Metadata = { title: 'Admin — Magazin' }

const CATEGORY_COLOR: Record<string, string> = {
  'Build Story': 'bg-[#222222]/10 text-[#717171] border-[#DDDDDD]/20',
  'Interview':   'bg-[#222222]/8  text-[#717171]/80 border-[#DDDDDD]/15',
  'Guide':       'bg-[#222222]/5  text-[#222222]/40 border-[#222222]/10',
}

export default async function AdminMagazinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const buildStory = ARTICLES.filter(a => a.category === 'build-story').length
  const interview  = ARTICLES.filter(a => a.category === 'interview').length
  const guide      = ARTICLES.filter(a => a.category === 'guide').length

  return (
    <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
            </div>
            <h1 className="text-2xl font-bold text-[#222222]">Magazin</h1>
          </div>
          <Link href="/admin/magazine/new"
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all">
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
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Beitrag</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest table-cell">Kategorie</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest table-cell">Autor</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest table-cell">Veröffentlicht</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/5">
                {ARTICLES.map(a => (
                  <tr key={a.slug} className="hover:bg-[#222222]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                          <Image src={a.coverImage} alt={a.title} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#222222] line-clamp-1">{a.title}</p>
                          <p className="text-xs text-[#222222]/30 mt-0.5 flex items-center gap-1">
                            <FileText size={9} /> {a.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 table-cell w-36">
                      <span className={`inline-block whitespace-nowrap text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${CATEGORY_COLOR[a.categoryLabel] ?? ''}`}>
                        {a.categoryLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="text-xs text-[#222222]/45">{a.author}</span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="text-xs text-[#222222]/45">
                        {new Date(a.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/magazine/${a.slug}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#222222]/40 hover:text-[#222222] border border-[#222222]/10 hover:border-[#222222]/25 px-3 py-1.5 rounded-full transition-all">
                          <ExternalLink size={10} /> Live
                        </a>
                        <Link href={`/admin/magazine/${a.slug}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-white bg-[#06a5a5] hover:bg-[#058f8f] px-3 py-1.5 rounded-full transition-all font-semibold">
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
  )
}
