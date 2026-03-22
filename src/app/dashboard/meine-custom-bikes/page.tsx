import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Bike } from 'lucide-react'
import type { Database } from '@/types/database'
import BikeCardActions, { PublishToggle } from './DeleteBikeButton'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

type BikeRow = Database['public']['Tables']['bikes']['Row']
type BikeImageRow = Database['public']['Tables']['bike_images']['Row']
type MyBike = Pick<BikeRow, 'id' | 'title' | 'make' | 'model' | 'year' | 'created_at' | 'status'> & {
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
    .select('id, slug, title, make, model, year, status, created_at, bike_images(id, url, is_cover, position, media_type, thumbnail_url)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false }) as unknown as { data: MyBike[] | null }

  const myBikes = bikes ?? []

  const pageTitle    = isWerkstatt ? 'Custom Bikes' : 'Mein Bike'
  const pageSubtitle = isWerkstatt ? 'Deine Projekte — werden auf MotoDigital gelistet' : 'Dein persönliches Custom Bike'
  const addHref      = '/bikes/new'
  const emptyText    = 'Noch kein Custom Bike eingetragen'
  const emptyHint    = 'Füge dein Custom Bike hinzu und werde auf MotoDigital gelistet.'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#222222]">{pageTitle}</h1>
            <p className="text-xs sm:text-sm text-[#222222]/40 mt-1">{pageSubtitle}</p>
          </div>
          <Link
            href={addHref}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all self-start sm:self-auto"
          >
            <Plus size={14} />
            Bike hinzufügen
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
              Bike hinzufügen
            </Link>
          </div>
        ) : (
            <div className="flex flex-col gap-4">
            {myBikes.map(bike => {
              const coverImg = bike.bike_images?.find(i => i.is_cover)?.url ?? bike.bike_images?.[0]?.url

              return (
                <div key={bike.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/8 transition-all duration-300 flex flex-col sm:flex-row sm:items-stretch sm:min-h-[200px]">
                  {/* Cover */}
                  <div className="relative aspect-[16/9] sm:aspect-auto sm:w-52 md:w-64 flex-shrink-0 bg-[#EBEBEB] overflow-hidden">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={bike.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike size={28} className="text-[#222222]/15" />
                      </div>
                    )}
                  </div>

                  {/* Info + actions */}
                  <div className="flex flex-col flex-1 px-4 sm:px-6 py-4 sm:py-5 min-w-0">
                    {/* Top row: title + toggle */}
                    <div className="flex items-start justify-between gap-4 mb-auto">
                      <div className="min-w-0">
                        <p className="font-bold text-[#222222] leading-snug line-clamp-1 text-base">{bike.title}</p>
                        <p className="text-xs text-[#222222]/40 mt-1 font-medium">{bike.make} {bike.model} · {bike.year}</p>
                      </div>
                      <PublishToggle bikeId={bike.id} initialStatus={bike.status} />
                    </div>
                    {/* Bottom row: action buttons */}
                    <div className="mt-5">
                      <BikeCardActions
                        bikeId={bike.id}
                        editHref={`/bikes/${bike.id}/edit`}
                        viewHref={`/custom-bike/${bike.slug ?? generateBikeSlug(bike.title, bike.id)}`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
