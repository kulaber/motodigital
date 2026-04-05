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
      // Fetch user role for role-based default redirect
      const { data: { user } } = await supabase.auth.getUser()
      let role: string | null = null
      if (user) {
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .maybeSingle() as { data: { role: string | null } | null }
        role = profile?.role ?? null
      }

      const target = getPostLoginRedirect(role as Parameters<typeof getPostLoginRedirect>[0], redirectTo)
      return NextResponse.redirect(`${origin}${target}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
