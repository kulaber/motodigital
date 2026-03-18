import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDS } from '@/lib/data/builds'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Custom Motorcycle Brands — MotoDigital',
  description: 'Browse custom motorcycles by brand. Honda, BMW, Harley-Davidson, Yamaha, Triumph, Kawasaki, Suzuki and more.',
}

const BRANDS = [
  { slug: 'honda',           name: 'Honda',           keywords: ['Honda'] },
  { slug: 'bmw',             name: 'BMW',              keywords: ['BMW'] },
  { slug: 'harley-davidson', name: 'Harley-Davidson',  keywords: ['H-D', 'Harley'] },
  { slug: 'yamaha',          name: 'Yamaha',           keywords: ['Yamaha'] },
  { slug: 'triumph',         name: 'Triumph',          keywords: ['Triumph'] },
  { slug: 'kawasaki',        name: 'Kawasaki',         keywords: ['Kawasaki'] },
  { slug: 'suzuki',          name: 'Suzuki',           keywords: ['Suzuki'] },
  { slug: 'norton',          name: 'Norton',           keywords: ['Norton'] },
  { slug: 'moto-guzzi',      name: 'Moto Guzzi',       keywords: ['Moto Guzzi'] },
]

export default function BrandIndexPage() {
  const brandsWithCount = BRANDS.map(brand => {
    const count = BUILDS.filter(b =>
      brand.keywords.some(kw => b.base.toLowerCase().includes(kw.toLowerCase()))
    ).length
    return { ...brand, count }
  }).filter(b => b.count > 0)

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />

      <section className="pt-28 pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <Breadcrumbs crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Marken' },
          ]} />

          <div className="mt-6">
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-3">Marken</p>
            <h1 className="font-bold text-[#222222] leading-tight mb-3" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
              Custom Motorcycle Brands
            </h1>
            <p className="text-[#222222]/40 text-sm max-w-lg leading-relaxed">
              Entdecke handgefertigte Custom Bikes nach Hersteller — finde deine bevorzugte Basis.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brandsWithCount.map(brand => (
              <Link
                key={brand.slug}
                href={`/brand/${brand.slug}`}
                className="group bg-white border border-[#222222]/6 hover:border-[#DDDDDD]/25 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
              >
                {/* Logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-[#222222]/10 border border-[#DDDDDD]/15 flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-[#717171]">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#222222] mb-1">{brand.name}</p>
                <p className="text-xs text-[#222222]/35">{brand.count} {brand.count === 1 ? 'Build' : 'Builds'}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
