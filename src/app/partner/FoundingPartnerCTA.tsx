'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useToast, ToastContainer } from '@/components/ui/Toast'

export default function FoundingPartnerCTA({ slotsLeft }: { slotsLeft: number }) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthContext()
  const router = useRouter()
  const { toasts, error } = useToast()

  const soldOut = slotsLeft <= 0

  const handleCheckout = async () => {
    setLoading(true)

    // Not logged in — redirect to register as workshop with return to /partner
    if (!user) {
      router.push('/auth/register?role=custom-werkstatt&redirect=/partner')
      return
    }

    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        // No workshop profile yet — redirect to workshop registration
        if (res.status === 400 && data.error?.includes('Werkstatt')) {
          router.push('/auth/register?role=custom-werkstatt&redirect=/partner')
          return
        }
        error(data.error || 'Fehler beim Checkout')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      error('Verbindungsfehler. Bitte versuche es erneut.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="border border-[#06a5a5]/30 rounded-2xl p-6 flex flex-col bg-[#06a5a5]/5 relative overflow-hidden">
        {/* Highlight border glow */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(6,165,165,0.08) 0%, transparent 60%)',
        }} />

        <div className="relative z-10 flex flex-col flex-1">
          <div className="w-11 h-11 rounded-xl bg-[#06a5a5]/10 border border-[#06a5a5]/20 flex items-center justify-center mb-4">
            <Crown size={24} className="text-[#06a5a5]" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Founding Partner</h3>

          <p className="text-sm text-white/40 leading-relaxed mb-3 flex-1">
            Deine Werkstatt auf MotoDigital — mit Premium-Profil, Top-Platzierung und exklusivem Founding Partner Badge. Für immer.
          </p>

          {/* Slot counter */}
          <p className={`text-sm font-semibold mb-6 ${soldOut ? 'text-red-400' : 'text-[#06a5a5]'}`}>
            {soldOut
              ? 'Alle 10 Plätze vergeben'
              : `${slotsLeft} von 10 Plätzen noch verfügbar`
            }
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading || soldOut}
            className="inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Weiterleitung zu Stripe...
              </>
            ) : soldOut ? (
              'Alle 10 Plätze vergeben'
            ) : (
              'Jetzt Founding Partner werden — 39 €/Mo'
            )}
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  )
}
