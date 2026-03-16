'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { ArrowLeft, Save, Shield, BadgeCheck, ExternalLink, Clock } from 'lucide-react'
import { BUILDERS } from '@/lib/data/builders'

/* ── Types ─────────────────────────────────────────────────────────── */

type DayRow = {
  key: string   // "Mo", "Di", …
  label: string // "Montag", …
  status: 'open' | 'closed' | 'appointment'
  open: string  // "09:00"
  close: string // "17:00"
}

type ProfileData = {
  id: string
  full_name: string | null
  city: string | null
  specialty: string | null
  bio: string | null
  instagram_url: string | null
  website_url: string | null
  tags: string[] | null
  is_verified: boolean
  since_year: number | null
  opening_hours: { day: string; hours: string }[] | null
}

/* ── Opening-hours helpers ─────────────────────────────────────────── */

const WEEK: DayRow[] = [
  { key: 'Mo', label: 'Montag',     status: 'closed', open: '09:00', close: '17:00' },
  { key: 'Di', label: 'Dienstag',   status: 'closed', open: '09:00', close: '17:00' },
  { key: 'Mi', label: 'Mittwoch',   status: 'closed', open: '09:00', close: '17:00' },
  { key: 'Do', label: 'Donnerstag', status: 'closed', open: '09:00', close: '17:00' },
  { key: 'Fr', label: 'Freitag',    status: 'closed', open: '09:00', close: '17:00' },
  { key: 'Sa', label: 'Samstag',    status: 'closed', open: '10:00', close: '14:00' },
  { key: 'So', label: 'Sonntag',    status: 'closed', open: '10:00', close: '14:00' },
]

/** Convert per-day rows → compact { day, hours }[] for storage */
function rowsToOpeningHours(rows: DayRow[]): { day: string; hours: string }[] {
  return rows.map(r => ({
    day: r.key,
    hours: r.status === 'closed'
      ? 'Geschlossen'
      : r.status === 'appointment'
        ? 'Nur nach Vereinbarung'
        : `${r.open} – ${r.close}`,
  }))
}

/** Seed per-day rows from stored { day, hours }[] */
function openingHoursToRows(stored: { day: string; hours: string }[]): DayRow[] {
  return WEEK.map(def => {
    const match = stored.find(s => s.day === def.key)
    if (!match) return { ...def }
    if (match.hours === 'Geschlossen') return { ...def, status: 'closed' }
    if (match.hours === 'Nur nach Vereinbarung') return { ...def, status: 'appointment' }
    const m = match.hours.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/)
    if (m) return { ...def, status: 'open', open: m[1], close: m[2] }
    return { ...def }
  })
}

