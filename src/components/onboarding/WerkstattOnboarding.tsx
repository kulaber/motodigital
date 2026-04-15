'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ImagePlus, Loader2, MapPin, Check, Trash2, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveOnboardingStep, completeOnboarding } from '@/lib/onboarding'
import { OnboardingProgressBar } from './OnboardingProgressBar'

type MapboxFeature = {
  id: string
  place_name: string
  center: [number, number]
}

function AddressAutocomplete({
  value,
  onChange,
}: {
  value: { address: string; lat: number | null; lng: number | null }
  onChange: (v: { address: string; lat: number | null; lng: number | null }) => void
}) {
  const [query, setQuery] = useState(value.address)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  function handleInput(val: string) {
    setQuery(val)
    onChange({ address: val, lat: null, lng: null })
    if (debounce.current) clearTimeout(debounce.current)
    if (!val.trim() || !token) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&language=de&country=de,at,ch&types=address,place&limit=5`
        )
        const json = await res.json()
        setSuggestions(json.features ?? [])
        setOpen(true)
      } catch { setSuggestions([]) }
    }, 280)
  }

  function select(f: MapboxFeature) {
    setQuery(f.place_name)
    setSuggestions([])
    setOpen(false)
    onChange({ address: f.place_name, lat: f.center[1], lng: f.center[0] })
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="z.B. Hauptstraße 1, 68766 Hockenheim"
        className="w-full h-12 bg-white/[0.05] border border-white/[0.08]
                   rounded-xl px-4 text-sm text-[#F0EDE4]
                   placeholder:text-white/20 outline-none
                   focus:border-[#2AABAB]/40 transition-colors"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(f => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={() => select(f)}
                className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] transition-colors flex items-start gap-2.5"
              >
                <MapPin size={12} className="text-[#2AABAB] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{f.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.lat && value.lng && (
        <p className="text-[10px] text-[#2AABAB] mt-1.5 flex items-center gap-1">
          <MapPin size={9} /> Koordinaten gespeichert
        </p>
      )}
    </div>
  )
}

interface Werkstatt {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  logo_url: string | null
  cover_image_url: string | null
  services: string[]
}

interface Profile {
  id: string
  username: string
  role: string
  onboarding_step: number
  address?: string | null
  lat?: number | null
  lng?: number | null
  bio?: string | null
  bio_long?: string | null
}

export function WerkstattOnboarding({
  profile: _profile,
  werkstatt,
  confirmed,
  initialStep,
}: {
  profile: Profile
  werkstatt: Werkstatt | null
  confirmed: boolean
  initialStep: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]                     = useState(initialStep === 0 ? 0 : initialStep)
  const [saving, setSaving]                 = useState(false)
  const [addressData, setAddressData]       = useState({ address: werkstatt?.address ?? _profile.address ?? '', lat: _profile.lat ?? null, lng: _profile.lng ?? null })
  const [description, setDescription]       = useState(werkstatt?.description ?? _profile.bio_long ?? _profile.bio ?? '')
  const [logoFile, setLogoFile]             = useState<File | null>(null)
  const [logoPreview, setLogoPreview]       = useState(werkstatt?.logo_url ?? '')
  const [coverFile, setCoverFile]           = useState<File | null>(null)
  const [coverPreview, setCoverPreview]     = useState(werkstatt?.cover_image_url ?? '')

  const TOTAL = 2

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function next(saveData?: () => Promise<void>) {
    setSaving(true)
    try {
      await saveData?.()
      const nextStep = step + 1
      await saveOnboardingStep(nextStep)
      setStep(nextStep)
    } finally {
      setSaving(false)
    }
  }

  async function skip() {
    const nextStep = step + 1
    await saveOnboardingStep(nextStep)
    setStep(nextStep)
  }

  async function finish() {
    setSaving(true)
    await completeOnboarding()
    router.push('/dashboard')
    router.refresh()
  }

  async function saveStep1() {
    if (!werkstatt?.id) return
    await (supabase.from('workshops') as any).update({
      address: addressData.address.trim() || null,
      description: description.trim() || null,
    }).eq('id', werkstatt.id)
    // Also save address + coordinates to profiles so the map works
    await (supabase.from('profiles') as any).update({
      address: addressData.address.trim() || null,
      lat: addressData.lat,
      lng: addressData.lng,
    }).eq('id', _profile.id)
  }

  async function saveStep2() {
    if (!werkstatt?.id) return

    const updates: Record<string, string> = {}

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${werkstatt.id}/logo.${ext}`
      const { error } = await supabase.storage
        .from('builder-media')
        .upload(path, logoFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('builder-media').getPublicUrl(path)
        updates.logo_url = data.publicUrl
      }
    }

    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const path = `${werkstatt.id}/cover.${ext}`
      const { error } = await supabase.storage
        .from('builder-media')
        .upload(path, coverFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('builder-media').getPublicUrl(path)
        updates.cover_image_url = data.publicUrl
      }
    }

    if (Object.keys(updates).length > 0) {
      await (supabase.from('workshops') as any).update(updates).eq('id', werkstatt.id)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden px-5 max-w-md mx-auto w-full">

      {step >= 1 && step <= TOTAL && (
        <div className="pt-10 pb-6">
          <OnboardingProgressBar
            currentStep={step}
            totalSteps={TOTAL}
            accentColor="#2AABAB"
          />
        </div>
      )}

      {/* SCHRITT 0: Willkommen Werkstatt */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-7
                        text-center py-16">
          {confirmed && (
            <div className="px-3 py-1.5 rounded-full text-xs font-medium
                            bg-[#2AABAB]/10 border border-[#2AABAB]/25 text-[#2AABAB]">
              E-Mail bestätigt
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl bg-[#2AABAB]/10 border border-[#2AABAB]/20 flex items-center justify-center">
            <Wrench size={28} className="text-[#2AABAB]" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F0EDE4] leading-tight">
              Willkommen bei<br />
              <span className="text-[#2AABAB]">MotoDigital</span>
            </h1>
            <p className="text-sm text-white/45 max-w-[280px] mx-auto leading-relaxed">
              Dein Werkstatt-Profil ist fast bereit — dann wirst du von Ridern im DACH-Raum gefunden.
            </p>
          </div>
          <div className="flex gap-3 w-full max-w-[280px] justify-center">
            <span className="px-3 py-1 rounded-full text-[10px] bg-white/[0.04]
                             border border-white/[0.08] text-white/30">
              ~3 Minuten
            </span>
          </div>
          <button
            onClick={() => next()}
            className="w-full max-w-[280px] h-12 rounded-xl bg-[#2AABAB] text-white
                       font-semibold text-sm flex items-center justify-center gap-2
                       active:scale-[0.97] transition-transform"
          >
            Profil vervollständigen
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SCHRITT 1: Basisdaten */}
      {step === 1 && (
        <div className="flex flex-col gap-6 flex-1 pb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Werkstatt-Details
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Vollständige Profile werden 3x öfter gefunden.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Werkstattname
            </label>
            <div className="w-full h-12 bg-white/[0.03] border border-white/[0.06]
                            rounded-xl px-4 flex items-center text-sm text-white/50">
              {werkstatt?.name ?? '—'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Adresse <span className="text-[#2AABAB]">*</span>
            </label>
            <AddressAutocomplete value={addressData} onChange={setAddressData} />
            {addressData.address && !addressData.lat && (
              <p className="text-[10px] text-amber-400/70">
                Bitte wähle eine Adresse aus den Vorschlägen.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Was macht eure Werkstatt besonders?"
              rows={3}
              className="w-full bg-white/[0.05] border border-white/[0.08]
                         rounded-xl px-4 py-3 text-sm text-[#F0EDE4]
                         placeholder:text-white/20 outline-none resize-none
                         focus:border-[#2AABAB]/40 transition-colors"
            />
          </div>

          <div className="mt-auto">
            <button
              onClick={() => next(saveStep1)}
              disabled={saving || !addressData.lat || !addressData.lng}
              className="w-full h-12 rounded-xl bg-[#2AABAB] text-white
                         font-semibold text-sm flex items-center justify-center gap-2
                         disabled:opacity-50 active:scale-[0.97] transition-all"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Weiter</span><ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 2: Logo & Titelbild */}
      {step === 2 && (
        <div className="flex flex-col gap-6 flex-1 pb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Logo und Titelbild hochladen
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Werkstätten mit Logo werden 4x häufiger angeklickt.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0
                           border-2 border-dashed border-[#2AABAB]/30
                           bg-[#2AABAB]/5 flex items-center justify-center
                           hover:bg-[#2AABAB]/8 transition-colors"
              >
                {logoPreview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                  : <ImagePlus className="w-6 h-6 text-[#2AABAB]" />
                }
              </button>
              <div className="flex flex-col gap-1">
                {logoPreview ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#2AABAB] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ausgewählt
                    </span>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      Ändern
                    </button>
                    <button
                      onClick={() => { setLogoFile(null); setLogoPreview('') }}
                      className="text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Löschen
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-white/30">Logo hochladen</span>
                )}
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                   onChange={handleLogoChange} />
          </div>

          {/* Titelbild Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Titelbild
            </label>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full aspect-[16/7] rounded-xl overflow-hidden
                         border-2 border-dashed border-[#2AABAB]/30
                         bg-[#2AABAB]/5 flex items-center justify-center
                         hover:bg-[#2AABAB]/8 transition-colors"
            >
              {coverPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="w-6 h-6 text-[#2AABAB]" />
                    <span className="text-xs text-white/30">Titelbild hochladen</span>
                  </div>
              }
            </button>
            {coverPreview && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#2AABAB] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Titelbild ausgewählt
                </span>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Ändern
                </button>
                <button
                  onClick={() => { setCoverFile(null); setCoverPreview('') }}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Löschen
                </button>
              </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                   onChange={handleCoverChange} />
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => next(saveStep2)}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-[#2AABAB] text-white
                         font-semibold text-sm flex items-center justify-center gap-2
                         disabled:opacity-50 active:scale-[0.97] transition-all"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Weiter</span><ChevronRight className="w-4 h-4" /></>
              }
            </button>
            <button onClick={skip} className="w-full h-10 text-white/25 text-sm">
              Später hinzufügen
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 3+: Fertig → Dashboard + Founding Partner Upsell */}
      {step >= 3 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-7
                        text-center py-16">
          <div className="text-7xl leading-none">✅</div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Profil ist live.
            </h1>
            <p className="text-sm text-white/45 max-w-[280px] mx-auto leading-relaxed">
              {werkstatt?.name ?? 'Deine Werkstatt'} ist jetzt für Rider
              im DACH-Raum sichtbar. Anfragen kommen direkt ins Dashboard.
            </p>
          </div>

          {/* Founding Partner Upsell */}
          <div className="w-full max-w-[320px] border border-[#2AABAB]/25 rounded-2xl p-5
                          bg-[#2AABAB]/5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2AABAB] mb-2">
              Founding Partner
            </p>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Logo, Galerie, Top-Platzierung und exklusives Founding Partner Badge — nur 10 Plätze, €39/Mo.
            </p>
            <button
              onClick={async () => {
                setSaving(true)
                try {
                  const res = await fetch('/api/checkout', { method: 'POST' })
                  const data = await res.json()
                  if (res.ok && data.url) {
                    await completeOnboarding()
                    window.location.href = data.url
                    return
                  }
                } catch { /* ignore — user can upgrade later */ }
                setSaving(false)
              }}
              disabled={saving}
              className="w-full h-10 rounded-xl bg-[#2AABAB] text-white
                         font-semibold text-sm flex items-center justify-center gap-2
                         disabled:opacity-50 active:scale-[0.97] transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Jetzt Founding Partner werden'}
            </button>
          </div>

          <button
            onClick={async () => {
              await completeOnboarding()
              router.push('/bikes/new')
            }}
            className="w-full max-w-[280px] h-12 rounded-xl bg-white/[0.05]
                       border border-white/[0.07]
                       text-white/50 text-sm font-medium flex items-center justify-center
                       active:scale-[0.97] transition-all"
          >
            Custom Bike hinzufügen
          </button>
        </div>
      )}

    </div>
  )
}
