'use client'

import { useState } from 'react'
import { Plus, Loader2, Crown } from 'lucide-react'

export default function AddBikeUpgradeCard() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="group text-left w-full"
    >
      <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-[#2AABAB]/30 bg-[#2AABAB]/[0.03] mb-3 flex flex-col items-center justify-center gap-3 transition-colors hover:border-[#2AABAB]/50 hover:bg-[#2AABAB]/[0.06]">
        {loading ? (
          <Loader2 size={24} className="text-[#2AABAB] animate-spin" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#2AABAB]/10 flex items-center justify-center">
              <Plus size={22} className="text-[#2AABAB]" />
            </div>
            <div className="flex flex-col items-center gap-1 px-4">
              <span className="text-sm font-semibold text-[#222222]">Weitere Bikes hinzufügen</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2AABAB] uppercase tracking-wider">
                <Crown size={10} /> Premium Upgrade
              </span>
            </div>
          </>
        )}
      </div>
      {/* Invisible spacer to match bike card height (title + base line) */}
      <p className="text-sm leading-snug mb-0.5 invisible">‎</p>
      <p className="text-xs invisible">‎</p>
    </button>
  )
}
