import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Coming Soon — MotoDigital',
  description: 'MotoDigital kommt bald. Die erste Plattform für Custom Motorrad Kultur.',
  openGraph: {
    title: 'Coming Soon — MotoDigital',
    description: 'MotoDigital kommt bald. Die erste Plattform für Custom Motorrad Kultur.',
  },
}

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222] flex flex-col items-center justify-center px-5 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 100%, rgba(42,171,171,0.05) 0%, transparent 65%)' }} />

      <div className="w-full max-w-lg text-center relative">

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image src="/logo-dark.svg" alt="MotoDigital" width={260} height={98} className="h-14 w-auto" priority />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#222222]/10 border border-[#DDDDDD]/25 text-[#717171] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#06a5a5] animate-pulse" />
          Demnächst verfügbar
        </div>

        {/* Headline */}
        <h1 className="font-bold text-[#222222] leading-tight mb-5"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.03em' }}>
          Die Plattform für<br />
          Custom Motorcycle Builder.
        </h1>

        <p className="text-[#222222]/45 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Verifizierte Builder, direkt kontaktierbar — ohne Umwege, ohne Provision. Wir starten bald.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-4 pt-8 border-t border-[#222222]/6">
          {[
            { value: '+124', label: 'Builder' },
            { value: '5', label: 'Länder' },
            { value: '€39', label: 'Founding Partner' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-bold text-[#222222]">{s.value}</p>
              <p className="text-[10px] text-[#222222]/30 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
