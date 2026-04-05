'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Camera, User, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import MapboxAddressInput from '@/components/ui/MapboxAddressInput'
import { compressImage } from '@/lib/utils/compressImage'
import { useToast, ToastContainer } from '@/components/ui/Toast'

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  city: string | null
  avatar_url: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  riding_style?: string | null
  visited_cities?: string[] | null
  instagram_url: string | null
  tiktok_url: string | null
  website_url: string | null
  tags: string[] | null
}

type CoverImage = {
  id: string
  url: string
  type: string
  title: string | null
  position: number
}

type Props = { profile: Profile; coverImage: CoverImage | null }

const input = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors'

export default function RiderProfileEditForm({ profile, coverImage: initialCover }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const { toasts, success: toastSuccess, error: toastError } = useToast()

  // ── Cover image (saves immediately on upload) ──
  const [cover, setCover] = useState<CoverImage | null>(initialCover)
  const [coverUploading, setCoverUploading] = useState(false)

  async function handleCoverUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setCoverUploading(true)

    // Delete existing cover if present
    if (cover) {
      const match = cover.url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
      if (match) {
        await supabase.storage.from('builder-media').remove([match[1]])
      }
      await (supabase.from('builder_media') as any).delete().eq('id', cover.id)
    }

    const rawFile = files[0]
    const file = await compressImage(rawFile, 1600)
    const ext = rawFile.name.split('.').pop()
    const path = `${profile.id}/${Date.now()}.${ext}`

    const { data: upload, error: uploadErr } = await supabase.storage
      .from('builder-media')
      .upload(path, file, { upsert: false })

    if (uploadErr) { toastError(uploadErr.message); setCoverUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('builder-media')
      .getPublicUrl(upload.path)

    const { data: row, error: insertErr } = await (supabase.from('builder_media') as any).insert({
      builder_id: profile.id,
      url:        publicUrl,
      type:       'image',
      title:      'cover',
      position:   0,
    }).select().maybeSingle()

    if (insertErr) { toastError(insertErr.message); setCoverUploading(false); return }
    setCover(row as CoverImage)
    setCoverUploading(false)
  }

  async function handleCoverDelete() {
    if (!cover) return
    setCoverUploading(true)
    const match = cover.url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    if (match) {
      await supabase.storage.from('builder-media').remove([match[1]])
    }
    await (supabase.from('builder_media') as any).delete().eq('id', cover.id)
    setCover(null)
    setCoverUploading(false)
  }

  // ── Avatar (saves immediately on upload) ──
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarDeleting, setAvatarDeleting] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSaved, setAvatarSaved] = useState(false)

  async function handleAvatarDelete() {
    if (!avatarUrl) return
    setAvatarDeleting(true); setAvatarError(null); setAvatarSaved(false)
    const { data: files } = await supabase.storage.from('avatars').list(profile.id)
    if (files?.length) {
      await supabase.storage.from('avatars').remove(files.map(f => `${profile.id}/${f.name}`))
    }
    await (supabase.from('profiles') as any).update({ avatar_url: null }).eq('id', profile.id)
    setAvatarUrl('')
    setAvatarDeleting(false)
    setAvatarSaved(true)
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { avatarUrl: null } }))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setAvatarError('Maximale Dateigröße: 5 MB'); return }
    setAvatarUploading(true); setAvatarError(null); setAvatarSaved(false)
    const compressed = await compressImage(file, 400, 0.82, 400)
    const ext = compressed.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, compressed, { upsert: true, contentType: compressed.type })
    if (upErr) { setAvatarError(upErr.message); setAvatarUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await (supabase.from('profiles') as any).update({ avatar_url: publicUrl }).eq('id', profile.id)
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
    setAvatarSaved(true)
    setAvatarUploading(false)
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { avatarUrl: `${publicUrl}?t=${Date.now()}` } }))
  }

  // ── All profile fields ──
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [selectedPlace, setSelectedPlace] = useState<{ address: string; lat: number; lng: number; city: string | null } | null>(
    profile.address ? { address: profile.address, lat: profile.lat ?? 0, lng: profile.lng ?? 0, city: profile.city ?? null } : null
  )
  const [visitedCities, setVisitedCities] = useState<string[]>(profile.visited_cities ?? [])
  const [ridingStyle, setRidingStyle] = useState(profile.riding_style ?? '')
  const [instagram, setInstagram] = useState(profile.instagram_url ?? '')
  const [tiktok, setTiktok] = useState(profile.tiktok_url ?? '')
  const [website, setWebsite] = useState(profile.website_url ?? '')
  const [tagsInput, setTagsInput] = useState((profile.tags ?? []).join(', '))
  const [saving, setSaving] = useState(false)

  function removeCity(city: string) {
    setVisitedCities(prev => prev.filter(c => c !== city))
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { toastError('Bitte gib deinen Namen ein'); return }
    setSaving(true)

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

    const { error: err } = await (supabase.from('profiles') as any).update({
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
      address: selectedPlace?.address || null,
      lat: selectedPlace?.lat || null,
      lng: selectedPlace?.lng || null,
      city: selectedPlace?.city || null,
      visited_cities: visitedCities,
      riding_style: ridingStyle || null,
      instagram_url: instagram || null,
      tiktok_url: tiktok || null,
      website_url: website || null,
      tags,
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

  return (
    <div className="flex flex-col gap-5 pb-28">
      <ToastContainer toasts={toasts} />

      {/* ── Titelbild ── */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Titelbild</h2>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { handleCoverUpload(e.target.files); e.target.value = '' }} />
        {!cover ? (
          <div
            className="border-2 border-dashed border-[#222222]/8 rounded-xl p-8 text-center cursor-pointer hover:border-[#DDDDDD]/30 transition-colors"
            onClick={() => coverInputRef.current?.click()}
          >
            <ImageIcon size={24} className="text-[#222222]/15 mx-auto mb-2" />
            <p className="text-sm text-[#222222]/30">Titelbild hinzufügen</p>
            <p className="text-xs text-[#222222]/15 mt-1">JPG, PNG · max. 50 MB</p>
          </div>
        ) : (
          <div className="group relative rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#222222]/6">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image src={cover.url} alt="Titelbild" fill sizes="100vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white text-[#222222] px-4 py-2 rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                <Upload size={12} /> Ersetzen
              </button>
              <button
                type="button"
                onClick={handleCoverDelete}
                disabled={coverUploading}
                className="flex items-center gap-1.5 text-xs font-semibold bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} /> Entfernen
              </button>
            </div>
            {coverUploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="w-4 h-4 rounded-full border-2 border-[#222222]/20 border-t-[#222222]/60 animate-spin" />
              </div>
            )}
          </div>
        )}
        <p className="text-[10px] text-[#222222]/25 mt-1">Wird als breites Titelbild auf deinem Profil angezeigt</p>
      </div>

      {/* ── Profilbild ── */}
      <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#222222] mb-5">Profilbild</h2>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="relative w-20 h-20 rounded-full bg-[#F7F7F7] border border-[#222222]/10 overflow-hidden flex items-center justify-center">
              {avatarUrl
                ? <Image src={avatarUrl} alt="Avatar" fill sizes="80px" className="object-cover" />
                : <User size={28} className="text-[#222222]/20" />
              }
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#222222] rounded-full flex items-center justify-center shadow-md hover:bg-[#444] transition-colors disabled:opacity-50"
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading || avatarDeleting}
                className="text-sm font-semibold text-[#222222] border border-[#222222]/12 px-4 py-2 rounded-full hover:border-[#222222]/30 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? 'Wird hochgeladen…' : avatarUrl ? 'Foto ändern' : 'Foto hochladen'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={avatarDeleting || avatarUploading}
                  className="flex items-center gap-1.5 text-sm text-red-400 border border-red-400/20 px-3 py-2 rounded-full hover:bg-red-50 hover:border-red-400/40 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {avatarDeleting ? 'Wird gelöscht…' : 'Entfernen'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#222222]/30">JPG, PNG oder WebP · max. 5 MB</p>
            {avatarSaved && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={12} /> Gespeichert</span>}
            {avatarError && <p className="text-[11px] text-red-400">{avatarError}</p>}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
      </div>

      {/* ── PROFILE FORM (single form, one save button) ── */}
      <form id="rider-profile-form" onSubmit={handleSaveProfile} className="contents">

        {/* ── Name ── */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-5">Name <span className="text-red-400">*</span></h2>
          <div>
            <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">Vollständiger Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Dein Name" className={input} />
            <p className="text-[10px] text-[#222222]/25 mt-1">Wird auf deinem Profil angezeigt</p>
          </div>
        </div>

        {/* ── Kurze Bio ── */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-5">Kurze Bio</h2>
          <div>
            <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={47}
              rows={2}
              placeholder="Beschreibe dich in ein paar Worten…"
              className={`${input} resize-none`}
            />
            <p className="text-[10px] text-[#222222]/25 mt-1 text-right">{bio.length}/47</p>
          </div>
        </div>

        {/* ── Standort ── */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-1">Standort <span className="text-red-400">*</span></h2>
          <p className="text-xs text-[#222222]/35 mb-5">Gib Deinen Standort ein, damit Du dich mit Nutzern vernetzen kannst.<br />Du kannst auch nur die Stadt hinterlegen, falls du es möchtest.</p>
          <div>
            <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">Adresse</label>
            <MapboxAddressInput
              initialValue={profile.address ?? ''}
              onSelect={place => setSelectedPlace(place)}
              placeholder="Straße, Stadt suchen…"
            />
          </div>
        </div>

        {/* ── Besuchte Städte ── */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-1">Wo warst Du schon Motorrad fahren?</h2>
          <p className="text-xs text-[#222222]/35 mb-5">Füge Städte oder Regionen hinzu, die Du mit dem Motorrad besucht hast. Jeder Ort wird als Badge auf Deinem Profil angezeigt.</p>
          <div className="flex flex-col gap-4">
            <MapboxAddressInput
              initialValue=""
              key={visitedCities.length}
              types="place,locality,region"
              onSelect={place => {
                if (!place) return
                const name = place.city || place.address.split(',')[0].trim()
                if (name && !visitedCities.includes(name)) {
                  setVisitedCities(prev => [...prev, name])
                }
              }}
              placeholder="Stadt oder Region suchen…"
            />
            {visitedCities.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {visitedCities.map(city => (
                  <div key={city} className="relative bg-[#111111] rounded-xl p-3 flex flex-col items-center justify-center aspect-square group">
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white text-xs transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <div className="text-[10px] text-[#2AABAB] tracking-wide mb-1">★ ★ ★ ★ ★</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/pin-logo.svg" alt="MotoDigital" className="w-7 h-7 mb-1.5 opacity-80" />
                    <span className="text-[10px] font-bold text-white text-center leading-tight truncate w-full">{city}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tags, Social ── */}
        <div className="flex flex-col gap-8 bg-white border border-[#222222]/6 rounded-2xl p-5 sm:p-6">

          <div>
            <h2 className="text-sm font-semibold text-[#222222] mb-4">Dein Fahrstil</h2>
            <div className="flex flex-col gap-2">
              {[
                { value: 'cruiser', label: '☀️ Ruhiger Cruiser' },
                { value: 'flott', label: '💨☀️ Flotter Fahrer' },
                { value: 'legende', label: '🏍💨☀️ Lebensmüde Legende' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRidingStyle(ridingStyle === option.value ? '' : option.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    ridingStyle === option.value
                      ? 'border-[#06a5a5] bg-[#06a5a5]/6 text-[#06a5a5]'
                      : 'border-[#222222]/10 text-[#222222]/50 hover:border-[#222222]/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#222222] mb-5">Interessen & Stile</h2>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="z. B. Cafe Racer, Scrambler, Bobber, Enduro"
              className={input}
            />
            <p className="text-[10px] text-[#222222]/25 mt-1">Kommagetrennt eingeben</p>
            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="text-[11px] font-semibold bg-[#06a5a5]/8 text-[#06a5a5] px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#222222] mb-5">Social Media</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Instagram', value: instagram, onChange: setInstagram, placeholder: '@dein_account' },
                { label: 'TikTok', value: tiktok, onChange: setTiktok, placeholder: '@dein_account' },
                { label: 'Website', value: website, onChange: setWebsite, placeholder: 'https://…' },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#222222]/35 font-medium">{f.label}</span>
                  <input
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    placeholder={f.placeholder}
                    className={input}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

      </form>

      {/* ── FLOATING SAVE BUTTON ── */}
      <div className="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          type="submit"
          form="rider-profile-form"
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
