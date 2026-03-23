'use client'

import { Search, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EVENTS } from '@/lib/data/events'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import SearchResult, { type SearchResultItem } from './SearchResult'

// ---------------------------------------------------------------------------
// Typewriter placeholder config
// ---------------------------------------------------------------------------
const PLACEHOLDERS = ['BMW R100 Cafe Racer', 'Superbikebox Werkstatt', 'Glemseck 101']
const TYPE_SPEED = 80    // ms per character typing
const DELETE_SPEED = 40  // ms per character deleting
const PAUSE_FULL = 2000  // ms pause after fully typed
const PAUSE_EMPTY = 300  // ms pause before typing next

// ---------------------------------------------------------------------------
// Types for raw Supabase rows
// ---------------------------------------------------------------------------
interface BikeRow {
  id: string
  title: string
  make: string
  model: string
  city: string | null
  slug: string | null
  bike_images: { url: string; is_cover: boolean; position: number }[]
}

interface BuilderRow {
  id: string
  full_name: string | null
  city: string | null
  specialty: string | null
  slug: string
  avatar_url: string | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function GlobalSearch({ dropUp = false }: { dropUp?: boolean }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [resolvedDropUp, setResolvedDropUp] = useState(dropUp)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bikes, setBikes] = useState<SearchResultItem[]>([])
  const [workshops, setWorkshops] = useState<SearchResultItem[]>([])
  const [events, setEvents] = useState<SearchResultItem[]>([])
  const [suggestions, setSuggestions] = useState<{ bikes: SearchResultItem[]; workshops: SearchResultItem[]; events: SearchResultItem[] } | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const [isFocused, setIsFocused] = useState(false)

  // Typewriter placeholder state
  const [tick, setTick] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const placeholderRef = useRef({ index: 0, charIndex: 0, isDeleting: false })

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // All results flattened for keyboard nav
  const allResults = useMemo(
    () => [...bikes, ...workshops, ...events],
    [bikes, workshops, events],
  )

  // ─── Typewriter placeholder ────────────────────────────
  useEffect(() => {
    if (isFocused || query) return

    const state = placeholderRef.current
    const currentWord = PLACEHOLDERS[state.index]

    const timer = setTimeout(() => {
      if (!state.isDeleting) {
        // Typing
        if (state.charIndex < currentWord.length) {
          state.charIndex++
          setDisplayText(currentWord.slice(0, state.charIndex))
        } else {
          // Fully typed — pause then start deleting
          state.isDeleting = true
        }
      } else {
        // Deleting
        if (state.charIndex > 0) {
          state.charIndex--
          setDisplayText(currentWord.slice(0, state.charIndex))
        } else {
          // Fully deleted — move to next word
          state.isDeleting = false
          state.index = (state.index + 1) % PLACEHOLDERS.length
          setDisplayText('')
        }
      }
      setTick((t) => t + 1)
    }, state.isDeleting
      ? (state.charIndex === currentWord.length ? PAUSE_FULL : DELETE_SPEED)
      : (state.charIndex === 0 ? PAUSE_EMPTY : TYPE_SPEED))

    return () => clearTimeout(timer)
  }, [tick, isFocused, query])

