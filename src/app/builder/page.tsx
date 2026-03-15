import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { BadgeCheck, MapPin, ChevronLeft, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Builder',
  description: 'Finde Custom Motorrad Builder und Workshops in deiner Nähe auf MotoDigital.',
}

const BUILDERS = [
  {
    initials: 'JK', name: 'Jakob Kraft',       city: 'Berlin',    specialty: 'Cafe Racer · Scrambler',
    builds: 14, rating: 4.9, verified: true,  featured: true,  since: '2019',
    tags: ['Cafe Racer', 'Scrambler', 'Restaurierung'],
    bio: 'Spezialist für luftgekühlte Japaner aus den 70ern. Jeder Build ist eine Zusammenarbeit.',
  },
  {
    initials: 'MS', name: 'Max Steiner',        city: 'München',   specialty: 'Bobber · Chopper',
    builds: 22, rating: 5.0, verified: true,  featured: true,  since: '2017',
    tags: ['Bobber', 'Chopper', 'Custom Paint'],
    bio: 'Über 20 fertiggestellte Builds. Fokus auf saubere Linien und handlackierte Tanks.',
  },
  {
    initials: 'SN', name: 'Studio Nord',        city: 'Hamburg',   specialty: 'Street · Tracker',
    builds: 8,  rating: 4.7, verified: true,  featured: false, since: '2021',
    tags: ['Street', 'Tracker'],
    bio: 'Kleines Studio im Hamburger Hafen. Tracker und Street Fighter sind unsere Welt.',
  },
  {
    initials: 'AW', name: 'Anna Wolff Moto',    city: 'Hamburg',   specialty: 'Scrambler · Enduro',
    builds: 11, rating: 4.8, verified: false, featured: false, since: '2020',
    tags: ['Scrambler', 'Enduro', 'Off-Road'],
    bio: 'Abenteuermaschinen für Straße und Gelände. Nachhaltige Restaurierungen bevorzugt.',
  },
  {
    initials: 'RB', name: 'René Bauer Cycles',  city: 'Köln',      specialty: 'Tracker · Flat Track',
    builds: 6,  rating: 4.6, verified: false, featured: false, since: '2022',
    tags: ['Tracker', 'Flat Track'],
    bio: 'Flat Track ist eine Lebenseinstellung. Leichte, schnelle Builds ohne Schnickschnack.',
  },
  {
    initials: 'KF', name: 'Kai Fuchs Custom',   city: 'Stuttgart', specialty: 'Chopper · Old School',
    builds: 18, rating: 4.9, verified: true,  featured: false, since: '2016',
    tags: ['Chopper', 'Old School', 'H-D'],
    bio: 'Old-School-Chopper aus Stuttgart seit 2016. Harley Davidson Experte.',
  },
]

