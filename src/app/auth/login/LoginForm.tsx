'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginFormInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicSent,  setMagicSent]  = useState(false)
  const [resetSent,  setResetSent]  = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
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

  async function handleReset() {
    if (!email) { setError('Bitte zuerst E-Mail eingeben'); return }
    setResetLoading(true); setError(null)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard/account`,
    })
    setResetSent(true)
    setResetLoading(false)
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
      <p className="text-sm text-[#222222] mb-1">Link gesendet!</p>
      <p className="text-xs text-[#222222]/40">Check deine E-Mails — der Link ist 1 Stunde gültig.</p>
    </div>
  )

  return (
    <form onSubmit={handlePassword} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full bg-[#F7F7F7] border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest">Passwort</label>
          {resetSent ? (
            <span className="text-[11px] text-green-500">Reset-Link gesendet ✓</span>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetLoading}
              className="text-[11px] text-[#222222]/35 hover:text-[#06a5a5] transition-colors disabled:opacity-50"
            >
              {resetLoading ? 'Wird gesendet…' : 'Passwort vergessen?'}
            </button>
          )}
        </div>
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-[#F7F7F7] border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 transition-all">
        {loading ? 'Wird geladen...' : 'Anmelden'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-creme/8" />
        <span className="text-xs text-[#222222]/25">oder</span>
        <div className="flex-1 h-px bg-creme/8" />
      </div>

      <button type="button" onClick={handleMagicLink} disabled={loading}
        className="w-full border border-[#222222]/12 text-[#222222]/60 font-medium py-3 rounded-full text-sm hover:text-[#222222] hover:border-[#222222]/25 disabled:opacity-50 transition-all">
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
