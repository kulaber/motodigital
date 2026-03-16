import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Anmelden' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Image src="/logo-dark.svg" alt="MotoDigital" width={220} height={83} className="h-12 w-auto" priority />
          </Link>
          <h1 className="text-xl font-bold text-[#222222]">Willkommen zurück</h1>
          <p className="text-sm text-[#222222]/40 mt-1">Meld dich in deinem Account an</p>
        </div>

        <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-[#222222]/35 mt-4">
          Noch kein Account?{' '}
          <Link href="/auth/register" className="text-[#717171] hover:text-[#717171]-light transition-colors">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
