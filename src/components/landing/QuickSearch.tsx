'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function QuickSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/bikes?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2.5 sm:gap-3 bg-white border border-[#222222]/10 rounded-full px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-[#222222]/20 focus-within:shadow-md">
        <Search size={16} className="text-[#222222]/30 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Marke, Modell, Builder oder Stadt..."
          className="bg-transparent text-xs sm:text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none focus:ring-0 focus:outline-none w-full"
        />
        <button
          type="submit"
          className="flex-shrink-0 bg-[#06a5a5] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-[#058f8f] transition-colors duration-200 flex items-center justify-center"
        >
          <Search size={13} className="sm:w-[14px] sm:h-[14px]" />
        </button>
      </div>
    </form>
  )
}
