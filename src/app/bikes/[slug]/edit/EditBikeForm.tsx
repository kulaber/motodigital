'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ChevronDown, Trash2 } from 'lucide-react'
import LocationAutocomplete, { type LocationResult } from '@/components/ui/LocationAutocomplete'

const STYLES = [
  { value: 'cafe_racer', label: 'Cafe Racer' },
  { value: 'bobber',     label: 'Bobber'     },
  { value: 'scrambler',  label: 'Scrambler'  },
  { value: 'tracker',    label: 'Tracker'    },
  { value: 'chopper',    label: 'Chopper'    },
  { value: 'street',     label: 'Street'     },
  { value: 'enduro',     label: 'Enduro'     },
  { value: 'naked',      label: 'Naked'      },
  { value: 'other',      label: 'Sonstiges'  },
]

type ExistingImage = { id: string; url: string; is_cover: boolean; position: number }

type BikeData = {
  id: string
  title: string
  make: string
  model: string
  year: number
  style: string
  cc: number | null
  mileage_km: number | null
  price: number
  city: string | null
  lat: number | null
  lng: number | null
  description: string | null
  status: 'active' | 'draft'
  seller_id: string
  bike_images: ExistingImage[]
}

const labelClass  = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-2'
const inputClass  = 'w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#B0B0B0] outline-none focus:border-[#DDDDDD] transition-colors'
const selectClass = 'w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 pr-10 text-sm text-[#222222] outline-none focus:border-[#DDDDDD] transition-colors appearance-none cursor-pointer'

