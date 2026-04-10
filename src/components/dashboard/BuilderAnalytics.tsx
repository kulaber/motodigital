'use client'

import { useState, useMemo } from 'react'
import { Eye, MessageCircle, Bike } from 'lucide-react'

type Props = {
  profileViews: { created_at: string }[]
  contactClicks: { created_at: string }[]
  bikeViews: { path: string; created_at: string }[]
  bikeSlugMap: Record<string, string> // slug → title
}

type FilterKey = 'all' | 'profile' | 'contact' | 'bikes'
type TimeRange = 'all' | '30d' | '7d' | 'today'

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: '30d', label: '30 Tage' },
  { key: '7d', label: '7 Tage' },
  { key: 'today', label: 'Heute' },
]

const FILTERS: { key: FilterKey; label: string; color: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Besucher', color: '#06a5a5', icon: <Eye size={12} /> },
  { key: 'contact', label: 'Anfragen', color: '#35c4c4', icon: <MessageCircle size={12} /> },
  { key: 'bikes', label: 'Bike-Aufrufe', color: '#7dd8d8', icon: <Bike size={12} /> },
]

/** Extracted outside so React compiler doesn't flag Date.now() as impure */
function getCurrentTimestamp() { return Date.now() }

function lastNDays(now: number, n: number) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(now - i * 86400000).toISOString().split('T')[0])
  }
  return days
}

function filterByTimeRange<T extends { created_at: string }>(items: T[], range: TimeRange, now: number): T[] {
  if (range === 'all') return items
  const cutoff = range === 'today'
    ? new Date(now).toISOString().split('T')[0]
    : new Date(now - (range === '30d' ? 30 : 7) * 86400000).toISOString()
  return items.filter(item => range === 'today'
    ? item.created_at.split('T')[0] === cutoff
    : item.created_at >= cutoff
  )
}

