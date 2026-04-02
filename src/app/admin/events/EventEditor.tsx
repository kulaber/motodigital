'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Upload, X, Loader2, Trash2, ExternalLink } from 'lucide-react'
import type { Event } from '@/lib/data/events'
import { formatEventDate } from '@/lib/data/events'
import { saveEvent, uploadEventImage } from './actions'
import { compressImage } from '@/lib/utils/compressImage'
import DatePicker from '@/components/ui/DatePicker'
import MapboxAddressInput from '@/components/ui/MapboxAddressInput'

const inputCls = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors'
const labelCls = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5'

export default function EventEditor({ initialEvent }: { initialEvent?: Event }) {
  const isNew = !initialEvent

  const [name, setName]               = useState(initialEvent?.name ?? '')
  const [dateStart, setDateStart]     = useState(initialEvent?.date_start ?? '')
  const [dateEnd, setDateEnd]         = useState(initialEvent?.date_end ?? '')
  const [location, setLocation]       = useState(initialEvent?.location ?? '')
  const [description, setDescription] = useState(initialEvent?.description ?? '')
  const [tags, setTags]               = useState(initialEvent?.tags.join(', ') ?? '')
  const [url, setUrl]                 = useState(initialEvent?.url ?? '')
  const [image, setImage]             = useState(initialEvent?.image ?? '')
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name ist erforderlich')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      if (initialEvent?.id) fd.append('id', initialEvent.id)
      fd.append('name', name)
      fd.append('slug', initialEvent?.slug ?? '')
      fd.append('date_start', dateStart)
      fd.append('date_end', dateEnd)
      fd.append('location', location)
      fd.append('description', description)
      fd.append('tags', tags)
      fd.append('url', url)
      fd.append('image', image)
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
      {/* Error banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/15 border-b border-red-500/25 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-red-500 font-semibold">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 pb-16 lg:px-8 ${error ? 'pt-20' : 'pt-8'}`}>

        {/* Top bar */}
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

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT PANEL ── */}
          <div className="flex flex-col gap-5">

            {/* Event details */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-5">Event-Details</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputCls + ' text-base font-semibold'}
                    placeholder="Glemseck 101"
                  />
                </div>

                <div>
                  <label className={labelCls}>Beschreibung</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={inputCls + ' resize-y'}
                    placeholder="Beschreibung des Events..."
                  />
                </div>
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
          </div>

          {/* ── RIGHT PANEL (sticky sidebar) ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-8">

            {/* Date range */}
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

            {/* Additional info */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-4">Zusatzinfo</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Ort</label>
                  <MapboxAddressInput
                    initialValue={location}
                    onSelect={(place) => setLocation(place?.address ?? '')}
                    placeholder="Leonberg, Deutschland"
                    types="place,locality,region"
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

            {/* Publish button */}
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
