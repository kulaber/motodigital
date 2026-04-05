'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Mail, ExternalLink, Pencil, Bike, Trash2, Plus, UserPlus, X } from 'lucide-react'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { resendInvitation } from '@/lib/actions/invite'

type StatusFilter = 'alle' | 'active' | 'invited' | 'unclaimed'

export type BuilderRow = {
  slug: string
  name: string
  city: string | null
  address: string | null
  specialty: string | null
  dbId: string | null
  email: string | null
  status: 'unclaimed' | 'invited' | 'active'
  is_verified: boolean
  bikeCount: number
  is_unclaimed: boolean
}

interface Props {
  builders: BuilderRow[]
}

export default function AdminBuilderClient({ builders }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('alle')
  const [deleteTarget, setDeleteTarget] = useState<BuilderRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [emailTarget, setEmailTarget] = useState<BuilderRow | null>(null)
  const [emailValue, setEmailValue] = useState('')
  const [assigningEmail, setAssigningEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    if (!deleteTarget?.dbId) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/admin/werkstatt', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: deleteTarget.dbId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? 'Fehler beim Loeschen')
        setDeleting(false)
        return
      }
      setDeleting(false)
      setDeleteTarget(null)
      router.refresh()
    } catch {
      setDeleteError('Netzwerkfehler')
      setDeleting(false)
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

    if (!res.ok) {
      setAssigningEmail(false)
      setEmailError(data.error ?? 'Fehler beim Zuweisen')
      return
    }

    setAssigningEmail(false)
    setEmailTarget(null)
    setEmailValue('')
    router.refresh()
  }

  const [resendingId, setResendingId] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState<Set<string>>(new Set())

  async function handleResendInvite(profileId: string) {
    setResendingId(profileId)
    const result = await resendInvitation(profileId)
    setResendingId(null)
    if (result.success) {
      setResendSuccess(prev => new Set(prev).add(profileId))
    }
  }

  const filtered = filter === 'alle'
    ? builders
    : builders.filter(b => b.status === filter)

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'alle',      label: 'Alle' },
    { value: 'active',    label: 'Aktiv' },
    { value: 'invited',   label: 'Eingeladen' },
    { value: 'unclaimed', label: 'Nicht zugewiesen' },
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
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden md:table-cell">Standort</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden sm:table-cell">Bikes</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden md:table-cell">E-Mail</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Status</th>
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
                    <span className="text-xs text-[#222222]/50 truncate max-w-[200px] block">{b.address ?? b.city ?? '—'}</span>
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
                    <span className="text-xs text-[#222222]/50 truncate max-w-[160px] block">{b.email ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {b.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <BadgeCheck size={10} /> Aktiv
                      </span>
                    ) : b.status === 'invited' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Mail size={10} /> Eingeladen
                      </span>
                    ) : (
                      <span className="text-xs text-[#222222]/20">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {b.status === 'unclaimed' && (
                        <button
                          onClick={() => { setEmailTarget(b); setEmailValue(''); setEmailError(null) }}
                          className="inline-flex items-center gap-1 text-xs text-amber-500/80 hover:text-amber-600 border border-amber-400/20 hover:border-amber-400/40 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                          <Mail size={10} /> Mail zuweisen
                        </button>
                      )}
                      {b.status === 'invited' && b.dbId && (
                        resendSuccess.has(b.dbId) ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500 px-3 py-1.5 whitespace-nowrap">
                            <Mail size={10} /> Gesendet
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResendInvite(b.dbId!)}
                            disabled={resendingId === b.dbId}
                            className="inline-flex items-center gap-1 text-xs text-amber-500/80 hover:text-amber-600 border border-amber-400/20 hover:border-amber-400/40 px-3 py-1.5 rounded-full transition-all whitespace-nowrap disabled:opacity-50"
                          >
                            <Mail size={10} />
                            {resendingId === b.dbId ? 'Sende…' : 'Erneut einladen'}
                          </button>
                        )
                      )}
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
                    Keine Werkstätten gefunden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null) }}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Möchtest Du die Custom Werkstatt „${deleteTarget?.name}" wirklich löschen?`}
        description={deleteError ? undefined : 'Alle Bikes, Medien und der Account werden unwiderruflich gelöscht.'}
        error={deleteError ?? undefined}
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
                {assigningEmail ? 'Wird zugewiesen…' : 'Zuweisen & einladen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
