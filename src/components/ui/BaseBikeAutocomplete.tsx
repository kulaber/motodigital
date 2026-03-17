'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Database } from '@/types/database'

type BaseBike = Database['public']['Tables']['base_bikes']['Row']

interface Props {
  value: { id: string; label: string } | null
  onChange: (bike: { id: string; label: string } | null) => void
  className?: string
}

export default function BaseBikeAutocomplete({ value, onChange, className }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BaseBike[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timeout = setTimeout(async () => {
      setLoading(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('base_bikes') as any)
        .select('*')
        .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
        .order('make', { ascending: true })
        .order('model', { ascending: true })
        .limit(10)
      setResults(data ?? [])
      setOpen(true)
      setLoading(false)
    }, 250)
    return () => clearTimeout(timeout)
  }, [query])

  function select(bike: BaseBike) {
    const label = `${bike.make} ${bike.model}`
    onChange({ id: bike.id, label })
    setQuery('')
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setQuery('')
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 bg-[#06a5a5]/5 border border-[#06a5a5]/20 rounded-xl px-4 py-3">
        <span className="flex-1 text-sm text-[#222222] font-medium">{value.label}</span>
        <button type="button" onClick={clear} className="text-[#222222]/30 hover:text-[#222222] transition-colors">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        placeholder="z.B. Honda CB 750, BMW R 80…"
        className={className}
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#222222]/15 border-t-[#717171] rounded-full animate-spin" />
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#222222]/10 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {results.map(bike => (
            <button
              key={bike.id}
              type="button"
              onClick={() => select(bike)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-[#222222]/5 transition-colors border-b border-[#222222]/5 last:border-0"
            >
              <span className="font-medium text-[#222222]">{bike.make} {bike.model}</span>
              <span className="text-xs text-[#222222]/30 flex-shrink-0 ml-3">
                {bike.cc ? `${bike.cc} cc` : ''}
                {bike.year_from ? ` · ${bike.year_from}${bike.year_to ? `–${bike.year_to}` : '+'}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#222222]/10 rounded-xl shadow-xl px-4 py-3">
          <p className="text-xs text-[#222222]/30">Kein Basisbike gefunden.</p>
        </div>
      )}
    </div>
  )
}
