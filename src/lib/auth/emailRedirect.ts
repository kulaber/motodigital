/**
 * Resolve the absolute origin Supabase should embed into auth emails
 * (magic link, sign-up confirmation, password reset, etc.).
 *
 * NEVER use `window.location.origin` directly for emailRedirectTo: when
 * a user hits the app via a Vercel preview/alias domain (e.g.
 * motodigital.vercel.app), `window.location.origin` resolves to that
 * preview host and the email link routes the user away from the
 * canonical domain.
 *
 * Priority:
 *  1. NEXT_PUBLIC_APP_URL — set per Vercel environment (Production →
 *     motodigital.io, Preview → staging.motodigital.io, Local → blank).
 *  2. window.location.origin — only used when the env var is blank,
 *     which is the local-dev case.
 *  3. Hard fallback to the production canonical, so a misconfigured
 *     deployment still produces working links rather than broken ones.
 */
export function getEmailRedirectBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://motodigital.io'
}
