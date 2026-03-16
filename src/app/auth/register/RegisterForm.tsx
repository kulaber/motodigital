'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wrench, Bike, BadgeCheck, ChevronRight } from 'lucide-react'

type Role = 'rider' | 'builder'

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
        <p className="text-xs font-semibold text-[#1A1714]/35 uppercase tracking-widest mb-4 text-center">
          Ich bin...
        </p>

        <div className="flex flex-col gap-2.5">
          {/* Builder — primary / recommended */}
          <button
            onClick={() => handleRoleSelect('builder')}
            className="relative flex items-center gap-4 p-4 bg-[#2AABAB]/6 border border-[#2AABAB]/30 rounded-xl hover:border-[#2AABAB]/60 hover:bg-[#2AABAB]/10 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2AABAB]/15 border border-[#2AABAB]/25 flex items-center justify-center flex-shrink-0">
              <Wrench size={18} className="text-[#2AABAB]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-sm font-bold text-[#1A1714] whitespace-nowrap">Builder</p>
                <span className="text-[9px] font-bold uppercase tracking-widest bg-[#2AABAB] text-[#141414] px-2 py-0.5 rounded-full whitespace-nowrap">
                  Beliebt
                </span>
              </div>
              <p className="text-xs text-[#1A1714]/45">Ich baue Custom Bikes & möchte Kunden gewinnen</p>
            </div>
            <ChevronRight size={15} className="text-[#2AABAB]/50 group-hover:text-[#2AABAB] transition-colors flex-shrink-0" />
          </button>

          {/* Rider — secondary */}
          <button
            onClick={() => handleRoleSelect('rider')}
            className="flex items-center gap-4 p-4 bg-[#F5F2EB] border border-[#1A1714]/8 rounded-xl hover:border-[#1A1714]/20 hover:bg-[#1A1714]/3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1A1714]/5 border border-[#1A1714]/10 flex items-center justify-center flex-shrink-0">
              <Bike size={18} className="text-[#1A1714]/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1714] mb-0.5">Rider</p>
              <p className="text-xs text-[#1A1714]/35">Ich suche Custom Bikes & Inspiration</p>
            </div>
            <ChevronRight size={15} className="text-[#1A1714]/20 group-hover:text-[#1A1714]/50 transition-colors flex-shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-5 px-1">
          <BadgeCheck size={12} className="text-[#2AABAB]/60 flex-shrink-0" />
          <p className="text-[11px] text-[#1A1714]/30">Kostenlos — keine Kreditkarte — jederzeit kündbar</p>
        </div>
      </div>
    )
  }

  // ── Step 2 — Details ────────────────────────────────────────────────────
  const isBuilder = role === 'builder'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Role badge + back */}
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => setStep(1)}
          className="text-xs text-[#1A1714]/35 hover:text-[#1A1714] transition-colors flex items-center gap-1">
          ← Zurück
        </button>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
          isBuilder
            ? 'bg-[#2AABAB]/12 text-[#2AABAB] border-[#2AABAB]/25'
            : 'bg-[#1A1714]/6 text-[#1A1714]/50 border-[#1A1714]/12'
        }`}>
          {isBuilder ? '🔧 Builder' : '🏍️ Rider'}
        </span>
      </div>

      {isBuilder && (
        <div className="flex items-start gap-2.5 bg-[#2AABAB]/6 border border-[#2AABAB]/20 rounded-xl px-3.5 py-3 -mt-1">
          <BadgeCheck size={13} className="text-[#2AABAB] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#2AABAB]/80 leading-relaxed">
            Nach der Registrierung kannst du dein Builder-Profil mit Builds, Öffnungszeiten und Fotos befüllen.
          </p>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-semibold text-[#1A1714]/35 uppercase tracking-widest mb-1.5">
          {isBuilder ? 'Name / Workshop' : 'Name'}
        </label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder={isBuilder ? 'z.B. Moto Garage Berlin' : 'Dein Name'}
          className="w-full bg-[#F5F2EB] border border-[#1A1714]/10 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#1A1714]/20 outline-none focus:border-[#2AABAB] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#1A1714]/35 uppercase tracking-widest mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full bg-[#F5F2EB] border border-[#1A1714]/10 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#1A1714]/20 outline-none focus:border-[#2AABAB] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#1A1714]/35 uppercase tracking-widest mb-1.5">Passwort</label>
        <input
          type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Mindestens 8 Zeichen"
          className="w-full bg-[#F5F2EB] border border-[#1A1714]/10 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#1A1714]/20 outline-none focus:border-[#2AABAB] transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#2AABAB] text-[#141414] font-semibold py-3 rounded-full text-sm hover:bg-[#3DBFBF] disabled:opacity-50 transition-all mt-1 cursor-pointer">
        {loading ? 'Wird erstellt...' : 'Account erstellen'}
      </button>

      <p className="text-center text-xs text-[#1A1714]/25 leading-relaxed">
        Mit der Registrierung stimmst du unseren Nutzungsbedingungen und der Datenschutzerklärung zu.
      </p>
    </form>
  )
}
