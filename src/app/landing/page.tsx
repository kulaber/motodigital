import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Map, MessageCircle, ShieldCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnimateIn from '@/components/ui/AnimateIn'
import { BUILDERS } from '@/lib/data/builders'

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
              <Link href="/auth/register"
                className="bg-[#06a5a5] text-white font-semibold px-7 py-3.5 rounded-full text-sm text-center hover:bg-[#058f8f] transition-colors duration-200 hover:-translate-y-0.5 transform min-h-[44px] flex items-center justify-center">
                Jetzt kostenlos registrieren
              </Link>
              <Link href="/custom-werkstatt"
                className="border border-white/25 text-white font-medium px-7 py-3.5 rounded-full text-sm text-center hover:border-white/60 hover:bg-white/10 transition-colors duration-200 min-h-[44px] flex items-center justify-center">
                Bikes entdecken
              </Link>
            </div>
            <div className="animate-fade-in flex items-center gap-3" style={{ animationDelay: '240ms' }}>
              <div className="flex -space-x-2">
                {['JK','MS','AW','RB'].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/15 border-2 border-white/20 flex items-center justify-center text-[10px] font-semibold text-white/70">{i}</div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white">+</div>
              </div>
              <p className="text-white/50 text-sm">
                <span className="text-white font-medium">47 Builder</span> bereits dabei
              </p>
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
                <Link href={`/builds/${build.slug}`}
                  className="group block rounded-2xl overflow-hidden bg-white border border-[#222222]/6 hover:border-[#222222]/15 transition-colors duration-200 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={build.img} alt={build.title}
                      loading="lazy" decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
                      <span className="text-[#222222] text-sm font-semibold">Ansehen →</span>
                    </div>
                    <span className="absolute top-3 left-3 bg-white/75 backdrop-blur-sm border border-[#222222]/15 text-[#222222] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {build.style}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#222222] mb-0.5">{build.title}</h3>
                    <p className="text-xs text-[#222222]/35">{build.base} · {build.builder} · {build.city}</p>
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
      <section className="py-20 lg:py-28 bg-white" id="builder">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <AnimateIn className="flex items-end justify-between mb-10 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILDERS.slice(0, 3).map((b, i) => (
              <AnimateIn key={b.slug} delay={i * 70}>
                <Link href={`/custom-werkstatt/${b.slug}`}
                  className="group bg-white border border-[#222222]/6 rounded-2xl p-5 hover:border-[#DDDDDD] hover:-translate-y-0.5 transition-all duration-200 block h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#222222]/15 border border-[#DDDDDD]/20 flex items-center justify-center text-sm font-bold text-[#717171] flex-shrink-0">
                      {b.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#222222] group-hover:text-[#717171] transition-colors duration-200">{b.name}</p>
                        {b.verified && <BadgeCheck size={11} className="text-[#717171] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-[#222222]/35">{b.city} · {b.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="#06a5a5"><path d="M7 1L8.5 5.5H13L9.5 8L11 12L7 9.5L3 12L4.5 8L1 5.5H5.5Z"/></svg>
                      <span className="text-xs text-[#222222]/40 font-medium">{b.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#222222]/40 leading-relaxed mb-3 line-clamp-2">{b.bio}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#222222]/6">
                    <span className="text-xs text-[#222222]/30 font-medium">{b.builds} Builds</span>
                    <span className="text-xs text-[#717171] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">Profil →</span>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden" id="waitlist">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(42,171,171,0.07) 0%, transparent 65%)', transform: 'translate(30%,-30%)' }} />
        <AnimateIn className="max-w-md mx-auto px-5 relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#06a5a5] rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-5">M</div>
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-2">Early Access</p>
            <h2 className="font-bold text-[#222222] mb-3" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)' }}>
              Sei unter den Ersten.
            </h2>
            <p className="text-sm text-[#222222]/40 leading-relaxed">
              Trag dich ein und erhalte als einer der ersten Zugang zur Plattform — kostenlos.
            </p>
          </div>
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
            <WaitlistForm />
          </div>
          <p className="text-center text-xs text-[#222222]/20 mt-4">Kein Spam. Nur der Launch-Link.</p>
        </AnimateIn>
      </section>

      <Footer />

    </div>
  )
}

// Waitlist form — client component inline
function WaitlistForm() {
  return (
    <form action="/api/waitlist" method="POST" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="name" className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">Name</label>
          <input id="name" name="name" type="text" placeholder="Dein Name" required
            className="w-full bg-white border border-[#222222]/10 rounded-xl px-3 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors duration-200 min-h-[44px]" />
        </div>
        <div>
          <label htmlFor="email" className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">E-Mail</label>
          <input id="email" name="email" type="email" placeholder="deine@mail.de" required
            className="w-full bg-white border border-[#222222]/10 rounded-xl px-3 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors duration-200 min-h-[44px]" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-2">Ich bin</label>
        <div className="grid grid-cols-2 gap-2">
          {[['custom-werkstatt','Custom-Werkstatt'],['rider','Rider']].map(([val, label]) => (
            <label key={val} className="cursor-pointer">
              <input type="radio" name="role" value={val} className="sr-only" required />
              <div className="border border-[#222222]/10 rounded-xl px-4 py-3 text-center text-sm font-medium text-[#222222]/50 hover:border-[#DDDDDD]/40 transition-colors duration-200 has-[:checked]:border-[#DDDDDD] has-[:checked]:text-[#717171] has-[:checked]:bg-[#222222]/08 min-h-[44px] flex items-center justify-center">
                {label}
              </div>
            </label>
          ))}
        </div>
      </div>
      <button type="submit"
        className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] transition-colors duration-200 mt-1 min-h-[44px]">
        Jetzt kostenlos anmelden
      </button>
    </form>
  )
}
