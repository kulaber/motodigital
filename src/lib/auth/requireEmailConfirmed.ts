import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side guard: checks that the current user has confirmed their email.
 * Redirects to /verify-email if not confirmed, or to /auth/login if not authenticated.
 *
 * Returns the authenticated, email-confirmed user.
 */
export async function requireEmailConfirmed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!user.email_confirmed_at) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email ?? '')}`)
  }

  return { user, confirmed: true as const }
}