/* ── Seed from static builder (best-effort, expands ranges) ─────── */
function seedFromStatic(staticHours: { day: string; hours: string }[] | undefined): DayRow[] {
  if (!staticHours) return WEEK.map(d => ({ ...d }))
  // Try to expand range labels ("Mo – Fr") into individual days
  const DAY_IDX: Record<string, number> = {
    Mo: 0, Di: 1, Mi: 2, Do: 3, Fr: 4, Sa: 5, So: 6,
    Montag: 0, Dienstag: 1, Mittwoch: 2, Donnerstag: 3, Freitag: 4, Samstag: 5, Sonntag: 6,
  }
  const expanded: { day: string; hours: string }[] = []
  for (const entry of staticHours) {
    const range = entry.day.match(/^(\w+)\s*[–-]\s*(\w+)$/)
    if (range) {
      const start = DAY_IDX[range[1]], end = DAY_IDX[range[2]]
      if (start !== undefined && end !== undefined) {
        let d = start
        while (true) {
          expanded.push({ day: WEEK[d].key, hours: entry.hours })
          if (d === end) break
          d = (d + 1) % 7
        }
        continue
      }
    }
    if (entry.day === 'Wochenende') {
      expanded.push({ day: 'Sa', hours: entry.hours }, { day: 'So', hours: entry.hours })
      continue
    }
    if (entry.day.includes('&')) {
      for (const part of entry.day.split('&')) {
        const i = DAY_IDX[part.trim()]
        if (i !== undefined) expanded.push({ day: WEEK[i].key, hours: entry.hours })
      }
      continue
    }
    // Single day label or already a key
    const i = DAY_IDX[entry.day]
    expanded.push({ day: i !== undefined ? WEEK[i].key : entry.day, hours: entry.hours })
  }
  return openingHoursToRows(expanded)
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function EditBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const staticBuilder = BUILDERS.find(b => b.slug === slug)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dbProfile, setDbProfile] = useState<ProfileData | null>(null)

  const [form, setForm] = useState({
    full_name: staticBuilder?.name ?? '',
    city: staticBuilder?.city ?? '',
    specialty: staticBuilder?.specialty ?? '',
    bio: staticBuilder?.bio ?? '',
    instagram_url: staticBuilder?.instagram ?? '',
    website_url: staticBuilder?.website ?? '',
    tags: (staticBuilder?.tags ?? []).join(', '),
    is_verified: staticBuilder?.verified ?? false,
    since_year: staticBuilder?.since ? parseInt(staticBuilder.since) : new Date().getFullYear(),
  })

  const [hours, setHours] = useState<DayRow[]>(() =>
    seedFromStatic(staticBuilder?.openingHours)
  )

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: me } = await (supabase.from('profiles') as any)
        .select('role').eq('id', user.id).single()
      if (me?.role !== 'superadmin') { router.push('/dashboard'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('id, full_name, city, specialty, bio, instagram_url, website_url, tags, is_verified, since_year, opening_hours')
        .or(`username.eq.${slug},slug.eq.${slug}`)
        .single() as { data: ProfileData | null }

      if (data) {
        setDbProfile(data)
        setForm({
          full_name: data.full_name ?? staticBuilder?.name ?? '',
          city: data.city ?? staticBuilder?.city ?? '',
          specialty: data.specialty ?? staticBuilder?.specialty ?? '',
          bio: data.bio ?? staticBuilder?.bio ?? '',
          instagram_url: data.instagram_url ?? staticBuilder?.instagram ?? '',
          website_url: data.website_url ?? staticBuilder?.website ?? '',
          tags: (data.tags ?? staticBuilder?.tags ?? []).join(', '),
          is_verified: data.is_verified,
          since_year: data.since_year ?? (staticBuilder?.since ? parseInt(staticBuilder.since) : new Date().getFullYear()),
        })
        if (data.opening_hours?.length) {
          setHours(openingHoursToRows(data.opening_hours))
        } else {
          setHours(seedFromStatic(staticBuilder?.openingHours))
        }
      }
      setLoading(false)
    }
    load()
  }, [slug, router, staticBuilder])

  async function handleSave() {
    if (!dbProfile) {
      setError('Kein Supabase-Profil gefunden. Dieser Builder hat sich noch nicht registriert.')
      return
    }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        full_name: form.full_name || null,
        city: form.city || null,
        specialty: form.specialty || null,
        bio: form.bio || null,
        instagram_url: form.instagram_url || null,
        website_url: form.website_url || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        is_verified: form.is_verified,
        since_year: form.since_year || null,
        opening_hours: rowsToOpeningHours(hours),
      })
      .eq('id', dbProfile.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const field = (label: string, key: keyof typeof form, type: 'text' | 'textarea' | 'number' = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 resize-none transition-colors"
        />
      ) : (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
          className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors"
        />
      )}
    </div>
  )

  const updateRow = (i: number, patch: Partial<DayRow>) =>
    setHours(h => h.map((r, idx) => idx === i ? { ...r, ...patch } : r))

  /* ── Quick-fill helpers ── */
  const setWeekdays = (status: DayRow['status'], open = '09:00', close = '17:00') =>
    setHours(h => h.map((r, i) => i < 5 ? { ...r, status, open, close } : r))

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/builder" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            <ArrowLeft size={13} /> Builder-Liste
          </Link>
          <a href={`/builder/${slug}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#717171] transition-colors">
            <ExternalLink size={12} /> Profil ansehen
          </a>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
        </div>
        <h1 className="text-2xl font-bold text-[#222222] mb-1">{staticBuilder?.name ?? slug}</h1>
        <p className="text-xs text-[#222222]/30 mb-8">@{slug}</p>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-white animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-5">

            {/* Source indicator */}
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#222222]/6">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dbProfile ? 'bg-green-400' : 'bg-amber-400'}`} />
              <p className="text-xs text-[#222222]/50">
                {dbProfile
                  ? 'Supabase-Profil gefunden — Änderungen werden in der Datenbank gespeichert'
                  : 'Kein Supabase-Konto — nur statische Profildaten verfügbar (schreibgeschützt)'}
              </p>
            </div>

            {/* Basis */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Basis-Informationen</h2>
              {field('Name', 'full_name')}
              <div className="grid grid-cols-2 gap-4">
                {field('Stadt', 'city')}
                {field('Seit Jahr', 'since_year', 'number')}
              </div>
              {field('Spezialisierung', 'specialty')}
              {field('Bio (kurz)', 'bio', 'textarea')}
            </div>

            {/* Links */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Links & Tags</h2>
              {field('Instagram (@handle)', 'instagram_url')}
              {field('Website', 'website_url')}
              {field('Tags (kommagetrennt)', 'tags')}
            </div>

            {/* Opening hours */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-[#222222]/30" />
                  <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Öffnungszeiten</h2>
                </div>
                {/* Quick fill */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWeekdays('open')}
                    disabled={!dbProfile}
                    className="text-[10px] font-semibold text-[#222222]/30 hover:text-[#717171] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Mo–Fr öffnen
                  </button>
                  <span className="text-[#222222]/10">·</span>
                  <button
                    type="button"
                    onClick={() => setHours(h => h.map(r => ({ ...r, status: 'closed' })))}
                    disabled={!dbProfile}
                    className="text-[10px] font-semibold text-[#222222]/30 hover:text-red-400 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Alle schließen
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {hours.map((row, i) => {
                  const isWeekend = i >= 5
                  return (
                    <div
                      key={row.key}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isWeekend ? 'bg-white/60' : 'bg-white/30'
                      }`}
                    >
                      {/* Day label */}
                      <span className="w-7 text-xs font-bold text-[#222222]/50 flex-shrink-0">{row.key}</span>

                      {/* Status selector */}
                      <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 flex-shrink-0">
                        {(['open', 'closed', 'appointment'] as const).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => dbProfile && updateRow(i, { status: s })}
                            disabled={!dbProfile}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all disabled:cursor-not-allowed ${
                              row.status === s
                                ? s === 'open'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : s === 'closed'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-[#222222]/20 text-[#717171]'
                                : 'text-[#222222]/25 hover:text-[#222222]/50'
                            }`}
                          >
                            {s === 'open' ? 'Offen' : s === 'closed' ? 'Zu' : 'Termin'}
                          </button>
                        ))}
                      </div>

                      {/* Time inputs — only when open */}
                      {row.status === 'open' ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <input
                            type="time"
                            value={row.open}
                            onChange={e => dbProfile && updateRow(i, { open: e.target.value })}
                            disabled={!dbProfile}
                            className="flex-1 min-w-0 bg-white border border-[#222222]/10 rounded-lg px-2 py-1.5 text-xs text-[#222222] focus:outline-none focus:border-[#DDDDDD]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          />
                          <span className="text-[#222222]/20 text-xs flex-shrink-0">–</span>
                          <input
                            type="time"
                            value={row.close}
                            onChange={e => dbProfile && updateRow(i, { close: e.target.value })}
                            disabled={!dbProfile}
                            className="flex-1 min-w-0 bg-white border border-[#222222]/10 rounded-lg px-2 py-1.5 text-xs text-[#222222] focus:outline-none focus:border-[#DDDDDD]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          />
                        </div>
                      ) : (
                        <span className={`flex-1 text-xs ${
                          row.status === 'closed' ? 'text-[#222222]/20' : 'text-[#717171]/60 italic'
                        }`}>
                          {row.status === 'closed' ? 'Geschlossen' : 'Nur nach Vereinbarung'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status / Verified */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mb-4">Status</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => dbProfile && setForm(f => ({ ...f, is_verified: !f.is_verified }))}
                  className={`w-10 h-6 rounded-full border-2 transition-all relative ${
                    form.is_verified ? 'bg-[#086565] border-[#DDDDDD]' : 'bg-transparent border-[#222222]/20'
                  } ${!dbProfile ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_verified ? 'left-4' : 'left-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#222222] flex items-center gap-1.5">
                    <BadgeCheck size={14} className={form.is_verified ? 'text-[#717171]' : 'text-[#222222]/20'} />
                    Verifizierter Builder
                  </p>
                  <p className="text-xs text-[#222222]/30 mt-0.5">Zeigt das Verified-Badge auf dem Profil</p>
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{error}</div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400">
                Änderungen gespeichert ✓
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link href="/admin/builder" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
                Abbrechen
              </Link>
              <button
                onClick={handleSave}
                disabled={saving || !dbProfile}
                className="inline-flex items-center gap-2 bg-[#086565] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#075555] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? 'Wird gespeichert…' : 'Speichern'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
