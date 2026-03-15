'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginFormInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const supabase = createClient()

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  async function handleMagicLink() {
    if (!email) { setError('Bitte E-Mail eingeben'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
    })
    if (error) setError(error.message)
    else setMagicSent(true)
    setLoading(false)
  }

  if (magicSent) return (
    <div className="text-center py-4">
      <p className="text-sm text-creme mb-1">Link gesendet!</p>
      <p className="text-xs text-creme/40">Check deine E-Mails — der Link ist 1 Stunde gültig.</p>
    </div>
  )

  return (
    <form onSubmit={handlePassword} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-creme/40 uppercase tracking-widest mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full bg-bg-3 border border-creme/10 rounded-xl px-4 py-3 text-sm text-creme placeholder:text-creme/20 outline-none focus:border-teal transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-creme/40 uppercase tracking-widest mb-1.5">Passwort</label>
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-bg-3 border border-creme/10 rounded-xl px-4 py-3 text-sm text-creme placeholder:text-creme/20 outline-none focus:border-teal transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-teal text-bg font-semibold py-3 rounded-full text-sm hover:bg-teal-light disabled:opacity-50 transition-all">
        {loading ? 'Wird geladen...' : 'Anmelden'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-creme/8" />
        <span className="text-xs text-creme/25">oder</span>
        <div className="flex-1 h-px bg-creme/8" />
      </div>

      <button type="button" onClick={handleMagicLink} disabled={loading}
        className="w-full border border-creme/12 text-creme/60 font-medium py-3 rounded-full text-sm hover:text-creme hover:border-creme/25 disabled:opacity-50 transition-all">
        Magic Link per E-Mail
      </button>
    </form>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="h-48" />}>
      <LoginFormInner />
    </Suspense>
  )
}
