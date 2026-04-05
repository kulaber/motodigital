type UserRole = 'rider' | 'custom-werkstatt' | 'superadmin' | null

const ROLE_DEFAULTS: Record<string, string> = {
  'rider': '/explore',
  'custom-werkstatt': '/dashboard',
  'superadmin': '/dashboard',
}

const FALLBACK_REDIRECT = '/explore'

/**
 * Validates that a redirectTo URL is same-origin (starts with `/`, no protocol).
 * Returns the URL if valid, otherwise null.
 */
export function validateRedirectTo(url: string | null | undefined): string | null {
  if (!url) return null
  // Must start with `/` and must NOT start with `//` (protocol-relative URL)
  if (url.startsWith('/') && !url.startsWith('//')) return url
  return null
}

/**
 * Determines the post-login redirect URL.
 * Priority: validated redirectTo > role-based default > fallback
 */
export function getPostLoginRedirect(role: UserRole, redirectTo?: string | null): string {
  const validRedirect = validateRedirectTo(redirectTo)
  if (validRedirect) return validRedirect
  return ROLE_DEFAULTS[role ?? ''] ?? FALLBACK_REDIRECT
}

/**
 * Returns the role-based default redirect (ignoring any redirectTo).
 */
export function getRoleDefaultRedirect(role: UserRole): string {
  return ROLE_DEFAULTS[role ?? ''] ?? FALLBACK_REDIRECT
}
