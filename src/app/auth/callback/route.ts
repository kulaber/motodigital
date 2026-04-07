import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPostLoginRedirect } from '@/lib/auth/redirectAfterLogin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Fetch user role + onboarding status for redirect
      const { data: { user } } = await supabase.auth.getUser()
      let role: string | null = null
      let onboardingCompleted = true
      if (user) {
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('role, onboarding_completed')
          .eq('id', user.id)
          .maybeSingle() as { data: { role: string | null; onboarding_completed: boolean | null } | null }
        role = profile?.role ?? null
        onboardingCompleted = profile?.onboarding_completed ?? true
      }

      // New user needs onboarding → /willkommen
      if (!onboardingCompleted) {
        return NextResponse.redirect(`${origin}/willkommen?confirmed=true`)
      }

      const target = getPostLoginRedirect(role as Parameters<typeof getPostLoginRedirect>[0], redirectTo)
      const separator = target.includes('?') ? '&' : '?'
      return NextResponse.redirect(`${origin}${target}${separator}confirmed=true`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
