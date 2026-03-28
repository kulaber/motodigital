'use client'

import { useEffect } from 'react'

export default function BikeDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Bike detail error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-bold text-[#F0EDE4] mb-2">Fehler beim Laden</h2>
      <p className="text-[#F0EDE4]/60 mb-6 max-w-md">
        Das Bike konnte nicht geladen werden.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[#2AABAB] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2AABAB]/90"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
