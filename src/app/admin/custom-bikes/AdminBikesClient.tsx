'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, ExternalLink, Bike, Link2, X, Search, Crown, Trash2 } from 'lucide-react'
import { isPremium } from '@/lib/werkstatt-tier'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktiv', cls: 'bg-green-50 text-green-600 border-green-200' },
  draft:  { label: 'Entwurf', cls: 'bg-[#222222]/5 text-[#222222]/40 border-[#222222]/10' },
}

type RoleFilter = 'alle' | 'custom-werkstatt' | 'rider' | 'unassigned'

export type AdminBike = {
  id: string; title: string; make: string; model: string; year: number
  price: number; status: string; seller_id: string; workshop_id: string | null; slug: string | null
  coverUrl: string | null
  sellerName: string | null
  sellerRole: string | null
  listingType?: string
  priceAmount?: number | null
  priceOnRequest?: boolean
}

export type WorkshopAssignOption = {
  profileId: string
  workshopId: string | null
  name: string
  city: string | null
  tier: string
  bikeCount: number
}

interface Props {
  bikes: AdminBike[]
  workshops: WorkshopAssignOption[]
}

export default function AdminBikesClient({ bikes, workshops }: Props) {
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('alle')
  const [assignBike, setAssignBike] = useState<AdminBike | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignSearch, setAssignSearch] = useState('')
  const [deleteBike, setDeleteBike] = useState<AdminBike | null>(null)
  const [deleting, setDeleting] = useState(false)

  const unassignedCount = bikes.filter(b => b.sellerRole === 'superadmin' || !b.workshop_id && b.sellerRole !== 'rider').length

  const filtered = roleFilter === 'alle'
    ? bikes
    : roleFilter === 'unassigned'
    ? bikes.filter(b => b.sellerRole === 'superadmin' || (!b.workshop_id && b.sellerRole !== 'rider'))
    : bikes.filter(b => b.sellerRole === roleFilter)

  const filters: { value: RoleFilter; label: string; count?: number }[] = [
    { value: 'alle', label: 'Alle' },
    { value: 'custom-werkstatt', label: 'Werkstatt' },
    { value: 'rider', label: 'Rider' },
    { value: 'unassigned', label: 'Nicht zugeordnet', count: unassignedCount },
  ]

  const filteredWorkshops = useMemo(() => {
    if (!assignSearch.trim()) return workshops
    const q = assignSearch.toLowerCase()
    return workshops.filter(w =>
      w.name.toLowerCase().includes(q) || w.city?.toLowerCase().includes(q)
    )
  }, [workshops, assignSearch])

  async function handleAssign(workshop: WorkshopAssignOption) {
    if (!assignBike) return
    setAssigning(true)
    setAssignError(null)

    try {
      const res = await fetch('/api/admin/bikes/assign', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bike_id: assignBike.id,
          workshop_owner_id: workshop.profileId,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setAssignError(result.error ?? 'Fehler bei der Zuordnung')
        setAssigning(false)
        return
      }

      setAssignBike(null)
      setAssignSearch('')
      setAssigning(false)
      router.refresh()
    } catch {
      setAssignError('Netzwerkfehler')
      setAssigning(false)
    }
  }

  async function handleDelete() {
    if (!deleteBike) return
    setDeleting(true)

    try {
      const res = await fetch('/api/admin/bikes/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bike_id: deleteBike.id }),
      })

      if (!res.ok) {
        const result = await res.json()
        alert(result.error ?? 'Fehler beim Löschen')
        setDeleting(false)
        return
      }

      setDeleteBike(null)
      setDeleting(false)
      router.refresh()
    } catch {
      alert('Netzwerkfehler')
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mr-1">Nutzer</span>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              roleFilter === f.value
                ? f.value === 'unassigned' ? 'bg-amber-500 text-white border-amber-500' : 'bg-[#222222] text-white border-[#222222]'
                : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#222222]/25 hover:text-[#222222]'
            }`}
          >
            {f.label}{f.count !== undefined && f.count > 0 ? ` (${f.count})` : ''}
          </button>
        ))}
        {roleFilter !== 'alle' && (
          <span className="text-xs text-[#222222]/30 ml-2">{filtered.length} Ergebnisse</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222222]/6">
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Bike</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest hidden sm:table-cell">Besitzer</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Status</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]/5">
              {filtered.map(b => {
                const status = STATUS_LABELS[b.status] ?? STATUS_LABELS.draft
                const isUnassigned = b.sellerRole === 'superadmin' || (!b.workshop_id && b.sellerRole !== 'rider')
                const roleLabel = isUnassigned ? 'Nicht zugeordnet' : b.sellerRole === 'custom-werkstatt' ? 'Werkstatt' : 'Rider'
                const roleCls = isUnassigned
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : b.sellerRole === 'custom-werkstatt'
                  ? 'bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20'
                  : 'bg-[#222222]/6 text-[#222222]/50 border-[#222222]/10'

                return (
                  <tr key={b.id} className="hover:bg-[#222222]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {b.coverUrl ? (
                          <Image src={b.coverUrl} alt="" width={48} height={36} className="w-12 h-9 rounded-lg object-cover flex-shrink-0 border border-[#222222]/8" />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0 border border-[#222222]/8">
                            <Bike size={14} className="text-[#222222]/20" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#222222] truncate max-w-[220px]">{b.title}</p>
                          <p className="text-[10px] text-[#222222]/30">
                            {b.listingType === 'for_sale'
                              ? (b.priceOnRequest ? 'Preis auf Anfrage' : b.priceAmount ? `${Number(b.priceAmount).toLocaleString('de-DE')} EUR` : '—')
                              : 'Showcase'
                            } · {b.year}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <div>
                        <p className="text-xs text-[#222222]/60 truncate max-w-[140px]">{isUnassigned ? '—' : b.sellerName ?? '—'}</p>
                        <span className={`inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${roleCls}`}>
                          {roleLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {isUnassigned && (
                          <button
                            onClick={() => { setAssignBike(b); setAssignError(null); setAssignSearch('') }}
                            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 bg-amber-50 px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                          >
                            <Link2 size={10} /> Zuordnen
                          </button>
                        )}
                        <a
                          href={`/custom-bike/${b.slug ?? b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#222222]/40 hover:text-[#222222] border border-[#222222]/10 hover:border-[#222222]/25 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                          <ExternalLink size={10} /> Ansehen
                        </a>
                        <Link
                          href={`/bikes/${b.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs text-white bg-[#06a5a5] hover:bg-[#058f8f] px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                        >
                          <Pencil size={10} /> Bearbeiten
                        </Link>
                        <button
                          onClick={() => setDeleteBike(b)}
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#222222]/25">
                    Keine Custom Bikes gefunden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-bold text-[#222222] mb-2">Bike löschen?</h2>
            <p className="text-sm text-[#222222]/50 mb-1">
              <span className="font-medium text-[#222222]">{deleteBike.title}</span>
            </p>
            <p className="text-xs text-[#222222]/35 mb-5">
              {deleteBike.make} {deleteBike.model} · {deleteBike.year}
            </p>
            <p className="text-xs text-red-500 mb-6">
              Das Bike und alle zugehörigen Bilder werden unwiderruflich gelöscht.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteBike(null)}
                disabled={deleting}
                className="text-sm text-[#222222]/50 hover:text-[#222222] px-4 py-2 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full transition-all disabled:opacity-50"
              >
                <Trash2 size={12} />
                {deleting ? 'Wird gelöscht…' : 'Endgültig löschen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#222222]/6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-[#222222]">Werkstatt zuordnen</h2>
                <button
                  onClick={() => { setAssignBike(null); setAssignError(null) }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222222]/5 transition-colors"
                >
                  <X size={16} className="text-[#222222]/40" />
                </button>
              </div>
              <p className="text-xs text-[#222222]/40 truncate">
                {assignBike.title} · {assignBike.make} {assignBike.model}
              </p>
            </div>

            {/* Search */}
            <div className="px-6 pt-4">
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#222222]/25" />
                <input
                  value={assignSearch}
                  onChange={e => setAssignSearch(e.target.value)}
                  placeholder="Werkstatt suchen…"
                  className="w-full bg-[#F7F7F7] border border-[#222222]/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Error */}
            {assignError && (
              <div className="mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600 font-medium">{assignError}</p>
              </div>
            )}

            {/* Workshop list */}
            <div className="flex-1 overflow-y-auto px-6 py-3">
              {filteredWorkshops.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#222222]/25">Keine Werkstätten gefunden</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {filteredWorkshops.map(w => {
                    const isFreeAndFull = !isPremium(w.tier) && w.bikeCount >= 1
                    return (
                      <button
                        key={w.profileId}
                        type="button"
                        onClick={() => !isFreeAndFull && !assigning && handleAssign(w)}
                        disabled={isFreeAndFull || assigning}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                          isFreeAndFull
                            ? 'opacity-40 cursor-not-allowed bg-[#222222]/2'
                            : 'hover:bg-[#06a5a5]/5 cursor-pointer'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#222222] truncate">{w.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {w.city && <span className="text-[10px] text-[#222222]/30">{w.city}</span>}
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                              isPremium(w.tier)
                                ? 'bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20'
                                : 'bg-[#222222]/5 text-[#222222]/35 border-[#222222]/10'
                            }`}>
                              {w.tier === 'founding_partner' ? 'Founding' : w.tier.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#222222]/25">{w.bikeCount} Bike{w.bikeCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        {isFreeAndFull ? (
                          <span className="flex-shrink-0 flex items-center gap-1 text-[9px] font-semibold text-amber-500">
                            <Crown size={10} /> Limit
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-[10px] font-semibold text-[#06a5a5] opacity-0 group-hover:opacity-100">
                            Zuordnen
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-[#222222]/6">
              <p className="text-[10px] text-[#222222]/25 text-center">
                FREE-Werkstätten: max. 1 Bike · PRO / Founding Partner: unbegrenzt
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
