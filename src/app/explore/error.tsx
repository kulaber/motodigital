'use client'

import { useEffect } from 'react'
import Header from '@/components/layout/Header'

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Explore error:', error)
  }, [error])

  return (
    <>
      <Header activePage="explore" />
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-[#222222] mb-2">Fehler beim Laden</h2>
        <p className="text-[#717171] mb-6 max-w-md">
          Die Explore-Seite konnte nicht geladen werden.
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
