import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Shield, Plus } from 'lucide-react'
import AdminBikesClient, { type AdminBike } from './AdminBikesClient'

export const metadata: Metadata = { title: 'Admin — Custom Bikes' }

export default async function AdminCustomBikesPage() {
  const supabase = await createClient()

  // Fetch all bikes (all statuses)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bikes } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, price, status, created_at, seller_id, slug, listing_type, price_amount, price_on_request, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
    .order('created_at', { ascending: false }) as {
      data: {
        id: string; title: string; make: string; model: string; year: number
        price: number; status: string; created_at: string
        seller_id: string; slug: string | null
        listing_type?: string; price_amount?: number | null; price_on_request?: boolean
        bike_images: { url: string; is_cover: boolean }[]
      }[] | null
    }

  // Fetch seller profiles
  const sellerIds = [...new Set((bikes ?? []).map(b => b.seller_id))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = sellerIds.length > 0
    ? await (supabase.from('profiles') as any)
        .select('id, full_name, role')
        .in('id', sellerIds) as { data: { id: string; full_name: string | null; role: string }[] | null }
    : { data: [] as { id: string; full_name: string | null; role: string }[] }

  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))

  const allBikes: AdminBike[] = (bikes ?? []).map(b => {
    const seller = profileById.get(b.seller_id)
    const cover = b.bike_images?.find(i => i.is_cover)?.url ?? b.bike_images?.[0]?.url ?? null
    return {
      id: b.id,
      title: b.title,
      make: b.make,
      model: b.model,
      year: b.year,
      price: b.price,
      status: b.status,
      seller_id: b.seller_id,
      slug: b.slug,
      coverUrl: cover,
      sellerName: seller?.full_name ?? null,
      sellerRole: seller?.role ?? null,
      listingType: b.listing_type ?? 'showcase',
      priceAmount: b.price_amount ?? null,
      priceOnRequest: b.price_on_request ?? false,
    }
  })

  const activeCount = allBikes.filter(b => b.status === 'active').length
  const draftCount = allBikes.filter(b => b.status === 'draft').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-amber-400" />
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">Custom Bikes</h1>
        </div>
        <Link
          href="/admin/custom-bikes/neu"
          className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
        >
          <Plus size={14} /> Neues Bike
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Bikes gesamt', value: allBikes.length },
          { label: 'Aktiv',        value: activeCount },
          { label: 'Entwurf',      value: draftCount },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#222222]/6 rounded-2xl p-4">
            <p className="text-2xl font-bold text-[#222222]">{s.value}</p>
            <p className="text-xs text-[#222222]/35 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <AdminBikesClient bikes={allBikes} />

    </div>
  )
}
