'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, ArrowLeft } from 'lucide-react'
import { searchAll, type SearchResults } from '@/lib/actions/search'
import { BikeResultCard } from './BikeResultCard'
import { WorkshopResultCard } from './WorkshopResultCard'
import { RiderResultCard } from './RiderResultCard'

type Tab = 'all' | 'bikes' | 'workshops' | 'riders'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Alles' },
  { key: 'bikes', label: 'Bikes' },
  { key: 'workshops', label: 'Werkstätten' },
  { key: 'riders', label: 'Rider' },
]

interface Props {
  initialQuery: string
  initialTab: Tab
}

export function SearchInterface({ initialQuery, initialTab }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Auto-focus search field
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (activeTab !== 'all') params.set('tab', activeTab)
    const qs = params.toString()
    router.replace(`/search${qs ? '?' + qs : ''}`, { scroll: false })
  }, [query, activeTab, router])

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current)

    if (!query || query.length < 2) return

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchAll(query, activeTab)
        setResults(data)
      })
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query, activeTab])

  const totalCount = results
    ? results.bikes.length + results.workshops.length + results.riders.length
    : 0

  const isEmpty = results !== null && totalCount === 0

  return (
    <section className="pt-4 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-[#222222]/40 hover:text-[#222222]/60 transition-colors mb-5"
        >
          <ArrowLeft size={14} /> Zurück
        </button>

        {/* ── STICKY SEARCH HEADER ── */}
        <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-xl pb-4 pt-1 -mx-4 px-4 sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8">

          {/* Search input */}
          <div className="relative flex items-center mb-3">
            <Search className="absolute left-3.5 w-4 h-4 text-[#222222]/30 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                const val = e.target.value
                setQuery(val)
                if (!val || val.trim().length < 2) setResults(null)
              }}
              placeholder="Bike, Werkstatt, Rider suchen…"
              className="w-full h-12 bg-[#F7F7F7] border border-[#222222]/8
                         rounded-xl pl-10 pr-10 text-sm text-[#222222]
                         placeholder:text-[#222222]/25 outline-none
                         focus:border-[#06a5a5]/40 focus:ring-1 focus:ring-[#06a5a5]/20 transition-all"
            />
            {isPending && (
              <Loader2 className="absolute right-3.5 w-4 h-4 text-[#06a5a5] animate-spin" />
            )}
            {!isPending && query && (
              <button
                onClick={() => { setQuery(''); setResults(null) }}
                className="absolute right-3.5 w-5 h-5 rounded-full
                           bg-[#222222]/8 flex items-center justify-center
                           hover:bg-[#222222]/15 transition-colors"
              >
                <X className="w-3 h-3 text-[#222222]/50" />
              </button>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium
                            border transition-all
                            ${activeTab === tab.key
                              ? 'bg-[#06a5a5]/10 border-[#06a5a5]/30 text-[#06a5a5]'
                              : 'bg-[#222222]/3 border-[#222222]/6 text-[#222222]/40 hover:text-[#222222]/60 hover:border-[#222222]/12'
                            }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className="flex flex-col gap-8 mt-4">

          {/* Empty state: no query yet */}
          {!query && <EmptyState />}

          {/* No results */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm font-medium text-[#222222]">
                Keine Ergebnisse für &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[#222222]/35 max-w-[240px]">
                Versuche einen anderen Begriff oder wähle einen anderen Tab.
              </p>
            </div>
          )}

          {/* Bikes */}
          {results && results.bikes.length > 0 && (
            <ResultSection
              title="Custom Bikes"
              count={results.bikes.length}
              showAll={activeTab === 'bikes'}
              onShowAll={() => setActiveTab('bikes')}
            >
              {results.bikes.map((bike) => (
                <BikeResultCard key={bike.id} bike={bike} />
              ))}
            </ResultSection>
          )}

          {/* Workshops */}
          {results && results.workshops.length > 0 && (
            <ResultSection
              title="Werkstätten"
              count={results.workshops.length}
              showAll={activeTab === 'workshops'}
              onShowAll={() => setActiveTab('workshops')}
            >
              {results.workshops.map((w) => (
                <WorkshopResultCard key={w.id} workshop={w} />
              ))}
            </ResultSection>
          )}

          {/* Rider */}
          {results && results.riders.length > 0 && (
            <ResultSection
              title="Rider"
              count={results.riders.length}
              showAll={activeTab === 'riders'}
              onShowAll={() => setActiveTab('riders')}
            >
              {results.riders.map((r) => (
                <RiderResultCard key={r.id} rider={r} />
              ))}
            </ResultSection>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Result section with title + optional "show all" ──
function ResultSection({
  title,
  count,
  showAll,
  onShowAll,
  children,
}: {
  title: string
  count: number
  showAll: boolean
  onShowAll: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#222222]/35 font-semibold">
            {title}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#222222]/5 text-[#222222]/30">
            {count}
          </span>
        </div>
        {!showAll && count >= 5 && (
          <button
            onClick={onShowAll}
            className="text-xs text-[#06a5a5] hover:underline font-medium"
          >
            Alle anzeigen &rarr;
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {children}
      </div>
    </div>
  )
}

// ── Empty state with suggestion chips ──
function EmptyState() {
  const [, setQuery] = useState('')
  const suggestions = ['Café Racer', 'Scrambler', 'BMW R nineT', 'Bobber', 'Hamburg']

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#222222]/25 font-semibold mb-3">
          Beliebte Suchen
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                // Set the input value directly
                const input = document.querySelector<HTMLInputElement>('input[placeholder*="suchen"]')
                if (input) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                  )?.set
                  nativeInputValueSetter?.call(input, s)
                  input.dispatchEvent(new Event('input', { bubbles: true }))
                }
                setQuery(s)
              }}
              className="px-3 py-1.5 rounded-full text-xs
                         bg-[#222222]/3 border border-[#222222]/6 text-[#222222]/40
                         hover:text-[#222222]/70 hover:border-[#222222]/15 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
