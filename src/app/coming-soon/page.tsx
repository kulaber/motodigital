'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, BadgeCheck } from 'lucide-react'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('waitlist') as any)
      .insert({ email })

    if (error && !error.message.includes('duplicate')) {
      setError('Etwas ist schiefgelaufen. Bitte versuche es erneut.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4] flex flex-col items-center justify-center px-5 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(42,171,171,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 100%, rgba(42,171,171,0.05) 0%, transparent 65%)' }} />

      <div className="w-full max-w-lg text-center relative">

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image src="/logo.svg" alt="MotoDigital" width={260} height={98} className="h-14 w-auto" priority />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#2AABAB]/10 border border-[#2AABAB]/25 text-[#2AABAB] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2AABAB] animate-pulse" />
          Demnächst verfügbar
        </div>

        {/* Headline */}
        <h1 className="font-bold text-[#F0EDE4] leading-tight mb-5"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.03em' }}>
          Die Plattform für<br />
          <span className="text-[#F0EDE4]/25">Custom Motorcycle Builder.</span>
        </h1>

        <p className="text-[#F0EDE4]/45 text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Verifizierte Builder, direkt kontaktierbar — ohne Umwege, ohne Provision. Wir starten bald.
        </p>

        {/* Waitlist form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto mb-4">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="flex-1 bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-full px-5 py-3 text-sm text-[#F0EDE4] placeholder:text-[#F0EDE4]/25 outline-none focus:border-[#2AABAB] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2AABAB] text-[#141414] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#3DBFBF] disabled:opacity-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {loading ? 'Wird gespeichert...' : <>Benachrichtigen <ArrowRight size={14} /></>}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-[#2AABAB]/10 border border-[#2AABAB]/25 rounded-full px-6 py-3 max-w-sm mx-auto mb-4">
            <BadgeCheck size={16} className="text-[#2AABAB]" />
            <p className="text-sm font-semibold text-[#2AABAB]">Du bist auf der Liste — wir melden uns!</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 mb-4">{error}</p>
        )}

        <p className="text-xs text-[#F0EDE4]/20">Kein Spam. Nur eine Nachricht, wenn wir live gehen.</p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-14 pt-8 border-t border-[#F0EDE4]/6">
          {[
            { value: '6+', label: 'Builder' },
            { value: '5', label: 'Länder' },
            { value: '100%', label: 'Kostenlos' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-bold text-[#F0EDE4]">{s.value}</p>
              <p className="text-[10px] text-[#F0EDE4]/30 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
