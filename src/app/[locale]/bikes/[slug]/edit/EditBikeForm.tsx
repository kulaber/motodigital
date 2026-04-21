'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ChevronRight, ChevronDown, Plus, Play } from 'lucide-react'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { compressImage } from '@/lib/utils/compressImage'
import { generateVideoThumbnail } from '@/lib/utils/videoThumbnail'
import { generateBikeSlug } from '@/lib/utils/bikeSlug'
import { sortBikeImages } from '@/lib/utils/bikeImages'

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10MB
const MAX_MEDIA_COUNT = 30
import { MAKES, getModelsByMake, getYearsForModel, type MotorcycleModel } from '@/lib/data/motorcycles'

// ─── Constants ────────────────────────────────────────────────────────────────
const STYLES = [
  { value: 'cafe_racer', label: 'Cafe Racer' },
  { value: 'bobber',     label: 'Bobber'     },
  { value: 'scrambler',  label: 'Scrambler'  },
  { value: 'tracker',    label: 'Tracker'    },
  { value: 'chopper',    label: 'Chopper'    },
  { value: 'street',     label: 'Street'     },
  { value: 'enduro',     label: 'Enduro'     },
  { value: 'naked',      label: 'Naked'      },
  { value: 'other',      label: 'Basis-Bike'  },
]

