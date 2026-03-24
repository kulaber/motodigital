'use client'

import { useAuth } from '@/hooks/useAuth'

export default function FooterWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <>{children}</>

  return (
    <div className={user ? 'hidden md:block' : ''}>
      {children}
    </div>
  )
}
