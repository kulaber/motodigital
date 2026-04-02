import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import RegisterForm from './RegisterForm'
import RegisterCarousel from './RegisterCarousel'

export const metadata: Metadata = { title: 'Registrieren — MotoDigital' }

export default function RegisterPage() {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[#111111] text-white flex flex-col lg:flex-row">

      {/* Left — dark panel */}
      <div className="hidden lg:flex flex-col justify-center w-[420px] flex-shrink-0 bg-[#111111] px-8 py-10 relative overflow-hidden">

        {/* Subtle glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(6,165,165,0.1) 0%, transparent 60%)' }} />

        {/* Logo */}
        <div className="absolute top-10 left-8">
          <Link href="/">
            <Image src="/logo.svg" alt="MotoDigital" width={200} height={76} className="h-12 w-auto" priority />
          </Link>
        </div>

        {/* Headline + Carousel — vertically centered */}
        <div className="relative">
          <h2 className="text-xl font-bold text-white leading-snug">Account erstellen</h2>
          <p className="text-sm text-white/35 mt-1 mb-6">Kostenlos — keine Kreditkarte erforderlich</p>
          <RegisterCarousel />
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex mb-3">
            <Image src="/logo.svg" alt="MotoDigital" width={150} height={56} className="h-8 w-auto" priority />
          </Link>
        </div>

        <div className="w-full max-w-sm py-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-white/35 mt-4">
            Bereits registriert?{' '}
            <Link href="/auth/login" className="text-white/60 hover:text-[#06a5a5] transition-colors">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