export default function BuilderPage() {
  const totalBuilds = BUILDERS.reduce((a, b) => a + b.builds, 0)
  const verifiedCount = BUILDERS.filter(b => b.verified).length

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]" style={{ fontFamily: 'var(--font-sans)' }}>

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#F0EDE4]/5 bg-[#141414]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 flex items-center justify-between h-16">
          <Link href="/">
            <Image src="/logo.svg" alt="MotoDigital" width={220} height={83} className="h-10 w-auto" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/builds"  className="text-sm text-[#F0EDE4]/50 hover:text-[#F0EDE4] transition-colors">Builds</Link>
            <Link href="/builder" className="text-sm text-[#F0EDE4] font-semibold">Builder</Link>
            <Link href="/map"     className="text-sm text-[#F0EDE4]/50 hover:text-[#F0EDE4] transition-colors">Karte</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm text-[#F0EDE4]/60 hover:text-[#F0EDE4] transition-colors px-4 py-2">Anmelden</Link>
            <Link href="/auth/register" className="bg-[#2AABAB] text-[#141414] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#3DBFBF] transition-all">Registrieren</Link>
          </div>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="pt-32 pb-12 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4]/70 transition-colors mb-6">
            <ChevronLeft size={13} /> MotoDigital
          </Link>
          <div className="animate-slide-up">
            <p className="text-xs font-semibold text-[#2AABAB] uppercase tracking-widest mb-2">Builder Directory</p>
            <h1 className="font-bold text-[#F0EDE4] leading-tight" style={{ fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.03em' }}>
              Die Menschen<br />
              <span className="text-[#F0EDE4]/25">hinter den Bikes.</span>
            </h1>
            <p className="text-[#F0EDE4]/40 text-sm mt-3 max-w-md leading-relaxed">
              Verifizierte Builder und Workshops — direkt kontaktierbar, ohne Umwege.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="pb-20 bg-[#141414]">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-8 items-start">

            {/* Builder cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BUILDERS.map((b, i) => (
                <div
                  key={b.name}
                  className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 hover:border-[#2AABAB]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group opacity-0 animate-scale-in"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2AABAB]/12 border border-[#2AABAB]/20 flex items-center justify-center text-base font-bold text-[#2AABAB] flex-shrink-0 group-hover:bg-[#2AABAB]/20 transition-colors">
                      {b.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-[#F0EDE4]">{b.name}</p>
                        {b.verified && <BadgeCheck size={13} className="text-[#2AABAB] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[#F0EDE4]/35 flex items-center gap-1">
                        <MapPin size={9} /> {b.city} · seit {b.since}
                      </p>
                    </div>
                    {b.featured && (
                      <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest bg-[#2AABAB]/12 text-[#2AABAB] border border-[#2AABAB]/20 px-2 py-0.5 rounded-full">
                        Top
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#F0EDE4]/40 leading-relaxed mb-3 line-clamp-2">{b.bio}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {b.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-[#F0EDE4]/40 bg-[#F0EDE4]/5 border border-[#F0EDE4]/8 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-[#F0EDE4]/6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#F0EDE4]/30">
                        <span className="text-[#F0EDE4]/60 font-semibold">{b.builds}</span> Builds
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#F0EDE4]/30">
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="#2AABAB"><path d="M7 1L8.5 5.5H13L9.5 8L11 12L7 9.5L3 12L4.5 8L1 5.5H5.5Z"/></svg>
                        <span className="text-[#F0EDE4]/60 font-semibold">{b.rating}</span>
                      </span>
                    </div>
                    <span className="text-xs text-[#2AABAB] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Kontakt →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              {/* CTA */}
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 pointer-events-none rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(42,171,171,0.10) 0%, transparent 70%)', transform: 'translate(35%,-35%)' }} />
                <div className="w-10 h-10 bg-[#2AABAB]/12 border border-[#2AABAB]/20 rounded-xl flex items-center justify-center mb-4">
                  <Wrench size={18} className="text-[#2AABAB]" />
                </div>
                <h3 className="text-sm font-bold text-[#F0EDE4] mb-2">Du bist Builder?</h3>
                <p className="text-xs text-[#F0EDE4]/40 leading-relaxed mb-5">
                  Registriere dich kostenlos, zeige deine Builds und werde direkt von Riders kontaktiert.
                </p>
                <Link href="/auth/register"
                  className="block w-full bg-[#2AABAB] text-[#141414] text-sm font-semibold py-2.5 rounded-full text-center hover:bg-[#3DBFBF] transition-all hover:-translate-y-0.5">
                  Als Builder registrieren
                </Link>
              </div>

              {/* Stats */}
              <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
                <p className="text-[10px] text-[#F0EDE4]/25 uppercase tracking-widest font-semibold mb-4">Plattform</p>
                {[
                  { label: 'Aktive Builder', value: BUILDERS.length },
                  { label: 'Verifiziert',    value: verifiedCount },
                  { label: 'Builds gesamt',  value: totalBuilds },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-[#F0EDE4]/5 last:border-0">
                    <span className="text-xs text-[#F0EDE4]/40">{s.label}</span>
                    <span className="text-sm font-bold text-[#F0EDE4]">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Map CTA */}
              <Link href="/map" className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 hover:border-[#2AABAB]/25 transition-all group block">
                <p className="text-xs font-semibold text-[#F0EDE4] mb-1 group-hover:text-[#2AABAB] transition-colors">Builder auf der Karte</p>
                <p className="text-xs text-[#F0EDE4]/35">Finde Builder in deiner Nähe →</p>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#141414] border-t border-[#F0EDE4]/5 py-10">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/">
            <Image src="/logo.svg" alt="MotoDigital" width={120} height={45} className="h-6 w-auto opacity-50" />
          </Link>
          <nav className="flex items-center gap-6">
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
