'use client'

import { useAuth } from '@/hooks/useAuth'

export default function MobileCTAWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <div className={`sm:hidden fixed left-0 right-0 z-40 flex justify-center px-4 ${user ? 'bottom-28' : 'bottom-6'}`}>
      <div className="w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}
