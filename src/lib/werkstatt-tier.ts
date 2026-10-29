// Founding period until end of 2026 — all workshops have full access
const FOUNDING_PERIOD_END = new Date('2027-01-01T00:00:00+01:00')

export function isFoundingPeriod(now: Date = new Date()): boolean {
  return now < FOUNDING_PERIOD_END
}

export function isPremium(_tier: string | null | undefined): boolean {
  return true
}

/** Tier for a workshop without a paid subscription — founding_partner while the founding period runs */
export function unpaidTier(): 'founding_partner' | 'free' {
  return isFoundingPeriod() ? 'founding_partner' : 'free'
}

// Seats in the free founding period, shown on /partner and /vorteile
export const FOUNDING_MEMBER_LIMIT = 100
