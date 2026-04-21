'use client'

import { useState, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { ArrowLeft, Upload, X, Loader2, Trash2, ExternalLink, Plus, ArrowUp, ArrowDown, Play } from 'lucide-react'
import type { Event } from '@/lib/data/events'
import { formatEventDate, youtubeId } from '@/lib/data/events'
import { saveEvent, uploadEventImage } from './actions'
import { compressImage } from '@/lib/utils/compressImage'
import DatePicker from '@/components/ui/DatePicker'
import MapboxAddressInput from '@/components/ui/MapboxAddressInput'

const inputCls = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors'
const labelCls = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5'

function pickI18n(map: Record<string, string> | null | undefined, locale: string, fallback: string): string {
  if (map && typeof map[locale] === 'string') return map[locale]
  return fallback
}

export default function EventEditor({ initialEvent }: { initialEvent?: Event }) {
  const isNew = !initialEvent

  // Active locale tab for text fields (DE/EN)
  const [activeLocale, setActiveLocale] = useState<'de' | 'en'>('de')

  // DE (mirrors the legacy single-locale columns)
  const [nameDe, setNameDe]               = useState(pickI18n(initialEvent?.name_i18n, 'de', initialEvent?.name ?? ''))
  const [descriptionDe, setDescriptionDe] = useState(pickI18n(initialEvent?.description_i18n, 'de', initialEvent?.description ?? ''))
  const [locationDe, setLocationDe]       = useState(pickI18n(initialEvent?.location_i18n, 'de', initialEvent?.location ?? ''))
  // EN
  const [nameEn, setNameEn]               = useState(pickI18n(initialEvent?.name_i18n, 'en', ''))
  const [descriptionEn, setDescriptionEn] = useState(pickI18n(initialEvent?.description_i18n, 'en', ''))
  const [locationEn, setLocationEn]       = useState(pickI18n(initialEvent?.location_i18n, 'en', ''))

  const [dateStart, setDateStart]     = useState(initialEvent?.date_start ?? '')
  const [dateEnd, setDateEnd]         = useState(initialEvent?.date_end ?? '')
  const [tags, setTags]               = useState(initialEvent?.tags.join(', ') ?? '')
  const [url, setUrl]                 = useState(initialEvent?.url ?? '')
  const [image, setImage]             = useState(initialEvent?.image ?? '')
  const [galleryImages, setGalleryImages] = useState<string[]>(initialEvent?.gallery_images ?? [])
  const [videos, setVideos]           = useState<string[]>(initialEvent?.videos ?? [])
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [videoError, setVideoError]   = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Active per-locale getters/setters
  const name        = activeLocale === 'de' ? nameDe : nameEn
  const setName     = activeLocale === 'de' ? setNameDe : setNameEn
  const description = activeLocale === 'de' ? descriptionDe : descriptionEn
  const setDescription = activeLocale === 'de' ? setDescriptionDe : setDescriptionEn
  const location    = activeLocale === 'de' ? locationDe : locationEn
  const setLocation = activeLocale === 'de' ? setLocationDe : setLocationEn

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file, 1600, 0.85)
      const fd = new FormData()
      fd.append('file', compressed)
      const result = await uploadEventImage(fd)
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        setImage(result.url)
      }
    } catch {
      setError('Bild-Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (files: FileList) => {
    setGalleryUploading(true)
    setError(null)
    const uploaded: string[] = []
    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file, 1600, 0.85)
        const fd = new FormData()
        fd.append('file', compressed)
        const result = await uploadEventImage(fd)
        if (result.error) {
          setError(result.error)
          break
        }
        if (result.url) uploaded.push(result.url)
      }
      if (uploaded.length > 0) {
        setGalleryImages(prev => [...prev, ...uploaded])
      }
    } catch {
      setError('Galerie-Upload fehlgeschlagen')
    } finally {
      setGalleryUploading(false)
    }
  }

  const removeGalleryImage = (idx: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx))
  }

  const moveGalleryImage = (idx: number, dir: -1 | 1) => {
    setGalleryImages(prev => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const addVideo = () => {
    const trimmed = newVideoUrl.trim()
    if (!trimmed) return
    if (!youtubeId(trimmed)) {
      setVideoError('Ungültige YouTube-URL')
      return
    }
    if (videos.includes(trimmed)) {
      setVideoError('Video bereits hinzugefügt')
      return
    }
    setVideos(prev => [...prev, trimmed])
    setNewVideoUrl('')
    setVideoError(null)
  }

  const removeVideo = (idx: number) => {
    setVideos(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (!nameDe.trim()) {
      setError('Name (DE) ist erforderlich')
      setActiveLocale('de')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      if (initialEvent?.id) fd.append('id', initialEvent.id)
      // Legacy fields mirror the DE values so non-migrated readers still work.
      fd.append('name', nameDe)
      fd.append('slug', initialEvent?.slug ?? '')
      fd.append('date_start', dateStart)
      fd.append('date_end', dateEnd)
      fd.append('location', locationDe)
      fd.append('description', descriptionDe)
      fd.append('tags', tags)
      fd.append('url', url)
      fd.append('image', image)
      fd.append('gallery_images', galleryImages.join('\n'))
      fd.append('videos', videos.join('\n'))
      // EN values go into _i18n JSONB columns via the server action.
      fd.append('name_en', nameEn)
      fd.append('description_en', descriptionEn)
      fd.append('location_en', locationEn)
      const result = await saveEvent(fd)
      if (result?.error) {
        setError(result.error)
        setSaving(false)
      }
    } catch {
      setSaving(false)
    }
  }

  const publishLabel = isNew ? 'Veröffentlichen' : 'Änderungen speichern'

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/15 border-b border-red-500/25 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-red-500 font-semibold">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 pb-16 lg:px-8 ${error ? 'pt-20' : 'pt-8'}`}>

        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            <ArrowLeft size={13} /> Events
          </Link>
          <div className="flex items-center gap-3">
            {!isNew && initialEvent?.slug && (
              <a href={`/events/${initialEvent.slug}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] border border-[#222222]/10 hover:border-[#222222]/25 px-3 py-1.5 rounded-full transition-all">
                <ExternalLink size={11} /> Vorschau
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Speichern…' : publishLabel}
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#222222] mb-8">
          {isNew ? 'Neues Event' : 'Event bearbeiten'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          <div className="flex flex-col gap-5">

            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30">Event-Details</p>
                {/* Locale tabs */}
                <div className="flex items-center gap-1 rounded-full bg-[#F0F0F0] p-1 text-[11px] font-semibold">
                  {(['de', 'en'] as const).map((loc) => {
                    const hasContent = loc === 'de' ? !!nameDe.trim() : !!nameEn.trim()
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setActiveLocale(loc)}
                        className={`relative px-3 py-1 rounded-full transition-colors ${
                          activeLocale === loc
                            ? 'bg-white text-[#222222] shadow-sm'
                            : 'text-[#222222]/50 hover:text-[#222222]'
                        }`}
                      >
                        {loc === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
                        {!hasContent && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Name ({activeLocale.toUpperCase()})</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputCls + ' text-base font-semibold'}
                    placeholder={activeLocale === 'de' ? 'Glemseck 101' : 'Glemseck 101'}
                  />
                </div>

                <div>
                  <label className={labelCls}>{activeLocale === 'de' ? 'Beschreibung (DE)' : 'Description (EN)'}</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={inputCls + ' resize-y'}
                    placeholder={activeLocale === 'de' ? 'Beschreibung des Events …' : 'Event description …'}
                  />
                </div>

                <p className="text-[10px] text-[#222222]/30">
                  Pflichtfeld: Name (DE). EN wird im deutschen Fallback angezeigt, bis du sie übersetzt.
                </p>
              </div>
            </div>

            {/* Image upload */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-5">Bild</p>

              {image ? (
                <div className="relative rounded-xl overflow-hidden">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={image}
                      alt="Event-Bild"
                      fill
                      className="object-cover"
                      sizes="(max-width: 900px) 100vw, 600px"
                    />
                  </div>
                  <button
                    onClick={() => setImage('')}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    aria-label="Bild entfernen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-[#222222]/10 hover:border-[#06a5a5]/40 rounded-xl transition-colors cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 size={24} className="text-[#06a5a5] animate-spin" />
                  ) : (
                    <Upload size={24} className="text-[#222222]/20" />
                  )}
                  <span className="text-sm text-[#222222]/30">
                    {uploading ? 'Wird hochgeladen…' : 'Bild hochladen'}
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Gallery */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30">
                  Galerie {galleryImages.length > 0 && (
                    <span className="text-[#222222]/50 normal-case tracking-normal font-medium">({galleryImages.length})</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={galleryUploading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06a5a5] hover:text-[#058f8f] border border-[#06a5a5]/20 hover:border-[#06a5a5]/40 px-3 py-1.5 rounded-full transition-all disabled:opacity-60"
                >
                  {galleryUploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  {galleryUploading ? 'Wird hochgeladen…' : 'Fotos hinzufügen'}
                </button>
              </div>

              {galleryImages.length === 0 ? (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={galleryUploading}
                  className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-[#222222]/10 hover:border-[#06a5a5]/40 rounded-xl transition-colors cursor-pointer"
                >
                  <Upload size={22} className="text-[#222222]/20" />
                  <span className="text-sm text-[#222222]/30">Mehrere Fotos auf einmal auswählen</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {galleryImages.map((img, i) => (
                    <div key={img + i} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-[#F0F0F0]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Galerie ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-200" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(i, -1)}
                          disabled={i === 0}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-[#222] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Nach vorne"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(i, 1)}
                          disabled={i === galleryImages.length - 1}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-[#222] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Nach hinten"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                          aria-label="Entfernen"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-full tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={e => {
                  const files = e.target.files
                  if (files && files.length > 0) handleGalleryUpload(files)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Videos */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30">
                  Videos {videos.length > 0 && (
                    <span className="text-[#222222]/50 normal-case tracking-normal font-medium">({videos.length})</span>
                  )}
                </p>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={e => { setNewVideoUrl(e.target.value); setVideoError(null) }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideo() } }}
                  className={inputCls + ' flex-1'}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
                <button
                  type="button"
                  onClick={addVideo}
                  disabled={!newVideoUrl.trim()}
                  className="inline-flex items-center gap-1.5 bg-[#06a5a5] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#058f8f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} /> Hinzufügen
                </button>
              </div>
              {videoError && <p className="text-xs text-red-500 mb-3">{videoError}</p>}
              <p className="text-[10px] text-[#222222]/30 mb-4">YouTube-URL einfügen und Enter drücken. Unterstützt watch?v=, youtu.be, /shorts/, /embed/.</p>

              {videos.length > 0 && (
                <div className="flex flex-col gap-2">
                  {videos.map((url, i) => {
                    const id = youtubeId(url)
                    return (
                      <div key={url + i} className="flex items-center gap-3 p-2 rounded-xl border border-[#222222]/8 bg-[#FAFAFA]">
                        <div className="relative w-20 h-12 flex-shrink-0 rounded-md overflow-hidden bg-black">
                          {id && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={14} className="text-white drop-shadow-md" fill="white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-[#222222]/70 truncate">{url}</p>
                          <p className="text-[10px] text-[#222222]/30">Video {i + 1}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-[#222222]/40 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                          aria-label="Video entfernen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-8">

            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-4">Zeitraum</p>

              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Startdatum</label>
                  <DatePicker
                    value={dateStart}
                    onChange={(d) => {
                      setDateStart(d)
                      if (!dateEnd || d > dateEnd) setDateEnd(d)
                    }}
                    placeholder="Startdatum wählen"
                  />
                </div>

                <div>
                  <label className={labelCls}>Enddatum</label>
                  <DatePicker
                    value={dateEnd}
                    onChange={setDateEnd}
                    min={dateStart}
                    placeholder="Enddatum wählen"
                  />
                </div>

                {dateStart && (
                  <p className="text-xs text-[#06a5a5] font-medium mt-1">
                    {formatEventDate({ date_start: dateStart, date_end: dateEnd || dateStart })}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-4">Zusatzinfo</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Ort ({activeLocale.toUpperCase()})</label>
                  <MapboxAddressInput
                    initialValue={location}
                    onSelect={(place) => setLocation(place?.address ?? '')}
                    placeholder="Leonberg, Deutschland"
                    types="place,locality,region"
                    key={activeLocale}
                  />
                </div>

                <div>
                  <label className={labelCls}>Tags (kommagetrennt)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className={inputCls}
                    placeholder="Sprint, Custom, Classic"
                  />
                  {tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>URL (optional)</label>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className={inputCls}
                    placeholder="https://glemseck.de"
                  />
                  <p className="text-[10px] text-[#222222]/20 mt-1">Offizielle Event-Website</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3.5 rounded-full hover:bg-[#058f8f] transition-all disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Speichern…' : publishLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
