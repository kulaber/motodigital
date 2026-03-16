import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { ArrowLeft, Shield, Plus, Pencil, ExternalLink, MapPin, Calendar } from 'lucide-react'
import { EVENTS } from '@/lib/data/events'

export const metadata: Metadata = { title: 'Admin — Events' }

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const uniqueLocations = new Set(EVENTS.map(e => e.location)).size

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
            <h1 className="text-2xl font-bold text-[#1A1714]">Events</h1>
          </div>
          <Link href="/admin/events/new"
            className="inline-flex items-center gap-2 bg-[#2AABAB] text-[#141414] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#3DBFBF] transition-all">
            <Plus size={14} /> Neues Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Events gesamt',    value: EVENTS.length },
            { label: 'Standorte',        value: uniqueLocations },
            { label: 'Mit URL',          value: EVENTS.filter(e => e.url).length },
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
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest">Name</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest table-cell">Datum</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest table-cell">Ort</th>
                  <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest table-cell">Tags</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#1A1714]/30 uppercase tracking-widest">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1714]/5">
                {EVENTS.map(event => (
                  <tr key={event.id} className="hover:bg-[#1A1714]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#1A1714]">{event.name}</p>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#2AABAB]">
                        <Calendar size={11} /> {event.date}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1A1714]/45">
                        <MapPin size={11} /> {event.location}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 table-cell">
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#1A1714]/5 text-[#1A1714]/35 border border-[#1A1714]/8">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <a href="/events" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#1A1714]/40 hover:text-[#1A1714] border border-[#1A1714]/10 hover:border-[#1A1714]/25 px-3 py-1.5 rounded-full transition-all whitespace-nowrap">
                          <ExternalLink size={10} /> Live ansehen
                        </a>
                        <Link href={`/admin/events/${event.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-[#141414] bg-[#2AABAB] hover:bg-[#3DBFBF] px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap">
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
