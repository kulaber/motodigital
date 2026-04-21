import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Route lists below use *locale-stripped* paths. Where the slug is translated,
// both DE and EN variants must be listed (e.g. /willkommen + /welcome).
const PROTECTED_ROUTES = [
  '/dashboard',
  '/bikes/new',
  '/profile',
  '/inserat-aufgeben',
  '/werkstatt-dashboard',
  '/onboarding',
  '/willkommen',
  '/welcome',
  '/rider',
]
const AUTH_ROUTES = ['/auth/login', '/auth/register']
const EMAIL_CONFIRMED_ROUTES = PROTECTED_ROUTES

function splitLocale(pathname: string): { locale: string; rest: string } {
  const seg = pathname.split('/')[1] ?? ''
  if ((routing.locales as readonly string[]).includes(seg)) {
    const rest = pathname.slice(seg.length + 1) || '/'
    return { locale: seg, rest }
  }
  return { locale: routing.defaultLocale, rest: pathname || '/' }
}

function withLocale(locale: string, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${clean === '/' ? '' : clean}`
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const path = request.nextUrl.pathname
  // Non-canonical hosts (motodigital.vercel.app, preview URLs, localhost) must
  // be hidden from search engines so they don't duplicate-index motodigital.io.
  const isCanonicalHost = host.includes('motodigital.io')
  const applyNoIndex = (res: NextResponse) => {
    if (!isCanonicalHost) res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  // Coming-soon rewrite for motodigital.io — runs before i18n handling.
  // The page itself lives under [locale]/coming-soon, so we must target the
  // fully-qualified locale path (next-intl's internal rewriting doesn't fire
  // because we short-circuit before its middleware runs).
  if (isCanonicalHost && !path.includes('coming-soon')) {
    return NextResponse.rewrite(
      new URL(`/${routing.defaultLocale}/coming-soon`, request.url)
    )
  }

  // Skip API routes completely — no i18n, no auth redirect logic here
  if (path.startsWith('/api')) {
    return applyNoIndex(NextResponse.next())
  }

  // Run next-intl first — it handles locale detection, redirects (/ → /de),
  // and translated-pathname rewrites under the hood.
  const intlResponse = intlMiddleware(request)

  // If next-intl wants to redirect (e.g. / → /de, /workshops → /en/workshops),
  // honour it immediately and skip the auth pass for this request.
  // Upgrade 307 → 308 so Google treats old unprefixed URLs as *permanently*
  // moved to the localized URL — avoids staying indexed under duplicate paths.
  if (
    intlResponse.status === 307 ||
    intlResponse.status === 308 ||
    intlResponse.headers.get('location')
  ) {
    if (intlResponse.status === 307 && intlResponse.headers.get('location')) {
      return applyNoIndex(NextResponse.redirect(intlResponse.headers.get('location')!, {
        status: 308,
        headers: intlResponse.headers,
      }))
    }
    return applyNoIndex(intlResponse)
  }

  // Build the Supabase client on top of the intl response so intl headers
  // (x-middleware-rewrite etc.) and cookies are preserved.
  let supabaseResponse = intlResponse
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          const next = NextResponse.next({ request })
          intlResponse.headers.forEach((v, k) => next.headers.set(k, v))
          cookiesToSet.forEach(({ name, value, options }) =>
            next.cookies.set(name, value, options as Parameters<typeof next.cookies.set>[2])
          )
          supabaseResponse = next
        },
      },
    }
  )

  const { locale, rest } = splitLocale(path)

  // Catch Supabase auth error redirects (expired magic links etc.) on the
  // localized homepage and bounce them to the localized login page.
  if (rest === '/' && request.nextUrl.searchParams.get('error_code')) {
    const desc =
      request.nextUrl.searchParams.get('error_description') ?? 'Authentifizierungsfehler'
    const loginUrl = new URL(withLocale(locale, '/auth/login'), request.url)
    loginUrl.searchParams.set('error', desc)
    return applyNoIndex(NextResponse.redirect(loginUrl))
  }

  // Refresh session — do not insert logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && PROTECTED_ROUTES.some(r => rest.startsWith(r))) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = withLocale(locale, '/auth/login')
    const fullPath = request.nextUrl.search ? `${path}${request.nextUrl.search}` : path
    loginUrl.searchParams.set('redirectTo', fullPath)
    return applyNoIndex(NextResponse.redirect(loginUrl))
  }

  if (
    user &&
    !user.email_confirmed_at &&
    EMAIL_CONFIRMED_ROUTES.some(r => rest.startsWith(r))
  ) {
    const verifyUrl = request.nextUrl.clone()
    verifyUrl.pathname = withLocale(locale, '/verify-email')
    verifyUrl.searchParams.set('email', user.email ?? '')
    return applyNoIndex(NextResponse.redirect(verifyUrl))
  }

  if (
    user &&
    !rest.startsWith('/willkommen') &&
    !rest.startsWith('/welcome') &&
    !rest.startsWith('/auth') &&
    !rest.startsWith('/verify-email') &&
    !rest.startsWith('/bikes/new')
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.onboarding_completed === false) {
      return applyNoIndex(NextResponse.redirect(
        new URL(withLocale(locale, '/willkommen'), request.url)
      ))
    }

    if (rest === '/') {
      const target = profile?.role === 'custom-werkstatt' ? '/dashboard' : '/explore'
      return applyNoIndex(NextResponse.redirect(new URL(withLocale(locale, target), request.url)))
    }
  }

  if (user && AUTH_ROUTES.some(r => rest.startsWith(r))) {
    return applyNoIndex(NextResponse.redirect(new URL(withLocale(locale, '/explore'), request.url)))
  }

  return applyNoIndex(supabaseResponse)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)',
  ],
}
