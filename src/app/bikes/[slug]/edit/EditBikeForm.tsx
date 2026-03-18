'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ChevronRight } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { compressImage } from '@/lib/utils/compressImage'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'

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
  slug: string | null
  title: string
  make: string
  model: string
  year: number
  style: string
  cc: number | null
  mileage_km: number | null
  price: number
  city: string | null
  description: string | null
  status: 'active' | 'draft'
  seller_id: string
  bike_images: ExistingImage[]
}

type Step = 1 | 2 | 3

const labelClass  = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-2'
const inputClass  = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors'
const selectClass = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 pr-10 text-sm text-[#222222] outline-none focus:border-[#DDDDDD] transition-colors appearance-none cursor-pointer'

export default function EditBikeForm({ bike }: { bike: BikeData }) {
  const router = useRouter()
  const supabase = createClient()
  const { toasts, success: toastSuccess, error: toastError } = useToast()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // ── Step 1: Basis ─────────────────────────────────
  const [title, setTitle]   = useState(bike.title)
  const [make, setMake]     = useState(bike.make)
  const [model, setModel]   = useState(bike.model)
  const [year, setYear]     = useState(String(bike.year))
  const [price, setPrice]   = useState(String(bike.price))
  const [style, setStyle]   = useState(bike.style)

  // ── Step 2: Details ───────────────────────────────
  const [mileage, setMileage]         = useState(bike.mileage_km ? String(bike.mileage_km) : '')
  const [description, setDescription] = useState(bike.description ?? '')

  // ── Step 3: Photos ────────────────────────────────
  const sorted = [...bike.bike_images].sort((a, b) => {
    if (a.is_cover) return -1
    if (b.is_cover) return 1
    return a.position - b.position
  })
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(sorted)
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [status, setStatus] = useState<'active' | 'draft'>(bike.status)

  // Drag & drop for existing images
  const dragExistingIdx = useRef<number | null>(null)
  const [dragOverExistingIdx, setDragOverExistingIdx] = useState<number | null>(null)

  // Drag & drop for new images
  const dragNewIdx = useRef<number | null>(null)
  const [dragOverNewIdx, setDragOverNewIdx] = useState<number | null>(null)

  const step1Valid = title.trim() && make.trim() && model.trim() && year && style && price

  // ── Image handlers ────────────────────────────────
  async function handleNewImages(files: FileList | null) {
    if (!files) return
    const total = existingImages.length + newImageFiles.length
    const add = Array.from(files).slice(0, 8 - total)
    const compressed = await Promise.all(add.map(f => compressImage(f)))
    setNewImageFiles(prev => [...prev, ...compressed])
    compressed.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setNewImagePreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function removeExistingImage(id: string) {
    setExistingImages(prev => prev.filter(i => i.id !== id))
    setDeletedImageIds(prev => [...prev, id])
  }

  function removeNewImage(i: number) {
    setNewImageFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewImagePreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleExistingDrop(toIdx: number) {
    if (dragExistingIdx.current === null || dragExistingIdx.current === toIdx) {
      setDragOverExistingIdx(null); return
    }
    const from = dragExistingIdx.current
    const arr = [...existingImages]
    const [moved] = arr.splice(from, 1)
    arr.splice(toIdx, 0, moved)
    setExistingImages(arr)
    setDragOverExistingIdx(null)
    dragExistingIdx.current = null
  }

  function handleNewDrop(toIdx: number) {
    if (dragNewIdx.current === null || dragNewIdx.current === toIdx) {
      setDragOverNewIdx(null); return
    }
    const from = dragNewIdx.current
    const files = [...newImageFiles]
    const previews = [...newImagePreviews]
    const [movedFile] = files.splice(from, 1)
    const [movedPreview] = previews.splice(from, 1)
    files.splice(toIdx, 0, movedFile)
    previews.splice(toIdx, 0, movedPreview)
    setNewImageFiles(files)
    setNewImagePreviews(previews)
    setDragOverNewIdx(null)
    dragNewIdx.current = null
  }

  // ── Submit ────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toastError('Nicht eingeloggt.'); setLoading(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('bikes') as any).update({
      title:       title.trim(),
      make:        make.trim(),
      model:       model.trim(),
      year:        parseInt(year),
      style,
      mileage_km:  mileage ? parseInt(mileage) : null,
      price:       parseFloat(price.replace(/[^0-9.]/g, '')),
      description: description.trim() || null,
      status,
    }).eq('id', bike.id)

    if (updateError) {
      toastError(updateError.message ?? 'Fehler beim Speichern.')
      console.error('[bikes/edit] update error:', updateError)
      setLoading(false)
      return
    }

    // Delete removed images
    for (const id of deletedImageIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('bike_images') as any).delete().eq('id', id)
    }

    // Update positions of existing images + set cover
    for (let i = 0; i < existingImages.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('bike_images') as any).update({
        position: i,
        is_cover: i === 0,
      }).eq('id', existingImages[i].id)
    }

    // Upload new images
    const offset = existingImages.length
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${bike.id}/${Date.now()}-${i}.${ext}`
      const { data: upload } = await supabase.storage.from('bike-images').upload(path, file, { upsert: true })
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

    toastSuccess('Änderungen gespeichert')
    const slug = bike.slug ?? generateBikeSlug(title.trim(), bike.id)
    router.push(`/custom-bike/${slug}`)
    router.refresh()
  }

  const steps = ['Basis', 'Details', 'Fotos & Veröffentlichen']

  return (
    <div className="max-w-2xl mx-auto">

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              step === i + 1 ? 'text-[#717171]' : step > i + 1 ? 'text-[#222222]/50' : 'text-[#222222]/20'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all ${
                step === i + 1 ? 'bg-[#06a5a5] text-white' :
                step > i + 1  ? 'bg-[#222222]/15 text-[#222222]/50' :
                                 'bg-[#222222]/6 text-[#222222]/20'
              }`}>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-colors ${step > i + 1 ? 'bg-[#222222]/20' : 'bg-[#222222]/6'}`} />
            )}
          </div>
        ))}
      </div>

      <ToastContainer toasts={toasts} />

      {/* ── STEP 1: Basis ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5 animate-fade-in">

          <div>
            <label className={labelClass}>Inserat-Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Honda CB550 Cafe Racer — The Midnight Scrambler"
              className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marke *</label>
              <input value={make} onChange={e => setMake(e.target.value)}
                placeholder="Honda" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Modell *</label>
              <input value={model} onChange={e => setModel(e.target.value)}
                placeholder="CB750" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Baujahr *</label>
              <input value={year} onChange={e => setYear(e.target.value)}
                type="number" min="1920" max={new Date().getFullYear()}
                placeholder="1981" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Preis (€) *</label>
              <input value={price} onChange={e => setPrice(e.target.value)}
                type="number" min="0" placeholder="9500" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Typ / Style *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {STYLES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    style === s.value
                      ? 'bg-[#222222]/15 border-[#DDDDDD] text-[#717171]'
                      : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20 hover:text-[#222222]'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
              className="flex items-center gap-2 bg-[#06a5a5] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5 animate-fade-in">

          <div>
            <label className={labelClass}>Kilometerstand</label>
            <input value={mileage} onChange={e => setMileage(e.target.value)}
              type="number" min="0" placeholder="12000" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={5} placeholder="Erzähl die Geschichte des Bikes — Umbauten, besondere Parts, Zustand…"
              className={`${inputClass} resize-none leading-relaxed`} />
            <p className="text-xs text-[#222222]/25 mt-1">{description.length} / 2000 Zeichen</p>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-[#06a5a5] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#058f8f] transition-all"
            >
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Fotos & Publish ── */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-fade-in">

          <div>
            <label className={labelClass}>Fotos (max. 8)</label>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {existingImages.map((img, i) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => { dragExistingIdx.current = i }}
                    onDragOver={e => { e.preventDefault(); setDragOverExistingIdx(i) }}
                    onDragLeave={() => setDragOverExistingIdx(null)}
                    onDrop={() => handleExistingDrop(i)}
                    onDragEnd={() => { dragExistingIdx.current = null; setDragOverExistingIdx(null) }}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F7] border cursor-grab active:cursor-grabbing group transition-all ${
                      dragOverExistingIdx === i ? 'border-[#06a5a5] scale-[0.97] opacity-70' : 'border-[#222222]/8'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#06a5a5] text-white px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button type="button" onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-[#222222]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New image previews */}
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {newImagePreviews.map((src, i) => (
                  <div
                    key={`new-${i}`}
                    draggable
                    onDragStart={() => { dragNewIdx.current = i }}
                    onDragOver={e => { e.preventDefault(); setDragOverNewIdx(i) }}
                    onDragLeave={() => setDragOverNewIdx(null)}
                    onDrop={() => handleNewDrop(i)}
                    onDragEnd={() => { dragNewIdx.current = null; setDragOverNewIdx(null) }}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-white border cursor-grab active:cursor-grabbing group transition-all ${
                      dragOverNewIdx === i ? 'border-[#06a5a5] scale-[0.97] opacity-70' : 'border-[#222222]/8'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#717171] text-white px-1.5 py-0.5 rounded-full">Neu</span>
                    <button type="button" onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-[#222222]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {existingImages.length + newImageFiles.length < 8 && (
              <label className="block border-2 border-dashed border-[#222222]/10 hover:border-[#DDDDDD]/40 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
                <input type="file" accept="image/*" multiple className="sr-only"
                  onChange={e => handleNewImages(e.target.files)} />
                <Upload size={24} className="mx-auto mb-3 text-[#222222]/20 group-hover:text-[#717171] transition-colors" />
                <p className="text-sm text-[#222222]/40 group-hover:text-[#222222]/60 transition-colors">
                  Fotos hinzufügen oder hierher ziehen
                </p>
                <p className="text-xs text-[#222222]/20 mt-1">JPG, PNG, WebP — max. 10 MB pro Bild</p>
              </label>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
            <p className="text-xs text-[#222222]/30 uppercase tracking-widest font-semibold mb-3">Zusammenfassung</p>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Titel', value: title },
                { label: 'Bike', value: `${make} ${model} · ${year}` },
                { label: 'Typ', value: STYLES.find(s => s.value === style)?.label ?? style },
                { label: 'Preis', value: `€ ${parseFloat(price || '0').toLocaleString('de-DE')}` },
                { label: 'Fotos', value: `${existingImages.length + newImageFiles.length} gesamt` },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#222222]/40">{row.label}</span>
                  <span className="text-[#222222] font-medium text-right max-w-[60%] truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-3">
            {([['active', 'Veröffentlicht'], ['draft', 'Entwurf']] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => setStatus(val)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                  status === val
                    ? 'border-[#DDDDDD] bg-[#222222]/10 text-[#717171]'
                    : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20'
                }`}>{label}</button>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#06a5a5] text-white font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {loading ? 'Wird gespeichert…' : 'Änderungen speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
