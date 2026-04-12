'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth/translateError'
import { getPostLoginRedirect, validateRedirectTo } from '@/lib/auth/redirectAfterLogin'

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
  const redirectTo = searchParams.get('redirectTo')
  const urlError = searchParams.get('error')
  const supabase = createClient()

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(translateAuthError(error.message))
      setLoading(false)
    } else {
      // If there's a valid redirectTo, go there directly.
      // Otherwise fetch role for role-based default redirect.
      const validRedirect = validateRedirectTo(redirectTo)
      if (validRedirect) {
        router.push(validRedirect)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        let role: string | null = null
        let slug: string | null = null
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, slug, username')
            .eq('id', user.id)
            .maybeSingle()
          role = (profile as { role: string | null; slug: string | null; username: string | null } | null)?.role ?? null
          slug = (profile as { slug: string | null; username: string | null } | null)?.slug ?? (profile as { username: string | null } | null)?.username ?? null
        }
        if (role === 'rider' && slug) {
          router.push(`/rider/${slug}`)
        } else {
          router.push(getPostLoginRedirect(role as Parameters<typeof getPostLoginRedirect>[0]))
        }
      }
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
    // Pass redirectTo to callback if present; callback handles role-based default
    const callbackUrl = redirectTo
      ? `/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/callback'
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${callbackUrl}` },
    })
    if (error) setError(error.message)
    else setMagicSent(true)
    setLoading(false)
  }

  if (magicSent) return (
    <div className="text-center py-4">
      <p className="text-sm text-white mb-1">Link gesendet!</p>
      <p className="text-xs text-white/40">Check deine E-Mails — der Link ist 1 Stunde gültig.</p>
    </div>
  )

  return (
    <form onSubmit={handlePassword} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-white/50 mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-white/50">Passwort</label>
          {resetSent ? (
            <span className="text-[11px] text-green-500">Reset-Link gesendet</span>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetLoading}
              className="text-[11px] text-white/35 hover:text-[#06a5a5] transition-colors disabled:opacity-50"
            >
              {resetLoading ? 'Wird gesendet…' : 'Passwort vergessen?'}
            </button>
          )}
        </div>
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {(error || urlError) && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error || urlError}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 transition-all cursor-pointer">
        {loading ? 'Wird geladen...' : 'Anmelden'}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/25">oder</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button type="button" onClick={handleMagicLink} disabled={loading}
        className="w-full border border-white/10 text-white/60 font-medium py-3 rounded-full text-sm hover:text-white hover:border-white/25 disabled:opacity-50 transition-all cursor-pointer">
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
