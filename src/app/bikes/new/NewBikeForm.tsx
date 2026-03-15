'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, ChevronRight } from 'lucide-react'

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

const CURRENT_YEAR = new Date().getFullYear()

type Step = 1 | 2 | 3

export default function NewBikeForm() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Form fields
  const [title, setTitle] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [style, setStyle] = useState('')
  const [cc, setCc] = useState('')
  const [mileage, setMileage] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'draft'>('active')

  function handleImages(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 8 - imageFiles.length)
    setImageFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(file => {
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

    // Insert bike
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bike, error: bikeError } = await (supabase.from('bikes') as any).insert({
      seller_id:   user.id,
      title:       title.trim(),
      make:        make.trim(),
      model:       model.trim(),
      year:        parseInt(year),
      style,
      cc:          cc ? parseInt(cc) : null,
      mileage_km:  mileage ? parseInt(mileage) : null,
      price:       parseFloat(price.replace(/[^0-9.]/g, '')),
      city:        city.trim() || null,
      description: description.trim() || null,
      status,
      is_verified: false,
    }).select('id').single()

    if (bikeError || !bike) {
      setError('Fehler beim Speichern. Bitte versuche es erneut.')
      setLoading(false)
      return
    }

    // Upload images
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

  const step1Valid = title && make && model && year && style && price
  const step2Valid = true // description & city optional

  // ── Step indicator ──────────────────────────────────────
  const steps = ['Basis', 'Details', 'Fotos & Veröffentlichen']

  return (
    <div className="max-w-2xl mx-auto">

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
              step === i + 1 ? 'text-[#2AABAB]' : step > i + 1 ? 'text-[#F0EDE4]/50' : 'text-[#F0EDE4]/20'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all ${
                step === i + 1 ? 'bg-[#2AABAB] text-[#141414]' :
                step > i + 1  ? 'bg-[#F0EDE4]/15 text-[#F0EDE4]/50' :
                                 'bg-[#F0EDE4]/6 text-[#F0EDE4]/20'
              }`}>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-colors ${step > i + 1 ? 'bg-[#F0EDE4]/20' : 'bg-[#F0EDE4]/6'}`} />
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
            <p className="text-xs text-[#F0EDE4]/25 mt-1">Ein prägnanter Titel erhöht die Aufmerksamkeit.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marke *</label>
              <input value={make} onChange={e => setMake(e.target.value)}
                placeholder="Honda, BMW, Triumph…" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Modell *</label>
              <input value={model} onChange={e => setModel(e.target.value)}
                placeholder="CB550, R80, T100…" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Baujahr *</label>
              <input value={year} onChange={e => setYear(e.target.value)}
                type="number" min="1920" max={CURRENT_YEAR}
                placeholder="1974" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Preis (€) *</label>
              <input value={price} onChange={e => setPrice(e.target.value)}
                type="number" min="0" placeholder="14500" className={inputClass} />
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
                      ? 'bg-[#2AABAB]/15 border-[#2AABAB] text-[#2AABAB]'
                      : 'border-[#F0EDE4]/8 text-[#F0EDE4]/40 hover:border-[#F0EDE4]/20 hover:text-[#F0EDE4]'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
              className="flex items-center gap-2 bg-[#2AABAB] text-[#141414] font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#3DBFBF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
            </div>
            <div>
              <label className={labelClass}>Kilometerstand</label>
              <input value={mileage} onChange={e => setMileage(e.target.value)}
                type="number" min="0" placeholder="12000" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Standort / Stadt</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder="Berlin, München, Hamburg…" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Beschreibung</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={5} placeholder="Erzähl die Geschichte des Bikes — Umbauten, besondere Parts, Zustand…"
              className={`${inputClass} resize-none leading-relaxed`} />
            <p className="text-xs text-[#F0EDE4]/25 mt-1">{description.length} / 2000 Zeichen</p>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)}
              className="text-sm text-[#F0EDE4]/40 hover:text-[#F0EDE4] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button
              onClick={() => step2Valid && setStep(3)}
              className="flex items-center gap-2 bg-[#2AABAB] text-[#141414] font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#3DBFBF] transition-all"
            >
              Weiter <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Fotos & Publish ── */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-fade-in">

          {/* Image upload */}
          <div>
            <label className={labelClass}>Fotos (max. 8)</label>
            <label className="block border-2 border-dashed border-[#F0EDE4]/10 hover:border-[#2AABAB]/40 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
              <input type="file" accept="image/*" multiple className="sr-only"
                onChange={e => handleImages(e.target.files)} />
              <Upload size={24} className="mx-auto mb-3 text-[#F0EDE4]/20 group-hover:text-[#2AABAB] transition-colors" />
              <p className="text-sm text-[#F0EDE4]/40 group-hover:text-[#F0EDE4]/60 transition-colors">
                Fotos auswählen oder hierher ziehen
              </p>
              <p className="text-xs text-[#F0EDE4]/20 mt-1">JPG, PNG, WebP — max. 10 MB pro Bild</p>
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#1C1C1C] border border-[#F0EDE4]/8 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#2AABAB] text-[#141414] px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-[#141414]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-[#F0EDE4]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-[#1C1C1C] border border-[#F0EDE4]/6 rounded-2xl p-5">
            <p className="text-xs text-[#F0EDE4]/30 uppercase tracking-widest font-semibold mb-3">Zusammenfassung</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#F0EDE4]/40">Titel</span>
                <span className="text-[#F0EDE4] font-medium text-right max-w-[60%] truncate">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F0EDE4]/40">Bike</span>
                <span className="text-[#F0EDE4]">{make} {model} · {year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F0EDE4]/40">Typ</span>
                <span className="text-[#F0EDE4]">{STYLES.find(s => s.value === style)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#F0EDE4]/40">Preis</span>
                <span className="text-[#2AABAB] font-semibold">€ {parseFloat(price || '0').toLocaleString('de-DE')}</span>
              </div>
              {city && <div className="flex justify-between">
                <span className="text-[#F0EDE4]/40">Standort</span>
                <span className="text-[#F0EDE4]">{city}</span>
              </div>}
              <div className="flex justify-between">
                <span className="text-[#F0EDE4]/40">Fotos</span>
                <span className="text-[#F0EDE4]">{imageFiles.length} hochgeladen</span>
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
                    ? 'border-[#2AABAB] bg-[#2AABAB]/10 text-[#2AABAB]'
                    : 'border-[#F0EDE4]/8 text-[#F0EDE4]/40 hover:border-[#F0EDE4]/20'
                }`}
              >{label}</button>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)}
              className="text-sm text-[#F0EDE4]/40 hover:text-[#F0EDE4] transition-colors px-4 py-3">
              ← Zurück
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#2AABAB] text-[#141414] font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#3DBFBF] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {loading ? 'Wird gespeichert…' : status === 'active' ? 'Jetzt veröffentlichen' : 'Entwurf speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const labelClass = 'block text-xs font-semibold text-[#F0EDE4]/40 uppercase tracking-widest mb-2'
const inputClass  = 'w-full bg-[#1C1C1C] border border-[#F0EDE4]/10 rounded-xl px-4 py-3 text-sm text-[#F0EDE4] placeholder:text-[#F0EDE4]/20 outline-none focus:border-[#2AABAB] transition-colors'
