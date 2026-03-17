'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wrench, Bike, BadgeCheck, ChevronRight } from 'lucide-react'

type Role = 'rider' | 'custom-werkstatt'

export default function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleRoleSelect(r: Role) {
    setRole(r)
    setStep(2)
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
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    await (supabase.from('waitlist') as any)
      .update({ invited_at: new Date().toISOString() })
      .eq('email', email)

    router.push('/auth/verify?email=' + encodeURIComponent(email))
  }

  // ── Step 1 — Role selection ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <p className="text-xs font-semibold text-[#222222]/35 uppercase tracking-widest mb-4 text-center">
          Ich bin...
        </p>

        <div className="flex flex-col gap-2.5">
          {/* Builder — primary / recommended */}
          <button
            onClick={() => handleRoleSelect('custom-werkstatt')}
            className="relative flex items-center gap-4 p-4 bg-[#222222]/6 border border-[#DDDDDD]/30 rounded-xl hover:border-[#DDDDDD]/60 hover:bg-[#222222]/10 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#222222]/15 border border-[#DDDDDD]/25 flex items-center justify-center flex-shrink-0">
              <Wrench size={18} className="text-[#717171]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-sm font-bold text-[#222222] whitespace-nowrap">Custom-Werkstatt</p>
                <span className="text-[9px] font-bold uppercase tracking-widest bg-[#06a5a5] text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                  Beliebt
                </span>
              </div>
              <p className="text-xs text-[#222222]/45">Ich baue Custom Bikes & möchte Kunden gewinnen</p>
            </div>
            <ChevronRight size={15} className="text-[#717171]/50 group-hover:text-[#717171] transition-colors flex-shrink-0" />
          </button>

          {/* Rider — secondary */}
          <button
            onClick={() => handleRoleSelect('rider')}
            className="flex items-center gap-4 p-4 bg-white border border-[#222222]/8 rounded-xl hover:border-[#222222]/20 hover:bg-[#222222]/3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#222222]/5 border border-[#222222]/10 flex items-center justify-center flex-shrink-0">
              <Bike size={18} className="text-[#222222]/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#222222] mb-0.5">Rider</p>
              <p className="text-xs text-[#222222]/35">Ich suche Custom Bikes & Inspiration</p>
            </div>
            <ChevronRight size={15} className="text-[#222222]/20 group-hover:text-[#222222]/50 transition-colors flex-shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-5 px-1">
          <BadgeCheck size={12} className="text-[#717171]/60 flex-shrink-0" />
          <p className="text-[11px] text-[#222222]/30">Kostenlos — keine Kreditkarte erforderlich</p>
        </div>
      </div>
    )
  }

  // ── Step 2 — Details ────────────────────────────────────────────────────
  const isBuilder = role === 'custom-werkstatt'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Role badge + back */}
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => setStep(1)}
          className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors flex items-center gap-1">
          ← Zurück
        </button>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
          isBuilder
            ? 'bg-[#222222]/12 text-[#717171] border-[#DDDDDD]/25'
            : 'bg-[#222222]/6 text-[#222222]/50 border-[#222222]/12'
        }`}>
          {isBuilder ? '🔧 Custom-Werkstatt' : '🏍️ Rider'}
        </span>
      </div>

      {isBuilder && (
        <div className="flex items-start gap-2.5 bg-[#222222]/6 border border-[#DDDDDD]/20 rounded-xl px-3.5 py-3 -mt-1">
          <BadgeCheck size={13} className="text-[#717171] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#717171]/80 leading-relaxed">
            Nach der Registrierung kannst du dein Werkstatt-Profil mit Builds, Öffnungszeiten und Fotos befüllen.
          </p>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">
          {isBuilder ? 'Name / Workshop' : 'Name'}
        </label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder={isBuilder ? 'z.B. Moto Garage Berlin' : 'Dein Name'}
          className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">Passwort</label>
        <input
          type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Mindestens 8 Zeichen"
          className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 transition-all mt-1 cursor-pointer">
        {loading ? 'Wird erstellt...' : 'Account erstellen'}
      </button>

      <p className="text-center text-xs text-[#222222]/25 leading-relaxed">
        Mit der Registrierung stimmst du unseren Nutzungsbedingungen und der Datenschutzerklärung zu.
      </p>
    </form>
  )
}
