'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Camera, Bike, Trash2 } from 'lucide-react'

interface Props {
  bikeId: string
  initialTitle: string
  initialCoverUrl: string | null
}

export default function BikeEditForm({ bikeId, initialTitle, initialCoverUrl }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialTitle)
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl)
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      // Upload new photo if selected
      if (newPhoto) {
        const ext = newPhoto.name.split('.').pop()
        const path = `${bikeId}/cover.${ext}`
        const { error: upErr } = await supabase.storage
          .from('bike-images')
          .upload(path, newPhoto, { upsert: true, contentType: newPhoto.type })

        if (upErr) throw new Error(upErr.message)

        const { data: { publicUrl } } = supabase.storage.from('bike-images').getPublicUrl(path)
        const urlWithBust = `${publicUrl}?t=${Date.now()}`

        // Replace existing cover image record
        await (supabase.from('bike_images') as any).delete().eq('bike_id', bikeId).eq('is_cover', true)
        await (supabase.from('bike_images') as any).insert({ bike_id: bikeId, url: urlWithBust, is_cover: true })

        setCoverUrl(urlWithBust)
        setNewPhoto(null)
        setPreview(null)
      }

      // Update title
      const { error: updateErr } = await (supabase.from('bikes') as any)
        .update({ title })
        .eq('id', bikeId)

      if (updateErr) throw new Error(updateErr.message)

      router.push('/dashboard/mein-bike')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  const displayImg = preview ?? coverUrl

  return (
    <div className="bg-white border border-[#222222]/6 rounded-2xl p-6 space-y-5">

      {/* Photo */}
      <div>
        <p className="text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-3">Foto</p>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
            displayImg ? 'border-transparent' : 'border-[#222222]/10 hover:border-[#222222]/25'
          }`}
        >
          {displayImg ? (
            <>
              <img src={displayImg} alt="Vorschau" className="w-full h-full object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-semibold flex items-center gap-2"><Camera size={16} /> Foto ändern</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#F7F7F7] border border-[#222222]/8 flex items-center justify-center mb-3">
                <Camera size={20} className="text-[#222222]/25" />
              </div>
              <p className="text-sm font-medium text-[#222222]/50">Foto auswählen</p>
              <p className="text-xs text-[#222222]/25 mt-1">JPG, PNG · max. 10 MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Title */}
      <div>
        <p className="text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-2">Bezeichnung</p>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] outline-none focus:border-[#222222]/30 transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-50 hover:bg-[#058f8f] transition-all"
        >
          {saving ? 'Wird gespeichert…' : <><Bike size={14} /> Speichern</>}
        </button>
      </div>
    </div>
  )
}
