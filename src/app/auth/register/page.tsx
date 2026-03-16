import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import RegisterForm from './RegisterForm'
import { BadgeCheck, Users, Wrench, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Registrieren — MotoDigital' }

const BENEFITS = [
  {
    icon: <Wrench size={14} className="text-[#717171]" />,
    title: 'Dein Builder-Profil',
    desc: 'Zeige deine Builds, Spezialiserung und Kontaktdaten — direkt auffindbar für Rider.',
  },
  {
    icon: <Users size={14} className="text-[#717171]" />,
    title: 'Direkte Anfragen',
    desc: 'Rider kontaktieren dich ohne Umwege — kein Mittelsmann, keine Provision.',
  },
  {
    icon: <BadgeCheck size={14} className="text-[#717171]" />,
    title: 'Verifiziertes Profil',
    desc: 'Verifizierte Builder werden in der Suche bevorzugt und gewinnen mehr Vertrauen.',
  },
  {
    icon: <Star size={14} className="text-[#717171]" />,
    title: 'Community & Reichweite',
    desc: 'Deine Builds erscheinen im Magazin und werden von der Community geteilt.',
  },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col lg:flex-row">

      {/* Left — Builder pitch */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-[#F7F7F7] border-r border-[#EBEBEB] px-12 py-12 relative overflow-hidden">

        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0% 0%, rgba(8,101,101,0.06) 0%, transparent 65%)' }} />

        {/* Logo */}
        <Link href="/">
          <Image src="/logo-dark.svg" alt="MotoDigital" width={180} height={68} className="h-10 w-auto" priority />
        </Link>

        {/* Headline */}
        <div className="relative">
          <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest mb-4">Für Builder & Workshops</p>
          <h2 className="font-bold text-[#222222] leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.03em' }}>
            Zeig der Welt,<br />
            <span className="text-[#B0B0B0]">was du baust.</span>
          </h2>
          <p className="text-sm text-[#717171] leading-relaxed mb-10 max-w-xs">
            MotoDigital ist die Plattform für Custom Motorcycle Builder in Europa — kostenlos, ohne Provision.
          </p>

          {/* Benefits */}
          <div className="flex flex-col gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#DDDDDD] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#222222]">{b.title}</p>
                  <p className="text-xs text-[#717171] leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-6 relative">
          <div>
            <p className="text-2xl font-bold text-[#222222]">6+</p>
            <p className="text-[10px] text-[#B0B0B0] uppercase tracking-widest">Builder</p>
          </div>
          <div className="w-px h-8 bg-[#DDDDDD]" />
          <div>
            <p className="text-2xl font-bold text-[#222222]">5</p>
            <p className="text-[10px] text-[#B0B0B0] uppercase tracking-widest">Länder</p>
          </div>
          <div className="w-px h-8 bg-[#DDDDDD]" />
          <div>
            <p className="text-2xl font-bold text-[#222222]">100%</p>
            <p className="text-[10px] text-[#B0B0B0] uppercase tracking-widest">Kostenlos</p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 lg:py-16">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex mb-4">
            <Image src="/logo-dark.svg" alt="MotoDigital" width={180} height={68} className="h-10 w-auto" priority />
          </Link>
          <p className="text-xs text-[#717171]">Für Builder & Workshops</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#222222] mb-1">Account erstellen</h1>
            <p className="text-sm text-[#222222]/40">Kostenlos registrieren — keine Kreditkarte</p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-[#222222]/35 mt-4">
            Bereits registriert?{' '}
            <Link href="/auth/login" className="text-[#717171] hover:text-[#086565] transition-colors">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
