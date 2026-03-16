import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUILDS } from '@/lib/data/builds'
import BikesClient from './BikesClient'

export const metadata: Metadata = {
  title: 'Custom Bikes kaufen — MotoDigital',
  description: 'Kaufe und verkaufe handgefertigte Custom Motorcycles — Cafe Racer, Bobber, Scrambler, Tracker und Chopper aus ganz Europa.',
}

export default function BikesPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222]" style={{ fontFamily: 'var(--font-sans)' }}>
      <Header activePage="bikes" />

      {/* PAGE HEADER */}
      <section className="pt-28 pb-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-slide-up">
            <div>
              <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Custom Motorcycles</p>
              <h1 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
                Handgefertigte Unikate.
              </h1>
              <p className="text-[#222222]/40 text-sm mt-2 max-w-md leading-relaxed">
                Durchstöbere alle Custom Bikes — von Cafe Racern bis zum Chopper.
              </p>
            </div>
            <p className="text-xs text-[#222222]/30 flex-shrink-0">
              <span className="text-[#222222]/60 font-semibold">{BUILDS.length} Bikes</span> · täglich aktualisiert
            </p>
          </div>

          {/* Style category links */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { href: '/bikes/cafe-racer', label: 'Cafe Racer' },
              { href: '/bikes/bobber',     label: 'Bobber' },
              { href: '/bikes/scrambler',  label: 'Scrambler' },
              { href: '/bikes/tracker',    label: 'Tracker' },
              { href: '/bikes/chopper',    label: 'Chopper' },
            ].map(s => (
              <Link
                key={s.href}
                href={s.href}
                className="text-xs text-[#222222]/40 border border-[#222222]/10 px-3 py-1.5 rounded-full hover:border-[#DDDDDD]/40 hover:text-[#717171] transition-all"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BikesClient builds={BUILDS} />

      <Footer />
    </div>
  )
}
