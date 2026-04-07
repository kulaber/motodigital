'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function ConfirmationToast() {
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed') === 'true'
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!confirmed) return
    const timer = setTimeout(() => setDismissed(true), 5000)
    return () => clearTimeout(timer)
  }, [confirmed])

  if (!confirmed || dismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-[999] pointer-events-none animate-slide-up-sm">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium pointer-events-auto bg-[#222222] text-white">
        <CheckCircle size={15} className="flex-shrink-0 text-[#06a5a5]" />
        E-Mail bestätigt! Willkommen bei MotoDigital.
      </div>
    </div>
  )
}