  // ─── Load random suggestions on focus ────────────────────
  const loadSuggestions = useCallback(async () => {
    if (suggestions) { setOpen(true); return }

    try {
      const [bikeRes, builderRes] = await Promise.all([
        (supabase.from('bikes') as ReturnType<typeof supabase.from>)
          .select('id, title, make, model, city, slug, bike_images(url, is_cover, position)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20),
        (supabase.from('profiles') as ReturnType<typeof supabase.from>)
          .select('id, full_name, city, specialty, slug, avatar_url')
          .eq('role', 'custom-werkstatt')
          .not('slug', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const bikeRows = (bikeRes.data ?? []) as unknown as BikeRow[]
      const builderRows = (builderRes.data ?? []) as unknown as BuilderRow[]

      const pick = <T,>(arr: T[]): T[] => {
        if (arr.length === 0) return []
        const i = Math.floor(Math.random() * arr.length)
        return [arr[i]]
      }

      const pickedBike = pick(bikeRows)
      const pickedBuilder = pick(builderRows)
      const pickedEvent = pick(EVENTS)

      const sugBikes: SearchResultItem[] = pickedBike.map((b) => {
        const imgs = b.bike_images ?? []
        const cover = imgs.find((i) => i.is_cover)?.url ?? imgs.sort((a, z) => a.position - z.position)[0]?.url
        return {
          id: b.id, type: 'bike' as const, title: b.title,
          subtitle: [b.make, b.model, b.city].filter(Boolean).join(' · '),
          href: `/custom-bike/${b.slug ?? generateBikeSlug(b.title, b.id)}`,
          imageUrl: cover || undefined,
        }
      })

      const sugWorkshops: SearchResultItem[] = pickedBuilder.map((w) => ({
        id: w.id, type: 'workshop' as const, title: w.full_name ?? 'Unbekannt',
        subtitle: [w.specialty, w.city].filter(Boolean).join(' · '),
        href: `/custom-werkstatt/${w.slug}`,
        imageUrl: w.avatar_url || undefined,
      }))

      const sugEvents: SearchResultItem[] = pickedEvent.map((e) => ({
        id: String(e.id), type: 'event' as const, title: e.name,
        subtitle: `${e.date} · ${e.location}`,
        href: `/events/${e.slug}`,
      }))

      setSuggestions({ bikes: sugBikes, workshops: sugWorkshops, events: sugEvents })
      setBikes(sugBikes)
      setWorkshops(sugWorkshops)
      setEvents(sugEvents)
      setOpen(true)
    } catch {
      // Silently fail
    }
  }, [supabase, suggestions])

  // ─── Search logic ────────────────────────────────────────
  const performSearch = useCallback(
    async (q: string) => {
      const term = q.trim()
      if (term.length < 2) {
        setBikes([])
        setWorkshops([])
        setEvents([])
        setOpen(false)
        return
      }

      setLoading(true)
      const pattern = `%${term}%`

      try {
        const [bikeRes, builderRes] = await Promise.all([
          // Bikes
          (supabase.from('bikes') as ReturnType<typeof supabase.from>)
            .select('id, title, make, model, city, slug, bike_images(url, is_cover, position)')
            .eq('status', 'active')
            .or(`title.ilike.${pattern},make.ilike.${pattern},model.ilike.${pattern},city.ilike.${pattern}`)
            .order('created_at', { ascending: false })
            .limit(3),

          // Builders / workshops (profiles with role custom-werkstatt)
          (supabase.from('profiles') as ReturnType<typeof supabase.from>)
            .select('id, full_name, city, specialty, slug, avatar_url')
            .eq('role', 'custom-werkstatt')
            .not('slug', 'is', null)
            .or(`full_name.ilike.${pattern},city.ilike.${pattern},specialty.ilike.${pattern}`)
            .order('created_at', { ascending: false })
            .limit(3),
        ])

        // Map bikes
        const bikeItems: SearchResultItem[] = ((bikeRes.data ?? []) as unknown as BikeRow[]).map((b) => {
          const imgs = b.bike_images ?? []
          const cover = imgs.find((i) => i.is_cover)?.url
            ?? imgs.sort((a, z) => a.position - z.position)[0]?.url
          return {
            id: b.id,
            type: 'bike' as const,
            title: b.title,
            subtitle: [b.make, b.model, b.city].filter(Boolean).join(' · '),
            href: `/custom-bike/${b.slug ?? generateBikeSlug(b.title, b.id)}`,
            imageUrl: cover || undefined,
          }
        })

        // Map workshops
        const workshopItems: SearchResultItem[] = ((builderRes.data ?? []) as unknown as BuilderRow[]).map((w) => ({
          id: w.id,
          type: 'workshop' as const,
          title: w.full_name ?? 'Unbekannt',
          subtitle: [w.specialty, w.city].filter(Boolean).join(' · '),
          href: `/custom-werkstatt/${w.slug}`,
          imageUrl: w.avatar_url || undefined,
        }))

        // Filter static events client-side
        const lowerTerm = term.toLowerCase()
        const eventItems: SearchResultItem[] = EVENTS
          .filter(
            (e) =>
              e.name.toLowerCase().includes(lowerTerm) ||
              e.location.toLowerCase().includes(lowerTerm),
          )
          .slice(0, 3)
          .map((e) => ({
            id: String(e.id),
            type: 'event' as const,
            title: e.name,
            subtitle: `${e.date} · ${e.location}`,
            href: `/events/${e.slug}`,
          }))

        setBikes(bikeItems)
        setWorkshops(workshopItems)
        setEvents(eventItems)
        setActiveIndex(-1)
        setOpen(bikeItems.length + workshopItems.length + eventItems.length > 0)
      } catch {
        // Silently fail — keep previous results
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  // ─── Debounced input handler ─────────────────────────────
  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (value.trim().length < 2) {
        if (suggestions) {
          setBikes(suggestions.bikes)
          setWorkshops(suggestions.workshops)
          setEvents(suggestions.events)
          setOpen(true)
        } else {
          setBikes([])
          setWorkshops([])
          setEvents([])
          setOpen(false)
        }
        return
      }
      debounceRef.current = setTimeout(() => performSearch(value), 300)
    },
    [performSearch],
  )

  // ─── Submit (Enter on empty selection / button click) ────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    if (activeIndex >= 0 && activeIndex < allResults.length) {
      router.push(allResults[activeIndex].href)
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
    setOpen(false)
    inputRef.current?.blur()
  }

  // ─── Keyboard navigation ────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return

    const count = allResults.length + 1 // +1 for "Alle Ergebnisse"

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % count)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + count) % count)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < allResults.length) {
        e.preventDefault()
        router.push(allResults[activeIndex].href)
        setOpen(false)
        inputRef.current?.blur()
      } else if (activeIndex === allResults.length) {
        // "Alle Ergebnisse" is selected
        e.preventDefault()
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
        inputRef.current?.blur()
      }
      // else: default form submit
    }
  }

  // ─── Click outside ──────────────────────────────────────
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // ─── Cleanup debounce on unmount ─────────────────────────
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ─── Render helpers ─────────────────────────────────────
  const hasResults = allResults.length > 0

  function renderGroup(items: SearchResultItem[], startIdx: number) {
    if (items.length === 0) return null
    return (
      <div>
        {items.map((item, i) => (
          <SearchResult
            key={item.id}
            item={item}
            isActive={activeIndex === startIdx + i}
            onClick={() => {
              setOpen(false)
              inputRef.current?.blur()
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto transition-all duration-300 ease-in-out ${
        isFocused || query ? 'w-full max-w-xl' : 'w-full max-w-md'
      }`}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center gap-2 sm:gap-2.5 bg-white border border-[#222222]/10 rounded-full pl-3 sm:pl-4 pr-1.5 sm:pr-2 py-1.5 sm:py-2 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-[#222222]/20 focus-within:shadow-md">
          {/* Input area */}
          <div className="relative flex-1 flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => {
                setIsFocused(true)
                if (dropUp && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect()
                  setResolvedDropUp(rect.top > 250)
                }
                if (query.trim().length >= 2 && allResults.length > 0) {
                  setOpen(true)
                } else if (query.trim().length < 2) {
                  loadSuggestions()
                }
              }}
              onBlur={(e) => {
                if (containerRef.current?.contains(e.relatedTarget as Node)) return
                setIsFocused(false)
                setResolvedDropUp(dropUp)
              }}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="bg-transparent text-xs sm:text-sm text-[#222222] outline-none focus:ring-0 focus:outline-none w-full py-1 sm:py-1.5 pl-1 sm:pl-1.5 pr-2"
              role="combobox"
              aria-expanded={open}
              aria-controls="global-search-listbox"
              aria-label="Globale Suche"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 && activeIndex < allResults.length
                  ? `search-result-${allResults[activeIndex].id}`
                  : undefined
              }
            />

            {/* Typewriter placeholder */}
            {!query && (
              <span className="absolute left-1 sm:left-1.5 text-xs sm:text-sm text-[#222222]/30 pointer-events-none whitespace-nowrap">
                {displayText}
                <span className="inline-block w-[1px] h-[1em] bg-[#222222]/30 align-middle ml-[1px] animate-blink" />
              </span>
            )}
          </div>

          {/* Clear button */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                if (suggestions) {
                  setBikes(suggestions.bikes)
                  setWorkshops(suggestions.workshops)
                  setEvents(suggestions.events)
                  setOpen(true)
                } else {
                  setBikes([])
                  setWorkshops([])
                  setEvents([])
                  setOpen(false)
                }
                setActiveIndex(-1)
                inputRef.current?.focus()
              }}
              className="flex-shrink-0 text-[#222222]/25 hover:text-[#222222]/50 transition-colors duration-150"
              aria-label="Suche leeren"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Search button — round circle */}
          <button
            type="submit"
            className="flex-shrink-0 bg-[#06a5a5] text-white w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:bg-[#058f8f] transition-colors duration-200 flex items-center justify-center"
            aria-label="Suche starten"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin sm:w-[15px] sm:h-[15px]" />
            ) : (
              <Search size={14} className="sm:w-[15px] sm:h-[15px]" />
            )}
          </button>
        </div>
      </form>

      {/* ── Dropdown ── */}
      {open && (
        <div
          id="global-search-listbox"
          role="listbox"
          className={`absolute left-0 right-0 bg-white border border-[#222222]/10 rounded-2xl shadow-lg z-50 animate-expand ${
            resolvedDropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } max-h-[60vh] overflow-y-auto`}
        >
          {hasResults ? (
            <>
              {query.trim().length < 2 && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#222222]/25">
                  Vorschläge
                </p>
              )}
              {renderGroup(bikes, 0)}
              {renderGroup(workshops, bikes.length)}
              {renderGroup(events, bikes.length + workshops.length)}

              {/* "Alle Ergebnisse anzeigen" — only when searching */}
              {query.trim().length >= 2 && (
                <div className="border-t border-[#222222]/6">
                  <button
                    type="button"
                    role="option"
                    aria-selected={activeIndex === allResults.length}
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                      setOpen(false)
                      inputRef.current?.blur()
                    }}
                    className={`w-full text-center text-xs font-semibold py-3 transition-colors duration-100 ${
                      activeIndex === allResults.length
                        ? 'bg-[#222222]/5 text-[#06a5a5]'
                        : 'text-[#06a5a5] hover:bg-[#222222]/3'
                    }`}
                  >
                    Alle Ergebnisse anzeigen
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-[#222222]/30 py-6">
              Keine Ergebnisse gefunden.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
