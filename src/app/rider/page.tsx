import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthGate from './[slug]/AuthGate'
import { RIDERS, type Rider } from '@/lib/data/riders'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Rider — MotoDigital',
  description: 'Entdecke Rider aus der Custom-Motorrad-Community auf MotoDigital.',
}

interface RiderCard {
  slug: string
  name: string
  city: string
  style: string
  avatar?: string
  initials: string
  bike: string
}

function staticToCard(r: Rider): RiderCard {
  return {
    slug: r.slug,
    name: r.name,
    city: r.city,
    style: r.style,
    avatar: r.avatar,
    initials: r.initials,
    bike: r.bike,
  }
}

export default async function RiderOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <AuthGate />

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbRiders } = await (supabase.from('profiles') as any)
    .select('id, full_name, slug, username, city, avatar_url, tags')
    .eq('role', 'rider')
    .order('created_at', { ascending: false })
    .limit(50)

  const dbCards: RiderCard[] = (dbRiders ?? [])
    .filter((r: Record<string, unknown>) => r.slug || r.username || r.full_name)
    .map((r: Record<string, unknown>) => {
      const name = (r.full_name as string | null) ?? 'Unbekannt'
      const slug = (r.slug as string | null)
        ?? (r.username as string | null)
        ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const tags = (r.tags as string[] | null) ?? []
      return {
        slug,
        name,
        city: (r.city as string | null) ?? '',
        style: tags[0] ?? '',
        avatar: (r.avatar_url as string | null) ?? undefined,
        initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        bike: '',
      }
    })

  // Merge: DB riders first, then fill with static, deduplicate by slug
  const dbSlugs = new Set(dbCards.map(r => r.slug))
  const staticCards = RIDERS.filter(r => !dbSlugs.has(r.slug)).map(staticToCard)
  const allRiders = [...dbCards, ...staticCards]

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222]">
      <Header activePage="explore" />

      <section className="pt-10 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">Rider</h1>
          <p className="text-sm text-[#717171] mt-1">{allRiders.length} Rider in der Community</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRiders.map(rider => (
              <Link
                key={rider.slug}
                href={`/rider/${rider.slug}`}
                className="bg-white rounded-2xl border border-[#222222]/6 p-5 hover:border-[#222222]/15 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#06a5a5] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {rider.avatar ? (
                      <Image src={rider.avatar} alt={rider.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-sm font-bold text-white">{rider.initials}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate leading-tight">
                      {rider.name}
                    </p>
                    {rider.city && (
                      <p className="text-xs text-[#717171] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {rider.city}
                      </p>
                    )}
                  </div>
                </div>
                {(rider.style || rider.bike) && (
                  <div className="flex flex-wrap gap-1.5">
                    {rider.style && (
                      <span className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 rounded-full">
                        {rider.style}
                      </span>
                    )}
                    {rider.bike && (
                      <span className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] border border-[#EBEBEB] px-2 py-0.5 rounded-full truncate max-w-[180px]">
                        {rider.bike}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
