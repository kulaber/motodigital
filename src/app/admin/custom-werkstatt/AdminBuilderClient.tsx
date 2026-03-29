'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Mail, MailX, ExternalLink, Pencil, Bike, Trash2, Plus, UserPlus, X } from 'lucide-react'
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
  is_unclaimed: boolean
}

interface Props {
  builders: BuilderRow[]
}

export default function AdminBuilderClient({ builders }: Props) {
  const [filter, setFilter] = useState<VerifiedFilter>('alle')
  const [deleteTarget, setDeleteTarget] = useState<BuilderRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [emailTarget, setEmailTarget] = useState<BuilderRow | null>(null)
  const [emailValue, setEmailValue] = useState('')
  const [assigningEmail, setAssigningEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
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

  async function handleAssignEmail() {
    if (!emailTarget?.dbId || !emailValue.trim()) return
    setAssigningEmail(true)
    setEmailError(null)

    const res = await fetch('/api/admin/werkstatt', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: emailTarget.dbId, email: emailValue.trim() }),
    })
    const data = await res.json()
    setAssigningEmail(false)

    if (!res.ok) {
      setEmailError(data.error ?? 'Fehler beim Zuweisen')
      return
    }

    setEmailTarget(null)
    setEmailValue('')
    router.refresh()
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
      {/* Top bar: Filter + Neue Werkstatt */}
      <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
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
      <Link
        href="/admin/custom-werkstatt/neu"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#06a5a5] hover:bg-[#058f8f] px-4 py-2 rounded-full transition-all whitespace-nowrap"
      >
        <Plus size={12} /> Neue Werkstatt
      </Link>
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
                    {b.is_unclaimed ? (
                      <button
                        onClick={() => { setEmailTarget(b); setEmailValue(''); setEmailError(null) }}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 hover:text-amber-600 border border-amber-300/40 hover:border-amber-400 bg-amber-50 px-2.5 py-1 rounded-full transition-all"
                      >
                        <UserPlus size={10} /> Zuweisen
                      </button>
                    ) : b.email ? (
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

      {/* E-Mail zuweisen Modal */}
      {emailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#222222]/6 w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#222222]">E-Mail zuweisen</h3>
              <button
                onClick={() => setEmailTarget(null)}
                className="text-[#222222]/30 hover:text-[#222222] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#222222]/50 mb-4">
              Weise <span className="font-semibold text-[#222222]">{emailTarget.name}</span> eine E-Mail-Adresse zu, damit sich der Inhaber einloggen kann.
            </p>
            <input
              type="email"
              value={emailValue}
              onChange={e => setEmailValue(e.target.value)}
              placeholder="inhaber@example.com"
              autoFocus
              className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors mb-3"
              onKeyDown={e => { if (e.key === 'Enter' && emailValue.trim()) handleAssignEmail() }}
            />
            {emailError && (
              <p className="text-xs text-red-400 mb-3">{emailError}</p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setEmailTarget(null)}
                className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAssignEmail}
                disabled={assigningEmail || !emailValue.trim()}
                className="inline-flex items-center gap-1.5 bg-[#06a5a5] text-white text-xs font-semibold px-5 py-2 rounded-full hover:bg-[#058f8f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserPlus size={11} />
                {assigningEmail ? 'Wird zugewiesen...' : 'Zuweisen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
