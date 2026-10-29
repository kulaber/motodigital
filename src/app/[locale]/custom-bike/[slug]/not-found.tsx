'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Header from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { isBikeId } from '@/lib/utils/bikeSlug'
import NotFound from '../../not-found'

type OwnBike = { id: string; title: string }

/**
 * Bike pages are cached for everyone, so unpublished bikes 404 here. Their
 * owner still lands on this URL (after saving a draft, from the garage), so
 * explain why instead of showing a dead end.
 */
export default function BikeNotFound() {
  const { slug } = useParams<{ slug: string }>()
  const { user, loading } = useAuth()
  const [lookup, setLookup] = useState<OwnBike | null | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    ;(supabase.from('bikes') as any)
      .select('id, title')
      .eq(isBikeId(slug) ? 'id' : 'slug', slug)
      .eq('seller_id', user.id)
      .maybeSingle()
      .then(({ data }: { data: OwnBike | null }) => setLookup(data))
  }, [user, slug])

  // undefined = still checking, null = not the owner (or signed out)
  const ownBike = loading ? undefined : user ? lookup : null

  // Still checking — render the header only, so owners don't see a 404 flash
  if (ownBike === undefined) return <Header />
  if (ownBike === null) return <NotFound />

  return (
    <>
      <Header />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2AABAB] mb-4">
          Entwurf
        </p>
        <h2 className="text-2xl font-bold text-[#222222] mb-2">{ownBike.title}</h2>
        <p className="text-[#717171] mb-6 max-w-md">
          Dieses Bike ist noch nicht veröffentlicht. Besucher sehen es erst, wenn du es veröffentlichst.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/bikes/${ownBike.id}/edit`}
            className="rounded-full bg-[#2AABAB] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2AABAB]/90"
          >
            Bike bearbeiten
          </Link>
          <Link
            href="/dashboard/meine-garage"
            className="rounded-full border border-[#DDDDDD] px-6 py-2.5 text-sm font-semibold text-[#222222] transition hover:border-[#222222]"
          >
            Meine Garage
          </Link>
        </div>
      </div>
    </>
  )
}
