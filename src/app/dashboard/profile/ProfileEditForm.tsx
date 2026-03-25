'use client'

import NextImage from 'next/image'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Image as ImageIcon, Trash2, MapPin } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'
import { useToast, ToastContainer } from '@/components/ui/Toast'

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

/* ── BaseBike Autocomplete ──────────────────────────────────────── */
type SuggestionItem =
  | { type: 'make'; label: string }
  | { type: 'model'; make: string; model: string; label: string }

function BaseBikeAutocomplete({
  value,
  onChange,
}: {
  value: string[]
  onChange: (v: string[]) => void
}) {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleInput(val: string) {
    setQuery(val)
    if (debounce.current) clearTimeout(debounce.current)
    if (!val.trim()) { setSuggestions([]); setOpen(false); return }
    debounce.current = setTimeout(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('base_bikes') as any)
        .select('make')
        .ilike('make', `%${val}%`)
        .order('make')
        .limit(20)

      const rows: { make: string }[] = data ?? []
      const seenMakes = new Set<string>()
      const makeItems: SuggestionItem[] = []
      for (const r of rows) {
        if (!seenMakes.has(r.make)) {
          seenMakes.add(r.make)
          makeItems.push({ type: 'make', label: r.make })
        }
      }

      setSuggestions(makeItems)
      setOpen(true)
    }, 250)
  }

  function select(label: string) {
    if (!value.includes(label)) onChange([...value, label])
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  function remove(item: string) {
    onChange(value.filter(v => v !== item))
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {value.map(v => (
            <span key={v} className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#F7F7F7] border border-[#222222]/10 px-3 py-1.5 rounded-full text-[#222222]/70">
              {v}
              <button type="button" onClick={() => remove(v)} className="text-[#222222]/30 hover:text-[#222222] leading-none text-base">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
          placeholder="Marke suchen, z. B. Honda, BMW, Yamaha…"
          className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-[#222222]/10 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => select(s.label)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F7F7F7] transition-colors flex items-center gap-2"
                >
                  <span className="font-medium text-[#222222]">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[10px] text-[#222222]/25 mt-1">Mehrere Bikes möglich</p>
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
  const [bioLong, setBioLong]       = useState(profile.bio_long ?? '')
  const [leistungen, setLeistungen] = useState<string[]>(
    (profile.tags ?? []).filter(t => LEISTUNGEN.includes(t))
  )
  const [bases, setBases] = useState<string[]>(profile.bases ?? [])
  const [addressData, setAddressData] = useState({
    address: profile.address ?? '',
    lat: profile.lat ?? null,
    lng: profile.lng ?? null,
  })
  const [instagram, setInstagram]   = useState(profile.instagram_url ?? '')
  const [tiktok, setTiktok]         = useState(profile.tiktok_url ?? '')
  const [website, setWebsite]       = useState(profile.website_url ?? '')
  const [avatarUrl, setAvatarUrl]   = useState(profile.avatar_url ?? '')
  const [avatarCacheBust, setAvatarCacheBust] = useState('')

  const computedSlug = profile.slug ?? slugify(fullName)

  // Media
  const [media, setMedia]           = useState<MediaItem[]>(initialMedia)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)

  const fileInput    = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const { toasts, success: toastSuccess, error: toastError } = useToast()
  const avatarInput  = useRef<HTMLInputElement>(null)

  const coverImage   = media.find(m => m.title === 'cover') ?? null
  const galleryImages = media.filter(m => m.title !== 'cover')

  function toggleLeistung(item: string) {
    setLeistungen(prev =>
      prev.includes(item) ? prev.filter(l => l !== item) : [...prev, item]
    )
  }

  async function handleAvatarUpload(file: File) {
    setUploading(true)
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
      setAvatarCacheBust(`?t=${Date.now()}`)
      // Sofort in DB speichern & Header aktualisieren
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any).update({ avatar_url: publicUrl }).eq('id', profile.id)
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: { avatarUrl: publicUrl } }))
    } catch (e: unknown) {
      toastError(e instanceof Error ? e.message : 'Logo-Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const slug  = profile.slug ?? (fullName ? slugify(fullName) : null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('profiles') as any).update({
      full_name:    fullName || null,
      slug:         slug || null,
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

    if (err) {
      toastError(err.message)
    } else {
      toastSuccess('Profil gespeichert')
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { avatarUrl, fullName: fullName || null },
      }))
    }
    setSaving(false)
  }

  async function handleCoverUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    // Replace existing cover image if present
    const existingCover = media.find(m => m.title === 'cover')
    if (existingCover) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('builder_media') as any).delete().eq('id', existingCover.id)
      setMedia(prev => prev.filter(m => m.id !== existingCover.id))
    }

    const rawFile = files[0]
    const file = await compressImage(rawFile, 1600)
    const ext = rawFile.name.split('.').pop()
    const path = `${profile.id}/${Date.now()}.${ext}`

    const { data: upload, error: uploadErr } = await supabase.storage
      .from('builder-media')
      .upload(path, file, { upsert: false })

    if (uploadErr) { toastError(uploadErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('builder-media')
      .getPublicUrl(upload.path)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error: insertErr } = await (supabase.from('builder_media') as any).insert({
      builder_id: profile.id,
      url:        publicUrl,
      type:       'image',
      title:      'cover',
      position:   0,
    }).select().maybeSingle()

    if (insertErr) { toastError(insertErr.message); setUploading(false); return }
    setMedia(prev => [...prev.filter(m => m.title !== 'cover'), row as MediaItem])
    setUploading(false)
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    const currentGalleryCount = media.filter(m => m.title !== 'cover').length

    for (const rawFile of Array.from(files)) {
      const file = await compressImage(rawFile, 1400)
      const ext  = rawFile.name.split('.').pop()
      const path = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: upload, error: uploadErr } = await supabase.storage
        .from('builder-media')
        .upload(path, file, { upsert: false })

      if (uploadErr) { toastError(uploadErr.message); continue }

      const { data: { publicUrl } } = supabase.storage
        .from('builder-media')
        .getPublicUrl(upload.path)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error: insertErr } = await (supabase.from('builder_media') as any).insert({
        builder_id: profile.id,
        url:        publicUrl,
        type:       'image',
        title:      null,
        position:   currentGalleryCount,
      }).select().maybeSingle()

      if (insertErr) { toastError(insertErr.message); continue }
      setMedia(prev => [...prev, row as MediaItem])
    }

    setUploading(false)
  }

  async function handleDeleteMedia(item: MediaItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('builder_media') as any).delete().eq('id', item.id)
    setMedia(prev => prev.filter(m => m.id !== item.id))
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <ToastContainer toasts={toasts} />

      {/* ── PROFILE FORM ── */}
      <form id="profile-form" onSubmit={handleSaveProfile} className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Profil-Informationen</h2>

        {/* Logo */}
        <Field label="Logo" className="mb-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#06a5a5]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${avatarUrl}${avatarCacheBust}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="36" height="36">
                  <path fill="white" d="M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z" />
                </svg>
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
                {uploading ? 'Wird hochgeladen…' : 'Logo hochladen'}
              </button>
              <p className="text-[10px] text-[#222222]/25 mt-1">JPG, PNG oder SVG, max. 5 MB</p>
            </div>
            <input
              ref={avatarInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }}
            />
          </div>
        </Field>

        {/* Titelbild */}
        <Field label="Titelbild" className="mb-5">
          <input ref={fileInput} type="file" accept="image/*" className="hidden"
            onChange={e => { handleCoverUpload(e.target.files); e.target.value = '' }} />
          {!coverImage ? (
            <div
              className="border-2 border-dashed border-[#222222]/8 rounded-xl p-8 text-center cursor-pointer hover:border-[#DDDDDD]/30 transition-colors"
              onClick={() => fileInput.current?.click()}
            >
              <ImageIcon size={24} className="text-[#222222]/15 mx-auto mb-2" />
              <p className="text-sm text-[#222222]/30">Titelbild hinzufügen</p>
              <p className="text-xs text-[#222222]/15 mt-1">JPG, PNG · max. 50 MB</p>
            </div>
          ) : (
            <div className="group relative rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#222222]/6">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <NextImage src={coverImage.url} alt="Titelbild" fill sizes="100vw" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-white text-[#222222] px-4 py-2 rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  <Upload size={12} /> Ersetzen
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMedia(coverImage)}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} /> Entfernen
                </button>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full border-2 border-[#222222]/20 border-t-[#222222]/60 animate-spin" />
                </div>
              )}
            </div>
          )}
          <p className="text-[10px] text-[#222222]/25 mt-1">Wird als breites Titelbild auf deinem Profil angezeigt</p>
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

        <Field label="Über die Werkstatt" className="mb-4">
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
                      ? 'bg-[#222222] border-[#222222] text-white'
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
          <BaseBikeAutocomplete value={bases} onChange={setBases} />
        </Field>

        <Field label="Vollständige Anschrift" className="mb-4">
          <AddressAutocomplete value={addressData} onChange={setAddressData} />
        </Field>

        <div className="mb-5">
          <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-3">Weiterführende Links</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input value={instagram} onChange={e => setInstagram(e.target.value)}
              placeholder="Instagram @handle"
              className={input} />
            <input value={tiktok} onChange={e => setTiktok(e.target.value)}
              placeholder="TikTok @handle"
              className={input} />
            <input value={website} onChange={e => setWebsite(e.target.value)}
              placeholder="Website"
              className={input} />
          </div>
        </div>

      </form>

      {/* ── GALLERIEBILDER ── */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#222222]">Werkstatt-Insights</h2>
            <p className="text-xs text-[#222222]/35 mt-0.5">Galleriebilder für dein öffentliches Profil</p>
          </div>
          <button type="button" onClick={() => galleryInput.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 text-xs bg-[#222222]/10 border border-[#DDDDDD]/25 text-[#717171] px-3 py-2 rounded-full hover:bg-[#222222]/20 transition-all disabled:opacity-40">
            <Upload size={12} /> {uploading ? 'Lädt...' : 'Bilder hochladen'}
          </button>
        </div>

        <input ref={galleryInput} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { handleGalleryUpload(e.target.files); e.target.value = '' }} />

        {galleryImages.length === 0 ? (
          <div
            className="border-2 border-dashed border-[#222222]/8 rounded-xl p-8 text-center cursor-pointer hover:border-[#DDDDDD]/30 transition-colors"
            onClick={() => galleryInput.current?.click()}
          >
            <ImageIcon size={24} className="text-[#222222]/15 mx-auto mb-2" />
            <p className="text-sm text-[#222222]/30">Bilder hinzufügen</p>
            <p className="text-xs text-[#222222]/15 mt-1">JPG, PNG · max. 50 MB · mehrere möglich</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryImages.map(item => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#222222]/6 aspect-[4/3]">
                <NextImage src={item.url} alt="" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item)}
                    className="w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInput.current?.click()}
              disabled={uploading}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-[#222222]/8 flex flex-col items-center justify-center gap-2 text-[#222222]/20 hover:border-[#DDDDDD]/30 hover:text-[#717171]/40 transition-colors disabled:opacity-40"
            >
              <Upload size={18} />
              <span className="text-xs">Hinzufügen</span>
            </button>
          </div>
        )}
      </div>

      {/* ── FLOATING SAVE BUTTON ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          type="submit"
          form="profile-form"
          disabled={saving}
          className="inline-flex items-center gap-2.5 bg-[#06a5a5] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-2xl hover:bg-[#058f8f] disabled:opacity-50 transition-all"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Wird gespeichert…
            </>
          ) : (
            'Änderungen speichern'
          )}
        </button>
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
