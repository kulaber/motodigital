import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Anmelden' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center text-bg font-bold text-sm">M</span>
            <span className="font-bold text-creme">Moto<span className="text-teal">Digital</span></span>
          </Link>
          <h1 className="text-xl font-bold text-creme">Willkommen zurück</h1>
          <p className="text-sm text-creme/40 mt-1">Meld dich in deinem Account an</p>
        </div>

        <div className="bg-bg-2 border border-creme/6 rounded-2xl p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-creme/35 mt-4">
          Noch kein Account?{' '}
          <Link href="/auth/register" className="text-teal hover:text-teal-light transition-colors">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
