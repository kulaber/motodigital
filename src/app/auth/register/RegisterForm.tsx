'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wrench, Bike, Eye, EyeOff, ArrowLeft, Check, X, Loader2 } from 'lucide-react'
import { translateAuthError } from '@/lib/auth/translateError'
import { getRoleDefaultRedirect } from '@/lib/auth/redirectAfterLogin'
import { notifyNewRegistration } from '@/lib/actions/admin-notifications'
import { useToast, ToastContainer } from '@/components/ui/Toast'

type Role = 'rider' | 'custom-werkstatt'

const WERKSTATT_BENEFITS: { text: string; badge?: string }[] = [
  { text: 'Öffentliches Werkstatt-Profil mit Galerie' },
  { text: 'Direktanfragen von Ridern – ohne Provision' },
  { text: 'Auf der Karte sichtbar' },
  { text: 'Custom Bikes präsentieren & verkaufen' },
  { text: 'Dashboard mit Besucherstatistiken', badge: 'PRO' },
]

const RIDER_BENEFITS = [
  'Präsentiere/Verkaufe dein Custom Bike',
  'Nutze die Explore-Seite & Teile, was dich bewegt',
  'Vernetze dich mit Fahrern in der Nähe',
  'Bilde Fahrgemeinschaften in der Nähe',
  'Digitaler Bike-Pass (bald verfügbar)',
]

export default function RegisterForm({ initialRole, onRoleChange }: { initialRole?: Role; onRoleChange?: (role: Role | null) => void }) {
  const [step, setStep] = useState<1 | 2>(initialRole ? 2 : 1)
  const [role, setRole] = useState<Role | null>(initialRole ?? null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const toast = useToast()

  function handleRoleSelect(r: Role) {
    setRole(r)
    setStep(2)
    onRoleChange?.(r)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setError(null)

    const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, username, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(getRoleDefaultRedirect(role as Parameters<typeof getRoleDefaultRedirect>[0]))}`,
      },
    })

    if (signUpError) {
      setError(translateAuthError(signUpError.message))
      setLoading(false)
      return
    }

    await (supabase.from('waitlist') as any)
      .update({ invited_at: new Date().toISOString() })
      .eq('email', email)

    // Notify superadmin (non-blocking)
    notifyNewRegistration({ name, email, role })

    toast.success('Fast geschafft — check deine Mails!')
    router.push('/verify-email?email=' + encodeURIComponent(email))
  }

  // ── Step 1 — Role selection ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex flex-col gap-3">

        {/* Rider */}
        <button
          onClick={() => handleRoleSelect('rider')}
          className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#06a5a5]/40 hover:bg-[#06a5a5]/[0.04] transition-all duration-200 text-left px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bike size={18} className="text-[#06a5a5]" />
            <p className="font-bold text-base text-white">Rider</p>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-[#06a5a5]/15 text-[#06a5a5] px-2 py-0.5 rounded-full">Kostenlos</span>
          </div>
          <p className="text-xs text-white/45 mb-3">Ich bin Custom-Bike interessiert / fahre ein Custom Bike</p>
          <ul className="flex flex-col gap-1.5">
            {RIDER_BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-2">
                <Check size={10} className="text-[#06a5a5] flex-shrink-0" />
                <span className="text-xs text-white/50">{b}</span>
              </li>
            ))}
          </ul>
        </button>

        {/* Custom Werkstatt */}
        <button
          onClick={() => handleRoleSelect('custom-werkstatt')}
          className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#06a5a5]/40 hover:bg-[#06a5a5]/[0.04] transition-all duration-200 text-left px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={18} className="text-[#06a5a5] flex-shrink-0" />
            <p className="font-bold text-base text-white whitespace-nowrap">Custom Werkstatt</p>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-[#06a5a5]/15 text-[#06a5a5] px-2 py-0.5 rounded-full">Kostenlos</span>
          </div>
          <p className="text-xs text-white/45 mb-3">Ich baue Custom Bikes & will Kunden erreichen</p>
          <ul className="flex flex-col gap-1.5">
            {WERKSTATT_BENEFITS.map(b => (
              <li key={b.text} className={`flex items-center gap-2${b.badge ? ' opacity-35' : ''}`}>
                {b.badge
                  ? <X size={10} className="text-white/40 flex-shrink-0" />
                  : <Check size={10} className="text-[#06a5a5] flex-shrink-0" />
                }
                <span className="text-xs text-white/50">{b.text}</span>
                {b.badge && (
                  <span className="text-[8px] font-bold uppercase tracking-widest bg-white/8 text-white/30 px-1.5 py-0.5 rounded-full border border-white/10">{b.badge}</span>
                )}
              </li>
            ))}
          </ul>
        </button>
      </div>
    )
  }

  // ── Step 2 — Details ────────────────────────────────────────────────────
  const isBuilder = role === 'custom-werkstatt'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Back + role indicator */}
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => { setStep(1); onRoleChange?.(null) }}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={13} />
          Zurück
        </button>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${
          isBuilder
            ? 'bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20'
            : 'bg-[#06a5a5]/10 text-[#06a5a5] border-[#06a5a5]/20'
        }`}>
          {isBuilder ? <Wrench size={11} /> : <Bike size={11} />}
          {isBuilder ? 'Custom Werkstatt' : 'Rider'}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 mb-1.5">
          {isBuilder ? 'Name / Werkstatt' : 'Dein Name'}
        </label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder={isBuilder ? 'z.B. Moto Garage Berlin' : 'Dein Name'}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          autoComplete="email"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/50 mb-1.5">Passwort</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required minLength={8}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mindestens 8 Zeichen"
            autoComplete="new-password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1 cursor-pointer">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Wird erstellt…
          </span>
        ) : 'Kostenlos starten'}
      </button>

      <p className="text-center text-xs text-white/25 leading-relaxed">
        Mit der Registrierung stimmst du unseren Nutzungsbedingungen und der Datenschutzerklärung zu.
      </p>
    </form>
    <ToastContainer toasts={toast.toasts} />
    </div>
  )
}
