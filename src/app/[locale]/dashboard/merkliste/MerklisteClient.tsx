'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { Star, Bike, ChevronRight, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

export type SavedBikeItem = {
  bike_id: string
  title: string
  slug: string | null
  make: string
  model: string
  year: number
  price: number | null
  status: string
  coverImg: string | null
  sellerName: string | null
}

export type SavedBuilderItem = {
  builder_id: string
  name: string
  slug: string | null
  city: string | null
  specialty: string | null
  is_verified: boolean
  coverImg: string | null
}

interface Props {
  savedBikes: SavedBikeItem[]
  savedBuilders: SavedBuilderItem[]
  activeTab: 'bikes' | 'werkstatt'
}

function DeleteModal({ onClose, onConfirm, loading, title }: {
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  title: string
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#222222]/30 hover:text-[#222222] transition-colors">
          <X size={16} />
        </button>
        <p className="text-sm font-semibold text-[#222222] mb-2">Aus Merkliste entfernen?</p>
        <p className="text-xs text-[#222222]/40 mb-5">{title}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-sm font-semibold py-2.5 rounded-xl border border-[#222222]/10 text-[#222222]/60 hover:text-[#222222] transition-colors">
            Abbrechen
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 text-sm font-semibold py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
            {loading ? 'Wird entfernt...' : 'Entfernen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MerklisteClient({ savedBikes, savedBuilders, activeTab }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [bikes, setBikes] = useState(savedBikes)
  const [builders, setBuilders] = useState(savedBuilders)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'bike' | 'builder'; id: string; title: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)

    if (deleteTarget.type === 'bike') {
      await (supabase.from('saved_bikes') as any).delete().eq('bike_id', deleteTarget.id)
      setBikes(prev => prev.filter(b => b.bike_id !== deleteTarget.id))
    } else {
      await (supabase.from('saved_builders') as any).delete().eq('builder_id', deleteTarget.id)
      setBuilders(prev => prev.filter(b => b.builder_id !== deleteTarget.id))
    }

    setDeleteLoading(false)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title={deleteTarget.title}
        />
      )}

      {/* ── Custom Bikes Tab ── */}
      {activeTab === 'bikes' && (
        <>
          {bikes.length === 0 ? (
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-12 text-center">
              <Star size={28} className="mx-auto text-[#222222]/15 mb-3" />
              <p className="text-sm font-semibold text-[#222222]/40 mb-1">Noch keine Bikes gespeichert</p>
              <p className="text-xs text-[#222222]/25 mb-5">Entdecke Custom Bikes und speichere sie fur spater.</p>
              <Link href="/bikes" className="inline-flex items-center gap-2 text-sm font-semibold bg-[#06a5a5] text-white px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all">
                Custom Bikes entdecken
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bikes.map(bike => {
                const isUnavailable = bike.status !== 'active'
                return (
                  <div key={bike.bike_id} className="relative group">
                    <Link
                      href={isUnavailable ? '#' : `/custom-bike/${bike.slug ?? generateBikeSlug(bike.title, bike.bike_id)}`}
                      className={`block bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/6 ${isUnavailable ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                        {bike.coverImg ? (
                          <Image src={bike.coverImg} alt={bike.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10">
                            <Bike size={36} />
                          </div>
                        )}
                        {bike.status === 'sold' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Verkauft</span>
                          </div>
                        )}
                        {bike.status === 'draft' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Nicht mehr verfugbar</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-[#222222] leading-snug mb-1 line-clamp-1 group-hover:text-[#06a5a5] transition-colors">
                          {bike.title}
                        </p>
                        <p className="text-xs text-[#222222]/40 mb-2">{bike.make} {bike.model} · {bike.year}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#222222]">
                            {bike.price ? formatPrice(bike.price) : '—'}
                          </span>
                          <ChevronRight size={13} className="text-[#222222]/20 group-hover:text-[#06a5a5] transition-colors" />
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget({ type: 'bike', id: bike.bike_id, title: bike.title })}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#222222]/30 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                      title="Aus Merkliste entfernen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Custom-Werkstatt Tab ── */}
      {activeTab === 'werkstatt' && (
        <>
          {builders.length === 0 ? (
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-12 text-center">
              <Star size={28} className="mx-auto text-[#222222]/15 mb-3" />
              <p className="text-sm font-semibold text-[#222222]/40 mb-1">Noch keine Werkstatten gespeichert</p>
              <p className="text-xs text-[#222222]/25 mb-5">Entdecke Custom-Werkstatten und speichere sie fur spater.</p>
              <Link href="/custom-werkstatt" className="inline-flex items-center gap-2 text-sm font-semibold bg-[#06a5a5] text-white px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all">
                Werkstatten entdecken
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {builders.map(builder => {
                const initials = builder.name.charAt(0).toUpperCase()
                return (
                  <div key={builder.builder_id} className="relative group">
                    <Link
                      href={builder.slug ? `/custom-werkstatt/${builder.slug}` : '/custom-werkstatt'}
                      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/8 transition-all duration-300 flex flex-col sm:flex-row sm:items-stretch"
                    >
                      {/* Cover image */}
                      <div className="relative aspect-[16/9] sm:aspect-auto sm:w-40 md:w-48 flex-shrink-0 bg-[#EBEBEB] overflow-hidden">
                        {builder.coverImg ? (
                          <Image src={builder.coverImg} alt={builder.name} fill sizes="192px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#222222]/15">
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 px-4 sm:px-6 py-4 sm:py-5 min-w-0">
                        <div className="flex items-start gap-2 mb-auto">
                          <div className="min-w-0">
                            <p className="font-bold text-[#222222] leading-snug line-clamp-1 text-base group-hover:text-[#06a5a5] transition-colors">
                              {builder.name}
                            </p>
                            {(builder.city || builder.specialty) && (
                              <p className="text-xs text-[#222222]/40 mt-1 font-medium">
                                {[builder.city, builder.specialty].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                          {builder.is_verified && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#06a5a5]/10 text-[#06a5a5] border border-[#06a5a5]/20 flex-shrink-0 mt-0.5">
                              Verifiziert
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#222222]/40 border border-[#222222]/10 px-4 py-2 rounded-full group-hover:border-[#06a5a5]/30 group-hover:text-[#06a5a5] transition-all">
                            Profil ansehen <ChevronRight size={11} />
                          </span>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget({ type: 'builder', id: builder.builder_id, title: builder.name })}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#222222]/30 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                      title="Aus Merkliste entfernen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
