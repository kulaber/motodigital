import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = { title: 'Registrieren — MotoDigital' }

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Image src="/logo.svg" alt="MotoDigital" width={220} height={83} className="h-12 w-auto" priority />
          </Link>
          <h1 className="text-xl font-bold text-[#F0EDE4]">Account erstellen</h1>
          <p className="text-sm text-[#F0EDE4]/40 mt-1">Kostenlos registrieren — keine Kreditkarte</p>
        </div>

        {/* Form card */}
        <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-6">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-[#F0EDE4]/35 mt-4">
          Bereits registriert?{' '}
          <Link href="/auth/login" className="text-[#2AABAB] hover:text-[#3DBFBF] transition-colors">
            Anmelden
          </Link>
        </p>

      </div>
    </div>
  )
}
