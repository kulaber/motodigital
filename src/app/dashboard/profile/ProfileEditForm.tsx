'use client'

import NextImage from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Play, Image as ImageIcon, Trash2, CheckCircle, User, MapPin } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'

type MapboxFeature = {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
}

function AddressAutocomplete({
  value,
  onChange,
}: {
  value: { address: string; lat: number | null; lng: number | null }
  onChange: (v: { address: string; lat: number | null; lng: number | null }) => void
}) {
  const [query, setQuery] = useState(value.address)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => { setQuery(value.address) }, [value.address])

  function handleInput(val: string) {
    setQuery(val)
    onChange({ address: val, lat: null, lng: null })
    if (debounce.current) clearTimeout(debounce.current)
    if (!val.trim() || !token) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&language=de&country=de,at,ch&types=address,place&limit=5`
        )
        const json = await res.json()
        setSuggestions(json.features ?? [])
        setOpen(true)
      } catch { setSuggestions([]) }
    }, 280)
  }

  function select(f: MapboxFeature) {
    setQuery(f.place_name)
    setSuggestions([])
    setOpen(false)
    onChange({ address: f.place_name, lat: f.center[1], lng: f.center[0] })
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#222222]/25 pointer-events-none" />
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="z.B. Greifswalder Str. 212, 10405 Berlin"
          className="w-full bg-white border border-[#222222]/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#06a5a5] transition-colors"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-[#222222]/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(f => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={() => select(f)}
                className="w-full text-left px-4 py-2.5 text-sm text-[#222222]/70 hover:bg-[#F7F7F7] transition-colors flex items-start gap-2.5"
              >
                <MapPin size={12} className="text-[#06a5a5] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{f.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.lat && value.lng && (
        <p className="text-[10px] text-[#06a5a5] mt-1 flex items-center gap-1">
          <MapPin size={9} /> {value.lat.toFixed(5)}, {value.lng.toFixed(5)} — Koordinaten gespeichert
        </p>
      )}
    </div>
  )
}

const LEISTUNGEN = [
  'Komplettumbau', 'Teileumbau', 'Elektrik', 'Lackierung', 'Folierung',
  'Pulverbeschichtung', 'Schweißen', 'Fräsen', 'Sandstrahlen', 'Verzinken',
  'Vergaser', 'TÜV-Einzelabnahme', 'TÜV-Untersuchung', 'Motorinstandsetzung',
  'Motorrevision', 'Motordiagnose', 'Sattlerarbeiten',
]

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
  const [leistungen, setLeistungen] = useState<string[]>(
    (profile.tags ?? []).filter(t => LEISTUNGEN.includes(t))
  )
  const [basesInput, setBasesInput] = useState((profile.bases ?? []).join(', '))
  const [addressData, setAddressData] = useState({
    address: profile.address ?? '',
    lat: profile.lat ?? null,
    lng: profile.lng ?? null,
  })
  const [instagram, setInstagram]   = useState(profile.instagram_url ?? '')
  const [tiktok, setTiktok]         = useState(profile.tiktok_url ?? '')
  const [website, setWebsite]       = useState(profile.website_url ?? '')
  const [avatarUrl, setAvatarUrl]   = useState(profile.avatar_url ?? '')

  const computedSlug = profile.slug ?? slugify(fullName)

  // Media
  const [media, setMedia]           = useState<MediaItem[]>(initialMedia)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const avatarInput = useRef<HTMLInputElement>(null)

  function toggleLeistung(item: string) {
    setLeistungen(prev =>
      prev.includes(item) ? prev.filter(l => l !== item) : [...prev, item]
    )
  }

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file, 800, 0.85)
      const ext  = file.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const bases = basesInput.split(',').map(t => t.trim()).filter(Boolean)
    const slug  = profile.slug ?? (fullName ? slugify(fullName) : null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('profiles') as any).update({
      full_name:    fullName || null,
      slug:         slug || null,
      bio:          bio || null,
      bio_long:     bioLong || null,
      avatar_url:   avatarUrl || null,
      tags:         leistungen.length ? leistungen : null,
      bases:        bases.length ? bases : null,
      address:      addressData.address || null,
      lat:          addressData.lat ?? null,
      lng:          addressData.lng ?? null,
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
      // eslint-disable-next-line react-hooks/purity
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
      }).select().maybeSingle()

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

        {/* Avatar */}
        <Field label="Profilbild" className="mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F7F7F7] border border-[#222222]/8 overflow-hidden flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <NextImage src={avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
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
        </Field>

        {/* Name */}
        <Field label="Name" className="mb-4">
          <input value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Dein Name oder Studio-Name"
            className={input} />
        </Field>

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

        {/* Leistungen checkboxes */}
        <Field label="Leistungen" className="mb-4">
          <div className="flex flex-wrap gap-2 mt-1">
            {LEISTUNGEN.map(item => {
              const checked = leistungen.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleLeistung(item)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    checked
                      ? 'bg-[#06a5a5] border-[#06a5a5] text-white'
                      : 'bg-white border-[#222222]/12 text-[#222222]/50 hover:border-[#222222]/25 hover:text-[#222222]'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-[#222222]/25 mt-2">
            {leistungen.length > 0
              ? `${leistungen.length} ausgewählt`
              : 'Wähle die Leistungen, die du anbietest'}
          </p>
        </Field>

        <Field label="Bevorzugte Basis-Bikes für Umbauten" className="mb-4">
          <input value={basesInput} onChange={e => setBasesInput(e.target.value)}
            placeholder="z.B. Honda CB750, Yamaha SR500, BMW R90"
            className={input} />
          <p className="text-[10px] text-[#222222]/25 mt-1">Kommagetrennt · Motorrad-Modelle, auf denen du am häufigsten aufbaust</p>
        </Field>

        <Field label="Vollständige Anschrift" className="mb-4">
          <AddressAutocomplete value={addressData} onChange={setAddressData} />
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
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <NextImage src={item.url} alt={item.title ?? ''} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
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
