'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Camera, Check, Bike } from 'lucide-react'

type BaseBike = { make: string; model: string; year_from: number; year_to: number | null }

interface Props {
  userId: string
  makes: string[]
  baseBikes: BaseBike[]
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i)

export default function RiderBikeForm({ userId, makes, baseBikes }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step,     setStep]     = useState<1 | 2 | 3 | 4>(1)
  const [make,     setMake]     = useState('')
  const [model,    setModel]    = useState('')
  const [year,     setYear]     = useState<number | null>(null)
  const [photo,    setPhoto]    = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Models for selected make
  const modelsForMake = [...new Set(
    baseBikes.filter(b => b.make === make).map(b => b.model)
  )].sort()

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!make || !model || !year) return
    setSaving(true); setError(null)

    try {
      // 1. Insert bike
      const title = `${make} ${model} ${year}`
      const { data: bike, error: bikeErr } = await (supabase.from('bikes') as any)
        .insert({
          seller_id: userId,
          title,
          make,
          model,
          year,
          price: 0,
          status: 'active',
        })
        .select('id')
        .maybeSingle()

      if (bikeErr) throw new Error(bikeErr.message)

      // 2. Upload photo if provided
      if (photo && bike?.id) {
        const ext  = photo.name.split('.').pop()
        const path = `${bike.id}/cover.${ext}`
        const { error: upErr } = await supabase.storage
          .from('bike-images')
          .upload(path, photo, { upsert: true, contentType: photo.type })

        if (upErr) {
          console.error('Storage upload error:', upErr)
          throw new Error(upErr.message)
        } else {
          const { data: { publicUrl } } = supabase.storage.from('bike-images').getPublicUrl(path)
          const { error: imgErr } = await (supabase.from('bike_images') as any).insert({
            bike_id:  bike.id,
            url:      publicUrl,
            is_cover: true,
          })
          if (imgErr) console.error('bike_images insert error:', imgErr)
        }
      }

      router.push('/dashboard/mein-bike')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  const stepLabel = ['Marke', 'Modell', 'Baujahr', 'Foto']

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabel.map((label, i) => {
          const n = i + 1
          const done    = step > n
          const active  = step === n
          return (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done   ? 'bg-[#06a5a5] text-white'
                  : active ? 'bg-[#222222] text-white'
                  : 'bg-[#222222]/8 text-[#222222]/30'
                }`}>
                  {done ? <Check size={13} /> : n}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-[#222222]' : 'text-[#222222]/30'}`}>
                  {label}
                </span>
              </div>
              {i < stepLabel.length - 1 && (
                <div className={`flex-1 h-px mb-4 ${step > n ? 'bg-[#06a5a5]' : 'bg-[#222222]/8'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">

        {/* ── Step 1: Marke ── */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-bold text-[#222222] mb-1">Welche Marke?</h2>
            <p className="text-xs text-[#222222]/35 mb-5">Wähle die Marke deines Bikes</p>
            <div className="relative">
              <select
                value={make}
                onChange={e => { setMake(e.target.value); setModel('') }}
                className="w-full border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] outline-none focus:border-[#222222]/30 transition-colors appearance-none bg-white"
              >
                <option value="" disabled>Marke wählen…</option>
                {makes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronRight size={13} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#222222]/30 pointer-events-none" />
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setStep(2)}
                disabled={!make}
                className="flex items-center gap-2 bg-[#222222] text-white text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-30 hover:bg-[#444] transition-all"
              >
                Weiter <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Modell ── */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-bold text-[#222222] mb-1">Welches Modell?</h2>
            <p className="text-xs text-[#222222]/35 mb-5">Modell von <span className="font-semibold text-[#222222]">{make}</span></p>
            <div className="flex flex-col gap-2">
              {modelsForMake.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-1">
                  {modelsForMake.map(m => (
                    <button
                      key={m}
                      onClick={() => { setModel(m); setStep(3) }}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        model === m
                          ? 'border-[#222222] bg-[#222222] text-white'
                          : 'border-[#222222]/10 text-[#222222]/70 hover:border-[#222222]/30 hover:text-[#222222]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
              <input
                value={modelsForMake.includes(model) ? '' : model}
                placeholder={modelsForMake.length ? 'Anderes Modell…' : 'Modell eingeben…'}
                className="border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none focus:border-[#222222]/30 transition-colors"
                onChange={e => setModel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && model) setStep(3) }}
              />
            </div>
            <div className="flex justify-between mt-5">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-[#222222]/40 hover:text-[#222222] transition-colors">
                <ChevronLeft size={14} /> Zurück
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!model}
                className="flex items-center gap-2 bg-[#222222] text-white text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-30 hover:bg-[#444] transition-all"
              >
                Weiter <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Baujahr ── */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-bold text-[#222222] mb-1">Baujahr?</h2>
            <p className="text-xs text-[#222222]/35 mb-5">
              <span className="font-semibold text-[#222222]">{make} {model}</span>
            </p>
            <div className="relative">
              <select
                value={year ?? ''}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] outline-none focus:border-[#222222]/30 transition-colors appearance-none bg-white"
              >
                <option value="" disabled>Jahr wählen…</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronRight size={13} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[#222222]/30 pointer-events-none" />
            </div>
            <div className="flex justify-between mt-5">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-[#222222]/40 hover:text-[#222222] transition-colors">
                <ChevronLeft size={14} /> Zurück
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!year}
                className="flex items-center gap-2 bg-[#222222] text-white text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-30 hover:bg-[#444] transition-all"
              >
                Weiter <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Foto ── */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-bold text-[#222222] mb-1">Foto hinzufügen</h2>
            <p className="text-xs text-[#222222]/35 mb-5">
              <span className="font-semibold text-[#222222]">{make} {model} · {year}</span>
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                preview ? 'border-transparent' : 'border-[#222222]/10 hover:border-[#222222]/25'
              }`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Vorschau" className="w-full h-full object-cover rounded-xl" />
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

            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

            <div className="flex justify-between mt-5">
              <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm text-[#222222]/40 hover:text-[#222222] transition-colors">
                <ChevronLeft size={14} /> Zurück
              </button>
              <div className="flex items-center gap-3">
                {!photo && (
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="text-sm text-[#222222]/35 hover:text-[#222222] transition-colors disabled:opacity-50"
                  >
                    Ohne Foto speichern
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-50 hover:bg-[#058f8f] transition-all"
                >
                  {saving ? 'Wird gespeichert…' : (
                    <><Bike size={14} /> Bike speichern</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