export default function EditBikeForm({ bike }: { bike: BikeData }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle]           = useState(bike.title)
  const [make, setMake]             = useState(bike.make)
  const [model, setModel]           = useState(bike.model)
  const [year, setYear]             = useState(String(bike.year))
  const [style, setStyle]           = useState(bike.style)
  const [cc, setCc]                 = useState(bike.cc ? String(bike.cc) : '')
  const [mileage, setMileage]       = useState(bike.mileage_km ? String(bike.mileage_km) : '')
  const [price, setPrice]           = useState(String(bike.price))
  const [city, setCity]             = useState(bike.city ?? '')
  const [locationLat, setLocationLat] = useState<number | null>(bike.lat)
  const [locationLng, setLocationLng] = useState<number | null>(bike.lng)
  const [description, setDescription] = useState(bike.description ?? '')
  const [status, setStatus]         = useState<'active' | 'draft'>(bike.status)

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    [...bike.bike_images].sort((a, b) => a.position - b.position)
  )
  const [newFiles, setNewFiles]     = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function handleNewImages(files: FileList | null) {
    if (!files) return
    const total = existingImages.length + newFiles.length
    const add = Array.from(files).slice(0, 8 - total)
    setNewFiles(prev => [...prev, ...add])
    add.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setNewPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function removeExisting(id: string) {
    setExistingImages(prev => prev.filter(i => i.id !== id))
    setDeletedImageIds(prev => [...prev, id])
  }

  function removeNew(i: number) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Nicht eingeloggt.'); setLoading(false); return }

    // Update bike row
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('bikes') as any).update({
      title:       title.trim(),
      make:        make.trim(),
      model:       model.trim(),
      year:        parseInt(year),
      style,
      cc:          cc ? parseInt(cc) : null,
      mileage_km:  mileage ? parseInt(mileage) : null,
      price:       parseFloat(price.replace(/[^0-9.]/g, '')),
      city:        city.trim() || null,
      lat:         locationLat,
      lng:         locationLng,
      description: description.trim() || null,
      status,
    }).eq('id', bike.id)

    if (updateError) {
      setError('Fehler beim Speichern: ' + updateError.message)
      setLoading(false)
      return
    }

    // Delete removed images
    for (const imgId of deletedImageIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('bike_images') as any).delete().eq('id', imgId)
    }

    // Upload new images
    const offset = existingImages.length
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${bike.id}/${Date.now()}-${i}.${ext}`
      const { data: upload } = await supabase.storage
        .from('bike-images')
        .upload(path, file, { upsert: true })
      if (upload) {
        const { data: urlData } = supabase.storage.from('bike-images').getPublicUrl(path)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('bike_images') as any).insert({
          bike_id:  bike.id,
          url:      urlData.publicUrl,
          position: offset + i,
          is_cover: offset === 0 && i === 0,
        })
      }
    }

    // If first existing was removed, set new cover
    if (existingImages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('bike_images') as any)
        .update({ is_cover: false }).eq('bike_id', bike.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('bike_images') as any)
        .update({ is_cover: true }).eq('id', existingImages[0].id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Titel */}
      <div>
        <label className={labelClass}>Titel *</label>
        <input required value={title} onChange={e => setTitle(e.target.value)}
          placeholder="z.B. Honda CB750 Cafe Racer" className={inputClass} />
      </div>

      {/* Marke / Modell */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Marke *</label>
          <input required value={make} onChange={e => setMake(e.target.value)}
            placeholder="Honda" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Modell *</label>
          <input required value={model} onChange={e => setModel(e.target.value)}
            placeholder="CB750" className={inputClass} />
        </div>
      </div>

      {/* Jahr / Preis */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Baujahr *</label>
          <input required type="number" min="1920" max={new Date().getFullYear()}
            value={year} onChange={e => setYear(e.target.value)}
            placeholder="1981" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Preis (€) *</label>
          <input required type="number" min="0"
            value={price} onChange={e => setPrice(e.target.value)}
            placeholder="9500" className={inputClass} />
        </div>
      </div>

      {/* Style */}
      <div>
        <label className={labelClass}>Typ / Style *</label>
        <div className="relative">
          <select required value={style} onChange={e => setStyle(e.target.value)} className={selectClass}>
            <option value="">Style wählen…</option>
            {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B0] pointer-events-none" />
        </div>
      </div>

      {/* CC / KM */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hubraum (cc)</label>
          <input type="number" min="0" value={cc} onChange={e => setCc(e.target.value)}
            placeholder="750" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Kilometerstand</label>
          <input type="number" min="0" value={mileage} onChange={e => setMileage(e.target.value)}
            placeholder="12000" className={inputClass} />
        </div>
      </div>

      {/* Standort */}
      <div>
        <label className={labelClass}>Standort</label>
        <LocationAutocomplete
          value={city}
          onChange={(result: LocationResult | null) => {
            setCity(result?.city ?? '')
            setLocationLat(result?.lat ?? null)
            setLocationLng(result?.lng ?? null)
          }}
          className={inputClass}
        />
      </div>

      {/* Beschreibung */}
      <div>
        <label className={labelClass}>Beschreibung</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={5} placeholder="Geschichte des Bikes, Umbauten, Zustand…"
          className={`${inputClass} resize-none leading-relaxed`} />
      </div>

      {/* Fotos */}
      <div>
        <label className={labelClass}>Fotos</label>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {existingImages.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB] group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#086565] text-white px-1.5 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
                <button type="button" onClick={() => removeExisting(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={11} className="text-[#717171]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New images */}
        {newPreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB] group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#717171] text-white px-1.5 py-0.5 rounded-full">Neu</span>
                <button type="button" onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={11} className="text-[#717171]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {existingImages.length + newFiles.length < 8 && (
          <label className="flex items-center gap-3 border border-dashed border-[#DDDDDD] hover:border-[#B0B0B0] rounded-xl px-4 py-3 cursor-pointer transition-colors">
            <Upload size={16} className="text-[#B0B0B0]" />
            <span className="text-sm text-[#B0B0B0]">Weitere Fotos hinzufügen</span>
            <input type="file" accept="image/*" multiple className="sr-only"
              onChange={e => handleNewImages(e.target.files)} />
          </label>
        )}
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <div className="flex gap-3">
          {([['active', 'Veröffentlicht'], ['draft', 'Entwurf']] as const).map(([val, label]) => (
            <button key={val} type="button" onClick={() => setStatus(val)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                status === val
                  ? 'border-[#222222] bg-[#222222] text-white'
                  : 'border-[#EBEBEB] text-[#717171] hover:border-[#DDDDDD]'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EBEBEB]">
        <button type="button" onClick={() => router.push('/dashboard')}
          className="text-sm text-[#B0B0B0] hover:text-[#717171] transition-colors">
          Abbrechen
        </button>
        <button type="submit" disabled={loading}
          className="bg-[#086565] text-white font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#075555] disabled:opacity-50 transition-all">
          {loading ? 'Wird gespeichert…' : 'Änderungen speichern'}
        </button>
      </div>
    </form>
  )
}
