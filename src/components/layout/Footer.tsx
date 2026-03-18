import Link from 'next/link'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

const NAV = [
  {
    heading: 'Plattform',
    links: [
      { label: 'Custom Bikes',              href: '/bikes' },
      { label: 'Custom Werkstatt',          href: '/custom-werkstatt' },
      { label: 'Magazin',                   href: '/magazine' },
      { label: 'Events',                    href: '/events' },
      { label: 'Preise',                    href: '/preise' },
      { label: 'Wie es funktioniert',       href: '/wie-es-funktioniert' },
    ],
  },
  {
    heading: 'Custom Bikes',
    links: [
      { label: 'Marken',      href: '/marken' },
      { label: 'Cafe Racer',  href: '/bikes/cafe-racer' },
      { label: 'Bobber',      href: '/bikes/bobber' },
      { label: 'Scrambler',   href: '/bikes/scrambler' },
      { label: 'Tracker',     href: '/bikes/tracker' },
      { label: 'Chopper',     href: '/bikes/chopper' },
      { label: 'Street',      href: '/bikes/street' },
      { label: 'Enduro',      href: '/bikes/enduro' },
    ],
  },
  {
    heading: 'Custom Werkstatt',
    links: [
      { label: 'Registrieren',                    href: '/auth/register' },
      { label: 'Anmelden',                        href: '/auth/login' },
      { label: 'Custom Werkstatt-Verzeichnis',    href: '/custom-werkstatt' },
    ],
  },
  {
    heading: 'Rechtliches',
    links: [
      { label: 'Impressum',           href: '/impressum' },
      { label: 'Datenschutz',         href: '/datenschutz' },
      { label: 'Nutzungsbedingungen', href: '/nutzungsbedingungen' },
      { label: 'Kontakt',             href: '/kontakt' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#222222] border-t border-white/8 text-white">

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 md:gap-8">

          {/* Brand column */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.svg" alt="MotoDigital" width={180} height={68} className="h-9 w-auto opacity-80" />
            </Link>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs mb-6">
              Die Plattform für Custom Motorcycle Builder in Europa — direkt, kostenlos, ohne Umwege.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/motodigital.io/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 transition-all">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {NAV.map(col => (
            <div key={col.heading}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/45 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">© 2026 MotoDigital. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-white/20">Alle Systeme aktiv</p>
          </div>
        </div>
      </div>

    </footer>
  )
}
