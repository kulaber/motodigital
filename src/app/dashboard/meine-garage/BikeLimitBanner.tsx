'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

export default function BikeLimitBanner({ workshopId }: { workshopId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="bg-white border border-[#2AABAB]/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#2AABAB]/10 flex items-center justify-center flex-shrink-0">
          <Lock size={16} className="text-[#2AABAB]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#222222]">Bike-Limit erreicht</p>
          <p className="text-xs text-[#222222]/40">Mit Premium unbegrenzte Bikes hochladen</p>
        </div>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Weiterleitung...
          </>
        ) : (
          'Jetzt upgraden'
        )}
      </button>
    </div>
  )
}
