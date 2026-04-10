import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/bikes/new', '/profile', '/inserat-aufgeben', '/werkstatt-dashboard', '/onboarding', '/willkommen', '/rider']
// Routes only accessible when NOT logged in
const AUTH_ROUTES = ['/auth/login', '/auth/register']
// Routes that require a confirmed email (subset of PROTECTED_ROUTES)
const EMAIL_CONFIRMED_ROUTES = PROTECTED_ROUTES

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Coming soon — rewrite all requests on motodigital.io to /coming-soon
  const host = request.headers.get('host') ?? ''
  const path = request.nextUrl.pathname
  if (host.includes('motodigital.io') && !path.startsWith('/coming-soon')) {
    return NextResponse.rewrite(new URL('/coming-soon', request.url))
  }

  // Catch Supabase auth error redirects (expired/invalid magic links, OTPs)
  if (path === '/' && request.nextUrl.searchParams.get('error_code')) {
    const desc = request.nextUrl.searchParams.get('error_description') ?? 'Authentifizierungsfehler'
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', desc)
    return NextResponse.redirect(loginUrl)
  }

  // Refresh session — IMPORTANT: do not add logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  if (!user && PROTECTED_ROUTES.some(r => path.startsWith(r))) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    // Preserve full path + search params so user lands back after login
    const fullPath = request.nextUrl.search ? `${path}${request.nextUrl.search}` : path
    loginUrl.searchParams.set('redirectTo', fullPath)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect unverified users to /verify-email for protected routes
  if (user && !user.email_confirmed_at && EMAIL_CONFIRMED_ROUTES.some(r => path.startsWith(r))) {
    const verifyUrl = request.nextUrl.clone()
    verifyUrl.pathname = '/verify-email'
    verifyUrl.searchParams.set('email', user.email ?? '')
    return NextResponse.redirect(verifyUrl)
  }

  // Onboarding guard: redirect non-onboarded users to /willkommen
  if (
    user &&
    !path.startsWith('/willkommen') &&
    !path.startsWith('/auth') &&
    !path.startsWith('/api') &&
    !path.startsWith('/verify-email') &&
    !path.startsWith('/bikes/new')
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.onboarding_completed === false) {
      return NextResponse.redirect(new URL('/willkommen', request.url))
    }

    // Redirect logged-in users from homepage to their role-based start page
    if (path === '/') {
      const target = profile?.role === 'custom-werkstatt' ? '/dashboard' : '/explore'
      return NextResponse.redirect(new URL(target, request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL('/explore', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
