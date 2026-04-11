'use client'

import { useState } from 'react'
import { Crown, ExternalLink, Loader2 } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/Toast'

type Props = {
  subscriptionTier: string
  subscriptionStartedAt: string | null
  hasStripeCustomer: boolean
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  founding_partner: 'Founding Partner',
  pro: 'Pro',
  premium: 'Premium',
}

export default function SubscriptionSection({ subscriptionTier, subscriptionStartedAt, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { toasts, error } = useToast()

  const isPaid = subscriptionTier !== 'free'
  const tierLabel = TIER_LABELS[subscriptionTier] ?? subscriptionTier

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      error(data.error || 'Fehler beim Öffnen des Kundenportals')
    } catch {
      error('Verbindungsfehler. Bitte versuche es erneut.')
    }
    setLoading(false)
  }

  async function handleCheckout() {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        console.error('[Checkout] Non-JSON response:', text.substring(0, 500))
        error('Server-Fehler. Bitte versuche es erneut.')
        setCheckoutLoading(false)
        return
      }
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      error(data.error || 'Fehler beim Checkout')
    } catch (err) {
      console.error('[Checkout] Fetch error:', err)
      error('Verbindungsfehler. Bitte versuche es erneut.')
    }
    setCheckoutLoading(false)
  }

  return (
    <>
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Abo & Abrechnung</h2>

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPaid && <Crown size={14} className="text-[#06a5a5]" />}
              <span className="text-sm font-semibold text-[#222222]">{tierLabel}</span>
              {isPaid && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#06a5a5]/10 text-[#06a5a5]">
                  Aktiv
                </span>
              )}
            </div>
            {isPaid && subscriptionStartedAt && (
              <p className="text-xs text-[#222222]/40">
                Mitglied seit {new Date(subscriptionStartedAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </p>
            )}
            {!isPaid && (
              <p className="text-xs text-[#222222]/40">
                Kostenloser Zugang — upgrade jederzeit möglich
              </p>
            )}
          </div>
        </div>

        {isPaid && hasStripeCustomer ? (
          <button
            onClick={openPortal}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#06a5a5] border border-[#06a5a5]/20 px-5 py-2.5 rounded-full hover:bg-[#06a5a5]/5 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ExternalLink size={14} />
            )}
            {loading ? 'Wird geladen...' : 'Abo verwalten'}
          </button>
        ) : (
          <div className="border border-[#06a5a5]/15 rounded-xl p-4 bg-[#06a5a5]/[0.03]">
            <p className="text-xs text-[#222222]/50 mb-3 leading-relaxed">
              Premium-Profil, Top-Platzierung und exklusives Founding Partner Badge — nur 10 Plätze verfügbar.
            </p>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-colors disabled:opacity-50"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Weiterleitung...
                </>
              ) : (
                'Founding Partner werden — 39 €/Mo'
              )}
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </>
  )
}
