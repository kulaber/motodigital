'use client'

import { useState, useMemo } from 'react'

type PageView = { path: string; section: string; created_at: string }

/** Turn a raw path into a readable label */
function formatPath(path: string): string {
  if (path === '/' || path === '') return 'Startseite'
  const segments = path.split('/').filter(Boolean)
  // For listing pages like /bikes, /custom-werkstatt etc.
  if (segments.length === 1) {
    const labels: Record<string, string> = {
      bikes: 'Custom Bikes Übersicht',
      'custom-werkstatt': 'Werkstattsuche',
      explore: 'Explore',
      magazine: 'Magazin',
      rider: 'Rider Übersicht',
      events: 'Events',
      marken: 'Marken',
    }
    return labels[segments[0]] ?? segments[0]
  }
  // Detail pages: format the slug nicely
  const slug = segments[segments.length - 1]
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Section prefix for context, e.g. "Werkstattsuche /" */
function sectionPrefix(path: string): string | null {
  const segments = path.split('/').filter(Boolean)
  if (segments.length <= 1) return null
  const labels: Record<string, string> = {
    'custom-werkstatt': 'Werkstatt',
    bikes: 'Bike',
    'custom-bike': 'Bike',
    magazine: 'Magazin',
    rider: 'Rider',
    events: 'Event',
    marken: 'Marke',
  }
  return labels[segments[0]] ?? null
}

/** Extracted outside so React compiler doesn't flag Date.now() as impure */
function getCurrentTimestamp() { return Date.now() }

export function PageViewsChart({ pageViews }: { pageViews: PageView[] }) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [now] = useState(getCurrentTimestamp)

  // All sections
  const sections = useMemo(() => {
    const map = new Map<string, number>()
    for (const pv of pageViews) {
      map.set(pv.section, (map.get(pv.section) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([section, count]) => ({ section, count }))
      .sort((a, b) => b.count - a.count)
  }, [pageViews])

  // Filtered views
  const filtered = useMemo(() => {
    if (!activeSection) return pageViews
    return pageViews.filter(pv => pv.section === activeSection)
  }, [pageViews, activeSection])

  const totalFiltered = filtered.length

  // Group by day
  const byDay = useMemo(() => {
    const dayMap = new Map<string, number>()
    for (const pv of filtered) {
      const day = pv.created_at.split('T')[0]
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
    }
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().split('T')[0]
      days.push({ date: d, count: dayMap.get(d) ?? 0 })
    }
    return days
  }, [filtered])

  // Top pages (detailed drill-down)
  const topPages = useMemo(() => {
    const map = new Map<string, number>()
    for (const pv of filtered) {
      map.set(pv.path, (map.get(pv.path) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filtered])

  // ── Chart (percentage-based for full-width alignment) ──
  const maxViews = Math.max(...byDay.map(d => d.count), 1)
  const n = byDay.length
  const padTop = 12 // % of viewBox
  const padBot = 10
  const chartH = 100 - padTop - padBot

  // x centered in each flex-1 column, y scaled to data
  const pts = byDay.map((d, i) => ({
    x: (2 * i + 1) / (2 * n) * 100,
    y: padTop + chartH * (1 - d.count / maxViews),
  }))

  // Smooth cubic bezier path (viewBox 0 0 100 100)
  let line = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = (pts[i + 1].x - pts[i].x) / 3
    line += ` C ${pts[i].x + dx} ${pts[i].y}, ${pts[i + 1].x - dx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`
  }
  const area = `${line} L ${pts[pts.length - 1].x} ${padTop + chartH} L ${pts[0].x} ${padTop + chartH} Z`

  return (
    <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-[#222222]">Seitenaufrufe</p>
          <p className="text-xs text-[#222222]/30 mt-0.5">
            {totalFiltered > 0
              ? `${totalFiltered.toLocaleString('de-DE')} in den letzten 7 Tagen`
              : 'Letzte 7 Tage'}
          </p>
        </div>
        <span className="text-[10px] bg-[#06a5a5]/10 text-[#06a5a5] border border-[#06a5a5]/20 px-2.5 py-1 rounded-full font-semibold">
          Live Daten
        </span>
      </div>

      {/* Section filter pills */}
      {sections.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
          <button
            onClick={() => setActiveSection(null)}
            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
              !activeSection
                ? 'bg-[#06a5a5] text-white'
                : 'bg-[#222222]/5 text-[#222222]/40 hover:bg-[#222222]/10 hover:text-[#222222]/60'
            }`}
          >
            Alle
          </button>
          {sections.map(s => (
            <button
              key={s.section}
              onClick={() => setActiveSection(activeSection === s.section ? null : s.section)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
                activeSection === s.section
                  ? 'bg-[#06a5a5] text-white'
                  : 'bg-[#222222]/5 text-[#222222]/40 hover:bg-[#222222]/10 hover:text-[#222222]/60'
              }`}
            >
              {s.section}
              <span className="ml-1 opacity-60">{s.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Area chart */}
      <div className="relative h-36">
        {/* SVG stretches to fill — line/area only */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="tealAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#058f8f" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#06a5a5" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2AABAB" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1="0" y1={padTop + chartH * (1 - f)} x2="100" y2={padTop + chartH * (1 - f)} stroke="#06a5a5" strokeOpacity="0.06" strokeDasharray="0.5 1" vectorEffect="non-scaling-stroke" />
          ))}
          {/* Filled area */}
          <path d={area} fill="url(#tealAreaGrad)" />
          {/* Curve */}
          <path d={line} fill="none" stroke="#06a5a5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Data point dots (HTML for perfect circles) */}
        {pts.map((p, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <div className="w-3 h-3 rounded-full bg-[#06a5a5]/10 flex items-center justify-center">
              <div className="w-[7px] h-[7px] rounded-full bg-white border-2 border-[#06a5a5]" />
            </div>
          </div>
        ))}
        {/* Hover columns for tooltips */}
        <div className="absolute inset-0 flex">
          {byDay.map((d, i) => (
            <div key={i} className="flex-1 group relative cursor-default">
              <div
                className="absolute left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-[#222222] text-white rounded-lg px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap z-10 shadow-md"
                style={{ top: `${Math.max(pts[i].y - 16, 0)}%` }}
              >
                {d.count}
                <span className="font-normal opacity-60">Aufrufe</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Weekday labels */}
      <div className="flex mt-2">
        {byDay.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-[#222222]/25">
            {new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' })}
          </span>
        ))}
      </div>

      {/* Top pages detail */}
      {topPages.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#222222]/6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">
            {activeSection ? `Top Seiten — ${activeSection}` : 'Top Seiten'}
          </p>
          <div className="space-y-2">
            {topPages.map(p => {
              const prefix = sectionPrefix(p.path)
              return (
                <div key={p.path} className="flex items-center gap-3">
                  <div className="w-40 min-w-0 flex items-center gap-1.5">
                    {prefix && (
                      <span className="text-[10px] text-[#06a5a5]/50 flex-shrink-0">{prefix}</span>
                    )}
                    <span className="text-xs text-[#222222]/60 truncate" title={p.path}>
                      {formatPath(p.path)}
                    </span>
                  </div>
                  <div className="flex-1 h-1.5 bg-[#222222]/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#06a5a5]/40 rounded-full"
                      style={{ width: `${(p.count / topPages[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#222222]/50 w-10 text-right">{p.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Section breakdown (only when "Alle" is active) */}
      {!activeSection && sections.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#222222]/6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-3">Nach Bereich</p>
          <div className="space-y-2">
            {sections.slice(0, 6).map(s => (
              <button
                key={s.section}
                onClick={() => setActiveSection(s.section)}
                className="flex items-center gap-3 w-full text-left group"
              >
                <span className="text-xs text-[#222222]/60 w-28 truncate group-hover:text-[#06a5a5] transition-colors">{s.section}</span>
                <div className="flex-1 h-1.5 bg-[#222222]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#06a5a5]/40 rounded-full group-hover:bg-[#06a5a5]/60 transition-colors"
                    style={{ width: `${(s.count / sections[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#222222]/50 w-10 text-right">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {totalFiltered === 0 && (
        <p className="text-xs text-[#222222]/25 mt-3 text-center">
          {activeSection
            ? `Keine Aufrufe für "${activeSection}" in den letzten 7 Tagen`
            : 'Noch keine Daten — Tracking wurde gerade aktiviert'}
        </p>
      )}
    </div>
  )
}
