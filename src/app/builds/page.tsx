import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, SlidersHorizontal } from 'lucide-react'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Builds',
  description: 'Alle Custom Motorrad Builds auf MotoDigital — handgefertigte Unikate aus der Community.',
}

const STYLES = ['Alle', 'Cafe Racer', 'Bobber', 'Scrambler', 'Tracker', 'Chopper', 'Street', 'Enduro']

const BUILDS = [
  { title: 'The Midnight Scrambler', style: 'Cafe Racer',  base: 'Honda CB550',      builder: 'Jakob K.',    city: 'Berlin',    year: 1974, price: '14.500 €', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75',   verified: true  },
  { title: 'Iron Bastard No. 3',     style: 'Bobber',      base: 'BMW R80',            builder: 'Max S.',      city: 'München',   year: 1981, price: '18.900 €', img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=75', verified: true  },
  { title: 'Desert Fox Scrambler',   style: 'Scrambler',   base: 'Triumph T100',       builder: 'Anna W.',     city: 'Hamburg',   year: 2003, price: '11.200 €', img: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=75', verified: false },
  { title: 'Flat Track Killer',      style: 'Tracker',     base: 'Yamaha SR500',       builder: 'René B.',     city: 'Köln',      year: 1986, price: '9.800 €',  img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=75',   verified: true  },
  { title: 'Low & Slow',             style: 'Chopper',     base: 'H-D Sportster',      builder: 'Kai F.',      city: 'Stuttgart', year: 1998, price: '22.000 €', img: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&q=75',   verified: false },
  { title: 'Berlin Ghost',           style: 'Street',      base: 'Suzuki GS750',       builder: 'Studio Nord', city: 'Berlin',    year: 1979, price: '13.400 €', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=75', verified: true  },
  { title: 'Old Soul Enduro',        style: 'Enduro',      base: 'KTM 500 EXC',        builder: 'Lukas H.',    city: 'Dresden',   year: 2010, price: '8.500 €',  img: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=75', verified: false },
  { title: 'Velvet Thunder',         style: 'Bobber',      base: 'Norton Commando',    builder: 'T. Braun',    city: 'Frankfurt', year: 1972, price: '31.000 €', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=75',   verified: true  },
  { title: 'Salt Lake Racer',        style: 'Cafe Racer',  base: 'Moto Guzzi V7',      builder: 'Moto Roma',   city: 'Berlin',    year: 2015, price: '16.700 €', img: 'https://images.unsplash.com/photo-1609899537878-d7f95a37d5bd?w=800&q=75', verified: false },
  { title: 'Steinzeit Tracker',      style: 'Tracker',     base: 'Royal Enfield 500',  builder: 'P. Koch',     city: 'Leipzig',   year: 2018, price: '7.200 €',  img: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80', verified: false },
  { title: 'Black Forest Bobber',    style: 'Bobber',      base: 'Honda Shadow 600',   builder: 'T. Kern',     city: 'Freiburg',  year: 1995, price: '10.500 €', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',   verified: true  },
  { title: 'Munich Cruiser',         style: 'Chopper',     base: 'Kawasaki VN 800',    builder: 'G. Weiß',    city: 'München',   year: 2001, price: '6.900 €',  img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80', verified: false },
]

export default function BuildsPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="builds" />

      {/* PAGE HEADER */}
      <section className="pt-28 pb-10 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-slide-up">
            <div>
              <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest mb-2">Community Builds</p>
              <h1 className="font-bold text-[#F0EDE4] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
                Handgefertigte Unikate.
              </h1>
              <p className="text-[#F0EDE4]/40 text-sm mt-2 max-w-md leading-relaxed">
                Durchstöbere alle Custom Builds — von Cafe Racern bis zum Chopper.
              </p>
            </div>
            <p className="text-xs text-[#F0EDE4]/30 flex-shrink-0">
              <span className="text-[#F0EDE4]/60 font-semibold">{BUILDS.length} Builds</span> · täglich aktualisiert
            </p>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="sticky top-16 z-30 bg-[#141414]/95 backdrop-blur-md border-b border-[#F0EDE4]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {STYLES.map((s, i) => (
              <button
                key={s}
                className={`flex-shrink-0 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
                  i === 0
                    ? 'bg-[#2AABAB] text-[#141414] border-[#2AABAB]'
                    : 'border-[#F0EDE4]/10 text-[#F0EDE4]/45 hover:border-[#2AABAB]/40 hover:text-[#F0EDE4]'
                }`}
              >
                {s}
              </button>
            ))}
            <button className="flex-shrink-0 ml-2 flex items-center gap-1.5 text-xs text-[#F0EDE4]/40 hover:text-[#F0EDE4] transition-colors border border-[#F0EDE4]/10 hover:border-[#F0EDE4]/25 px-3 py-2 rounded-full">
              <SlidersHorizontal size={11} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="py-8 sm:py-10 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {BUILDS.map((build, i) => (
              <Link
                key={build.title}
                href="/map"
                className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/6 hover:border-[#F0EDE4]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 opacity-0 animate-slide-up-sm"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={build.img}
                    alt={build.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/85 via-[#141414]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-[#F0EDE4] text-xs font-semibold">Ansehen →</span>
                  </div>
                  <span className="absolute top-2 left-2 bg-[#141414]/80 backdrop-blur-sm border border-[#F0EDE4]/15 text-[#F0EDE4] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {build.style}
                  </span>
                  {build.verified && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#2AABAB]/90 text-[#141414] text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                      <BadgeCheck size={8} /> Verified
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F0EDE4] leading-snug line-clamp-1">{build.title}</h3>
                    <span className="text-xs sm:text-sm font-bold text-[#2AABAB] flex-shrink-0">{build.price}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#F0EDE4]/35 line-clamp-1">{build.base} · {build.year} · {build.city}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 sm:mt-14 text-center">
            <button className="border border-[#F0EDE4]/12 text-[#F0EDE4]/50 hover:text-[#F0EDE4] hover:border-[#F0EDE4]/25 text-sm font-medium px-8 py-3 rounded-full transition-all hover:-translate-y-0.5">
              Mehr laden
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <nav className="flex items-center gap-5 sm:gap-6">
            {['Impressum', 'Datenschutz', 'Kontakt'].map(l => (
              <Link key={l} href="#" className="text-xs text-[#F0EDE4]/25 hover:text-[#F0EDE4]/60 transition-colors">{l}</Link>
            ))}
          </nav>
          <p className="text-xs text-[#F0EDE4]/15">© 2026 MotoDigital</p>
        </div>
      </footer>
    </div>
  )
}
