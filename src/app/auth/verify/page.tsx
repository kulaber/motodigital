import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'E-Mail bestätigen — MotoDigital' }

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#222222]/15 border border-[#DDDDDD]/25 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="6" width="28" height="20" rx="4" stroke="#06a5a5" strokeWidth="1.5"/>
            <path d="M6 11 L16 18 L26 11" stroke="#06a5a5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-xl font-bold text-[#222222] mb-2">E-Mail bestätigen</h1>
        <p className="text-sm text-[#222222]/45 leading-relaxed mb-2">
          Wir haben einen Bestätigungslink an
        </p>
        {email && (
          <p className="text-sm font-semibold text-[#717171] mb-4">{email}</p>
        )}
        <p className="text-sm text-[#222222]/45 leading-relaxed mb-8">
          gesendet. Klick auf den Link um deinen Account zu aktivieren.
        </p>

        {/* What happens next */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 text-left mb-6">
          <p className="text-[10px] font-semibold text-[#222222]/30 uppercase tracking-widest mb-4">Was passiert als nächstes</p>
          <div className="flex flex-col gap-3">
            {[
              'E-Mail bestätigen — Link anklicken',
              'Profil vervollständigen',
              'Erste Bike-Suche starten',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#222222]/15 border border-[#DDDDDD]/20 flex items-center justify-center text-[10px] font-bold text-[#717171] flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-[#222222]/55">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/auth/login"
          className="block w-full border border-[#222222]/12 text-[#222222]/60 font-medium py-3 rounded-full text-sm hover:text-[#222222] hover:border-[#222222]/25 transition-all">
          Zurück zum Login
        </Link>

      </div>
    </div>
  )
}
