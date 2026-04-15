'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

type Props = {
  children: React.ReactNode
  workshopId: string
}

export default function LockedFeature({ children, workshopId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      console.error('[Upgrade]', data.error)
    } catch (err) {
      console.error('[Upgrade] Fetch error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5 bg-white border border-[#2AABAB]/20 rounded-2xl px-6 py-5 text-center max-w-[260px]">
          <Lock size={16} className="text-[#2AABAB]" />
          <p className="text-xs font-semibold text-[#222222]">Premium Feature</p>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#058f8f] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Weiterleitung...
              </>
            ) : (
              'Jetzt upgraden'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
