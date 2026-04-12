import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CheckCircle, ArrowRight } from 'lucide-react'
import HeroAnimatedIcons from './HeroAnimatedIcons'
import CommunityCircle from './CommunityCircle'

export const metadata: Metadata = {
  title: 'Über MotoDigital',
  description: 'Die Plattform für Custom Motorcycle Builder und Rider — so funktioniert MotoDigital.',
}

const sections = [
  {
    number: '01',
    image: '/custom-werkstatt.png',
    tag: 'Für Custom-Werkstätten',
    heading: 'Deine Werkstatt.\nSichtbar für die\nrichtigen Kunden.',
    description:
      'MotoDigital ist die erste digitale Anlaufstelle für Custom-Werkstätten in Europa. Kein Algorithmus, kein Pay-to-Win — nur echte Sichtbarkeit bei Menschen, die Custom Bikes wirklich wollen.',
    usps: [
      'Profilseite mit Galerie, Fotos & Videos',
      'Werde auf der interaktiven Karte gefunden',
      'Zeig deine Builds als Referenz',
      'Direkter Kontakt mit Kunden',
      'Verifiziertes Profil für mehr Vertrauen',
    ],
    cta: { label: 'Jetzt Founding Partner sichern', href: '/auth/register?role=custom-werkstatt' },
    accent: '#06a5a5',
  },
  {
    number: '02',
    image: '/custom-bikes.png',
    tag: 'Für Custom-Bike-Käufer',
    heading: 'Finde dein nächstes\nCustom Bike —\nohne Umwege.',
    description:
      'Durchstöbere hunderte handgefertigte Custom Bikes direkt von Werkstätten und Privatverkäufern. Filtere nach Stil, Marke oder Region.',
    usps: [
      'Cafe Racer, Bobber, Scrambler, Tracker & mehr',
      'Hochwertige Fotos von jedem Bike',
      'Direktkontakt zum Verkäufer',
      'Merkliste für deine Favoriten',
      'Regionale Suche & Stilfilter',
    ],
    cta: { label: 'Bikes entdecken', href: '/bikes' },
    accent: '#222222',
  },
  {
    number: '03',
    image: '/rider.png',
    tag: 'Für Rider',
    heading: 'Werde Teil der\nCustom-Bike\nCommunity.',
    description:
      'Als Rider auf MotoDigital kannst du dein eigenes Bike präsentieren oder verkaufen, Werkstätten entdecken, Rider in der Nähe finden, die das gleiche Mindset haben wie du. Erlebe die wirkliche Custom Motorcycle Culture.',
    usps: [
      'Eigenes Rider-Profil mit deinem Bike',
      'Fahrten in der Nähe finden durch Map',
      'Custom Bikes verkaufen',
      'Custom-Werkstätten in deiner Nähe',
      'Inspiration durch Builds & Magazin',
      'Events in der Community entdecken',
      'Direkter Draht zu Werkstätten & Ridern',
    ],
    cta: { label: 'Als Rider registrieren', href: '/auth/register?role=rider' },
    accent: '#06a5a5',
  },
]

