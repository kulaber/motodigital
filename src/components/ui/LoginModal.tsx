'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Mail, Loader2, ArrowLeft, Wrench, Bike, Check, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* ─── Trigger Context ────────────────────────────────────── */

type TriggerContext =
  | 'bike_save'
  | 'comment'
  | 'like'
  | 'contact_builder'
  | 'message'
  | 'event_interest'
  | 'follow_rider'

const CONTEXT_MESSAGES: Record<TriggerContext, string> = {
  bike_save: 'Melde dich an, um dieses Bike zu speichern',
  comment: 'Melde dich an, um zu kommentieren',
  like: 'Melde dich an, um dieses Bike zu liken',
  contact_builder: 'Melde dich an, um den Builder zu kontaktieren',
  message: 'Melde dich an, um eine Nachricht zu senden',
  event_interest: 'Melde dich an, um am Event teilzunehmen',
  follow_rider: 'Melde dich an, um diesem Rider zu folgen',
}

/* ─── Register benefits ──────────────────────────────────── */

type Role = 'rider' | 'custom-werkstatt'

const RIDER_BENEFITS = [
  'Custom Werkstätten entdecken & kontaktieren',
  'Custom Bikes kaufen & Builds speichern',
  'Magazin, Guides & Community',
  'Digitaler Bike-Pass (bald verfügbar)',
]

const WERKSTATT_BENEFITS = [
  'Öffentliches Werkstatt-Profil mit Galerie',
  'Direktanfragen von Ridern — ohne Provision',
  'Auf der Karte sichtbar & auffindbar',
  'Custom Bikes inserieren & verkaufen',
]

/* ─── Props ──────────────────────────────────────────────── */

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  triggerContext?: TriggerContext
  initialMode?: 'login' | 'register'
}

/* ─── Component ──────────────────────────────────────────── */

