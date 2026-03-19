import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { Plus, Bike } from 'lucide-react'
import type { Database } from '@/types/database'
import BikeCardActions from './DeleteBikeButton'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type BikeImageRow = Database['public']['Tables']['bike_images']['Row']
type MyBike = Pick<BikeRow, 'id' | 'title' | 'make' | 'model' | 'year' | 'created_at'> & {
  slug?: string | null
  bike_images: Pick<BikeImageRow, 'url' | 'is_cover'>[]
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Custom Bikes — MotoDigital' }
}

export default async function MeinBikePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role').eq('id', user.id).maybeSingle()
  const role = profile?.role as string | null
  if (role !== 'custom-werkstatt' && role !== 'rider') redirect('/dashboard')

  const isWerkstatt = role === 'custom-werkstatt'

  const { data: bikes } = await supabase
    .from('bikes')
    .select('id, slug, title, make, model, year, created_at, bike_images(url, is_cover)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false }) as unknown as { data: MyBike[] | null }

  const myBikes = bikes ?? []

  const pageTitle    = isWerkstatt ? 'Custom Bikes' : 'Mein Bike'
  const pageSubtitle = isWerkstatt ? 'Deine Projekte — werden auf MotoDigital gelistet' : 'Dein persönliches Custom Bike'
  const addHref      = isWerkstatt ? '/bikes/new' : '/dashboard/meine-custom-bikes/neu'
  const emptyText    = isWerkstatt ? 'Noch kein Projekt eingetragen' : 'Noch kein Bike eingetragen'
  const emptyHint    = isWerkstatt ? 'Füge deine Custom Bike Projekte hinzu.' : 'Zeig der Community dein Custom Bike.'

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#222222]/15">/</span>
          <span className="text-xs text-[#222222]/60 font-medium">{pageTitle}</span>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#222222]">{pageTitle}</h1>
            <p className="text-sm text-[#222222]/35 mt-0.5">{pageSubtitle}</p>
          </div>
          <Link
            href={addHref}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
          >
            <Plus size={14} />
            {isWerkstatt ? 'Projekt hinzufügen' : 'Bike hinzufügen'}
          </Link>
        </div>

        {/* Empty state */}
        {myBikes.length === 0 ? (
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F7F7] border border-[#222222]/8 flex items-center justify-center mx-auto mb-4">
              <Bike size={24} className="text-[#222222]/20" />
            </div>
            <p className="text-sm font-semibold text-[#222222]/40 mb-1">{emptyText}</p>
            <p className="text-xs text-[#222222]/25 mb-6 max-w-[30ch] mx-auto">{emptyHint}</p>
            <Link
              href={addHref}
              className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
            >
              <Plus size={14} />
              {isWerkstatt ? 'Projekt hinzufügen' : 'Bike hinzufügen'}
            </Link>
          </div>
        ) : (
          <div className={isWerkstatt
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
          }>
            {myBikes.map(bike => {
              const coverImg = bike.bike_images?.find(i => i.is_cover)?.url ?? bike.bike_images?.[0]?.url

              return (
                <div key={bike.id} className="group bg-white border border-[#222222]/6 hover:border-[#222222]/18 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/6">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F7]">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={bike.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike size={32} className="text-[#222222]/10" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-[#222222] leading-snug mb-1 line-clamp-1">
                      {bike.title}
                    </p>
                    <p className="text-xs text-[#222222]/40 mb-4">
                      {bike.make} {bike.model} · {bike.year}
                    </p>
                    <BikeCardActions
                      bikeId={bike.id}
                      editHref={isWerkstatt ? `/bikes/${bike.id}/edit` : `/dashboard/meine-custom-bikes/${bike.id}/edit`}
                      viewHref={isWerkstatt ? `/custom-bike/${bike.slug ?? generateBikeSlug(bike.title, bike.id)}` : undefined}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
