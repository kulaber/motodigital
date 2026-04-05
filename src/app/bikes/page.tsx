import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import type { Build } from '@/lib/data/builds'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import BikesClient from './BikesClient'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 1800 // ISR: revalidate every 30 minutes

export const metadata: Metadata = {
  title: 'Custom Bikes kaufen — MotoDigital',
  description: 'Kaufe und verkaufe handgefertigte Custom Motorcycles — Cafe Racer, Bobber, Scrambler, Tracker und Chopper aus ganz Europa.',
}

const STYLE_LABELS: Record<string, string> = {
  naked: 'Naked', cafe_racer: 'Cafe Racer', bobber: 'Bobber',
  scrambler: 'Scrambler', tracker: 'Tracker', chopper: 'Chopper',
  street: 'Street', enduro: 'Enduro', other: 'Basis-Bike',
}

export default async function BikesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  // Fetch all active bikes with seller profile via JOIN (single query instead of two)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from('bikes') as any)
    .select('id, title, make, model, year, style, city, price, created_at, seller_id, slug, view_count, listing_type, price_amount, price_on_request, bike_images(id, url, is_cover, position, media_type, thumbnail_url), profiles!seller_id(full_name, role, address)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbBuilds: Build[] = (rows ?? []).map((r: any) => {
    const images: { url: string; is_cover: boolean; position: number }[] = r.bike_images ?? []
    const cover = images.find((i: any) => i.is_cover)?.url ?? images.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? ''
    const profile = r.profiles
    // Extract city + country from address like "Street, 20459 Hamburg, Deutschland" or "Berlin, Deutschland" or "Bielefeld, NRW, Deutschland"
    const addressParts = (profile?.address as string | null)?.split(',').map((s: string) => s.trim()) ?? []
    const sellerCountry = addressParts.length >= 2 ? addressParts[addressParts.length - 1] : ''
    let sellerCity = ''
    if (addressParts.length >= 3) {
      // "Street, PLZ Stadt, Land" → take second-to-last, strip PLZ
      // "Stadt, Bundesland, Land" → take first part
      const secondToLast = addressParts[addressParts.length - 2]
      const stripped = secondToLast.replace(/^\d{4,5}\s+/, '')
      // If second-to-last had a PLZ, it's "PLZ Stadt" → use stripped as city
      // Otherwise it's likely a state/region → use first part as city
      sellerCity = secondToLast !== stripped ? stripped : addressParts[0].replace(/^\d{4,5}\s+/, '')
    } else if (addressParts.length === 2) {
      sellerCity = addressParts[0]
    }
    return {
      slug:          r.id,
      href:          `/custom-bike/${r.slug ?? generateBikeSlug(r.title, r.id)}`,
      title:         r.title,
      tagline:       '',
      style:         STYLE_LABELS[r.style] ?? r.style,
      base:          `${r.make} ${r.model}`,
      year:          r.year,
      price:         r.price ? `€ ${Number(r.price).toLocaleString('de-DE')}` : '',
      city:          sellerCity || r.city || '',
      country:       sellerCountry || 'Deutschland',
      verified:      false,
      buildYear:     r.year,
      buildDuration: '',
      description:   '',
      modifications: [],
      engine:        '',
      displacement:  '',
      builder:       { name: profile?.full_name ?? '', slug: '', initials: '', city: '', specialty: '', verified: false },
      coverImg:      cover,
      images:        images.map((i: any) => i.url),
      publishedAt:   r.created_at,
      role:          profile?.role ?? 'rider',
      viewCount:     r.view_count ?? 0,
      listingType:   r.listing_type ?? 'showcase',
      priceAmount:   r.price_amount ?? null,
      priceOnRequest: r.price_on_request ?? false,
    }
  })

  const allBuilds = dbBuilds

  return (
    <div className="min-h-screen bg-white text-[#222222] overflow-x-clip" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="bikes" />

      {/* PAGE HEADER */}
      <div className="pt-6 pb-4 px-4 sm:px-5 lg:hidden">
        <h1 className="text-xl font-bold text-[#222222] text-center">Custom Bikes</h1>
      </div>

      <BikesClient builds={allBuilds} isLoggedIn={isLoggedIn} />

      <Footer />
    </div>
  )
}
