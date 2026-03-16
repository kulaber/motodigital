import Image from 'next/image'
export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4] flex flex-col items-center justify-center px-5 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 100%, rgba(42,171,171,0.05) 0%, transparent 65%)' }} />

      <div className="w-full max-w-lg text-center relative">

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image src="/logo.svg" alt="MotoDigital" width={260} height={98} className="h-14 w-auto" priority />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#2AABAB]/10 border border-[#2AABAB]/25 text-[#2AABAB] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2AABAB] animate-pulse" />
          Demnächst verfügbar
        </div>

        {/* Headline */}
        <h1 className="font-bold text-[#F0EDE4] leading-tight mb-5"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.03em' }}>
          Die Plattform für<br />
          <span className="text-[#F0EDE4]/25">Custom Motorcycle Builder.</span>
        </h1>

        <p className="text-[#F0EDE4]/45 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Verifizierte Builder, direkt kontaktierbar — ohne Umwege, ohne Provision. Wir starten bald.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-4 pt-8 border-t border-[#F0EDE4]/6">
          {[
            { value: '+124', label: 'Builder' },
            { value: '5', label: 'Länder' },
            { value: '100%', label: 'Kostenlos' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-bold text-[#F0EDE4]">{s.value}</p>
              <p className="text-[10px] text-[#F0EDE4]/30 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
