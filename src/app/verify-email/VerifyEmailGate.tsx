'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const COOLDOWN_SECONDS = 60
const POLL_INTERVAL_MS = 3000

export default function VerifyEmailGate({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Poll for email confirmation
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        clearInterval(interval)
        router.push('/dashboard')
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [supabase, router])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || !email) return
    setLoading(true)
    setError(null)
    setResendSuccess(false)

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (resendError) {
      setError(resendError.message)
    } else {
      setResendSuccess(true)
      setCooldown(COOLDOWN_SECONDS)
    }
    setLoading(false)
  }, [cooldown, email, supabase])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }, [supabase, router])

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl border border-[#222222]/6 shadow-sm p-8 text-center">

        {/* Mail icon */}
        <div className="w-16 h-16 rounded-full bg-[#2AABAB]/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="6" width="28" height="20" rx="4" stroke="#2AABAB" strokeWidth="1.5" />
            <path d="M6 11 L16 18 L26 11" stroke="#2AABAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-[#222222] mb-2">
          Bestätige deine E-Mail-Adresse
        </h1>

        <p className="text-sm text-[#222222]/50 leading-relaxed mb-1">
          Wir haben eine Bestätigungsmail an
        </p>
        {email && (
          <p className="text-sm font-semibold text-[#222222]/70 mb-3">{email}</p>
        )}
        <p className="text-sm text-[#222222]/50 leading-relaxed mb-6">
          gesendet. Klicke auf den Link in der Mail, um fortzufahren.
        </p>

        {/* Success toast */}
        {resendSuccess && (
          <div className="bg-[#2AABAB]/10 border border-[#2AABAB]/20 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-xs text-[#2AABAB] font-medium">
              Mail erneut gesendet — bitte prüfe deinen Posteingang.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="w-full bg-[#2AABAB] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#239494] disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading
            ? 'Wird gesendet...'
            : cooldown > 0
              ? `Erneut senden (${cooldown}s)`
              : 'E-Mail erneut senden'}
        </button>

        {/* Sign out / use different email */}
        <button
          onClick={handleSignOut}
          className="mt-3 w-full text-sm text-[#222222]/40 hover:text-[#222222]/70 transition-colors cursor-pointer"
        >
          Andere E-Mail-Adresse verwenden
        </button>
      </div>

      {/* Auto-check hint */}
      <p className="text-center text-xs text-[#222222]/30 mt-4">
        Diese Seite aktualisiert sich automatisch nach der Bestätigung.
      </p>
    </div>
  )
}
