import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { Shield, Plus } from 'lucide-react'
import AdminBikesClient, { type AdminBike, type WorkshopAssignOption } from './AdminBikesClient'

export const metadata: Metadata = { title: 'Admin — Custom Bikes' }

export const dynamic = 'force-dynamic'

export default async function AdminCustomBikesPage() {
  const supabase = await createClient()

  // Fetch all bikes (all statuses)
  const { data: bikes } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, price, status, created_at, seller_id, workshop_id, slug, listing_type, price_amount, price_on_request, bike_images(url, is_cover, position)')
    .order('created_at', { ascending: false }) as {
      data: {
        id: string; title: string; make: string; model: string; year: number
        price: number; status: string; created_at: string
        seller_id: string; workshop_id: string | null; slug: string | null
        listing_type?: string; price_amount?: number | null; price_on_request?: boolean
        bike_images: { url: string; is_cover: boolean }[]
      }[] | null
    }

  // Fetch seller profiles
  const sellerIds = [...new Set((bikes ?? []).map(b => b.seller_id))]
  const { data: profiles } = sellerIds.length > 0
    ? await (supabase.from('profiles') as any)
        .select('id, full_name, role')
        .in('id', sellerIds) as { data: { id: string; full_name: string | null; role: string }[] | null }
    : { data: [] as { id: string; full_name: string | null; role: string }[] }

  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))

  // Fetch all workshops with subscription tier for assignment options
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: workshopProfiles } = await (admin.from('profiles') as any)
    .select('id, full_name, username, city')
    .eq('role', 'custom-werkstatt')
    .order('full_name') as {
      data: { id: string; full_name: string | null; username: string | null; city: string | null }[] | null
    }

  const { data: workshopRecords } = await admin
    .from('workshops')
    .select('id, owner_id, subscription_tier')

  const workshopByOwner = new Map(
    (workshopRecords ?? []).map((w: { id: string; owner_id: string; subscription_tier: string | null }) => [w.owner_id, w])
  )

  // Count bikes per seller
  const bikeCountBySeller = new Map<string, number>()
  for (const b of bikes ?? []) {
    bikeCountBySeller.set(b.seller_id, (bikeCountBySeller.get(b.seller_id) ?? 0) + 1)
  }

  const workshopOptions: WorkshopAssignOption[] = (workshopProfiles ?? []).map(p => {
    const ws = workshopByOwner.get(p.id)
    return {
      profileId: p.id,
      workshopId: ws?.id ?? null,
      name: p.full_name ?? p.username ?? 'Unbenannt',
      city: p.city ?? null,
      tier: ws?.subscription_tier ?? 'free',
      bikeCount: bikeCountBySeller.get(p.id) ?? 0,
    }
  })

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
      workshop_id: b.workshop_id,
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

      <AdminBikesClient bikes={allBikes} workshops={workshopOptions} />

    </div>
  )
}
