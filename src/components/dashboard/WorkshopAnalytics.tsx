'use client'

import { useState, useMemo } from 'react'
import {
  Eye, MessageCircle, Bike, Star, Lock, Loader2,
  TrendingUp, TrendingDown, Minus, Image as ImageIcon,
  AlertCircle, MapPin, Sparkles,
} from 'lucide-react'

// ── Types ──

type AnalyticsEvent = {
  event_type: string
  target_type: string | null
  target_id: string | null
  referrer: string | null
  created_at: string
}

type BikeInfo = {
  id: string
  title: string
  style: string | null
  listing_type: string | null
}

type ProfileTips = {
  hasCover: boolean
  hasLocation: boolean
  allBikesHaveStyle: boolean
  lastActivityDaysAgo: number | null
}

type TimeRange = 'today' | '7d' | '30d' | 'all'

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'today', label: 'Heute' },
  { key: '7d', label: '7 Tage' },
  { key: '30d', label: '30 Tage' },
  { key: 'all', label: 'Alle' },
]

// ── Locked State ──

export function LockedDashboard() {
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
    <div className="relative">
      {/* Blurred mock content */}
      <div className="opacity-30 blur-[2px] pointer-events-none select-none space-y-4">
        {/* Mock time tabs */}
        <div className="flex gap-1 bg-[#E8E8E8] rounded-xl p-1">
          {TIME_RANGES.map(t => (
            <div key={t.key} className={`flex-1 text-xs font-medium py-2 rounded-lg text-center ${t.key === '7d' ? 'bg-white text-[#222]' : 'text-[#222]/40'}`}>
              {t.label}
            </div>
          ))}
        </div>

        {/* Mock KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Profilbesucher', value: 847, trend: '+12%' },
            { label: 'Kontakt-Klicks', value: 34, trend: '+8%' },
            { label: 'Bike-Aufrufe', value: 1243, trend: '+23%' },
            { label: 'Merkliste-Saves', value: 56, trend: '+5%' },
          ].map(k => (
            <div key={k.label} className="bg-gray-50 rounded-2xl p-4">
              <p className="text-[10px] font-medium text-[#222]/40 uppercase tracking-wider mb-1">{k.label}</p>
              <p className="text-2xl font-bold text-[#222]">{k.value}</p>
              <p className="text-xs text-green-500 mt-0.5">{k.trend}</p>
            </div>
          ))}
        </div>

        {/* Mock chart */}
        <div className="bg-white border border-[#222]/6 rounded-2xl p-5 h-48">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0 35 C 10 30, 20 15, 30 20 C 40 25, 50 10, 60 15 C 70 20, 80 5, 100 10" fill="none" stroke="#2AABAB" strokeWidth="0.5" />
            <path d="M 0 35 C 10 30, 20 15, 30 20 C 40 25, 50 10, 60 15 C 70 20, 80 5, 100 10 L 100 40 L 0 40 Z" fill="#2AABAB" fillOpacity="0.1" />
          </svg>
        </div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-white border border-[#2AABAB]/20 rounded-2xl px-8 py-7 text-center max-w-sm shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[#2AABAB]/10 flex items-center justify-center">
            <Lock size={18} className="text-[#2AABAB]" />
          </div>
          <h3 className="text-base font-bold text-[#222]">Analytics freischalten</h3>
          <p className="text-xs text-[#717171] leading-relaxed">
            Sieh wie viele Besucher dein Profil hatte, welche Bikes am meisten aufgerufen wurden und woher deine Besucher kommen.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-colors mt-1 disabled:opacity-50"
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

// ── Full Dashboard ──

function getCurrentTimestamp() { return Date.now() }

function filterByRange(events: AnalyticsEvent[], range: TimeRange, now: number): AnalyticsEvent[] {
  if (range === 'all') return events
  const cutoff = range === 'today'
    ? new Date(now).toISOString().split('T')[0]
    : new Date(now - (range === '30d' ? 30 : 7) * 86400000).toISOString()
  return events.filter(e => range === 'today'
    ? e.created_at.split('T')[0] === cutoff
    : e.created_at >= cutoff
  )
}

function countByType(events: AnalyticsEvent[], type: string): number {
  return events.filter(e => e.event_type === type).length
}

function groupByDay(events: AnalyticsEvent[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of events) {
    const day = e.created_at.split('T')[0]
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  return map
}

function lastNDays(now: number, n: number): string[] {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(now - i * 86400000).toISOString().split('T')[0])
  }
  return days
}

function trendPercent(current: number, previous: number): { value: string; direction: 'up' | 'down' | 'neutral' } {
  if (previous === 0 && current === 0) return { value: '0%', direction: 'neutral' }
  if (previous === 0) return { value: '+100%', direction: 'up' }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { value: '0%', direction: 'neutral' }
  return { value: `${pct > 0 ? '+' : ''}${pct}%`, direction: pct > 0 ? 'up' : 'down' }
}

type Props = {
  events: AnalyticsEvent[]
  bikes: BikeInfo[]
  tips: ProfileTips
}

export function FullDashboard({ events, bikes, tips }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [now] = useState(getCurrentTimestamp)

  const filtered = useMemo(() => filterByRange(events, timeRange, now), [events, timeRange, now])

  // For trend comparison: previous period of same length
  const previousFiltered = useMemo(() => {
    if (timeRange === 'all') return []
    const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 30
    const cutoffStart = new Date(now - days * 2 * 86400000).toISOString()
    const cutoffEnd = new Date(now - days * 86400000).toISOString()
    return events.filter(e => e.created_at >= cutoffStart && e.created_at < cutoffEnd)
  }, [events, timeRange, now])

  // KPI values
  const profileViews = countByType(filtered, 'profile_view')
  const contactClicks = countByType(filtered, 'contact_click')
  const bikeViews = countByType(filtered, 'bike_view')
  const saveClicks = countByType(filtered, 'save_click')

  const prevProfileViews = countByType(previousFiltered, 'profile_view')
  const prevContactClicks = countByType(previousFiltered, 'contact_click')
  const prevBikeViews = countByType(previousFiltered, 'bike_view')
  const prevSaveClicks = countByType(previousFiltered, 'save_click')

  const kpis = [
    { label: 'Profilbesucher', value: profileViews, trend: trendPercent(profileViews, prevProfileViews), icon: <Eye size={14} /> },
    { label: 'Kontakt-Klicks', value: contactClicks, trend: trendPercent(contactClicks, prevContactClicks), icon: <MessageCircle size={14} /> },
    { label: 'Bike-Aufrufe', value: bikeViews, trend: trendPercent(bikeViews, prevBikeViews), icon: <Bike size={14} />, hint: bikes.length === 0 ? 'Füge ein Custom Bike hinzu' : null },
    { label: 'Merkliste-Saves', value: saveClicks, trend: trendPercent(saveClicks, prevSaveClicks), icon: <Star size={14} /> },
  ]

  // ── Chart data ──
  const chartDays = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 30
  const days = lastNDays(now, chartDays)
  const profileViewsByDay = groupByDay(filtered.filter(e => e.event_type === 'profile_view'))
  const chartData = days.map(d => profileViewsByDay.get(d) ?? 0)
  const maxChart = Math.max(...chartData, 1)

  // ── Conversion Funnel ──
  const routeClicks = countByType(filtered, 'route_click')
  const funnelSteps = [
    { label: 'Profil gesehen', value: profileViews },
    { label: 'Bike angesehen', value: bikeViews },
    { label: 'Route geplant', value: routeClicks },
    { label: 'Kontaktiert', value: contactClicks },
  ]
  const funnelMax = Math.max(profileViews, 1)

  // ── Bike Performance ──
  const bikePerformance = useMemo(() => {
    const bikeViewMap = new Map<string, number>()
    const bikeContactMap = new Map<string, number>()

    for (const e of filtered) {
      if (e.event_type === 'bike_view' && e.target_id) {
        bikeViewMap.set(e.target_id, (bikeViewMap.get(e.target_id) ?? 0) + 1)
      }
      if (e.event_type === 'contact_click' && e.target_type === 'bike' && e.target_id) {
        bikeContactMap.set(e.target_id, (bikeContactMap.get(e.target_id) ?? 0) + 1)
      }
    }

    // Sparkline: last 7 days of views per bike
    const sevenDays = lastNDays(now, 7)
    const bikeViewsByDay = new Map<string, Map<string, number>>()
    for (const e of events.filter(ev => ev.event_type === 'bike_view' && ev.target_id)) {
      const day = e.created_at.split('T')[0]
      if (!sevenDays.includes(day)) continue
      if (!bikeViewsByDay.has(e.target_id!)) bikeViewsByDay.set(e.target_id!, new Map())
      const dayMap = bikeViewsByDay.get(e.target_id!)!
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
    }

    return bikes.map(b => ({
      ...b,
      views: bikeViewMap.get(b.id) ?? 0,
      contacts: bikeContactMap.get(b.id) ?? 0,
      sparkline: sevenDays.map(d => bikeViewsByDay.get(b.id)?.get(d) ?? 0),
    })).sort((a, b) => b.views - a.views)
  }, [filtered, bikes, events, now])

  // ── Traffic Sources ──
  const trafficSources = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) {
      const ref = e.referrer ?? 'direct'
      map.set(ref, (map.get(ref) ?? 0) + 1)
    }
    const labels: Record<string, string> = {
      werkstattsuche: 'Werkstattsuche',
      explore: 'Explore-Feed',
      bikes: 'Custom Bikes',
      google: 'Google',
      instagram: 'Instagram',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      twitter: 'X / Twitter',
      pinterest: 'Pinterest',
      linkedin: 'LinkedIn',
      external: 'Andere Website',
      direct: 'Direkter Link',
    }
    return Array.from(map.entries())
      .map(([key, count]) => ({ key, label: labels[key] ?? key, count }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])
  const trafficTotal = trafficSources.reduce((a, b) => a + b.count, 0) || 1

  // ── Geo Insights ──
  const geoData = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) {
      if (e.referrer === undefined) continue // only events that have region data at the event level don't exist yet
    }
    // Region data comes from the region field — we need to aggregate from raw events
    // For now, check if any events have region data (passed separately)
    return Array.from(map.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filtered])

  // ── Tips ──
  const activeTips = useMemo(() => {
    const t: { icon: React.ReactNode; text: string }[] = []
    if (!tips.hasCover) t.push({ icon: <ImageIcon size={14} />, text: 'Lade ein Cover-Bild hoch, um dein Profil attraktiver zu machen.' })
    if (!tips.allBikesHaveStyle) t.push({ icon: <Bike size={14} />, text: 'Einige deiner Bikes haben keinen Stil-Tag. Das verbessert die Auffindbarkeit.' })
    if (tips.lastActivityDaysAgo !== null && tips.lastActivityDaysAgo > 14) t.push({ icon: <Sparkles size={14} />, text: 'Dein letzter Explore-Post ist über 14 Tage her. Teile ein Update!' })
    if (!tips.hasLocation) t.push({ icon: <MapPin size={14} />, text: 'Setze deinen Standort, damit Besucher dich auf der Karte finden.' })
    return t
  }, [tips])

  // ── Chart SVG ──
  const padTop = 12
  const padBot = 10
  const chartH = 100 - padTop - padBot
  const n = days.length

  function buildCurve(data: number[], max: number) {
    const pts = data.map((v, i) => ({
      x: (2 * i + 1) / (2 * n) * 100,
      y: padTop + chartH * (1 - v / max),
    }))
    let line = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = (pts[i + 1].x - pts[i].x) / 3
      line += ` C ${pts[i].x + dx} ${pts[i].y}, ${pts[i + 1].x - dx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`
    }
    const area = `${line} L ${pts[pts.length - 1].x} ${padTop + chartH} L ${pts[0].x} ${padTop + chartH} Z`
    return { pts, line, area }
  }

  const curve = buildCurve(chartData, maxChart)

  // ── Sparkline builder ──
  function Sparkline({ data }: { data: number[] }) {
    const max = Math.max(...data, 1)
    const h = 20
    const w = 48
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
    return (
      <svg width={w} height={h} className="flex-shrink-0">
        <polyline points={pts} fill="none" stroke="#2AABAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Time Range Tabs ── */}
      <div className="sticky top-1 z-20 flex gap-1 bg-[#E8E8E8] rounded-xl p-1">
        {TIME_RANGES.map(t => (
          <button
            key={t.key}
            onClick={() => setTimeRange(t.key)}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
              timeRange === t.key
                ? 'bg-[#2AABAB] text-white shadow-sm'
                : 'text-[#222]/40 hover:text-[#222]/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2 text-[#222]/35">
              {k.icon}
              <span className="text-[10px] font-medium uppercase tracking-wider">{k.label}</span>
            </div>
            {k.hint ? (
              <p className="text-xs text-[#222]/30 leading-relaxed mt-1">{k.hint}</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-[#222]">{k.value.toLocaleString('de-DE')}</p>
                <p className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 ${
                  k.trend.direction === 'up' ? 'text-green-600' : k.trend.direction === 'down' ? 'text-red-500' : 'text-[#222]/25'
                }`}>
                  {k.trend.direction === 'up' ? <TrendingUp size={11} /> : k.trend.direction === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
                  {k.trend.value} vs. Vorperiode
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Besucher Chart ── */}
      <div className="bg-white border border-[#222]/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[#222]">Profilbesucher</p>
            <p className="text-xs text-[#222]/30 mt-0.5">{profileViews.toLocaleString('de-DE')} im Zeitraum</p>
          </div>
          <span className="text-[10px] bg-[#2AABAB]/10 text-[#2AABAB] border border-[#2AABAB]/20 px-2.5 py-1 rounded-full font-semibold">Live Daten</span>
        </div>

        {chartDays > 1 ? (
          <>
            <div className="relative h-36">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                {[0.25, 0.5, 0.75].map(f => (
                  <line key={f} x1="0" y1={padTop + chartH * (1 - f)} x2="100" y2={padTop + chartH * (1 - f)} stroke="#222" strokeOpacity="0.04" strokeDasharray="0.5 1" vectorEffect="non-scaling-stroke" />
                ))}
                <defs>
                  <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2AABAB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2AABAB" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={curve.area} fill="url(#visitorsGrad)" />
                <path d={curve.line} fill="none" stroke="#2AABAB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* Dots */}
              {curve.pts.map((p, i) => (
                chartData[i] > 0 && (
                  <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <div className="w-3 h-3 rounded-full flex items-center justify-center bg-[#2AABAB]/10">
                      <div className="w-[7px] h-[7px] rounded-full bg-white border-2 border-[#2AABAB]" />
                    </div>
                  </div>
                )
              ))}

              {/* Hover tooltips */}
              <div className="absolute inset-0 flex">
                {days.map((_, i) => (
                  <div key={i} className="flex-1 group relative cursor-default">
                    <div
                      className="absolute left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-start bg-[#222] text-white rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap z-10 shadow-md"
                      style={{ top: `${Math.max(curve.pts[i].y - 16, 0)}%` }}
                    >
                      <span className="font-semibold">{chartData[i]} Besucher</span>
                      <span className="opacity-50">{new Date(days[i]).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex mt-2">
              {days.map((d, i) => (
                <span key={i} className="flex-1 text-center text-[10px] text-[#222]/25">
                  {new Date(d).toLocaleDateString('de-DE', { weekday: 'short' })}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-20">
            <p className="text-3xl font-bold text-[#2AABAB]">{profileViews}</p>
          </div>
        )}
      </div>

      {/* ── Conversion Funnel ── */}
      <div className="bg-white border border-[#222]/6 rounded-2xl p-5">
        <p className="text-sm font-semibold text-[#222] mb-4">Conversion Funnel</p>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => {
            const rate = i === 0 ? 100 : funnelMax > 0 ? Math.round((step.value / funnelMax) * 100) : 0
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#222]/60">{step.label}</span>
                  <span className="text-xs font-semibold text-[#222]/50">
                    {step.value.toLocaleString('de-DE')}
                    {i > 0 && <span className="text-[#222]/25 ml-1">({rate}%)</span>}
                  </span>
                </div>
                <div className="h-2 bg-[#222]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2AABAB] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(rate, 1)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bike Performance Table ── */}
      {bikePerformance.length > 0 && (
        <div className="bg-white border border-[#222]/6 rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#222] mb-4">Bike Performance</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-[#222]/30 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Bike</th>
                  <th className="pb-3 font-medium text-right">Aufrufe</th>
                  <th className="pb-3 font-medium text-right">Anfragen</th>
                  <th className="pb-3 font-medium text-center hidden sm:table-cell">7-Tage</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {bikePerformance.map(b => (
                  <tr key={b.id} className="border-t border-[#222]/5">
                    <td className="py-3 pr-3">
                      <p className="text-xs font-semibold text-[#222] truncate max-w-[200px]">{b.title}</p>
                      <p className="text-[10px] text-[#222]/30 truncate">{b.style ?? ''}</p>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-xs font-semibold text-[#222]">{b.views}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-xs font-semibold text-[#222]">{b.contacts}</span>
                    </td>
                    <td className="py-3 text-center hidden sm:table-cell">
                      <div className="flex justify-center">
                        <Sparkline data={b.sparkline} />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        b.listing_type === 'for_sale'
                          ? 'bg-[#2AABAB]/10 text-[#2AABAB]'
                          : 'bg-[#222]/5 text-[#222]/40'
                      }`}>
                        {b.listing_type === 'for_sale' ? 'Zu verkaufen' : 'Portfolio'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Traffic Sources ── */}
      {trafficSources.length > 0 && (
        <div className="bg-white border border-[#222]/6 rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#222] mb-4">Traffic-Quellen</p>
          <div className="space-y-3">
            {trafficSources.map(s => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#222]/60">{s.label}</span>
                  <span className="text-xs font-semibold text-[#222]/50">
                    {s.count} <span className="text-[#222]/25">({Math.round((s.count / trafficTotal) * 100)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-[#222]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2AABAB]/60 rounded-full transition-all duration-500"
                    style={{ width: `${(s.count / (trafficSources[0]?.count || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Geo Insights ── */}
      {geoData.length > 0 && (
        <div className="bg-white border border-[#222]/6 rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#222] mb-4">Besucher nach Region</p>
          <div className="space-y-3">
            {geoData.map(g => (
              <div key={g.region}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#222]/60">{g.region}</span>
                  <span className="text-xs font-semibold text-[#222]/50">{g.count}</span>
                </div>
                <div className="h-2 bg-[#222]/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2AABAB]/40 rounded-full"
                    style={{ width: `${(g.count / (geoData[0]?.count || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tips Strip ── */}
      {activeTips.length > 0 && (
        <div className="bg-[#E1F5EE] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-[#222]/40" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222]/40">Tipps zur Optimierung</p>
          </div>
          <div className="space-y-2">
            {activeTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[#222]/30 mt-0.5 flex-shrink-0">{tip.icon}</span>
                <p className="text-xs text-[#222]/60 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
