'use client'

import { useEffect } from 'react'
import Header from '@/components/layout/Header'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <>
      <Header />
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-[#222222] mb-2">Etwas ist schiefgelaufen</h2>
        <p className="text-[#717171] mb-6 max-w-md">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-[#2AABAB] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2AABAB]/90"
        >
          Erneut versuchen
        </button>
      </div>
    </>
  )
}