export function LoginModal({ isOpen, onClose, triggerContext, initialMode = 'login' }: LoginModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [regStep, setRegStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState<'magic' | 'password' | 'register' | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const [registerDone, setRegisterDone] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

  // Sync initialMode + reset when modal opens/closes
  const prevOpenRef = useRef(false)
  useEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = isOpen

    if (isOpen && !wasOpen) {
      // Modal just opened — sync mode
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(initialMode)
    }

    if (!isOpen && wasOpen) {
      // Modal just closed — reset after animation
      const timer = setTimeout(() => {
        setEmail('')
        setPassword('')
        setName('')
        setRole(null)
        setRegStep(1)
        setLoading(null)
        setMagicSent(false)
        setRegisterDone(false)
        setShowPasswordField(true)
        setShowPw(false)
        setError(null)
        setCooldown(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialMode])

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

  const redirectUrl = `${window.location.origin}/auth/callback?redirectTo=/explore`

  /* ─── Auth Handlers ──────────────────────────────────── */

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
      router.push('/explore')
      router.refresh()
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!role || !name.trim() || !email.trim() || !password) return
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben')
      return
    }
    setLoading('register')
    setError(null)

    const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim(), username, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=/explore`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(null)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('waitlist') as any)
      .update({ invited_at: new Date().toISOString() })
      .eq('email', email.trim())

    setLoading(null)
    setRegisterDone(true)
  }

  function switchToRegister() {
    setMode('register')
    setError(null)
    setRegStep(1)
    setRole(null)
  }

  function switchToLogin() {
    setMode('login')
    setError(null)
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

  /* ─── Register Done View ─────────────────────────────── */

  const registerDoneView = (
    <div className="flex flex-col items-center text-center px-2">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-5">
        <Mail size={28} className="text-accent" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">
        Bestätige deine E-Mail
      </h3>
      <p className="text-sm text-white/50 mb-1">
        Wir haben dir einen Bestätigungslink gesendet an:
      </p>
      <p className="text-sm font-semibold text-white mb-6">
        {email}
      </p>
      <p className="text-xs text-white/30">
        Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
      </p>
    </div>
  )

  /* ─── Register: Role Selection (Step 1) ──────────────── */

  const registerRoleView = (
    <div className="flex flex-col gap-3">
      {/* Rider */}
      <button
        type="button"
        onClick={() => { setRole('rider'); setRegStep(2); setError(null) }}
        className="rounded-2xl border border-white/10 hover:border-white/25 transition-all text-left group"
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Bike size={18} className="text-accent" />
            <p className="font-bold text-xl text-white">Rider</p>
          </div>
          <p className="text-xs text-white/40 mb-2.5">Ich suche Custom Bikes & die richtige Werkstatt</p>
          <ul className="flex flex-col gap-1.5">
            {RIDER_BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-2">
                <Check size={10} className="text-white/25 flex-shrink-0" />
                <span className="text-xs text-white/40">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </button>

      {/* Custom Werkstatt */}
      <button
        type="button"
        onClick={() => { setRole('custom-werkstatt'); setRegStep(2); setError(null) }}
        className="rounded-2xl border border-white/10 hover:border-accent/50 transition-all text-left group"
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={18} className="text-accent" />
            <p className="font-bold text-xl text-white">Custom Werkstatt</p>
          </div>
          <p className="text-xs text-white/40 mb-2.5">Ich baue Custom Bikes & will Kunden gewinnen</p>
          <ul className="flex flex-col gap-1.5">
            {WERKSTATT_BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-2">
                <Check size={10} className="text-accent/60 flex-shrink-0" />
                <span className="text-xs text-white/40">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </button>
    </div>
  )

  /* ─── Register: Details (Step 2) ─────────────────────── */

  const isBuilder = role === 'custom-werkstatt'

  const registerFormView = (
    <form onSubmit={handleRegister} className="flex flex-col gap-3">
      {/* Back + role badge */}
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => { setRegStep(1); setError(null) }}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={13} />
          Zurück
        </button>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${
          isBuilder
            ? 'bg-accent/10 text-accent border-accent/20'
            : 'bg-white/5 text-white/50 border-white/10'
        }`}>
          {isBuilder ? <Wrench size={11} /> : <Bike size={11} />}
          {isBuilder ? 'Custom Werkstatt' : 'Rider'}
        </div>
      </div>

      <input
        type="text"
        required
        value={name}
        onChange={e => { setName(e.target.value); setError(null) }}
        placeholder={isBuilder ? 'Name / Werkstatt' : 'Dein Name'}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/50 transition-colors min-h-[48px]"
      />

      <input
        type="email"
        required
        value={email}
        onChange={e => { setEmail(e.target.value); setError(null) }}
        placeholder="deine@email.de"
        autoComplete="email"
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/50 transition-colors min-h-[48px]"
      />

      <div className="relative">
        <input
          type={showPw ? 'text' : 'password'}
          required
          minLength={8}
          value={password}
          onChange={e => { setPassword(e.target.value); setError(null) }}
          placeholder="Passwort (min. 8 Zeichen)"
          autoComplete="new-password"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 pr-11 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/50 transition-colors min-h-[48px]"
        />
        <button
          type="button"
          onClick={() => setShowPw(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

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
        {loading === 'register' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Wird erstellt…
          </span>
        ) : (
          'Account erstellen'
        )}
      </button>
    </form>
  )

  /* ─── Login View ─────────────────────────────────────── */

  const loginView = (
    <>
      {/* Context message */}
      {contextMessage && (
        <p className="text-center text-sm text-white/50 mb-6">
          {contextMessage}
        </p>
      )}

      {/* Email + Password / Magic Link Form */}
      <form onSubmit={showPasswordField ? handlePasswordLogin : handleMagicLink} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null) }}
          placeholder="deine@email.de"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-accent/50 transition-colors min-h-[48px]"
        />

        {showPasswordField && (
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
          ) : showPasswordField ? (
            'Anmelden'
          ) : (
            'Magic Link senden'
          )}
        </button>

        <button
          type="button"
          onClick={() => { setShowPasswordField(!showPasswordField); setError(null) }}
          className="text-xs text-white/35 hover:text-white/60 transition-colors text-center"
        >
          {showPasswordField ? 'Lieber Magic Link per E-Mail' : 'Mit Passwort anmelden'}
        </button>
      </form>
    </>
  )

  /* ─── Determine content ──────────────────────────────── */

  let title = 'Login'
  let content = loginView
  let showModeSwitch = true

  if (mode === 'login') {
    if (magicSent) {
      content = magicSentView
      showModeSwitch = false
    }
  } else {
    title = 'Kostenlos Registrieren'
    showModeSwitch = true

    if (registerDone) {
      content = registerDoneView
      showModeSwitch = false
    } else if (regStep === 1) {
      title = 'Wähle Deine Rolle:'
      content = registerRoleView
    } else {
      content = registerFormView
    }
  }

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
            // Mobile: bottom sheet — anchored to bottom, max height with internal scroll
            'rounded-t-3xl pb-[env(safe-area-inset-bottom)] animate-slide-up-sheet max-h-[90vh]',
            // Desktop: centered modal
            'sm:rounded-3xl sm:max-w-[420px] sm:pb-0 sm:animate-scale-in sm:max-h-[90vh]',
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

          {/* Content — scrollable if needed */}
          <div className="px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col gap-3 overflow-y-auto overscroll-contain">
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
            {!(mode === 'login' && magicSent) && !registerDone && (
              <h2
                id="login-modal-title"
                className="text-xl font-bold text-white text-center mb-1"
              >
                {title}
              </h2>
            )}

            {content}

            {/* Mode switch */}
            {showModeSwitch && (
              <p className="text-sm text-white/35 text-center mt-2">
                {mode === 'login' ? (
                  <>
                    Noch kein Konto?{' '}
                    <button type="button" onClick={switchToRegister} className="text-accent hover:text-accent-dark font-semibold transition-colors">
                      Registrieren
                    </button>
                  </>
                ) : (
                  <>
                    Bereits ein Konto?{' '}
                    <button type="button" onClick={switchToLogin} className="text-accent hover:text-accent-dark font-semibold transition-colors">
                      Anmelden
                    </button>
                  </>
                )}
              </p>
            )}

            {/* Legal */}
            <p className="text-[11px] text-white/25 text-center mt-3 leading-relaxed">
              Mit der {mode === 'login' ? 'Anmeldung' : 'Registrierung'} akzeptierst du unsere{' '}
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
