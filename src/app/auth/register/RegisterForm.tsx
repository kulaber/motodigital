'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'rider' | 'builder' | 'workshop'

const ROLES: { value: Role; emoji: string; label: string; desc: string }[] = [
  { value: 'rider',    emoji: '🏍️', label: 'Rider',    desc: 'Ich suche Bikes' },
  { value: 'builder',  emoji: '🔧', label: 'Builder',  desc: 'Ich baue Bikes' },
  { value: 'workshop', emoji: '🏪', label: 'Workshop', desc: 'Ich betreibe eine Werkstatt' },
]

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
        data: {
          full_name: name,
          username,
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update waitlist entry if exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('waitlist') as any)
      .update({ invited_at: new Date().toISOString() })
      .eq('email', email)

    router.push('/auth/verify?email=' + encodeURIComponent(email))
  }

  // Step 1 — Role selection
  if (step === 1) {
    return (
      <div>
        <p className="text-xs font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-4 text-center">
          Ich bin...
        </p>
        <div className="flex flex-col gap-2">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => handleRoleSelect(r.value)}
              className="flex items-center gap-4 p-4 bg-[#141414] border border-[#F0EDE4]/8 rounded-xl hover:border-[#2AABAB]/40 hover:bg-[#2AABAB]/05 transition-all text-left group"
            >
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-[#F0EDE4] group-hover:text-[#2AABAB] transition-colors">{r.label}</p>
                <p className="text-xs text-[#F0EDE4]/35">{r.desc}</p>
              </div>
              <span className="ml-auto text-[#F0EDE4]/20 group-hover:text-[#2AABAB] transition-colors">→</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 2 — Details
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Role badge + back */}
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => setStep(1)} className="text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors">
          ← Zurück
        </button>
        <span className="text-xs bg-[#2AABAB]/12 text-[#2AABAB] border border-[#2AABAB]/20 px-2.5 py-1 rounded-full font-medium capitalize">
          {ROLES.find(r => r.value === role)?.emoji} {role}
        </span>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-1.5">Name</label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          placeholder="Dein Name"
          className="w-full bg-[#141414] border border-[#F0EDE4]/10 rounded-xl px-4 py-3 text-sm text-[#F0EDE4] placeholder:text-[#F0EDE4]/20 outline-none focus:border-[#2AABAB] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-1.5">E-Mail</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full bg-[#141414] border border-[#F0EDE4]/10 rounded-xl px-4 py-3 text-sm text-[#F0EDE4] placeholder:text-[#F0EDE4]/20 outline-none focus:border-[#2AABAB] transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#F0EDE4]/35 uppercase tracking-widest mb-1.5">Passwort</label>
        <input
          type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Mindestens 8 Zeichen"
          className="w-full bg-[#141414] border border-[#F0EDE4]/10 rounded-xl px-4 py-3 text-sm text-[#F0EDE4] placeholder:text-[#F0EDE4]/20 outline-none focus:border-[#2AABAB] transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#2AABAB] text-[#141414] font-semibold py-3 rounded-full text-sm hover:bg-[#3DBFBF] disabled:opacity-50 transition-all mt-1">
        {loading ? 'Wird erstellt...' : 'Account erstellen'}
      </button>

      <p className="text-center text-[10px] text-[#F0EDE4]/20 leading-relaxed">
        Mit der Registrierung stimmst du unseren Nutzungsbedingungen und der Datenschutzerklärung zu.
      </p>
    </form>
  )
}
