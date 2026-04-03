import Link from 'next/link'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import FooterWrapper from './FooterWrapper'
import { createClient } from '@/lib/supabase/server'

// DB style value → slug + label for footer links
const STYLE_MAP: Record<string, { slug: string; label: string }> = {
  cafe_racer:     { slug: 'cafe-racer',     label: 'Cafe Racer' },
  bobber:         { slug: 'bobber',         label: 'Bobber' },
  scrambler:      { slug: 'scrambler',      label: 'Scrambler' },
  tracker:        { slug: 'tracker',        label: 'Tracker' },
  chopper:        { slug: 'chopper',        label: 'Chopper' },
  naked:          { slug: 'naked',          label: 'Naked' },
  brat_style:     { slug: 'brat-style',     label: 'Brat Style' },
  street_fighter: { slug: 'street-fighter', label: 'Street Fighter' },
  enduro:         { slug: 'enduro',         label: 'Enduro' },
  old_school:     { slug: 'old-school',     label: 'Old School' },
  street:         { slug: 'street',         label: 'Street' },
}

const STATIC_NAV = [
  {
    heading: 'Plattform',
    links: [
      { label: 'Custom Bikes',              href: '/bikes' },
      { label: 'Custom Werkstatt',          href: '/custom-werkstatt' },
      { label: 'Magazin',                   href: '/magazine' },
      { label: 'Events',                    href: '/events' },
      { label: 'Preise',                    href: '/preise' },
      { label: 'Über MotoDigital',           href: '/ueber-motodigital' },
    ],
  },
  {
    heading: 'Custom Werkstatt',
    links: [
      { label: 'Registrieren',                    href: '/auth/register' },
      { label: 'Anmelden',                        href: '/auth/login' },
    ],
  },
  {
    heading: 'Rechtliches',
    links: [
      { label: 'Impressum',           href: '/impressum' },
      { label: 'Datenschutz',         href: '/datenschutz' },
      { label: 'Nutzungsbedingungen', href: '/nutzungsbedingungen' },
      { label: 'Support & Kontakt',   href: '/support' },
      { label: 'FAQs',               href: '/faq' },
    ],
  },
]

export default async function Footer() {
  // Fetch distinct styles that have at least 1 active bike
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from('bikes') as any)
    .select('style')
    .eq('status', 'active')

  const activeStyles = new Set((rows ?? []).map((r: { style: string }) => r.style))
  const styleLinks = Array.from(activeStyles)
    .filter(s => STYLE_MAP[s])
    .sort((a, b) => STYLE_MAP[a].label.localeCompare(STYLE_MAP[b].label))
    .map(s => ({ label: STYLE_MAP[s].label, href: `/bikes/${STYLE_MAP[s].slug}` }))

  const bikesColumn = {
    heading: 'Custom Bikes',
    links: [
      { label: 'Alle Marken', href: '/marken' },
      ...styleLinks,
    ],
  }

  const NAV = [STATIC_NAV[0], bikesColumn, STATIC_NAV[1], STATIC_NAV[2]]

  return (
    <FooterWrapper>
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
    </FooterWrapper>
  )
}
