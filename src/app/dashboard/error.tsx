'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-bold text-[#222222] mb-2">Dashboard-Fehler</h2>
      <p className="text-[#717171] mb-6 max-w-md">
        Beim Laden des Dashboards ist ein Fehler aufgetreten.
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
