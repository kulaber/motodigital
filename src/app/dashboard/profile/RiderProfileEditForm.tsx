'use client'

import { useState, useRef } from 'react'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, CheckCircle, User } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'

type Profile = {
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
}

type Props = { profile: Profile }

export default function RiderProfileEditForm({ profile }: Props) {
  const supabase = createClient()

  const [fullName,  setFullName]  = useState(profile.full_name  ?? '')
  const [username,  setUsername]  = useState(profile.username   ?? '')
  const [bio,       setBio]       = useState(profile.bio        ?? '')
  const [city,      setCity]      = useState(profile.city       ?? '')
  const [instagram, setInstagram] = useState(profile.instagram_url ?? '')
  const [tiktok,    setTiktok]    = useState(profile.tiktok_url    ?? '')
  const [website,   setWebsite]   = useState(profile.website_url   ?? '')
  const [tagsInput, setTagsInput] = useState((profile.tags ?? []).join(', '))
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')

  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const avatarInput = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file, 800, 0.85)
      const ext  = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('builder-media')
        .upload(path, compressed, { upsert: true })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('builder-media')
        .getPublicUrl(path)

      setAvatarUrl(publicUrl)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('profiles') as any)
      .update({
        full_name:    fullName    || null,
        username:     username    || null,
        bio:          bio         || null,
        city:         city        || null,
        avatar_url:   avatarUrl   || null,
        instagram_url: instagram  || null,
        tiktok_url:   tiktok      || null,
        website_url:  website     || null,
        tags,
      })
      .eq('id', profile.id)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 pb-28">

      {/* Avatar */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-widest">Profilbild</label>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#F7F7F7] border border-[#222222]/8 overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <NextImage src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-[#222222]/20" />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-[#222222]/12 text-[#222222]/60 hover:text-[#222222] hover:border-[#222222]/25 transition-all disabled:opacity-40"
            >
              <Upload size={12} />
              {uploading ? 'Wird hochgeladen…' : 'Foto hochladen'}
            </button>
            <p className="text-[11px] text-[#222222]/25 mt-1.5">JPG oder PNG, max. 5 MB</p>
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

      {/* Name & Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-widest">Name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Dein Name"
            className="border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#222222]/25 focus:outline-none focus:border-[#06a5a5] transition-colors bg-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-widest">Username</label>
          <div className="flex items-center border border-[#222222]/10 rounded-xl overflow-hidden focus-within:border-[#06a5a5] transition-colors bg-white">
            <span className="px-3 text-sm text-[#222222]/30 select-none">@</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="dein_username"
              className="flex-1 py-3 pr-4 text-sm text-[#222222] placeholder-[#222222]/25 focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-widest">Über dich</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={3}
          placeholder="Erzähl kurz von dir und deiner Leidenschaft für Custom Bikes…"
          className="border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#222222]/25 focus:outline-none focus:border-[#06a5a5] transition-colors bg-white resize-none"
        />
        <p className="text-[11px] text-[#222222]/25">{bio.length} / 300 Zeichen</p>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-widest">Interessen & Stile</label>
        <input
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="z. B. Cafe Racer, Scrambler, Bobber, Enduro"
          className="border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#222222]/25 focus:outline-none focus:border-[#06a5a5] transition-colors bg-white"
        />
        <p className="text-[11px] text-[#222222]/25">Kommagetrennt eingeben</p>
        {tagsInput && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="text-[11px] font-semibold bg-[#06a5a5]/8 text-[#06a5a5] px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Social */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-widest">Social Media</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Instagram', value: instagram, onChange: setInstagram, placeholder: '@dein_account' },
            { label: 'TikTok',    value: tiktok,    onChange: setTiktok,    placeholder: '@dein_account' },
            { label: 'Website',   value: website,   onChange: setWebsite,   placeholder: 'https://…' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[#222222]/35 font-medium">{f.label}</span>
              <input
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                className="border border-[#222222]/10 rounded-xl px-3 py-2.5 text-sm text-[#222222] placeholder-[#222222]/25 focus:outline-none focus:border-[#06a5a5] transition-colors bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Floating Save */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2.5 bg-[#06a5a5] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-2xl hover:bg-[#058f8f] disabled:opacity-50 transition-all"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Wird gespeichert…
            </>
          ) : saved ? (
            <>
              <CheckCircle size={14} className="text-[#06a5a5]" />
              Gespeichert
            </>
          ) : (
            'Änderungen speichern'
          )}
        </button>
      </div>

    </form>
  )
}
