'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, ChevronRight, ChevronDown, Plus, Play, Shield, Search } from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { MAKES, getModelsByMake, getYearsForModel, type MotorcycleModel } from '@/lib/data/motorcycles'
import { compressImage } from '@/lib/utils/compressImage'
import { generateVideoThumbnail } from '@/lib/utils/videoThumbnail'

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_MEDIA_COUNT = 30

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

export type WorkshopOption = {
  profileId: string
  workshopId: string | null
  name: string
  city: string | null
}

type Step = 1 | 2 | 3 | 4

interface Props {
  workshops: WorkshopOption[]
}

export default function AdminCreateBikeForm({ workshops }: Props) {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const { toasts, success: toastSuccess, error: toastError } = useToast()
  type MediaFile = { file: File; preview: string; isVideo: boolean; thumbFile?: File }
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const dragIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // ── Workshop selection ───────────────────────────
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopOption | null>(null)
  const [workshopSearch, setWorkshopSearch] = useState('')

  const filteredWorkshops = useMemo(() => {
    if (!workshopSearch.trim()) return workshops
    const q = workshopSearch.toLowerCase()
    return workshops.filter(w =>
      w.name.toLowerCase().includes(q) || w.city?.toLowerCase().includes(q)
    )
  }, [workshops, workshopSearch])

  // ── Bike selection state ─────────────────────────
  const [makeId, setMakeId]       = useState('')
  const [modelId, setModelId]     = useState('')
  const [variantIdx, setVariantIdx] = useState(0)
  const [customMake, setCustomMake] = useState('')
  const [customModel, setCustomModel] = useState('')

  // ── Form fields ──────────────────────────────────
  const [title, setTitle]           = useState('')
  const [year, setYear]             = useState('')
  const [style, setStyle]           = useState('')
  const [cc, setCc]                 = useState('')
  const [mileage, setMileage]       = useState('')
  const [description, setDescription] = useState('')
  const [modifications, setModifications] = useState<string[]>([''])
  const [status, setStatus]         = useState<'active' | 'draft'>('active')
  const [listingType, setListingType] = useState<'showcase' | 'for_sale'>('showcase')
  const [priceAmount, setPriceAmount] = useState('')
  const [priceOnRequest, setPriceOnRequest] = useState(false)

  // ── Derived values ───────────────────────────────
  const isCustomMake = makeId === 'andere'
  const modelsForMake: MotorcycleModel[] = useMemo(
    () => (makeId && !isCustomMake ? getModelsByMake(makeId) : []),
    [makeId, isCustomMake]
  )
  const selectedModel = useMemo(
    () => modelsForMake.find(m => m.id === modelId) ?? null,
    [modelsForMake, modelId]
  )
  const yearsForModel = useMemo(
    () => (selectedModel ? getYearsForModel(selectedModel) : []),
    [selectedModel]
  )
  const selectedVariant = selectedModel?.variants[variantIdx] ?? null
  const selectedMakeName = MAKES.find(m => m.id === makeId)?.name ?? customMake
  const selectedModelName = selectedModel?.name ?? customModel

  const submitMake  = selectedMakeName
  const submitModel = selectedModelName

  // ── Handlers ─────────────────────────────────────
  function onMakeChange(id: string) {
    setMakeId(id); setModelId(''); setVariantIdx(0)
    setYear(''); setCc(''); setCustomMake(''); setCustomModel('')
  }

  function onModelChange(id: string) {
    setModelId(id); setVariantIdx(0); setYear('')
    const m = modelsForMake.find(x => x.id === id)
    setCc(m?.variants.length === 1 ? String(m.variants[0].displacement) : '')
  }

  function onVariantChange(idx: number) {
    setVariantIdx(idx)
    if (selectedModel) setCc(String(selectedModel.variants[idx].displacement))
  }

  async function handleMedia(files: FileList | null) {
    if (!files) return
    const incoming = Array.from(files).slice(0, MAX_MEDIA_COUNT - mediaFiles.length)
    const newItems: MediaFile[] = []

    for (const file of incoming) {
      const isVideo = VIDEO_TYPES.includes(file.type)
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toastError(`Video "${file.name}" ist zu groß (max. 100 MB)`); continue
      }
      if (!isVideo && file.size > MAX_IMAGE_SIZE) {
        toastError(`Bild "${file.name}" ist zu groß (max. 10 MB)`); continue
      }

      const processed = isVideo ? file : await compressImage(file, 1600)
      const preview = URL.createObjectURL(processed)
      let thumbFile: File | undefined
      if (isVideo) {
        try { thumbFile = await generateVideoThumbnail(file) } catch { /* ignore */ }
      }
      newItems.push({ file: processed, preview, isVideo, thumbFile })
    }

    setMediaFiles(prev => [...prev, ...newItems])
  }

  function removeMedia(i: number) {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  function handleMediaDrop(toIdx: number) {
    if (dragIdx.current === null || dragIdx.current === toIdx) { setDragOverIdx(null); return }
    const from = dragIdx.current
    const arr = [...mediaFiles]
    const [moved] = arr.splice(from, 1)
    arr.splice(toIdx, 0, moved)
    setMediaFiles(arr)
    setDragOverIdx(null)
    dragIdx.current = null
  }

  async function handleSubmit() {
    if (!selectedWorkshop) { toastError('Keine Werkstatt ausgewählt.'); return }
    setLoading(true)

    try {
      // 1. Create bike record via admin API
      const res = await fetch('/api/admin/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id:    selectedWorkshop.profileId,
          workshop_id:  selectedWorkshop.workshopId,
          title:        title.trim(),
          make:         submitMake,
          model:        submitModel,
          year:         parseInt(year),
          style,
          cc:           cc ? parseInt(cc) : null,
          mileage_km:   mileage ? parseInt(mileage) : null,
          description:  description.trim() || null,
          modifications: modifications.map(m => m.trim()).filter(Boolean),
          status,
          listing_type: listingType,
          price_amount: listingType === 'for_sale' && !priceOnRequest && priceAmount ? parseInt(priceAmount) : null,
          price_on_request: listingType === 'for_sale' ? priceOnRequest : false,
        }),
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        toastError(result.error ?? 'Fehler beim Speichern.')
        setLoading(false)
        return
      }

      const bikeId = result.id

      // 2. Upload media files via admin media API
      for (let i = 0; i < mediaFiles.length; i++) {
        const { file, isVideo, thumbFile } = mediaFiles[i]
        const formData = new FormData()
        formData.append('bike_id', bikeId)
        formData.append('seller_id', selectedWorkshop.profileId)
        formData.append('position', String(i))
        formData.append('file', file)
        if (isVideo && thumbFile) {
          formData.append('thumbnail', thumbFile)
        }

        const mediaRes = await fetch('/api/admin/bikes/media', {
          method: 'POST',
          body: formData,
        })

        if (!mediaRes.ok) {
          const mediaErr = await mediaRes.json()
          console.error(`[admin/bikes/media] upload ${i} error:`, mediaErr)
        }
      }

      toastSuccess('Bike erfolgreich angelegt')
      router.push('/admin/custom-bikes')
      router.refresh()
    } catch (err) {
      console.error('[AdminCreateBikeForm] submit error:', err)
      toastError('Fehler beim Speichern.')
      setLoading(false)
    }
  }

  const step1Valid = !!selectedWorkshop
  const step2Valid = title && submitMake && submitModel && year && style

  const steps = ['Werkstatt', 'Basis', 'Details', 'Fotos & Veröffentlichen']

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Shield size={14} className="text-amber-400" />
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-6">Neues Bike anlegen</h1>

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

      {/* ── STEP 1: Werkstatt wählen ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div>
            <label className={labelClass}>Werkstatt auswählen *</label>
            <p className="text-xs text-[#222222]/30 mb-3">Das Bike wird dieser Werkstatt zugeordnet.</p>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#222222]/25" />
              <input
                value={workshopSearch}
                onChange={e => setWorkshopSearch(e.target.value)}
                placeholder="Werkstatt suchen…"
                className={`${inputClass} pl-10`}
              />
            </div>

            {/* Workshop list */}
            <div className="border border-[#222222]/8 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
              {filteredWorkshops.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-[#222222]/25">Keine Werkstätten gefunden</p>
              ) : (
                filteredWorkshops.map(w => (
                  <button
                    key={w.profileId}
                    type="button"
                    onClick={() => setSelectedWorkshop(w)}
                    className={`w-full text-left px-5 py-3.5 flex items-center justify-between border-b border-[#222222]/5 last:border-0 transition-all ${
                      selectedWorkshop?.profileId === w.profileId
                        ? 'bg-[#06a5a5]/8'
                        : 'hover:bg-[#222222]/2'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${
                        selectedWorkshop?.profileId === w.profileId ? 'text-[#06a5a5]' : 'text-[#222222]'
                      }`}>{w.name}</p>
                      {w.city && <p className="text-xs text-[#222222]/30 mt-0.5">{w.city}</p>}
                    </div>
                    {selectedWorkshop?.profileId === w.profileId && (
                      <span className="text-[10px] font-bold bg-[#06a5a5] text-white px-2 py-0.5 rounded-full">
                        Ausgewählt
                      </span>
                    )}
                  </button>
                ))
              )}
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

      {/* ── STEP 2: Basis ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5 animate-fade-in">

          {/* Selected workshop badge */}
          <div className="bg-[#06a5a5]/8 border border-[#06a5a5]/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-[#06a5a5] font-semibold">
              Werkstatt: {selectedWorkshop?.name}
              {selectedWorkshop?.city && <span className="font-normal text-[#06a5a5]/60"> · {selectedWorkshop.city}</span>}
            </p>
            <button onClick={() => setStep(1)} className="text-[10px] text-[#06a5a5]/60 hover:text-[#06a5a5] transition-colors">
              Ändern
            </button>
          </div>

          <div>
            <label className={labelClass}>Inserat-Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Honda CB550 Cafe Racer — The Midnight Scrambler"
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
            {isCustomMake && (
              <input value={customMake} onChange={e => setCustomMake(e.target.value)}
                placeholder="Marke eingeben…" className={`${inputClass} mt-2`} />
            )}
          </div>

          {/* Modell */}
          <div>
            <label className={labelClass}>Modell *</label>
            {isCustomMake ? (
              <input value={customModel} onChange={e => setCustomModel(e.target.value)}
                placeholder="Modell eingeben…" className={inputClass} />
            ) : (
              <div className="relative">
                <select value={modelId} onChange={e => onModelChange(e.target.value)}
                  disabled={!makeId} className={`${selectClass} disabled:opacity-40`}>
                  <option value="">{makeId ? 'Modell wählen…' : 'Zuerst Marke wählen'}</option>
                  {modelsForMake.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.yearFrom}{m.yearTo ? `–${m.yearTo}` : '+'})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Variante */}
          {selectedModel && selectedModel.variants.length > 1 && (
            <div>
              <label className={labelClass}>Variante / Hubraum *</label>
              <div className="relative">
                <select value={variantIdx} onChange={e => onVariantChange(Number(e.target.value))} className={selectClass}>
                  {selectedModel.variants.map((v, i) => (
                    <option key={i} value={i}>
                      {v.name ?? `${v.displacement} cc`}{v.power ? ` — ${v.power}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Technische Daten */}
          {selectedVariant && (
            <div className="bg-white border border-[#DDDDDD]/15 rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#717171]/70 uppercase tracking-widest mb-3">Technische Daten (auto-befüllt)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Motor', value: selectedVariant.engine },
                  { label: 'Hubraum', value: `${selectedVariant.displacement} cc` },
                  selectedVariant.power   ? { label: 'Leistung', value: selectedVariant.power }   : null,
                  selectedVariant.torque  ? { label: 'Drehmoment', value: selectedVariant.torque } : null,
                ].filter(Boolean).map(item => (
                  <div key={item!.label}>
                    <p className="text-[10px] text-[#222222]/30 uppercase tracking-widest">{item!.label}</p>
                    <p className="text-xs font-semibold text-[#222222]/70 mt-0.5">{item!.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Baujahr */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Baujahr *</label>
              {yearsForModel.length > 0 ? (
                <div className="relative">
                  <select value={year} onChange={e => setYear(e.target.value)} className={selectClass}>
                    <option value="">Jahr wählen…</option>
                    {yearsForModel.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
                </div>
              ) : (
                <input value={year} onChange={e => setYear(e.target.value)}
                  type="number" min="1920" max={new Date().getFullYear()}
                  placeholder="1974" className={inputClass} />
              )}
            </div>
            <div>{/* spacer */}</div>
          </div>

          {/* Style */}
          <div>
            <label className={labelClass}>Typ / Style *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {STYLES.map(s => (
                <button key={s.value} type="button" onClick={() => setStyle(s.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    style === s.value
                      ? 'bg-[#222222]/15 border-[#DDDDDD] text-[#717171]'
                      : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20 hover:text-[#222222]'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button onClick={() => step2Valid && setStep(3)} disabled={!step2Valid}
              className="flex items-center gap-2 bg-[#06a5a5] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Details ── */}
      {step === 3 && (
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

          <div>
            <label className={labelClass}>Umbauten & Modifikationen</label>
            <div className="flex flex-col gap-2">
              {modifications.map((mod, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={mod}
                    onChange={e => {
                      const next = [...modifications]; next[i] = e.target.value; setModifications(next)
                    }}
                    placeholder="z.B. Tiefer gelegter Rahmen (handgeschweißt)"
                    className={inputClass} />
                  <button type="button" onClick={() => setModifications(prev => prev.filter((_, idx) => idx !== i))}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#222222]/8 text-[#222222]/30 hover:text-[#222222] hover:border-[#222222]/20 transition-all">
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setModifications(prev => [...prev, ''])}
                className="flex items-center gap-2 text-xs font-semibold text-[#717171] hover:text-[#222222] transition-colors mt-1">
                <Plus size={13} /> Umbau hinzufügen
              </button>
            </div>
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
            <button onClick={() => setStep(2)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button onClick={() => setStep(4)}
              disabled={listingType === 'for_sale' && !priceOnRequest && !priceAmount}
              className="flex items-center gap-2 bg-[#06a5a5] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Fotos & Publish ── */}
      {step === 4 && (
        <div className="flex flex-col gap-6 animate-fade-in">

          <div>
            <label className={labelClass}>Medien (max. {MAX_MEDIA_COUNT})</label>
            <p className="text-xs text-[#222222]/30 mb-3">Fotos und Videos hochladen. Maximal {MAX_MEDIA_COUNT} Dateien.</p>
            <label className="block border-2 border-dashed border-[#222222]/10 hover:border-[#DDDDDD]/40 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
              <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="sr-only"
                onChange={e => handleMedia(e.target.files)} />
              <Upload size={24} className="mx-auto mb-3 text-[#222222]/20 group-hover:text-[#717171] transition-colors" />
              <p className="text-sm text-[#222222]/40 group-hover:text-[#222222]/60 transition-colors">
                Fotos oder Videos auswählen
              </p>
              <p className="text-xs text-[#222222]/20 mt-1">JPG, PNG, WebP, MP4, WebM — max. 10 MB / 100 MB</p>
            </label>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {mediaFiles.map((item, i) => (
                  <div key={i} draggable
                    onDragStart={() => { dragIdx.current = i }}
                    onDragOver={e => { e.preventDefault(); setDragOverIdx(i) }}
                    onDragLeave={() => setDragOverIdx(null)}
                    onDrop={() => handleMediaDrop(i)}
                    onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null) }}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-white border transition-all cursor-grab active:cursor-grabbing group ${
                      dragOverIdx === i ? 'border-[#06a5a5] scale-[0.97] opacity-70' : 'border-[#222222]/8'
                    }`}>
                    {item.isVideo ? (
                      <>
                        {item.thumbFile ? (
                          <img src={URL.createObjectURL(item.thumbFile)} alt={`Video-Vorschau ${i + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.preview} className="w-full h-full object-cover" muted preload="metadata" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center">
                            <Play size={14} className="text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img src={item.preview} alt={`Bild ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#06a5a5] text-white px-1.5 py-0.5 rounded-full">Cover</span>
                    )}
                    <button onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-[#222222]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
            <p className="text-xs text-[#222222]/30 uppercase tracking-widest font-semibold mb-3">Zusammenfassung</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#222222]/40">Werkstatt</span>
                <span className="text-[#06a5a5] font-medium">{selectedWorkshop?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#222222]/40">Titel</span>
                <span className="text-[#222222] font-medium text-right max-w-[60%] truncate">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#222222]/40">Bike</span>
                <span className="text-[#222222]">{submitMake} {submitModel} · {year}</span>
              </div>
              {selectedVariant && (
                <div className="flex justify-between">
                  <span className="text-[#222222]/40">Motor</span>
                  <span className="text-[#222222]">{selectedVariant.engine} · {selectedVariant.displacement} cc</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#222222]/40">Typ</span>
                <span className="text-[#222222]">{STYLES.find(s => s.value === style)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#222222]/40">Medien</span>
                <span className="text-[#222222]">{mediaFiles.length} hochgeladen</span>
              </div>
              {listingType === 'for_sale' && (
                <div className="flex justify-between">
                  <span className="text-[#222222]/40">Verkauf</span>
                  <span className="text-[#06a5a5] font-medium">
                    {priceOnRequest ? 'Preis auf Anfrage' : priceAmount ? `${Number(priceAmount).toLocaleString('de-DE')} EUR` : '—'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Publish status */}
          <div className="flex gap-3">
            {([['active', 'Sofort veröffentlichen'], ['draft', 'Als Entwurf speichern']] as const).map(([val, label]) => (
              <button key={val} type="button" onClick={() => setStatus(val)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                  status === val
                    ? 'border-[#DDDDDD] bg-[#222222]/10 text-[#717171]'
                    : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20'
                }`}
              >{label}</button>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(3)}
              className="text-sm text-[#222222]/40 hover:text-[#222222] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-[#06a5a5] text-white font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
              {loading ? 'Wird gespeichert…' : status === 'active' ? 'Jetzt veröffentlichen' : 'Entwurf speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const labelClass  = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-2'
const inputClass  = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-[#DDDDDD] transition-colors'
const selectClass = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 pr-10 text-sm text-[#222222] outline-none focus:border-[#DDDDDD] transition-colors appearance-none cursor-pointer'
