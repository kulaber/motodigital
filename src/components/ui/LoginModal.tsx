'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, Mail, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* ─── Trigger Context ────────────────────────────────────── */

type TriggerContext =
  | 'bike_save'
  | 'comment'
  | 'like'
  | 'contact_builder'
  | 'message'
  | 'event_interest'

const CONTEXT_MESSAGES: Record<TriggerContext, string> = {
  bike_save: 'Melde dich an, um dieses Bike zu speichern',
  comment: 'Melde dich an, um zu kommentieren',
  like: 'Melde dich an, um dieses Bike zu liken',
  contact_builder: 'Melde dich an, um den Builder zu kontaktieren',
  message: 'Melde dich an, um eine Nachricht zu senden',
  event_interest: 'Melde dich an, um am Event teilzunehmen',
}

/* ─── Props ──────────────────────────────────────────────── */

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  triggerContext?: TriggerContext
}

/* ─── Component ──────────────────────────────────────────── */

export function LoginModal({ isOpen, onClose, triggerContext }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<'google' | 'apple' | 'magic' | 'password' | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setEmail('')
        setPassword('')
        setLoading(null)
        setMagicSent(false)
        setShowPassword(true)
        setError(null)
        setCooldown(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Focus trap + keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()

    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  if (!isOpen) return null

  const redirectUrl = `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(window.location.pathname)}`

  /* ─── Auth Handlers ──────────────────────────────────── */

  async function handleOAuth(provider: 'google' | 'apple') {
    setLoading(provider)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein')
      return
    }
    setLoading('magic')
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl },
    })

    if (error) {
      setError(error.message)
      setLoading(null)
    } else {
      setMagicSent(true)
      setLoading(null)
      setCooldown(60)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setLoading('magic')
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl },
    })

    if (error) {
      setError(error.message)
    } else {
      setCooldown(60)
    }
    setLoading(null)
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein')
      return
    }
    if (!password) {
      setError('Bitte gib dein Passwort ein')
      return
    }
    setLoading('password')
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(null)
    } else {
      onClose()
      window.location.reload()
    }
  }

  const contextMessage = triggerContext ? CONTEXT_MESSAGES[triggerContext] : null

  /* ─── Magic Link Sent View ───────────────────────────── */

  const magicSentView = (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-5">
        <Mail size={28} className="text-accent" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">
        Prüfe dein Postfach
      </h3>
      <p className="text-sm text-white/50 mb-1">
        Wir haben einen Login-Link gesendet an:
      </p>
      <p className="text-sm font-semibold text-white mb-6">
        {email}
      </p>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mb-4 w-full">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || loading === 'magic'}
        className="text-sm text-accent hover:text-accent-dark disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
      >
        {loading === 'magic' ? (
          <span className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Wird gesendet…
          </span>
        ) : cooldown > 0 ? (
          `Erneut senden in ${cooldown}s`
        ) : (
          'Link erneut senden'
        )}
      </button>

      <button
        type="button"
        onClick={() => { setMagicSent(false); setError(null) }}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mt-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Andere Methode wählen
      </button>
    </div>
  )

  /* ─── Default View ───────────────────────────────────── */

  const defaultView = (
    <>
      {/* Context message */}
      {contextMessage && (
        <p className="text-center text-sm text-white/50 mb-6">
          {contextMessage}
        </p>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-white text-[#222222] font-semibold py-3.5 rounded-2xl text-sm hover:bg-white/90 disabled:opacity-50 transition-all min-h-[48px]"
      >
        {loading === 'google' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
        )}
        Weiter mit Google
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleOAuth('apple')}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 bg-white/10 text-white font-semibold py-3.5 rounded-2xl text-sm hover:bg-white/15 disabled:opacity-50 transition-all border border-white/10 min-h-[48px]"
      >
        {loading === 'apple' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M14.94 9.88c-.02-2.12 1.73-3.14 1.81-3.19-1-.1.45-2.63-2.06-2.95-.86-.1-1.77.51-2.23.51-.47 0-1.17-.5-1.93-.48C9.07 3.79 7.74 4.53 7 5.78c-1.52 2.63-.39 6.52 1.07 8.65.73 1.04 1.59 2.2 2.71 2.16 1.1-.04 1.51-.7 2.83-.7s1.69.7 2.83.67c1.17-.02 1.91-1.04 2.62-2.09.84-1.2 1.18-2.38 1.19-2.44-.03-.01-2.31-.89-2.33-3.15h.02ZM12.77 2.59c.58-.74.98-1.73.87-2.74-.84.04-1.9.59-2.5 1.3-.54.63-1.02 1.67-.89 2.64.94.07 1.91-.48 2.52-1.2Z"/>
          </svg>
        )}
        Weiter mit Apple
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-wider">oder</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email + Password / Magic Link Form */}
      <form onSubmit={showPassword ? handlePasswordLogin : handleMagicLink} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null) }}
          placeholder="deine@email.de"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/50 transition-colors min-h-[48px]"
        />

        {showPassword && (
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null) }}
            placeholder="Passwort"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/50 transition-colors min-h-[48px]"
          />
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading !== null}
          className="w-full bg-accent text-white font-semibold py-3.5 rounded-2xl text-sm hover:bg-accent-dark disabled:opacity-50 transition-all min-h-[48px]"
        >
          {(loading === 'magic' || loading === 'password') ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {loading === 'password' ? 'Wird angemeldet…' : 'Wird gesendet…'}
            </span>
          ) : showPassword ? (
            'Anmelden'
          ) : (
            'Magic Link senden'
          )}
        </button>

        <button
          type="button"
          onClick={() => { setShowPassword(!showPassword); setError(null) }}
          className="text-xs text-white/35 hover:text-white/60 transition-colors text-center"
        >
          {showPassword ? 'Lieber Magic Link per E-Mail' : 'Mit Passwort anmelden'}
        </button>
      </form>
    </>
  )

  /* ─── Render ─────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Desktop: centered modal / Mobile: bottom sheet */}
      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className={[
            'relative z-10 w-full bg-[#1A1A1A] flex flex-col',
            // Mobile: bottom sheet
            'rounded-t-3xl pb-[env(safe-area-inset-bottom)] animate-slide-up-sheet',
            // Desktop: centered modal
            'sm:rounded-3xl sm:max-w-[420px] sm:pb-0 sm:animate-scale-in',
          ].join(' ')}
        >
          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col gap-3">
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <Image
                src="/logo.svg"
                alt="MotoDigital"
                width={280}
                height={106}
                className="h-16 w-auto"
                priority
              />
            </div>

            {/* Title */}
            {!magicSent && (
              <h2
                id="login-modal-title"
                className="text-xl font-bold text-white text-center mb-1"
              >
                Willkommen bei MotoDigital
              </h2>
            )}

            {magicSent ? magicSentView : defaultView}

            {/* Legal */}
            <p className="text-[11px] text-white/25 text-center mt-3 leading-relaxed">
              Mit der Anmeldung akzeptierst du unsere{' '}
              <a href="/agb" className="underline hover:text-white/40 transition-colors">
                AGB
              </a>{' '}
              und{' '}
              <a href="/datenschutz" className="underline hover:text-white/40 transition-colors">
                Datenschutzrichtlinie
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
