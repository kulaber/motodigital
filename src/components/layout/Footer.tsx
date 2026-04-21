import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import FooterWrapper from './FooterWrapper'
import FooterBikeStyles from './FooterBikeStyles'

export default function Footer() {
  const tNav = useTranslations('Nav')
  const tFoot = useTranslations('Footer')

  const NAV: { heading: string; links: { label: string; href: Parameters<typeof Link>[0]['href'] }[] }[] = [
    {
      heading: 'Plattform',
      links: [
        { label: tFoot('about'),        href: '/ueber-motodigital' },
        { label: tFoot('benefits'),     href: '/vorteile' },
        { label: tNav('register'),      href: '/auth/register' },
        { label: tNav('login'),         href: '/auth/login' },
        { label: tNav('magazine'),      href: '/magazine' },
        { label: tNav('events'),        href: '/events' },
      ],
    },
    {
      heading: 'Community',
      links: [
        { label: tNav('explore'),       href: '/explore' },
        { label: tNav('bikes'),         href: '/bikes' },
        { label: tNav('workshops'),     href: '/custom-werkstatt' },
      ],
    },
    {
      heading: tFoot('support'),
      links: [
        { label: tFoot('support'),      href: '/support' },
        { label: tFoot('faq'),          href: '/faq' },
        { label: tFoot('partner'),      href: '/partner' },
      ],
    },
  ]

  return (
    <FooterWrapper>
    <footer className="bg-[#222222] border-t border-white/8 text-white">

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 md:gap-8">

          {/* Brand column */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.svg" alt="MotoDigital" width={180} height={68} className="h-14 w-auto opacity-80" />
            </Link>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs mb-6">
              {tFoot('tagline')}
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/motodigital.io/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 transition-all">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Custom Bikes — dynamic styles from DB */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">
              {tNav('bikes')}
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/marken" className="text-sm text-white/45 hover:text-white transition-colors">
                  {tNav('bikes')}
                </Link>
              </li>
              <FooterBikeStyles />
            </ul>
          </div>

          {/* Static columns */}
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
          <p className="text-[10px] text-white/15">© 2026 MotoDigital. {tFoot('copyright')}</p>
          <div className="flex items-center gap-4">
            <Link href="/impressum" className="text-[10px] text-white/15 hover:text-white/30 transition-colors">{tFoot('legal')}</Link>
            <Link href="/datenschutz" className="text-[10px] text-white/15 hover:text-white/30 transition-colors">{tFoot('privacy')}</Link>
            <Link href="/nutzungsbedingungen" className="text-[10px] text-white/15 hover:text-white/30 transition-colors">{tFoot('terms')}</Link>
          </div>
        </div>
      </div>

    </footer>
    </FooterWrapper>
  )
}
