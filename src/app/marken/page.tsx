import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Custom Motorrad Marken — Honda, BMW, Triumph & mehr | MotoDigital',
  description: 'Entdecke Custom Builds nach Marke — Honda CB750, BMW R nineT, Triumph Bonneville, Harley-Davidson Sportster und viele mehr. Jetzt auf MotoDigital.',
}

// Group brands by country for display
const COUNTRY_ORDER = ['Japan', 'Deutschland', 'Grossbritannien', 'USA', 'Italien', 'Indien', 'Oesterreich', 'Schweden', 'Spanien']
const COUNTRY_LABELS: Record<string, string> = {
  'Japan': 'Japan',
  'Deutschland': 'Deutschland',
  'Grossbritannien': 'Grossbritannien',
  'USA': 'USA',
  'Italien': 'Italien',
  'Indien': 'Indien',
  'Oesterreich': 'Oesterreich',
  'Schweden': 'Schweden',
  'Spanien': 'Spanien',
}

export default async function MarkenPage() {
  const supabase = await createClient()

  // Fetch all brands with model count
  const { data: brands } = await (supabase.from('base_bike_brands') as any)
    .select('id, name, slug, country, founded, description')
    .order('name')

  // Fetch model counts per brand
  const { data: baseBikes } = await (supabase.from('base_bikes') as any)
    .select('brand_id')

  const modelCountByBrand: Record<string, number> = {}
  for (const bike of baseBikes ?? []) {
    if (bike.brand_id) {
      modelCountByBrand[bike.brand_id] = (modelCountByBrand[bike.brand_id] ?? 0) + 1
    }
  }

  // Fetch active bike counts per make (for build counts)
  const { data: dbBikes } = await (supabase.from('bikes') as any)
    .select('make')
    .eq('status', 'active')

  const buildCountByMake: Record<string, number> = {}
  for (const bike of dbBikes ?? []) {
    const make = (bike.make ?? '').toLowerCase()
    if (make) buildCountByMake[make] = (buildCountByMake[make] ?? 0) + 1
  }

  // Group brands by country
  const brandsByCountry: Record<string, typeof brands> = {}
  for (const brand of brands ?? []) {
    const country = brand.country ?? 'Sonstige'
    if (!brandsByCountry[country]) brandsByCountry[country] = []
    brandsByCountry[country].push(brand)
  }

  const sortedCountries = COUNTRY_ORDER.filter(c => brandsByCountry[c]?.length)
  // Add any countries not in our predefined order
  for (const country of Object.keys(brandsByCountry)) {
    if (!sortedCountries.includes(country)) sortedCountries.push(country)
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pt-12 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#717171] mb-3">Custom Motorrad Marken</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight leading-tight mb-3">
          Finde Builds nach Marke
        </h1>
        <p className="text-sm text-[#717171] max-w-xl">
          Von Honda bis Harley-Davidson — entdecke Custom Bikes nach Hersteller und finde die passende Custom Werkstatt fuer deinen Umbau.
        </p>
      </div>

      {/* Grid grouped by country */}
      <section className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-10">
        {sortedCountries.map(country => (
          <div key={country} className="mb-12">
            <h2 className="text-sm font-semibold text-[#717171] uppercase tracking-widest mb-5">
              {COUNTRY_LABELS[country] ?? country}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(brandsByCountry[country] ?? []).map((brand: any) => {
                const modelCount = modelCountByBrand[brand.id] ?? 0
                const buildCount = buildCountByMake[brand.name.toLowerCase()] ?? 0

                return (
                  <Link
                    key={brand.slug}
                    href={`/marken/${brand.slug}`}
                    className="group bg-white border border-[#EBEBEB] hover:border-[#DDDDDD] hover:shadow-md rounded-2xl p-6 transition-all duration-200"
                  >
                    {/* Brand logo */}
                    <div className="h-14 flex items-center mb-4">
                      <Image
                        src={`/brands/${brand.slug}.svg`}
                        alt={brand.name}
                        width={160}
                        height={56}
                        className="h-12 w-auto max-w-[140px] object-contain"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-[#222222] tracking-tight">{brand.name}</h3>
                      <span className="text-[10px] font-medium text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-full flex-shrink-0">
                        {brand.country}
                      </span>
                    </div>

                    {brand.description && (
                      <p className="text-xs text-[#717171] leading-relaxed mb-4 line-clamp-2">
                        {brand.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-[#717171]">
                        {modelCount} {modelCount === 1 ? 'Modell' : 'Modelle'}
                      </span>
                      {buildCount > 0 && (
                        <span className="text-[10px] font-semibold text-[#06a5a5]">{buildCount} {buildCount === 1 ? 'Build' : 'Builds'}</span>
                      )}
                    </div>

                    <p className="mt-4 text-[10px] font-semibold text-[#06a5a5] group-hover:text-[#058f8f] transition-colors">
                      Alle {brand.name} Modelle →
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  )
}
