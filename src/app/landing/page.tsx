import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Map, MessageCircle, ShieldCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnimateIn from '@/components/ui/AnimateIn'
import { BUILDERS } from '@/lib/data/builders'
import BuilderMarquee from '@/components/ui/BuilderMarquee'

export const metadata: Metadata = {
  title: 'MotoDigital — Custom Bikes, Builder & Builds',
  description: 'Die erste Plattform für Custom Motorrad Kultur. Finde Builder, kaufe Builds, starte dein Projekt.',
}

const BUILDS = [
  { slug: 'the-midnight-scrambler', title: 'The Midnight Scrambler', style: 'Cafe Racer', base: 'Honda CB550',    builder: 'Jakob K.',    city: 'Berlin',    img: 'https://images.unsplash.com/photo-1568708167256-1f385e6485f5?w=600&q=75' },
  { slug: 'iron-bastard-no-3',      title: 'Iron Bastard No. 3',     style: 'Bobber',     base: 'BMW R80',        builder: 'Max S.',      city: 'München',   img: 'https://images.unsplash.com/photo-1505052533681-2be9d65eade5?w=600&q=75' },
  { slug: 'desert-fox-scrambler',   title: 'Desert Fox Scrambler',   style: 'Scrambler',  base: 'Triumph T100',   builder: 'Anna W.',     city: 'Hamburg',   img: 'https://images.unsplash.com/photo-1677435783431-4f81723d5a18?w=600&q=75' },
  { slug: 'flat-track-killer',      title: 'Flat Track Killer',      style: 'Tracker',    base: 'Yamaha SR500',   builder: 'René B.',     city: 'Köln',      img: 'https://images.unsplash.com/photo-1603096564885-1a332df4f903?w=600&q=75' },
  { slug: 'low-and-slow',           title: 'Low & Slow',             style: 'Chopper',    base: 'H-D Sportster',  builder: 'Kai F.',      city: 'Stuttgart', img: 'https://images.unsplash.com/photo-1567972411080-a8ad4b2fded1?w=600&q=75' },
  { slug: 'berlin-ghost',           title: 'Berlin Ghost',           style: 'Street',     base: 'Suzuki GS750',   builder: 'Studio Nord', city: 'Berlin',    img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=75' },
]

const USPS = [
  { icon: <Map size={20} className="text-[#717171]" />,          title: 'Builder & Rider',   desc: 'Die erste Plattform, die Builder und Rider direkt verbindet — ohne Umwege.' },
  { icon: <BadgeCheck size={20} className="text-[#717171]" />,   title: 'Verified Builds',   desc: 'Jedes verifizierte Inserat wurde manuell geprüft — maximale Sicherheit.' },
  { icon: <MessageCircle size={20} className="text-[#717171]" />,title: 'Direkter Kontakt',  desc: 'Schreib Builder direkt an — kein Social Media Chaos, nur echte Anfragen.' },
  { icon: <ShieldCheck size={20} className="text-[#717171]" />,  title: 'Marketplace',       desc: 'Bald: Custom Builds kaufen & verkaufen — direkt vom Builder.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222]">

      {/* ── NAV ── */}
      <Header activePage="landing" />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-16 lg:pb-24 overflow-hidden">
        <video
          autoPlay muted loop playsInline preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#1a1a1a]/50" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.1) 38%, rgba(20,20,20,0.85) 80%, rgba(20,20,20,0.97) 100%)'
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 w-full">
          <div className="max-w-2xl">
            <span className="inline-block animate-slide-up-sm bg-white/12 text-white/80 border border-white/20 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              Beta — Jetzt registrieren
            </span>
            <h1
              className="animate-slide-up font-bold text-white leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', animationDelay: '60ms' }}
            >
              Entdecke die Welt<br />der Custom Bikes
            </h1>
            <p
              className="animate-slide-up text-white/60 font-light mb-8 leading-relaxed max-w-[55ch]"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', animationDelay: '120ms' }}
            >
              Finde Builder, kaufe Builds, starte dein Projekt — die Plattform für Custom Motorrad Kultur.
            </p>
            <div className="animate-slide-up flex flex-col sm:flex-row gap-3 mb-12" style={{ animationDelay: '180ms' }}>
              <Link href="/custom-werkstatt"
                className="bg-[#06a5a5] text-white font-semibold px-7 py-3.5 rounded-full text-sm text-center hover:bg-[#058f8f] transition-colors duration-200 hover:-translate-y-0.5 transform min-h-[44px] flex items-center justify-center">
                Custom Werkstatt finden
              </Link>
              <Link href="/bikes"
                className="border border-white/25 text-white font-medium px-7 py-3.5 rounded-full text-sm text-center hover:border-white/60 hover:bg-white/10 transition-colors duration-200 min-h-[44px] flex items-center justify-center">
                Custom Bikes ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-white border-y border-[#222222]/5">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#222222]/8">
            {[
              { num: '47',   label: 'Builder' },
              { num: '120+', label: 'Builds' },
              { num: '8',    label: 'Städte' },
              { num: 'Beta', label: 'Coming soon', accent: true },
            ].map((s, i) => (
              <AnimateIn key={s.label} delay={i * 80}>
                <div className="py-7 px-6 text-center">
                  <p className="font-bold leading-none mb-1.5"
                     style={{ fontSize: '2rem', letterSpacing: '-0.04em', color: s.accent ? '#06a5a5' : '#1A1714' }}>
                    {s.num}
                  </p>
                  <p className="text-xs text-[#222222]/30 uppercase tracking-widest font-medium">{s.label}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED BUILDS ── */}
      <section className="py-20 lg:py-28 bg-white" id="builds">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <AnimateIn className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Featured Builds</p>
              <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
                Handgefertigte Unikate.<br />
                <span className="text-[#222222]/25">Aus der Community.</span>
              </h2>
            </div>
            <Link href="/builds" className="flex-shrink-0 border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
              Alle ansehen →
            </Link>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILDS.map((build, i) => (
              <AnimateIn key={build.title} delay={i * 60}>
                <Link href={`/custom-bike/${build.slug}`}
                  className="group block rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/20 transition-all duration-200 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={build.img} alt={build.title}
                      loading="lazy" decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {build.style}
                    </span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-[#222222] leading-snug line-clamp-1 mb-0.5">{build.title}</h3>
                    <p className="text-[10px] sm:text-xs text-[#222222]/35 line-clamp-1">{build.base} · {build.builder} · {build.city}</p>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── USP ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <AnimateIn className="max-w-xl mb-12">
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Warum MotoDigital</p>
            <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
              Die Plattform, die Custom Culture verdient.
            </h2>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USPS.map((usp, i) => (
              <AnimateIn key={usp.title} delay={i * 70}>
                <div className="bg-white border border-[#222222]/6 rounded-2xl p-6 hover:border-[#DDDDDD]/20 transition-colors duration-200 h-full">
                  <div className="w-11 h-11 rounded-xl bg-[#222222]/10 border border-[#DDDDDD]/20 flex items-center justify-center mb-4">
                    {usp.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-[#222222] mb-2">{usp.title}</h3>
                  <p className="text-sm text-[#222222]/40 leading-relaxed">{usp.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILDER SPOTLIGHT ── */}
      <section className="py-20 lg:py-28 bg-white overflow-hidden" id="builder">
        <AnimateIn className="max-w-6xl mx-auto px-5 lg:px-8 flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Builder Spotlight</p>
            <h2 className="font-bold text-[#222222] leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)' }}>
              Die Menschen<br />
              <span className="text-[#222222]/25">hinter den Bikes.</span>
            </h2>
          </div>
          <Link href="/custom-werkstatt" className="flex-shrink-0 border border-[#222222]/15 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-200">
            Alle Builder →
          </Link>
        </AnimateIn>
        <BuilderMarquee builders={BUILDERS.slice(0, 10)} />
      </section>

      {/* ── DARK CTA ── */}
      <section className="bg-[#111111] py-24 lg:py-32 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(6,165,165,0.10) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 relative z-10">

          {/* Headline */}
          <AnimateIn className="text-center mb-16">
            <p className="text-xs font-semibold text-[#06a5a5] uppercase tracking-widest mb-4">Für wen bist du hier?</p>
            <h2 className="font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
              Werde Teil unserer Community.
            </h2>
            <p className="text-sm text-white/35 max-w-md mx-auto leading-relaxed">
              Registriere dich kostenlos — als Rider oder als Custom Werkstatt.
            </p>
          </AnimateIn>

          {/* Two cards */}
          <div className="flex flex-col lg:flex-row items-stretch gap-5 max-w-4xl mx-auto">

            {/* Card: Custom Werkstatt */}
            <AnimateIn delay={0} className="flex-1">
              <Link href="/auth/register?role=custom-werkstatt"
                className="group relative flex flex-col h-full min-h-[380px] rounded-2xl overflow-hidden border border-white/6 hover:border-white/16 transition-all duration-500">
                <img src="/custom-werkstatt.png" alt="Custom Werkstatt"
                  className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 opacity-20 group-hover:opacity-30 origin-center transition duration-[1200ms] ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-[#111]/10" />
                <div className="relative z-10 flex flex-col h-full p-7 justify-end">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#06a5a5]/15 text-[#06a5a5] mb-4 self-start">
                    Custom Werkstatt
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                    Zeig deine Werkstatt.<br />Erreiche die Community.
                  </h3>
                  <p className="text-sm text-white/35 mb-6 leading-relaxed">
                    Kostenlose Profilseite, Galerie, Karte & Direktkontakt mit Kunden.
                  </p>
                  <span className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3 rounded-xl self-start transition-all duration-300 group-hover:bg-[#058f8f] group-hover:gap-3">
                    Als Werkstatt registrieren →
                  </span>
                </div>
              </Link>
            </AnimateIn>

            {/* Card: Rider */}
            <AnimateIn delay={120} className="flex-1">
              <Link href="/auth/register?role=rider"
                className="group relative flex flex-col h-full min-h-[380px] rounded-2xl overflow-hidden border border-white/6 hover:border-white/16 transition-all duration-500">
                <img src="/rider.png" alt="Rider"
                  className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 opacity-20 group-hover:opacity-30 origin-center transition duration-[1200ms] ease-in-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-[#111]/10" />
                <div className="relative z-10 flex flex-col h-full p-7 justify-end">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#06a5a5]/15 text-[#06a5a5] mb-4 self-start">
                    Rider
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                    Teil der Custom<br />Community sein.
                  </h3>
                  <p className="text-sm text-white/35 mb-6 leading-relaxed">
                    Präsentiere dein Bike, entdecke Werkstätten & werde Teil der Szene.
                  </p>
                  <span className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3 rounded-xl self-start transition-all duration-300 group-hover:bg-[#058f8f] group-hover:gap-3">
                    Als Rider registrieren →
                  </span>
                </div>
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  )
}