export default function WieEsFunktioniertPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-[#222222] overflow-hidden relative">
        <HeroAnimatedIcons />
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-5">
            So funktioniert MotoDigital
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 max-w-3xl">
            Die Plattform für Custom Motorcycle Culture.
          </h1>
          <p className="text-base text-white/40 max-w-lg leading-relaxed">
            MotoDigital verbindet Custom-Werkstätten, Bike-Käufer und Rider — direkt und ohne Umwege.
          </p>
        </div>
      </section>

      {/* Sections */}
      {sections.map((s, i) => (
        <section key={s.number} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F7F7F7]'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24">
            <div className={`flex flex-col lg:flex-row items-center gap-16 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

              {/* Image block */}
              <div className="flex-shrink-0 w-full lg:w-[44%] flex items-center justify-center">
                <Image
                  src={s.image}
                  alt={s.tag}
                  width={576}
                  height={400}
                  className="w-full sm:w-full max-w-xl object-contain drop-shadow-sm"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
                  style={{ background: `${s.accent}18`, color: s.accent }}>
                  {s.tag}
                </span>

                <h2 className="text-3xl sm:text-4xl font-black text-[#222222] leading-tight mb-5 whitespace-pre-line">
                  {s.heading}
                </h2>

                <p className="text-sm text-[#717171] leading-relaxed mb-8 max-w-md">
                  {s.description}
                </p>

                <ul className="flex flex-col gap-2.5 mb-10">
                  {s.usps.map(usp => (
                    <li key={usp} className="flex items-start gap-3">
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: s.accent }} />
                      <span className="text-sm text-[#222222]/65">{usp}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={s.cta.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:gap-3"
                  style={{ background: s.accent, color: '#fff' }}
                >
                  {s.cta.label}
                  <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          </div>

          {i < sections.length - 1 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
              <div className="h-px bg-[#222222]/6" />
            </div>
          )}
        </section>
      ))}

      <CommunityCircle />

      {/* Roadmap */}
      <section className="bg-[#222222]" id="roadmap">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24">

          {/* Heading */}
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">Roadmap</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight max-w-2xl">
              Europas größte Plattform für Custom Motorcycle Culture.
            </h2>
          </div>

          {/* Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {[
              {
                status: 'Live',
                live: true,
                title: 'Custom Werkstatt Verzeichnis',
                description: 'Interaktive Karte mit allen Custom-Werkstätten in Europa — inkl. Profil, Galerie & Direktkontakt.',
              },
              {
                status: 'Live',
                live: true,
                title: 'Rider Community',
                description: 'Eigene Rider-Profile mit Bike-Vorstellung und Vernetzung innerhalb der Community.',
              },
              {
                status: 'Live',
                live: true,
                title: 'Custom Bike Marktplatz',
                description: 'Kauf & Verkauf von handgefertigten Custom Bikes direkt zwischen Werkstätten und Ridern.',
              },
              {
                status: 'Demnächst',
                live: false,
                title: 'Werkstatt Bewertungen',
                description: 'Verifizierte Kundenbewertungen für Custom-Werkstätten — transparent und authentisch.',
              },
              {
                status: 'Demnächst',
                live: false,
                title: 'Shop Integration',
                description: 'Werkstätten können Merchandise, Teile und Services direkt über ihre Profilseite verkaufen.',
              },
              {
                status: 'Geplant',
                live: false,
                title: 'Teile-Datenbank',
                description: 'Intelligente Datenbank für passende Umbauteile — gefiltert nach Motorrad, Baujahr und Stil.',
              },
              {
                status: 'Geplant',
                live: false,
                title: 'Digitaler Custom Bike-Pass',
                description: 'Ein MotoDigital-Pass zur Verifizierung und Dokumentation von Custom Bikes. Für mehr Sicherheit und Transparenz für deine Custom Bike-Identität.',
              },
              {
                status: 'Geplant',
                live: false,
                title: 'App — iOS & Android',
                description: 'Die MotoDigital App für unterwegs — Bikes entdecken, Werkstätten finden, Community erleben.',
              },
              {
                status: 'Geplant',
                live: false,
                title: 'Europäische Expansion',
                description: 'Lokalisierte Versionen für DE, AT, CH, NL, FR, IT und weitere europäische Märkte.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#222222] p-8 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    item.live
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : item.status === 'Demnächst'
                      ? 'bg-[#06a5a5]/10 text-[#06a5a5]'
                      : 'bg-white/5 text-white/30'
                  }`}>
                    {item.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#111111] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">Los geht&apos;s</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Bereit loszulegen?
          </h2>
          <p className="text-sm text-white/35 mb-10 max-w-sm mx-auto leading-relaxed">
            Registriere dich als Werkstatt oder Rider. In wenigen Minuten live.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register?role=custom-werkstatt"
              className="bg-[#06a5a5] text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-[#058f8f] transition-all inline-flex items-center gap-2">
              Jetzt Founding Partner sichern <ArrowRight size={14} />
            </Link>
            <Link href="/auth/register?role=rider"
              className="border border-white/10 text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:border-white/25 transition-all inline-flex items-center gap-2">
              Als Rider registrieren <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
