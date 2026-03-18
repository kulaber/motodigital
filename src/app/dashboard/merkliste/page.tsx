import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { Star, Bike, Wrench, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

export const metadata: Metadata = { title: 'Merkliste — MotoDigital' }

type SavedBike = {
  bike_id: string
  created_at: string
  bikes: {
    id: string
    slug: string | null
    title: string
    price: number | null
    make: string
    model: string
    year: number
    status: string
    bike_images: { url: string; is_cover: boolean }[]
    profiles: { full_name: string | null; username: string } | null
  } | null
}

type SavedBuilder = {
  builder_id: string
  created_at: string
  builders: {
    id: string
    full_name: string | null
    username: string
    city: string | null
    specialty: string | null
    is_verified: boolean
    avatar_url: string | null
  } | null
}

export default async function MerklistePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const activeTab = params.tab === 'bikes' ? 'bikes' : 'werkstatt'

  const [savedBikesResult, savedBuildersResult] = await Promise.all([
    (supabase
      .from('saved_bikes')
      .select('bike_id, created_at, bikes(id, slug, title, price, make, model, year, status, bike_images(url, is_cover), profiles:seller_id(full_name, username))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: SavedBike[] | null }>),
    (supabase
      .from('saved_builders')
      .select('builder_id, created_at, builders:builder_id(id, full_name, username, city, specialty, is_verified, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: SavedBuilder[] | null }>),
  ])

  const savedBikes = savedBikesResult.data ?? []
  const savedBuilders = savedBuildersResult.data ?? []

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#222222]/15">/</span>
          <span className="text-xs text-[#222222]/60 font-medium">Merkliste</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#222222]">Merkliste</h1>
          <p className="text-sm text-[#222222]/35 mt-0.5">Gespeicherte Custom Bikes und Werkstätten</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link
            href="/dashboard/merkliste?tab=werkstatt"
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              activeTab === 'werkstatt'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#222222]/50 border-[#222222]/12 hover:border-[#222222]/30 hover:text-[#222222]/80'
            }`}
          >
            <Wrench size={13} />
            Custom Werkstatt
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'werkstatt' ? 'bg-white/20 text-white' : 'bg-[#222222]/8 text-[#222222]/40'
            }`}>
              {savedBuilders.length}
            </span>
          </Link>
          <Link
            href="/dashboard/merkliste?tab=bikes"
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              activeTab === 'bikes'
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#222222]/50 border-[#222222]/12 hover:border-[#222222]/30 hover:text-[#222222]/80'
            }`}
          >
            <Bike size={13} />
            Custom Bikes
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'bikes' ? 'bg-white/20 text-white' : 'bg-[#222222]/8 text-[#222222]/40'
            }`}>
              {savedBikes.length}
            </span>
          </Link>
        </div>

        {/* ── Custom Bikes Tab ── */}
        {activeTab === 'bikes' && (
          <>
            {savedBikes.length === 0 ? (
              <div className="bg-white border border-[#222222]/6 rounded-2xl p-12 text-center">
                <Star size={28} className="mx-auto text-[#222222]/15 mb-3" />
                <p className="text-sm font-semibold text-[#222222]/40 mb-1">Noch keine Bikes gespeichert</p>
                <p className="text-xs text-[#222222]/25 mb-5">Entdecke Custom Bikes und speichere sie für später.</p>
                <Link
                  href="/bikes"
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-[#06a5a5] text-white px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
                >
                  Custom Bikes entdecken
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savedBikes.map(entry => {
                  const bike = entry.bikes
                  if (!bike) return null
                  const coverImg = bike.bike_images?.find(i => i.is_cover)?.url ?? bike.bike_images?.[0]?.url
                  return (
                    <Link
                      key={entry.bike_id}
                      href={`/custom-bike/${bike.slug ?? generateBikeSlug(bike.title, bike.id)}`}
                      className="group block bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/6"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={bike.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          />
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
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Custom-Werkstatt Tab ── */}
        {activeTab === 'werkstatt' && (
          <>
            {savedBuilders.length === 0 ? (
              <div className="bg-white border border-[#222222]/6 rounded-2xl p-12 text-center">
                <Star size={28} className="mx-auto text-[#222222]/15 mb-3" />
                <p className="text-sm font-semibold text-[#222222]/40 mb-1">Noch keine Werkstätten gespeichert</p>
                <p className="text-xs text-[#222222]/25 mb-5">Entdecke Custom-Werkstätten und speichere sie für später.</p>
                <Link
                  href="/custom-werkstatt"
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-[#06a5a5] text-white px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
                >
                  Werkstätten entdecken
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBuilders.map(entry => {
                  const builder = entry.builders
                  if (!builder) return null
                  const initials = (builder.full_name ?? builder.username).charAt(0).toUpperCase()
                  const slug = (builder.full_name ?? builder.username)
                    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  return (
                    <Link
                      key={entry.builder_id}
                      href={`/custom-werkstatt/${slug}`}
                      className="group flex items-start gap-4 bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/6"
                    >
                      <div className="relative w-12 h-12 rounded-xl bg-[#222222]/8 border border-[#222222]/10 flex items-center justify-center text-base font-bold text-[#717171] flex-shrink-0 overflow-hidden">
                        {builder.avatar_url ? (
                          <Image src={builder.avatar_url} alt={builder.full_name ?? ''} fill sizes="48px" className="object-cover" />
                        ) : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-[#222222] truncate group-hover:text-[#06a5a5] transition-colors">
                            {builder.full_name ?? builder.username}
                          </p>
                          {builder.is_verified && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#06a5a5]/10 text-[#06a5a5] flex-shrink-0">
                              Verifiziert
                            </span>
                          )}
                        </div>
                        {(builder.city || builder.specialty) && (
                          <p className="text-xs text-[#222222]/40 truncate">
                            {[builder.city, builder.specialty].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-[#222222]/20 group-hover:text-[#06a5a5] transition-colors flex-shrink-0 mt-0.5" />
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
