'use client'

import { useAuth } from '@/hooks/useAuth'
import PriceLoginButton from './PriceLoginButton'

// Prices are shown to signed-in users only. Resolved in the browser so the
// bike pages themselves stay cacheable for everyone.

function formatAmount(amount: number, fractionDigits: number) {
  return Number(amount).toLocaleString('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/** Price on the bike detail page — login prompt for visitors. */
export default function BikePrice({ amount }: { amount: number }) {
  const { user, loading } = useAuth()

  // Keep the slot empty while the session resolves, so signed-in users never see the login prompt flash
  if (loading) return <div className="h-9 sm:h-10" aria-hidden />
  if (!user) return <PriceLoginButton />

  return (
    <p className="text-2xl sm:text-3xl font-bold text-[#222222]">
      {formatAmount(amount, 2)} <span className="text-base font-semibold text-[#222222]/50">€</span>
    </p>
  )
}

/** Price on bike cards — hidden for visitors. */
export function BikeCardPrice({ amount }: { amount: number }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <span className="text-xs sm:text-sm font-bold text-[#222222] flex-shrink-0">
      {formatAmount(amount, 0)} <span className="text-[10px] font-semibold text-[#222222]/40">€</span>
    </span>
  )
}
