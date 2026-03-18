'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import { ArrowLeft, Save, Shield, BadgeCheck, User, Upload } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'

type RiderProfile = {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  city: string | null
  avatar_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  website_url: string | null
  tags: string[] | null
  is_verified: boolean
}

export default function AdminEditRiderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [rider, setRider]       = useState<RiderProfile | null>(null)

  const [form, setForm] = useState({
    full_name:     '',
    username:      '',
    bio:           '',
    city:          '',
    avatar_url:    '',
    instagram_url: '',
    tiktok_url:    '',
    website_url:   '',
    tags:          '',
    is_verified:   false,
  })

  const avatarInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: me } = await (supabase.from('profiles') as any)
        .select('role').eq('id', user.id).maybeSingle()
      if (me?.role !== 'superadmin') { router.push('/dashboard'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('id, full_name, username, bio, city, avatar_url, instagram_url, tiktok_url, website_url, tags, is_verified')
        .eq('id', id)
        .maybeSingle() as { data: RiderProfile | null }

      if (!data) { router.push('/admin/riders'); return }

      setRider(data)
      setForm({
        full_name:     data.full_name     ?? '',
        username:      data.username      ?? '',
        bio:           data.bio           ?? '',
        city:          data.city          ?? '',
        avatar_url:    data.avatar_url    ?? '',
        instagram_url: data.instagram_url ?? '',
        tiktok_url:    data.tiktok_url    ?? '',
        website_url:   data.website_url   ?? '',
        tags:          (data.tags ?? []).join(', '),
        is_verified:   data.is_verified,
      })
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const supabase = createClient()
      const compressed = await compressImage(file, 800, 0.85)
      const ext  = file.name.split('.').pop()
      const path = `${id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('builder-media')
        .upload(path, compressed, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage
        .from('builder-media')
        .getPublicUrl(path)
      setForm(f => ({ ...f, avatar_url: publicUrl }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!rider) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        full_name:     form.full_name     || null,
        username:      form.username      || null,
        bio:           form.bio           || null,
        city:          form.city          || null,
        avatar_url:    form.avatar_url    || null,
        instagram_url: form.instagram_url || null,
        tiktok_url:    form.tiktok_url    || null,
        website_url:   form.website_url   || null,
        tags:          tags.length ? tags : null,
        is_verified:   form.is_verified,
      })
      .eq('id', rider.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const inputCls = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#222222]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors'

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 lg:px-8">

        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/riders" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            <ArrowLeft size={13} /> Rider-Liste
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
        </div>
        <h1 className="text-2xl font-bold text-[#222222] mb-1">{rider?.full_name ?? '…'}</h1>
        {rider?.username && <p className="text-xs text-[#222222]/30 mb-8">@{rider.username}</p>}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-[#F7F7F7] animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-5">

            {/* Avatar */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mb-4">Profilbild</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#F7F7F7] border border-[#222222]/8 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {form.avatar_url ? (
                    <NextImage src={form.avatar_url} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <User size={22} className="text-[#222222]/20" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => avatarInput.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-[#222222]/12 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/25 transition-all disabled:opacity-40"
                  >
                    <Upload size={11} />
                    {uploading ? 'Wird hochgeladen…' : 'Foto hochladen'}
                  </button>
                  <p className="text-[10px] text-[#222222]/25 mt-1">JPG oder PNG, max. 5 MB</p>
                </div>
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }}
                />
              </div>
            </div>

            {/* Basis */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Basis-Informationen</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">Name</label>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Vor- und Nachname" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">Username</label>
                  <div className="flex items-center border border-[#222222]/10 rounded-xl overflow-hidden focus-within:border-[#DDDDDD]/50 transition-colors bg-white">
                    <span className="px-3 text-sm text-[#222222]/30 select-none">@</span>
                    <input
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      placeholder="username"
                      className="flex-1 py-3 pr-4 text-sm text-[#222222] placeholder-[#222222]/20 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">Stadt</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="z. B. Berlin" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3} placeholder="Kurze Beschreibung…"
                  className={`${inputCls} resize-none`} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">Tags (kommagetrennt)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="z. B. Cafe Racer, Scrambler, Bobber" className={inputCls} />
              </div>
            </div>

            {/* Social */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Social Media</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { label: 'Instagram', key: 'instagram_url', placeholder: '@handle' },
                  { label: 'TikTok',    key: 'tiktok_url',    placeholder: '@handle' },
                  { label: 'Website',   key: 'website_url',   placeholder: 'https://…' },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">{field.label}</label>
                    <input
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mb-4">Status</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, is_verified: !f.is_verified }))}
                  className={`w-10 h-6 rounded-full border-2 transition-all relative cursor-pointer ${
                    form.is_verified ? 'bg-[#06a5a5] border-[#DDDDDD]' : 'bg-transparent border-[#222222]/20'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_verified ? 'left-4' : 'left-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#222222] flex items-center gap-1.5">
                    <BadgeCheck size={14} className={form.is_verified ? 'text-[#717171]' : 'text-[#222222]/20'} />
                    Verifizierter Rider
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
              <Link href="/admin/riders" className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
                Abbrechen
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#058f8f] transition-all disabled:opacity-40"
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