function groupByDay(items: { created_at: string }[]) {
  const map = new Map<string, number>()
  for (const item of items) {
    const day = item.created_at.split('T')[0]
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  return map
}

export function BuilderAnalytics({ profileViews, contactClicks, bikeViews, bikeSlugMap }: Props) {
  const [active, setActive] = useState<FilterKey>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [now] = useState(getCurrentTimestamp)

  // Filter data by time range
  const filteredProfile = useMemo(() => filterByTimeRange(profileViews, timeRange, now), [profileViews, timeRange, now])
  const filteredContact = useMemo(() => filterByTimeRange(contactClicks, timeRange, now), [contactClicks, timeRange, now])
  const filteredBikes = useMemo(() => filterByTimeRange(bikeViews, timeRange, now), [bikeViews, timeRange, now])

  const chartDays = timeRange === 'today' ? 1 : timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 30
  const days = lastNDays(now, chartDays)

  const profileByDay = groupByDay(filteredProfile)
  const contactByDay = groupByDay(filteredContact)
  const bikeByDay = groupByDay(filteredBikes)

  const profileData = days.map(d => profileByDay.get(d) ?? 0)
  const contactData = days.map(d => contactByDay.get(d) ?? 0)
  const bikeData = days.map(d => bikeByDay.get(d) ?? 0)
  const allData = days.map((d, i) => profileData[i] + contactData[i] + bikeData[i])

  // Active dataset
  const activeData = active === 'profile' ? profileData
    : active === 'contact' ? contactData
    : active === 'bikes' ? bikeData
    : allData
  const activeColor = FILTERS.find(f => f.key === active)?.color ?? '#06a5a5'
  const activeTotal = activeData.reduce((a, b) => a + b, 0)
  const activeLabel = active === 'all' ? 'Gesamt' : FILTERS.find(f => f.key === active)?.label ?? ''

  // Top bikes breakdown (for "bikes" or "all" filter)
  const topBikes = useMemo(() => {
    const map = new Map<string, number>()
    for (const bv of filteredBikes) {
      const segments = bv.path.split('/').filter(Boolean)
      const key = segments[segments.length - 1]
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([slug, count]) => ({ slug, title: bikeSlugMap[slug] ?? slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredBikes, bikeSlugMap])

  // ── Chart (percentage-based, same approach as PageViewsChart) ──
  const n = days.length
  const padTop = 12
  const padBot = 10
  const chartH = 100 - padTop - padBot

  // All three datasets for multi-line rendering
  const allSeries = [
    { data: profileData, color: '#06a5a5', key: 'profile' },
    { data: contactData, color: '#35c4c4', key: 'contact' },
    { data: bikeData, color: '#7dd8d8', key: 'bikes' },
  ]

  // Global max across all series (for consistent scale in "Alle" mode)
  const globalMax = Math.max(...profileData, ...contactData, ...bikeData, 1)
  const singleMax = Math.max(...activeData, 1)
  const maxViews = active === 'all' ? globalMax : singleMax

  function buildCurve(data: number[]) {
    const pts = data.map((v, i) => ({
      x: (2 * i + 1) / (2 * n) * 100,
      y: padTop + chartH * (1 - v / maxViews),
    }))
    let line = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = (pts[i + 1].x - pts[i].x) / 3
      line += ` C ${pts[i].x + dx} ${pts[i].y}, ${pts[i + 1].x - dx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`
    }
    const area = `${line} L ${pts[pts.length - 1].x} ${padTop + chartH} L ${pts[0].x} ${padTop + chartH} Z`
    return { pts, line, area }
  }

  // Single active curve (used when not "all")
  const activeCurve = buildCurve(activeData)
  const pts = activeCurve.pts

  const timeRangeLabel = TIME_RANGES.find(t => t.key === timeRange)?.label ?? ''

  return (
    <div className="space-y-3">
      {/* Time range filter tabs */}
      <div className="flex gap-1 bg-[#222222]/4 rounded-xl p-1">
        {TIME_RANGES.map(t => (
          <button
            key={t.key}
            onClick={() => setTimeRange(t.key)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
              timeRange === t.key
                ? 'bg-white text-[#222222] shadow-sm'
                : 'text-[#222222]/40 hover:text-[#222222]/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {FILTERS.map(f => {
          const total = f.key === 'profile' ? filteredProfile.length
            : f.key === 'contact' ? filteredContact.length
            : filteredBikes.length
          return (
            <button
              key={f.key}
              onClick={() => setActive(active === f.key ? 'all' : f.key)}
              className={`bg-white border rounded-2xl p-4 text-left transition-all ${
                active === f.key
                  ? 'border-[#222222]/15 ring-1 ring-[#222222]/5'
                  : 'border-[#222222]/6 hover:border-[#222222]/12'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2" style={{ color: f.color }}>
                {f.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{f.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#222222]">{total}</p>
              <p className="text-[10px] text-[#222222]/25 mt-0.5">{timeRangeLabel}</p>
            </button>
          )
        })}
      </div>

      {/* Chart card (same style as superadmin PageViewsChart) */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-semibold text-[#222222]">{activeLabel}</p>
            <p className="text-xs text-[#222222]/30 mt-0.5">
              {activeTotal > 0
                ? `${activeTotal.toLocaleString('de-DE')} — ${timeRangeLabel}`
                : timeRangeLabel}
            </p>
          </div>
          <span className="text-[10px] bg-[#06a5a5]/10 text-[#06a5a5] border border-[#06a5a5]/20 px-2.5 py-1 rounded-full font-semibold">
            Live Daten
          </span>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
          <button
            onClick={() => setActive('all')}
            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
              active === 'all'
                ? 'bg-[#06a5a5] text-white'
                : 'bg-[#222222]/5 text-[#222222]/40 hover:bg-[#222222]/10 hover:text-[#222222]/60'
            }`}
          >
            Alle
          </button>
          {FILTERS.map(f => {
            const total = f.key === 'profile' ? filteredProfile.length
              : f.key === 'contact' ? filteredContact.length
              : filteredBikes.length
            return (
              <button
                key={f.key}
                onClick={() => setActive(active === f.key ? 'all' : f.key)}
                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
                  active === f.key
                    ? 'text-white'
                    : 'bg-[#222222]/5 text-[#222222]/40 hover:bg-[#222222]/10 hover:text-[#222222]/60'
                }`}
                style={active === f.key ? { backgroundColor: f.color } : undefined}
              >
                {f.label}
                <span className="ml-1 opacity-60">{total}</span>
              </button>
            )
          })}
        </div>

        {/* Area chart */}
        <div className="relative h-36">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(f => (
              <line key={f} x1="0" y1={padTop + chartH * (1 - f)} x2="100" y2={padTop + chartH * (1 - f)} stroke="#222222" strokeOpacity="0.04" strokeDasharray="0.5 1" vectorEffect="non-scaling-stroke" />
            ))}

            {active === 'all' ? (
              /* Multi-line mode: all 3 curves layered */
              <>
                {allSeries.map(s => {
                  const curve = buildCurve(s.data)
                  return (
                    <g key={s.key}>
                      <defs>
                        <linearGradient id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={s.color} stopOpacity="0.15" />
                          <stop offset="100%" stopColor={s.color} stopOpacity="0.01" />
                        </linearGradient>
                      </defs>
                      <path d={curve.area} fill={`url(#grad-${s.key})`} />
                      <path d={curve.line} fill="none" stroke={s.color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )
                })}
              </>
            ) : (
              /* Single-line mode */
              <>
                <defs>
                  <linearGradient id="builderAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColor} stopOpacity="0.3" />
                    <stop offset="50%" stopColor={activeColor} stopOpacity="0.12" />
                    <stop offset="100%" stopColor={activeColor} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={activeCurve.area} fill="url(#builderAreaGrad)" />
                <path d={activeCurve.line} fill="none" stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </>
            )}
          </svg>

          {active === 'all' ? (
            /* Multi-line dots — hidden when value is 0 */
            <>
              {allSeries.map(s => {
                const curve = buildCurve(s.data)
                return curve.pts.map((p, i) => (
                  s.data[i] > 0 && (
                    <div key={`${s.key}-${i}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-white border-[1.5px]" style={{ borderColor: s.color }} />
                    </div>
                  )
                ))
              })}
            </>
          ) : (
            /* Single-line dots — hidden when value is 0 */
            <>
              {pts.map((p, i) => (
                activeData[i] > 0 && (
                  <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${activeColor}18` }}>
                      <div className="w-[7px] h-[7px] rounded-full bg-white border-2" style={{ borderColor: activeColor }} />
                    </div>
                  </div>
                )
              ))}
            </>
          )}

          {/* Hover tooltips */}
          <div className="absolute inset-0 flex">
            {days.map((_, i) => {
              // In "all" mode, show breakdown per category; otherwise single value
              const topPt = active === 'all'
                ? Math.min(...allSeries.map(s => buildCurve(s.data).pts[i].y))
                : pts[i].y
              return (
                <div key={i} className="flex-1 group relative cursor-default">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-start bg-[#222222] text-white rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap z-10 shadow-md"
                    style={{ top: `${Math.max(topPt - 16, 0)}%` }}
                  >
                    {active === 'all' ? (
                      allSeries.map(s => (
                        <div key={s.key} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="font-semibold">{s.data[i]}</span>
                          <span className="opacity-50">{FILTERS.find(f => f.key === s.key)?.label}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-1 font-semibold">
                        {activeData[i]}
                        <span className="font-normal opacity-60">Aufrufe</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Weekday labels */}
        <div className="flex mt-2">
          {days.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] text-[#222222]/25">
              {new Date(d).toLocaleDateString('de-DE', { weekday: 'short' })}
            </span>
          ))}
        </div>

        {/* Top bikes breakdown (visible when "bikes" or "all" is active) */}
        {(active === 'all' || active === 'bikes') && topBikes.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#222222]/6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">Meistbesuchte Custom Bikes</p>
            <div className="space-y-2.5">
              {topBikes.map(b => (
                <div key={b.slug} className="flex items-center gap-3">
                  <span className="text-xs text-[#222222]/60 w-40 truncate">{b.title}</span>
                  <div className="flex-1 h-1.5 bg-[#222222]/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7dd8d8]/50 rounded-full"
                      style={{ width: `${(b.count / topBikes[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#222222]/50 w-10 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section breakdown (visible on "all" filter) */}
        {active === 'all' && (
          <div className="mt-4 pt-4 border-t border-[#222222]/6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">Nach Bereich</p>
            <div className="space-y-2">
              {FILTERS.map(f => {
                const total = f.key === 'profile' ? filteredProfile.length
                  : f.key === 'contact' ? filteredContact.length
                  : filteredBikes.length
                const maxSection = Math.max(filteredProfile.length, filteredContact.length, filteredBikes.length, 1)
                return (
                  <button
                    key={f.key}
                    onClick={() => setActive(f.key)}
                    className="flex items-center gap-3 w-full text-left group"
                  >
                    <span className="text-xs text-[#222222]/60 w-28 truncate group-hover:text-[#06a5a5] transition-colors">{f.label}</span>
                    <div className="flex-1 h-1.5 bg-[#222222]/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full group-hover:opacity-80 transition-opacity"
                        style={{ width: `${(total / maxSection) * 100}%`, backgroundColor: `${f.color}66` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#222222]/50 w-10 text-right">{total}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTotal === 0 && (
          <p className="text-xs text-[#222222]/25 mt-3 text-center">
            Noch keine Daten für diesen Zeitraum
          </p>
        )}
      </div>
    </div>
  )
}
