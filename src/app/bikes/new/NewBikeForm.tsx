'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ChevronRight, ChevronDown } from 'lucide-react'
import { MAKES, MODELS, getModelsByMake, getYearsForModel, type MotorcycleModel } from '@/lib/data/motorcycles'
import LocationAutocomplete, { type LocationResult } from '@/components/ui/LocationAutocomplete'
import BaseBikeAutocomplete from '@/components/ui/BaseBikeAutocomplete'
import { compressImage } from '@/lib/utils/compressImage'

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

type Step = 1 | 2 | 3

export default function NewBikeForm() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // ── Bike selection state ─────────────────────────
  const [makeId, setMakeId]       = useState('')
  const [modelId, setModelId]     = useState('')
  const [variantIdx, setVariantIdx] = useState(0)
  const [customMake, setCustomMake] = useState('')
  const [customModel, setCustomModel] = useState('')

  // ── Base bike ─────────────────────────────────────
  const [baseBike, setBaseBike] = useState<{ id: string; label: string } | null>(null)

  // ── Form fields ──────────────────────────────────
  const [title, setTitle]           = useState('')
  const [year, setYear]             = useState('')
  const [style, setStyle]           = useState('')
  const [cc, setCc]                 = useState('')
  const [mileage, setMileage]       = useState('')
  const [price, setPrice]           = useState('')
  const [city, setCity]             = useState('')
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [status, setStatus]         = useState<'active' | 'draft'>('active')

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

  // Submitted values for DB
  const submitMake  = selectedMakeName
  const submitModel = selectedModelName

  // ── Handlers ─────────────────────────────────────
  function onMakeChange(id: string) {
    setMakeId(id)
    setModelId('')
    setVariantIdx(0)
    setYear('')
    setCc('')
    setCustomMake('')
    setCustomModel('')
  }

  function onModelChange(id: string) {
    setModelId(id)
    setVariantIdx(0)
    setYear('')
    const m = modelsForMake.find(x => x.id === id)
    if (m?.variants.length === 1) {
      setCc(String(m.variants[0].displacement))
    } else {
      setCc('')
    }
  }

  function onVariantChange(idx: number) {
    setVariantIdx(idx)
    if (selectedModel) {
      setCc(String(selectedModel.variants[idx].displacement))
    }
  }

  async function handleImages(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 8 - imageFiles.length)
    const compressed = await Promise.all(newFiles.map(f => compressImage(f)))
    setImageFiles(prev => [...prev, ...compressed])
    compressed.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setImagePreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  function removeImage(i: number) {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i))
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Nicht eingeloggt.'); setLoading(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bike, error: bikeError } = await (supabase.from('bikes') as any).insert({
      seller_id:    user.id,
      base_bike_id: baseBike?.id ?? null,
      title:        title.trim(),
      make:         submitMake,
      model:        submitModel,
      year:         parseInt(year),
      style,
      cc:           cc ? parseInt(cc) : null,
      mileage_km:   mileage ? parseInt(mileage) : null,
      price:        parseFloat(price.replace(/[^0-9.]/g, '')),
      city:         city.trim() || null,
      lat:          locationLat,
      lng:          locationLng,
      description:  description.trim() || null,
      status,
      is_verified:  false,
    }).select('id').single()

    if (bikeError || !bike) {
      setError('Fehler beim Speichern. Bitte versuche es erneut.')
      setLoading(false)
      return
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${bike.id}/${i}.${ext}`
      const { data: upload } = await supabase.storage
        .from('bike-images')
        .upload(path, file, { upsert: true })
      if (upload) {
        const { data: urlData } = supabase.storage.from('bike-images').getPublicUrl(path)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('bike_images') as any).insert({
          bike_id:  bike.id,
          url:      urlData.publicUrl,
          position: i,
          is_cover: i === 0,
        })
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  const step1Valid = title && submitMake && submitModel && year && style && price

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

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* ── STEP 1: Basis ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5 animate-fade-in">

          <div>
            <label className={labelClass}>Inserat-Titel *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Honda CB550 Cafe Racer — The Midnight Scrambler"
              className={inputClass} />
            <p className="text-xs text-[#222222]/25 mt-1">Ein prägnanter Titel erhöht die Aufmerksamkeit.</p>
          </div>

          {/* Basisbike */}
          <div>
            <label className={labelClass}>Basisbike <span className="normal-case font-normal text-[#222222]/25">(Spendermodell)</span></label>
            <BaseBikeAutocomplete
              value={baseBike}
              onChange={setBaseBike}
              className={inputClass}
            />
            <p className="text-xs text-[#222222]/25 mt-1">Das originale Motorrad, das als Grundlage für den Custom Build diente.</p>
          </div>

          {/* Marke */}
          <div>
            <label className={labelClass}>Marke *</label>
            <div className="relative">
              <select
                value={makeId}
                onChange={e => onMakeChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Marke wählen…</option>
                {MAKES.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
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
                <select
                  value={modelId}
                  onChange={e => onModelChange(e.target.value)}
                  disabled={!makeId}
                  className={`${selectClass} disabled:opacity-40`}
                >
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

          {/* Variante — nur wenn Modell mehrere Hubraumvarianten hat */}
          {selectedModel && selectedModel.variants.length > 1 && (
            <div>
              <label className={labelClass}>Variante / Hubraum *</label>
              <div className="relative">
                <select
                  value={variantIdx}
                  onChange={e => onVariantChange(Number(e.target.value))}
                  className={selectClass}
                >
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

          {/* Technische Daten — auto-befüllt, read-only wenn aus Datenbank */}
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
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Jahr wählen…</option>
                    {yearsForModel.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
                </div>
              ) : (
                <input value={year} onChange={e => setYear(e.target.value)}
                  type="number" min="1920" max={new Date().getFullYear()}
                  placeholder="1974" className={inputClass} />
              )}
            </div>
            <div>
              <label className={labelClass}>Preis (€) *</label>
              <input value={price} onChange={e => setPrice(e.target.value)}
                type="number" min="0" placeholder="14500" className={inputClass} />
            </div>
          </div>

          {/* Typ / Style */}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hubraum (cc)</label>
              <input value={cc} onChange={e => setCc(e.target.value)}
                type="number" min="0" placeholder="550" className={inputClass} />
              {selectedVariant && (
                <p className="text-xs text-[#222222]/25 mt-1">Auto-befüllt · anpassbar</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Kilometerstand</label>
              <input value={mileage} onChange={e => setMileage(e.target.value)}
                type="number" min="0" placeholder="12000" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Standort / Stadt</label>
            <LocationAutocomplete
              value={city}
              onChange={(result: LocationResult | null) => {
                setCity(result?.city ?? '')
                setLocationLat(result?.lat ?? null)
                setLocationLng(result?.lng ?? null)
              }}
              className={inputClass}
            />
            {locationLat && (
              <p className="text-xs text-[#717171]/60 mt-1 flex items-center gap-1">
                ✓ Koordinaten gespeichert · {locationLat.toFixed(4)}, {locationLng?.toFixed(4)}
              </p>
            )}
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
            <label className="block border-2 border-dashed border-[#222222]/10 hover:border-[#DDDDDD]/40 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
              <input type="file" accept="image/*" multiple className="sr-only"
                onChange={e => handleImages(e.target.files)} />
              <Upload size={24} className="mx-auto mb-3 text-[#222222]/20 group-hover:text-[#717171] transition-colors" />
              <p className="text-sm text-[#222222]/40 group-hover:text-[#222222]/60 transition-colors">
                Fotos auswählen oder hierher ziehen
              </p>
              <p className="text-xs text-[#222222]/20 mt-1">JPG, PNG, WebP — max. 10 MB pro Bild</p>
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[#222222]/8 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#06a5a5] text-white px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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
                <span className="text-[#222222]/40">Titel</span>
                <span className="text-[#222222] font-medium text-right max-w-[60%] truncate">{title}</span>
              </div>
              {baseBike && (
                <div className="flex justify-between">
                  <span className="text-[#222222]/40">Basisbike</span>
                  <span className="text-[#222222]">{baseBike.label}</span>
                </div>
              )}
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
                <span className="text-[#222222]/40">Preis</span>
                <span className="text-[#717171] font-semibold">€ {parseFloat(price || '0').toLocaleString('de-DE')}</span>
              </div>
              {city && (
                <div className="flex justify-between">
                  <span className="text-[#222222]/40">Standort</span>
                  <span className="text-[#222222]">{city}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#222222]/40">Fotos</span>
                <span className="text-[#222222]">{imageFiles.length} hochgeladen</span>
              </div>
            </div>
          </div>

          {/* Publish status */}
          <div className="flex gap-3">
            {([['active', 'Sofort veröffentlichen'], ['draft', 'Als Entwurf speichern']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatus(val)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                  status === val
                    ? 'border-[#DDDDDD] bg-[#222222]/10 text-[#717171]'
                    : 'border-[#222222]/8 text-[#222222]/40 hover:border-[#222222]/20'
                }`}
              >{label}</button>
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
