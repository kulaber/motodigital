export function isPremium(tier: string | null | undefined): boolean {
  return tier === 'founding_partner' || tier === 'pro'
}
