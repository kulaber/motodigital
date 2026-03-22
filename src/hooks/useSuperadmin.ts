'use client'

import { useAuth } from './useAuth'

export function useSuperadmin() {
  const { role, loading } = useAuth()
  return { isSuperadmin: role === 'superadmin', loading }
}
