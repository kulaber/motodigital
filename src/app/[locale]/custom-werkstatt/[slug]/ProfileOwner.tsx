'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

// The workshop profile page is cached for everyone; owner-specific UI is
// picked in the browser. Visitors are the default while the session loads.

/** True when the signed-in user owns the workshop profile `slug`. */
export function useIsProfileOwner(slug: string): boolean {
  const { user, role, slug: ownSlug } = useAuth()
  return !!user && role === 'custom-werkstatt' && ownSlug === slug
}

export function OwnerOnly({ slug, children }: { slug: string; children: ReactNode }) {
  return useIsProfileOwner(slug) ? <>{children}</> : null
}

export function VisitorOnly({ slug, children }: { slug: string; children: ReactNode }) {
  return useIsProfileOwner(slug) ? null : <>{children}</>
}

export function OwnerSwitch({ slug, owner, visitor }: { slug: string; owner: ReactNode; visitor: ReactNode }) {
  return <>{useIsProfileOwner(slug) ? owner : visitor}</>
}
