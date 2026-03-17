'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Play, Image as ImageIcon, Trash2, CheckCircle } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'

type Profile = {
  id: string
  full_name: string | null
  slug: string | null
  bio: string | null
  bio_long: string | null
  city: string | null
  specialty: string | null
  since_year: number | null
  tags: string[] | null
  bases: string[] | null
  address: string | null
  lat: number | null
  lng: number | null
  instagram_url: string | null
  tiktok_url: string | null
  website_url: string | null
  avatar_url: string | null
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

type MediaItem = {
  id: string
  url: string
  type: 'image' | 'video'
  title: string | null
  position: number
}

type Props = {
  profile: Profile
  media: MediaItem[]
}

export default function ProfileEditForm({ profile, media: initialMedia }: Props) {
  const supabase = createClient()

  // Profile fields
  const [fullName, setFullName]     = useState(profile.full_name ?? '')
  const [bio, setBio]               = useState(profile.bio ?? '')
  const [bioLong, setBioLong]       = useState(profile.bio_long ?? '')
  const [city, setCity]             = useState(profile.city ?? '')
  const [specialty, setSpecialty]   = useState(profile.specialty ?? '')
  const [sinceYear, setSinceYear]   = useState(profile.since_year?.toString() ?? '')
  const [tagsInput, setTagsInput]   = useState((profile.tags ?? []).join(', '))
  const [basesInput, setBasesInput] = useState((profile.bases ?? []).join(', '))
  const [address, setAddress]       = useState(profile.address ?? '')
  const [instagram, setInstagram]   = useState(profile.instagram_url ?? '')
  const [tiktok, setTiktok]         = useState(profile.tiktok_url ?? '')
  const [website, setWebsite]       = useState(profile.website_url ?? '')

  const computedSlug = profile.slug ?? slugify(fullName)

  // Media
  const [media, setMedia]           = useState<MediaItem[]>(initialMedia)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const tags  = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const bases = basesInput.split(',').map(t => t.trim()).filter(Boolean)
    const slug  = profile.slug ?? (fullName ? slugify(fullName) : null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('profiles') as any).update({
      full_name:    fullName || null,
      slug:         slug || null,
      bio:          bio || null,
      bio_long:     bioLong || null,
      city:         city || null,
      specialty:    specialty || null,
      since_year:   sinceYear ? parseInt(sinceYear) : null,
      tags:         tags.length ? tags : null,
      bases:        bases.length ? bases : null,
      address:      address || null,
      instagram_url: instagram || null,
      tiktok_url:    tiktok || null,
      website_url:   website || null,
    }).eq('id', profile.id)

    if (err) setError(err.message)
    else setSaved(true)
    setSaving(false)
  }

  async function handleMediaUpload(files: FileList | null, type: 'image' | 'video') {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    for (const rawFile of Array.from(files)) {
      const file = type === 'image' ? await compressImage(rawFile) : rawFile
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/${Date.now()}.${ext}`

      const { data: upload, error: uploadErr } = await supabase.storage
        .from('builder-media')
        .upload(path, file, { upsert: false })

      if (uploadErr) { setError(uploadErr.message); continue }

      const { data: { publicUrl } } = supabase.storage
        .from('builder-media')
        .getPublicUrl(upload.path)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error: insertErr } = await (supabase.from('builder_media') as any).insert({
        builder_id: profile.id,
        url:        publicUrl,
        type,
        title:      null,
        position:   media.length,
      }).select().single()

      if (insertErr) { setError(insertErr.message); continue }
      setMedia(prev => [...prev, row as MediaItem])
    }

    setUploading(false)
  }

  async function handleDeleteMedia(item: MediaItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('builder_media') as any).delete().eq('id', item.id)
    setMedia(prev => prev.filter(m => m.id !== item.id))
  }

  async function handleUpdateTitle(id: string, title: string) {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, title } : m))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('builder_media') as any).update({ title }).eq('id', id)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── PROFILE FORM ── */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Profil-Informationen</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Name">
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Dein Name oder Studio-Name"
              className={input} />
          </Field>
          <Field label="Stadt">
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder="z.B. Berlin"
              className={input} />
          </Field>
          <Field label="Spezialisierung">
            <input value={specialty} onChange={e => setSpecialty(e.target.value)}
              placeholder="z.B. Cafe Racer · Scrambler"
              className={input} />
          </Field>
          <Field label="Dabei seit (Jahr)">
            <input value={sinceYear} onChange={e => setSinceYear(e.target.value)}
              placeholder="z.B. 2019" type="number" min="1980" max="2030"
              className={input} />
          </Field>
        </div>

        <Field label="Profil-URL (slug)" className="mb-4">
          <div className={`${input} text-[#222222]/40 cursor-default`}>
            motodigital.vercel.app/custom-werkstatt/<span className="text-[#717171]">{computedSlug || '…'}</span>
          </div>
          <p className="text-[10px] text-[#222222]/25 mt-1">Wird automatisch aus deinem Namen generiert</p>
        </Field>

        <Field label="Kurz-Bio" className="mb-4">
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Beschreibe dich und deine Arbeit (1–2 Sätze)..."
            rows={2}
            className={`${input} resize-none`} />
        </Field>

        <Field label="Ausführliche Bio" className="mb-4">
          <textarea value={bioLong} onChange={e => setBioLong(e.target.value)}
            placeholder="Erzähle deine Geschichte — Hintergrund, Philosophie, was dich antreibt..."
            rows={5}
            className={`${input} resize-none`} />
        </Field>

        <Field label="Tags (kommagetrennt)" className="mb-4">
          <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
            placeholder="z.B. Cafe Racer, Scrambler, Restaurierung"
            className={input} />
          <p className="text-[10px] text-[#222222]/25 mt-1">Werden auf deinem Profil als Badges angezeigt</p>
        </Field>

        <Field label="Basis-Bikes (kommagetrennt)" className="mb-4">
          <input value={basesInput} onChange={e => setBasesInput(e.target.value)}
            placeholder="z.B. Honda CB750, Yamaha SR500, BMW R90"
            className={input} />
          <p className="text-[10px] text-[#222222]/25 mt-1">Motorrad-Modelle, auf denen du am häufigsten aufbaust</p>
        </Field>

        <Field label="Adresse" className="mb-4">
          <input value={address} onChange={e => setAddress(e.target.value)}
            placeholder="z.B. Greifswalder Str. 212, 10405 Berlin"
            className={input} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Field label="Instagram">
            <input value={instagram} onChange={e => setInstagram(e.target.value)}
              placeholder="@dein_handle"
              className={input} />
          </Field>
          <Field label="TikTok">
            <input value={tiktok} onChange={e => setTiktok(e.target.value)}
              placeholder="@dein_handle"
              className={input} />
          </Field>
          <Field label="Website">
            <input value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="deine-seite.de"
              className={input} />
          </Field>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2 mb-4">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="bg-[#06a5a5] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#058f8f] disabled:opacity-50 transition-all">
            {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle size={13} /> Gespeichert
            </span>
          )}
        </div>
      </form>

      {/* ── MEDIA ── */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#222222]">Fotos & Videos</h2>
            <p className="text-xs text-[#222222]/35 mt-0.5">Werden auf deinem öffentlichen Profil angezeigt</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInput} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleMediaUpload(e.target.files, 'image')} />
            <input ref={videoInput} type="file" accept="video/*" className="hidden"
              onChange={e => handleMediaUpload(e.target.files, 'video')} />
            <button type="button" onClick={() => videoInput.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-[#222222]/50 border border-[#222222]/10 px-3 py-2 rounded-full hover:border-[#222222]/25 hover:text-[#222222] transition-all disabled:opacity-40">
              <Play size={12} /> Video
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs bg-[#222222]/10 border border-[#DDDDDD]/25 text-[#717171] px-3 py-2 rounded-full hover:bg-[#222222]/20 transition-all disabled:opacity-40">
              <Upload size={12} /> {uploading ? 'Lädt...' : 'Fotos hochladen'}
            </button>
          </div>
        </div>

        {media.length === 0 ? (
          <div
            className="border-2 border-dashed border-[#222222]/8 rounded-xl p-10 text-center cursor-pointer hover:border-[#DDDDDD]/30 transition-colors"
            onClick={() => fileInput.current?.click()}
          >
            <ImageIcon size={28} className="text-[#222222]/15 mx-auto mb-3" />
            <p className="text-sm text-[#222222]/30">Fotos oder Videos hinzufügen</p>
            <p className="text-xs text-[#222222]/15 mt-1">JPG, PNG, MP4 · max. 50 MB</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {media.map(item => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden bg-white border border-[#222222]/6">
                {item.type === 'video' ? (
                  <div className="relative aspect-[4/3]">
                    <video src={item.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                      <Play size={22} className="text-[#222222]/70" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.url} alt={item.title ?? ''} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button
                    onClick={() => handleDeleteMedia(item)}
                    className="self-end w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                  <input
                    defaultValue={item.title ?? ''}
                    onBlur={e => handleUpdateTitle(item.id, e.target.value)}
                    placeholder="Titel..."
                    onClick={e => e.stopPropagation()}
                    className="w-full text-xs bg-white/80 border border-[#222222]/15 rounded-lg px-2 py-1 text-[#222222] placeholder:text-[#222222]/30 outline-none"
                  />
                </div>
                {item.type === 'video' && (
                  <span className="absolute top-2 left-2 bg-[#222222]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Video
                  </span>
                )}
              </div>
            ))}
            {/* Add more button */}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-[#222222]/8 flex flex-col items-center justify-center gap-2 text-[#222222]/20 hover:border-[#DDDDDD]/30 hover:text-[#717171]/40 transition-colors"
            >
              <Upload size={18} />
              <span className="text-xs">Hinzufügen</span>
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

// Helper components
const input = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors'

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  )
}
