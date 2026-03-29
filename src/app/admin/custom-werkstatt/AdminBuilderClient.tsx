'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Mail, MailX, ExternalLink, Pencil, Bike, Trash2 } from 'lucide-react'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { deleteBuilder } from '@/lib/actions/builders'

type VerifiedFilter = 'alle' | 'verified' | 'unverified'

export type BuilderRow = {
  slug: string
  name: string
  city: string | null
  specialty: string | null
  dbId: string | null
  email: string | null
  email_confirmed: boolean
  is_verified: boolean
  bikeCount: number
}

interface Props {
  builders: BuilderRow[]
}

export default function AdminBuilderClient({ builders }: Props) {
  const [filter, setFilter] = useState<VerifiedFilter>('alle')
  const [deleteTarget, setDeleteTarget] = useState<BuilderRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!deleteTarget?.dbId) return
    setDeleting(true)
    const result = await deleteBuilder(deleteTarget.dbId)
    setDeleting(false)
    setDeleteTarget(null)
    if (result.success) {
      router.refresh()
    }
  }

  const filtered = filter === 'alle'
    ? builders
    : filter === 'verified'
    ? builders.filter(b => b.is_verified)
    : builders.filter(b => !b.is_verified)

  const filters: { value: VerifiedFilter; label: string }[] = [
    { value: 'alle', label: 'Alle' },
    { value: 'verified', label: 'Verifiziert' },
    { value: 'unverified', label: 'Nicht verifiziert' },
  ]

  return (
    <>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mr-1">Status</span>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              filter === f.value
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#222222]/25 hover:text-[#222222]'
            }`}
          >
            {f.label}
          </button>
        ))}
        {filter !== 'alle' && (
          <span className="text-xs text-[#222222]/30 ml-2">{filtered.length} Ergebnisse</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222222]/6">
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Name</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden md:table-cell">Stadt</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden lg:table-cell">Spezialisierung</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden sm:table-cell">Bikes</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden md:table-cell">E-Mail</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Verif.</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]/5">
              {filtered.map(b => (
                <tr key={b.slug} className="hover:bg-[#222222]/2 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-[#222222]">{b.name}</p>
                      <p className="text-xs text-[#222222]/30">@{b.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-[#222222]/50">{b.city ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-[#222222]/50">{b.specialty ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-center">
                    {b.bikeCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#717171] bg-[#222222]/8 border border-[#DDDDDD]/15 px-2 py-0.5 rounded-full">
                        <Bike size={8} /> {b.bikeCount}
                      </span>
                    ) : (
                      <span className="text-xs text-[#222222]/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {b.email ? (
                      <div className="flex items-center gap-1.5">
                        {b.email_confirmed
                          ? <Mail size={11} className="text-green-400 flex-shrink-0" />
                          : <MailX size={11} className="text-[#222222]/20 flex-shrink-0" />
                        }
                        <span className="text-xs text-[#222222]/50 truncate max-w-[160px]">{b.email}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#222222]/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {b.is_verified
                      ? <BadgeCheck size={14} className="text-[#717171] mx-auto" />
                      : <span className="text-xs text-[#222222]/20">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/custom-werkstatt/${b.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#222222]/40 hover:text-[#222222] border border-[#222222]/10 hover:border-[#222222]/25 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                      >
                        <ExternalLink size={10} /> Profil
                      </a>
                      <Link
                        href={`/admin/custom-werkstatt/${b.slug}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-white bg-[#06a5a5] hover:bg-[#058f8f] px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                      >
                        <Pencil size={10} /> Bearbeiten
                      </Link>
                      {b.dbId && (
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                        >
                          <Trash2 size={10} /> Löschen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#222222]/25">
                    Keine Builder gefunden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Möchtest Du die Custom Werkstatt „${deleteTarget?.name}" wirklich löschen?`}
      />
    </>
  )
}
