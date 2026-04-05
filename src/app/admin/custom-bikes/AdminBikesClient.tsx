'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, ExternalLink, Bike } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: 'Aktiv', cls: 'bg-green-50 text-green-600 border-green-200' },
  draft:  { label: 'Entwurf', cls: 'bg-[#222222]/5 text-[#222222]/40 border-[#222222]/10' },
}

type RoleFilter = 'alle' | 'custom-werkstatt' | 'rider'

export type AdminBike = {
  id: string; title: string; make: string; model: string; year: number
  price: number; status: string; seller_id: string; slug: string | null
  coverUrl: string | null
  sellerName: string | null
  sellerRole: string | null
  listingType?: string
  priceAmount?: number | null
  priceOnRequest?: boolean
}

interface Props {
  bikes: AdminBike[]
}

export default function AdminBikesClient({ bikes }: Props) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('alle')

  const filtered = roleFilter === 'alle'
    ? bikes
    : bikes.filter(b => b.sellerRole === roleFilter)

  const filters: { value: RoleFilter; label: string }[] = [
    { value: 'alle', label: 'Alle' },
    { value: 'custom-werkstatt', label: 'Werkstatt' },
    { value: 'rider', label: 'Rider' },
  ]

  return (
    <>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mr-1">Nutzer</span>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              roleFilter === f.value
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#222222]/25 hover:text-[#222222]'
            }`}
          >
            {f.label}
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
                const roleLabel = b.sellerRole === 'custom-werkstatt' ? 'Werkstatt' : 'Rider'
                const roleCls = b.sellerRole === 'custom-werkstatt'
                  ? 'bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20'
                  : 'bg-[#222222]/6 text-[#222222]/50 border-[#222222]/10'

                return (
                  <tr key={b.id} className="hover:bg-[#222222]/2 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {b.coverUrl ? (
                          <img src={b.coverUrl} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0 border border-[#222222]/8" />
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
                        <p className="text-xs text-[#222222]/60 truncate max-w-[140px]">{b.sellerName ?? '—'}</p>
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
    </>
  )
}