const labelClass = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-2'
const inputClass = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#06a5a5] transition-colors'
const selectClass = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 pr-10 text-sm text-[#222222] outline-none focus:border-[#06a5a5] transition-colors appearance-none cursor-pointer'

// ─── Types ────────────────────────────────────────────────────────────────────
type ExistingImage = { id: string; url: string; is_cover: boolean; position: number; media_type?: 'image' | 'video'; thumbnail_url?: string | null }

type BikeData = {
  id: string; slug: string | null; title: string; make: string; model: string; year: number
  style: string; cc: number | null; mileage_km: number | null; price: number
  city: string | null; description: string | null; modifications: string[] | null
  status: 'active' | 'draft'; seller_id: string; bike_images: ExistingImage[]
  listing_type?: 'showcase' | 'for_sale'; price_amount?: number | null; price_on_request?: boolean
}

type Step = 1 | 2 | 3

// ─── Main component ───────────────────────────────────────────────────────────
export default function EditBikeForm({ bike }: { bike: BikeData }) {
  const router = useRouter()
  const supabase = createClient()
  const { toasts, success: toastSuccess, error: toastError } = useToast()

  const [step, setStepRaw] = useState<Step>(1)
  function setStep(s: Step) {
    setStepRaw(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const [loading, setLoading] = useState(false)

  // ── Step 1: Basis ──────────────────────────────────
  const [title, setTitle] = useState(bike.title)

  // Make — match by name against MAKES
  const knownMake = MAKES.find(m => m.name === bike.make)
  const [makeId, setMakeId] = useState(knownMake ? knownMake.id : 'andere')
  const [customMake, setCustomMake] = useState(knownMake ? '' : bike.make)
  const isCustomMake = makeId === 'andere'

  // Model
  const modelsForMake: MotorcycleModel[] = useMemo(
    () => (makeId && !isCustomMake ? getModelsByMake(makeId) : []),
    [makeId, isCustomMake]
  )
  const knownModel = modelsForMake.find(m => m.name === bike.model)
  const [modelId, setModelId] = useState(knownModel ? knownModel.id : (modelsForMake.length > 0 ? 'andere' : ''))
  const [customModel, setCustomModel] = useState(knownModel ? '' : bike.model)

  // Year
  const selectedModel = useMemo(
    () => modelsForMake.find(m => m.id === modelId) ?? null,
    [modelsForMake, modelId]
  )
  const yearOptions = useMemo(
    () => (selectedModel ? getYearsForModel(selectedModel) : []),
    [selectedModel]
  )
  const [year, setYear] = useState(String(bike.year))

  const selectedMake = MAKES.find(m => m.id === makeId)
  const finalMake = isCustomMake ? customMake : (selectedMake?.name ?? makeId)
  const finalModel = modelId === 'andere' || !selectedModel ? customModel : selectedModel.name

  function onMakeChange(val: string) {
    setMakeId(val)
    setModelId('')
    setCustomModel('')
    setYear('')
  }

  function onModelChange(val: string) {
    setModelId(val)
    setYear('')
  }

  // ── Step 2: Details ────────────────────────────────
  const [style, setStyle] = useState(bike.style)
  const [mileage, setMileage] = useState(bike.mileage_km ? String(bike.mileage_km) : '')
  const [description, setDescription] = useState(bike.description ?? '')
  const [modifications, setModifications] = useState<string[]>(bike.modifications?.filter(Boolean) ?? [])
  const [modInput, setModInput] = useState('')
  const [listingType, setListingType] = useState<'showcase' | 'for_sale'>(bike.listing_type ?? 'showcase')
  const [priceAmount, setPriceAmount] = useState(bike.price_amount ? String(bike.price_amount) : '')
  const [priceOnRequest, setPriceOnRequest] = useState(bike.price_on_request ?? false)

  function addMod() {
    const t = modInput.trim()
    if (!t || modifications.includes(t)) return
    setModifications(p => [...p, t])
    setModInput('')
  }

  // ── Step 3: Photos ─────────────────────────────────
  const sorted = sortBikeImages(bike.bike_images)
  type GalleryItem = { type: 'existing'; img: ExistingImage } | { type: 'new'; file: File; preview: string; isVideo: boolean; thumbFile?: File }
  const [gallery, setGallery] = useState<GalleryItem[]>(sorted.map(img => ({ type: 'existing', img })))
  const [status, setStatus] = useState<'active' | 'draft'>(bike.status)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const dragIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  async function handleAddMedia(files: FileList | null) {
    if (!files) return
    const incoming = Array.from(files).slice(0, MAX_MEDIA_COUNT - gallery.length)
    const newItems: GalleryItem[] = []

    for (const file of incoming) {
      const isVideo = VIDEO_TYPES.includes(file.type)
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toastError(`Video "${file.name}" ist zu groß (max. 100 MB)`)
        continue
      }
      if (!isVideo && file.size > MAX_IMAGE_SIZE) {
        toastError(`Bild "${file.name}" ist zu groß (max. 10 MB)`)
        continue
      }
      const processed = isVideo ? file : await compressImage(file, 1600)
      let thumbFile: File | undefined
      if (isVideo) {
        try { thumbFile = await generateVideoThumbnail(file) } catch { /* ignore */ }
      }
      newItems.push({ type: 'new', file: processed, preview: URL.createObjectURL(processed), isVideo, thumbFile })
    }

    setGallery(p => [...p, ...newItems])
  }

  async function confirmRemoveItem() {
    if (deleteTarget === null) return
    const item = gallery[deleteTarget]

    if (item.type === 'existing') {
      setDeleteLoading(true)
      // Delete from storage
      const match = item.img.url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
      if (match) {
        await supabase.storage.from('bike-images').remove([match[1]])
      }
      if (item.img.thumbnail_url) {
        const thumbMatch = item.img.thumbnail_url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
        if (thumbMatch) {
          await supabase.storage.from('bike-images').remove([thumbMatch[1]])
        }
      }
      // Delete from DB
      await (supabase.from('bike_images') as any).delete().eq('id', item.img.id)
      setDeleteLoading(false)
    }

    setGallery(p => p.filter((_, idx) => idx !== deleteTarget))
    setDeleteTarget(null)
  }

  function handleDrop(toIdx: number) {
    if (dragIdx.current === null || dragIdx.current === toIdx) { setDragOverIdx(null); return }
    const arr = [...gallery]
    const [moved] = arr.splice(dragIdx.current, 1)
    arr.splice(toIdx, 0, moved)
    setGallery(arr)
    setDragOverIdx(null)
    dragIdx.current = null
  }

  // ── Validation ─────────────────────────────────────
  const step1Valid = title.trim() && finalMake.trim() && finalModel.trim() && year

  // ── Submit ─────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toastError('Nicht eingeloggt.'); setLoading(false); return }

    const { error: updateError } = await (supabase.from('bikes') as any).update({
      title:       title.trim(),
      make:        finalMake.trim(),
      model:       finalModel.trim(),
      year:        parseInt(year),
      style,
      mileage_km:  mileage ? parseInt(mileage) : null,
      description: description.trim() || null,
      modifications,
      status,
      listing_type: listingType,
      price_amount: listingType === 'for_sale' && !priceOnRequest && priceAmount ? parseInt(priceAmount) : null,
      price_on_request: listingType === 'for_sale' ? priceOnRequest : false,
    }).eq('id', bike.id)

    if (updateError) { toastError(updateError.message); setLoading(false); return }

    // Update positions for all remaining gallery items
    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i]
      if (item.type === 'existing') {
        await (supabase.from('bike_images') as any).update({ position: i, is_cover: i === 0 }).eq('id', item.img.id)
      } else {
        const ext = item.file.name.split('.').pop()
        const path = `${bike.seller_id}/${bike.id}/${Date.now()}-${i}.${ext}`
        const { data: upload } = await supabase.storage.from('bike-images').upload(path, item.file, { upsert: true })
        if (upload) {
          const { data: { publicUrl } } = supabase.storage.from('bike-images').getPublicUrl(path)

          // Upload thumbnail for videos
          let thumbnailUrl: string | null = null
          if (item.isVideo && item.thumbFile) {
            const thumbPath = `${bike.seller_id}/${bike.id}/${Date.now()}-${i}_thumb.jpg`
            const { data: thumbUpload } = await supabase.storage
              .from('bike-images')
              .upload(thumbPath, item.thumbFile, { upsert: true })
            if (thumbUpload) {
              thumbnailUrl = supabase.storage.from('bike-images').getPublicUrl(thumbPath).data.publicUrl
            }
          }

          await (supabase.from('bike_images') as any).insert({
            bike_id: bike.id, url: publicUrl, position: i, is_cover: i === 0,
            media_type: item.isVideo ? 'video' : 'image',
            thumbnail_url: thumbnailUrl,
          })
        }
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
      <ToastContainer toasts={toasts} />
      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmRemoveItem}
        loading={deleteLoading}
        title="Möchtest du dieses Bild wirklich löschen?"
      />

      {/* Step indicator */}
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

      {/* ── STEP 1: Basis ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5 animate-fade-in">

          <div>
            <label className={labelClass}>Build-Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Honda CB550 Café Racer — The Midnight"
              className={inputClass} />
          </div>

          {/* Marke */}
          <div>
            <label className={labelClass}>Marke *</label>
            <div className="relative">
              <select value={makeId} onChange={e => onMakeChange(e.target.value)} className={selectClass}>
                <option value="">Marke wählen…</option>
                {MAKES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
            </div>
            {makeId === 'andere' && (
              <input value={customMake} onChange={e => setCustomMake(e.target.value)}
                placeholder="Marke eingeben…" className={`${inputClass} mt-2`} />
            )}
          </div>

          {/* Modell */}
          <div>
            <label className={labelClass}>Modell *</label>
            {isCustomMake || modelsForMake.length === 0 ? (
              <input value={customModel} onChange={e => setCustomModel(e.target.value)}
                placeholder="Modell eingeben…" className={inputClass} />
            ) : (
              <>
                <div className="relative">
                  <select value={modelId} onChange={e => onModelChange(e.target.value)}
                    disabled={!makeId} className={`${selectClass} disabled:opacity-40`}>
                    <option value="">Modell wählen…</option>
                    {modelsForMake.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.yearFrom}–{m.yearTo ?? 'heute'})
                      </option>
                    ))}
                    <option value="andere">Anderes Modell…</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
                </div>
                {modelId === 'andere' && (
                  <input value={customModel} onChange={e => setCustomModel(e.target.value)}
                    placeholder="Modell eingeben…" className={`${inputClass} mt-2`} />
                )}
              </>
            )}
          </div>

          {/* Baujahr + Kilometerstand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Baujahr *</label>
              {yearOptions.length > 0 ? (
                <div className="relative">
                  <select value={year} onChange={e => setYear(e.target.value)} className={selectClass}>
                    <option value="">Jahr wählen…</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
                </div>
              ) : (
                <input value={year} onChange={e => setYear(e.target.value)}
                  type="number" min="1920" max={new Date().getFullYear()}
                  placeholder="1981" className={inputClass} />
              )}
            </div>
            <div>
              <label className={labelClass}>Kilometerstand</label>
              <input value={mileage} onChange={e => setMileage(e.target.value)}
                type="number" min="0" placeholder="12000" className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => step1Valid && setStep(2)} disabled={!step1Valid}
              className="flex items-center gap-2 bg-[#06a5a5] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Details ── */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-fade-in">

          {/* Umbaustil */}
          <div>
            <label className={labelClass}>Umbaustil *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {STYLES.map(s => (
                <button key={s.value} type="button" onClick={() => setStyle(s.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    style === s.value
                      ? 'bg-[#06a5a5]/10 border-[#06a5a5]/30 text-[#06a5a5]'
                      : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20 hover:text-[#222222]'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Umbauten & Modifikationen */}
          <div>
            <label className={labelClass}>Umbauten & Modifikationen</label>

            {/* Tags */}
            {modifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {modifications.map(mod => (
                  <span key={mod} className="inline-flex items-center gap-1.5 bg-white border border-[#222222]/10 text-[#222222]/70 text-xs font-medium px-3 py-1.5 rounded-full">
                    {mod}
                    <button type="button" onClick={() => setModifications(p => p.filter(m => m !== mod))}
                      className="text-[#222222]/30 hover:text-[#222222] transition-colors">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                value={modInput}
                onChange={e => setModInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMod() } }}
                placeholder="z.B. Öhlins Federbein, K&N Filter, Custom Sitzbank…"
                className={inputClass}
              />
              <button type="button" onClick={addMod}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#06a5a5] text-white hover:bg-[#058f8f] transition-colors disabled:opacity-40"
                disabled={!modInput.trim()}>
                <Plus size={16} />
              </button>
            </div>
            <p className="text-xs text-[#222222]/25 mt-1.5">Enter drücken oder + klicken zum Hinzufügen</p>
          </div>

          {/* Beschreibung */}
          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={5} placeholder="Erzähl die Geschichte des Bikes — Umbauten, besondere Parts, Zustand…"
              className={`${inputClass} resize-none leading-relaxed`} />
            <p className="text-xs text-[#222222]/25 mt-1">{description.length} / 2000</p>
          </div>

          {/* Verkauf */}
          <div>
            <label className={labelClass}>Verkauf</label>
            <div className="grid grid-cols-2 gap-2">
              {([['showcase', 'Showcase'], ['for_sale', 'Zu verkaufen']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setListingType(val)
                    if (val === 'showcase') { setPriceAmount(''); setPriceOnRequest(false) }
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    listingType === val
                      ? 'bg-[#06a5a5]/10 border-[#06a5a5]/30 text-[#06a5a5]'
                      : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20 hover:text-[#222222]'
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          {listingType === 'for_sale' && (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  value={priceAmount ? Number(priceAmount).toLocaleString('de-DE') : ''}
                  onChange={e => setPriceAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  type="text"
                  inputMode="numeric"
                  placeholder="z.B. 12.500"
                  disabled={priceOnRequest}
                  className={`${inputClass} pr-10 disabled:opacity-40 disabled:cursor-not-allowed`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#222222]/30 pointer-events-none">EUR</span>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priceOnRequest}
                  onChange={e => {
                    setPriceOnRequest(e.target.checked)
                    if (e.target.checked) setPriceAmount('')
                  }}
                  className="w-4 h-4 rounded border-[#222222]/20 text-[#06a5a5] focus:ring-[#06a5a5] accent-[#06a5a5]"
                />
                <span className="text-xs text-[#222222]/60">Preis auf Anfrage</span>
              </label>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button onClick={() => setStep(3)}
              disabled={listingType === 'for_sale' && !priceOnRequest && !priceAmount}
              className="flex items-center gap-2 bg-[#06a5a5] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Fotos & Veröffentlichen ── */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-fade-in">

          {/* Unified gallery */}
          <div>
            <label className={labelClass}>Medien — ziehen zum Sortieren (max. {MAX_MEDIA_COUNT})</label>
            <p className="text-xs text-[#222222]/30 mb-3">Fotos und Videos hochladen. Maximal {MAX_MEDIA_COUNT} Dateien (Bilder max. 10 MB, Videos max. 100 MB).</p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {gallery.map((item, i) => {
                const isExisting = item.type === 'existing'
                const isVideo = isExisting
                  ? item.img.media_type === 'video'
                  : item.isVideo
                const src = isExisting ? item.img.url : item.preview
                const isNew = item.type === 'new'
                return (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => { dragIdx.current = i }}
                    onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
                    onDragLeave={() => setDragOverIdx(null)}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null) }}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-[#F7F7F7] border cursor-grab active:cursor-grabbing group transition-all ${
                      dragOverIdx === i ? 'border-[#06a5a5] scale-[0.97] opacity-70' : 'border-[#222222]/8'
                    }`}
                  >
                    {isVideo ? (
                      <>
                        {isExisting && item.img.thumbnail_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.img.thumbnail_url} alt={`Video-Vorschau ${i + 1}`} className="w-full h-full object-cover" />
                        ) : !isExisting && item.thumbFile ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={URL.createObjectURL(item.thumbFile)} alt={`Video-Vorschau ${i + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center">
                            <Play size={14} className="text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={src} alt={`Bild ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#06a5a5] text-white px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    {isNew && (
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-[#717171] text-white px-1.5 py-0.5 rounded-full">
                        Neu
                      </span>
                    )}
                    <button type="button" onClick={() => setDeleteTarget(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-[#222222]" />
                    </button>
                  </div>
                )
              })}
            </div>

            {gallery.length < MAX_MEDIA_COUNT && (
              <label className="block border-2 border-dashed border-[#222222]/10 hover:border-[#06a5a5]/40 rounded-2xl p-6 text-center cursor-pointer transition-colors group">
                <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="sr-only"
                  onChange={e => handleAddMedia(e.target.files)} />
                <Upload size={22} className="mx-auto mb-2 text-[#222222]/20 group-hover:text-[#06a5a5] transition-colors" />
                <p className="text-sm text-[#222222]/40 group-hover:text-[#222222]/60 transition-colors">Fotos oder Videos hinzufügen</p>
                <p className="text-xs text-[#222222]/20 mt-0.5">JPG, PNG, WebP, MP4, WebM</p>
              </label>
            )}
          </div>

          {/* Status */}
          <div className="flex gap-3">
            {([['active', 'Veröffentlicht'], ['draft', 'Entwurf']] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => setStatus(val)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                  status === val
                    ? 'border-[#06a5a5]/30 bg-[#06a5a5]/8 text-[#06a5a5]'
                    : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20'
                }`}>{label}</button>
            ))}
          </div>

          {/* Zusammenfassung — nur befüllte Felder */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
            <p className="text-xs text-[#222222]/30 uppercase tracking-widest font-semibold mb-3">Zusammenfassung</p>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Titel', value: title || null },
                { label: 'Bike', value: finalMake && finalModel && year ? `${finalMake} ${finalModel} · ${year}` : null },
                { label: 'Stil', value: STYLES.find(s => s.value === style)?.label ?? null },
                { label: 'Kilometerstand', value: mileage ? `${parseInt(mileage).toLocaleString('de-DE')} km` : null },
                { label: 'Umbauten', value: modifications.length ? `${modifications.length} eingetragen` : null },
                { label: 'Medien', value: gallery.length ? `${gallery.length} Dateien` : null },
                { label: 'Verkauf', value: listingType === 'for_sale' ? (priceOnRequest ? 'Preis auf Anfrage' : priceAmount ? `${Number(priceAmount).toLocaleString('de-DE')} EUR` : null) : null },
              ].filter(row => row.value !== null).map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#222222]/40">{row.label}</span>
                  <span className="text-[#222222] font-medium text-right max-w-[60%] truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-[#06a5a5] text-white font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
              {loading ? 'Wird gespeichert…' : 'Änderungen speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
