'use client'

import { useState } from 'react'
import { Crown, ExternalLink, Loader2 } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/Toast'

type Props = {
  subscriptionTier: string
  subscriptionStartedAt: string | null
  subscriptionCancelAt: string | null
  hasStripeCustomer: boolean
}

const TIER_LABELS: Record<string, string> = {
  free: 'Founding Member',
  founding_partner: 'Founding Member',
  pro: 'Pro',
}

export default function SubscriptionSection({ subscriptionTier, subscriptionStartedAt, subscriptionCancelAt, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false)
  const { toasts, error } = useToast()

  const tierLabel = TIER_LABELS[subscriptionTier] ?? subscriptionTier
  const isCancelling = hasStripeCustomer && !!subscriptionCancelAt

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

  return (
    <>
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Mitgliedschaft</h2>

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={14} className="text-[#06a5a5]" />
              <span className="text-sm font-semibold text-[#222222]">{tierLabel}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isCancelling
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-[#06a5a5]/10 text-[#06a5a5]'
              }`}>
                {isCancelling ? 'Wird gekündigt' : 'Aktiv'}
              </span>
            </div>
            {isCancelling && (
              <p className="text-xs text-amber-600">
                Aktiv bis {new Date(subscriptionCancelAt!).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} — danach endet dein Abo.
              </p>
            )}
            {!isCancelling && subscriptionStartedAt && hasStripeCustomer && (
              <p className="text-xs text-[#222222]/40">
                Mitglied seit {new Date(subscriptionStartedAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {hasStripeCustomer ? (
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
          <div className="border border-[#06a5a5]/15 rounded-xl p-5 bg-[#06a5a5]/[0.03]">
            <p className="text-sm font-semibold text-[#222222] mb-1">Alle PRO-Features kostenlos bis Ende 2026</p>
            <p className="text-xs text-[#222222]/40 leading-relaxed">
              Du bist Founding Member — unbegrenzte Bikes, Analytics, Kontaktieren-Button und alle zukünftigen Features inklusive.
            </p>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </>
  )
}
