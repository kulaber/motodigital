'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { ArrowLeft, Save, Shield, BadgeCheck, ExternalLink } from 'lucide-react'
import { BUILDERS } from '@/lib/data/builders'

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
}

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

  // Form state — seeded from DB or static fallback
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

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      // Auth check
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: me } = await (supabase.from('profiles') as any)
        .select('role').eq('id', user.id).single()
      if (me?.role !== 'superadmin') { router.push('/dashboard'); return }

      // Load the builder's profile from Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('id, full_name, city, specialty, bio, instagram_url, website_url, tags, is_verified, since_year')
        .eq('username', slug)
        .eq('role', 'builder')
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
      <label className="block text-xs font-semibold text-[#F0EDE4]/40 uppercase tracking-widest mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="w-full bg-[#141414] border border-[#F0EDE4]/10 rounded-xl px-4 py-3 text-sm text-[#F0EDE4] placeholder-[#F0EDE4]/20 focus:outline-none focus:border-[#2AABAB]/50 resize-none transition-colors"
        />
      ) : (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
          className="w-full bg-[#141414] border border-[#F0EDE4]/10 rounded-xl px-4 py-3 text-sm text-[#F0EDE4] placeholder-[#F0EDE4]/20 focus:outline-none focus:border-[#2AABAB]/50 transition-colors"
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#141414] text-[#F0EDE4]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/builder" className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors">
            <ArrowLeft size={13} /> Builder-Liste
          </Link>
          <a href={`/builder/${slug}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#F0EDE4]/35 hover:text-[#2AABAB] transition-colors">
            <ExternalLink size={12} /> Profil ansehen
          </a>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
        </div>
        <h1 className="text-2xl font-bold text-[#F0EDE4] mb-1">
          {staticBuilder?.name ?? slug}
        </h1>
        <p className="text-xs text-[#F0EDE4]/30 mb-8">@{slug}</p>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-14 rounded-xl bg-[#1C1C1C] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">

            {/* Source indicator */}
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-[#1C1C1C] border border-[#F0EDE4]/6">
              <div className={`w-2 h-2 rounded-full ${dbProfile ? 'bg-green-400' : 'bg-amber-400'}`} />
              <p className="text-xs text-[#F0EDE4]/50">
                {dbProfile
                  ? 'Supabase-Profil gefunden — Änderungen werden in der Datenbank gespeichert'
                  : 'Kein Supabase-Konto — nur statische Profildaten verfügbar (schreibgeschützt)'}
              </p>
            </div>

            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-4">Basis-Informationen</h2>
              {field('Name', 'full_name')}
              <div className="grid grid-cols-2 gap-4">
                {field('Stadt', 'city')}
                {field('Seit Jahr', 'since_year', 'number')}
              </div>
              {field('Spezialisierung', 'specialty')}
              {field('Bio (kurz)', 'bio', 'textarea')}
            </div>

            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-4">Links & Tags</h2>
              {field('Instagram (@handle)', 'instagram_url')}
              {field('Website', 'website_url')}
              {field('Tags (kommagetrennt)', 'tags')}
            </div>

            <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-[#F0EDE4]/30 uppercase tracking-widest mb-4">Status</h2>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => dbProfile && setForm(f => ({ ...f, is_verified: !f.is_verified }))}
                  className={`w-10 h-6 rounded-full border-2 transition-all relative ${
                    form.is_verified
                      ? 'bg-[#2AABAB] border-[#2AABAB]'
                      : 'bg-transparent border-[#F0EDE4]/20'
                  } ${!dbProfile ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_verified ? 'left-4' : 'left-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F0EDE4] flex items-center gap-1.5">
                    <BadgeCheck size={14} className={form.is_verified ? 'text-[#2AABAB]' : 'text-[#F0EDE4]/20'} />
                    Verifizierter Builder
                  </p>
                  <p className="text-xs text-[#F0EDE4]/30 mt-0.5">Zeigt das Verified-Badge auf dem Profil</p>
                </div>
              </label>
            </div>

            {/* Error / success */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400">
                Änderungen gespeichert ✓
              </div>
            )}

            {/* Save button */}
            <div className="flex items-center justify-between pt-2">
              <Link href="/admin/builder" className="text-xs text-[#F0EDE4]/35 hover:text-[#F0EDE4] transition-colors">
                Abbrechen
              </Link>
              <button
                onClick={handleSave}
                disabled={saving || !dbProfile}
                className="inline-flex items-center gap-2 bg-[#2AABAB] text-[#141414] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#3DBFBF] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
