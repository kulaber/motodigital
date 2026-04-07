'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ImagePlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveOnboardingStep, completeOnboarding } from '@/lib/onboarding'
import { OnboardingProgressBar } from './OnboardingProgressBar'

const SPECIALIZATIONS = [
  'Cafe Racer', 'Scrambler', 'Bobber', 'Tracker',
  'Chopper', 'Restauration', 'Lackierung', 'Elektrik',
  'BMW Spezialist', 'Honda Spezialist', 'Triumph Spezialist', 'Harley Spezialist',
]

interface Werkstatt {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  logo_url: string | null
  services: string[]
}

interface Profile {
  id: string
  username: string
  role: string
  onboarding_step: number
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

  const [step, setStep]                     = useState(initialStep === 0 ? 0 : initialStep)
  const [saving, setSaving]                 = useState(false)
  const [address, setAddress]               = useState(werkstatt?.address ?? '')
  const [description, setDescription]       = useState(werkstatt?.description ?? '')
  const [selectedServices, setSelectedServices] = useState<string[]>(werkstatt?.services ?? [])
  const [logoFile, setLogoFile]             = useState<File | null>(null)
  const [logoPreview, setLogoPreview]       = useState(werkstatt?.logo_url ?? '')

  const TOTAL = 4

  function toggleService(s: string) {
    setSelectedServices(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
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
      address: address.trim() || null,
      description: description.trim() || null,
    }).eq('id', werkstatt.id)
  }

  async function saveStep2() {
    if (!werkstatt?.id) return
    await (supabase.from('workshops') as any).update({
      services: selectedServices,
    }).eq('id', werkstatt.id)
  }

  async function saveStep3() {
    if (!werkstatt?.id) return

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${werkstatt.id}/logo.${ext}`
      const { error } = await supabase.storage
        .from('builder-media')
        .upload(path, logoFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('builder-media').getPublicUrl(path)
        await (supabase.from('workshops') as any).update({ logo_url: data.publicUrl }).eq('id', werkstatt.id)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] px-5 max-w-md mx-auto w-full">

      {step >= 1 && step <= TOTAL && (
        <div className="pt-10 pb-6">
          <OnboardingProgressBar
            currentStep={step}
            totalSteps={TOTAL}
            accentColor="#E8A829"
          />
        </div>
      )}

      {/* SCHRITT 0: Willkommen Werkstatt */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-7
                        text-center py-16">
          {confirmed && (
            <div className="px-3 py-1.5 rounded-full text-xs font-medium
                            bg-[#E8A829]/10 border border-[#E8A829]/25 text-[#E8A829]">
              E-Mail bestätigt
            </div>
          )}
          <div className="text-7xl leading-none">🏭</div>
          <div className="flex flex-col gap-3">
            <h1 className="font-['Bebas_Neue'] text-[clamp(40px,12vw,60px)]
                           tracking-wide text-[#F0EDE4] leading-none">
              WILLKOMMEN,<br />
              <span className="text-[#E8A829]">
                {werkstatt?.name ?? 'WERKSTATT'}.
              </span>
            </h1>
            <p className="text-sm text-white/45 max-w-[280px] mx-auto leading-relaxed">
              Dein Werkstatt-Profil ist fast bereit.
              4 kurze Schritte — dann wirst du von Ridern im DACH-Raum gefunden.
            </p>
          </div>
          <div className="flex gap-3 w-full max-w-[280px] justify-center">
            <span className="px-3 py-1 rounded-full text-[10px] bg-white/[0.04]
                             border border-white/[0.08] text-white/30">
              ~3 Minuten
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] bg-white/[0.04]
                             border border-white/[0.08] text-white/30">
              4 Schritte
            </span>
          </div>
          <button
            onClick={() => next()}
            className="w-full max-w-[280px] h-12 rounded-xl bg-[#E8A829] text-[#111111]
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
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-wide text-[#F0EDE4]">
              WERKSTATT-DETAILS
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
              Adresse
            </label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="z.B. Hauptstraße 1, 68766 Hockenheim"
              className="w-full h-12 bg-white/[0.05] border border-white/[0.08]
                         rounded-xl px-4 text-sm text-[#F0EDE4]
                         placeholder:text-white/20 outline-none
                         focus:border-[#E8A829]/40 transition-colors"
            />
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
                         focus:border-[#E8A829]/40 transition-colors"
            />
          </div>

          <div className="mt-auto">
            <button
              onClick={() => next(saveStep1)}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-[#E8A829] text-[#111111]
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

      {/* SCHRITT 2: Spezialisierungen */}
      {step === 2 && (
        <div className="flex flex-col gap-6 flex-1 pb-10">
          <div>
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-wide text-[#F0EDE4]">
              EURE STÄRKEN.
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Rider suchen nach Spezialisten. Mehrfachauswahl möglich.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SPECIALIZATIONS.map(spez => {
              const sel = selectedServices.includes(spez)
              return (
                <button
                  key={spez}
                  onClick={() => toggleService(spez)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium
                              border transition-all active:scale-[0.97]
                              ${sel
                                ? 'bg-[#E8A829]/12 border-[#E8A829]/40 text-[#E8A829]'
                                : 'bg-white/[0.04] border-white/[0.08] text-white/45'
                              }`}
                >
                  {spez}
                </button>
              )
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => next(saveStep2)}
              disabled={saving || selectedServices.length === 0}
              className="w-full h-12 rounded-xl bg-[#E8A829] text-[#111111]
                         font-semibold text-sm flex items-center justify-center gap-2
                         disabled:opacity-40 active:scale-[0.97] transition-all"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Weiter</span><ChevronRight className="w-4 h-4" /></>
              }
            </button>
            <button onClick={skip} className="w-full h-10 text-white/25 text-sm">
              Überspringen
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 3: Logo */}
      {step === 3 && (
        <div className="flex flex-col gap-6 flex-1 pb-10">
          <div>
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-wide text-[#F0EDE4]">
              EUER LOGO.
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Werkstätten mit Logo werden 4x häufiger angeklickt.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-24 h-24 rounded-xl overflow-hidden
                         border-2 border-dashed border-[#E8A829]/30
                         bg-[#E8A829]/5 flex items-center justify-center
                         hover:bg-[#E8A829]/8 transition-colors"
            >
              {logoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                : <ImagePlus className="w-7 h-7 text-[#E8A829]" />
              }
            </button>
            <span className="text-xs text-white/30">Logo hochladen</span>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                   onChange={handleFileChange} />
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => next(saveStep3)}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-[#E8A829] text-[#111111]
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

      {/* SCHRITT 4: Ersten Build hochladen */}
      {step === 4 && (
        <div className="flex flex-col gap-7 flex-1 pb-10">
          <div>
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-wide text-[#F0EDE4]">
              ERSTEN BUILD ZEIGEN.
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Werkstätten mit Builds werden sofort in der Suche angezeigt.
            </p>
          </div>

          <button
            onClick={() => {
              saveOnboardingStep(5)
              router.push('/bikes/new?onboarding=true')
            }}
            className="w-full h-48 rounded-2xl border-2 border-dashed
                       border-[#E8A829]/20 bg-[#E8A829]/4
                       flex flex-col items-center justify-center gap-4
                       active:bg-[#E8A829]/8 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-[#E8A829]
                            flex items-center justify-center text-3xl">
              🏍
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-[#E8A829]">
                Build hochladen
              </span>
              <span className="text-xs text-white/30">
                Fotos, Modell, Beschreibung
              </span>
            </div>
          </button>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={finish}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-white/[0.05]
                         border border-white/[0.07]
                         text-white/50 text-sm font-medium
                         disabled:opacity-50 active:scale-[0.97] transition-all"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : 'Später — erst ins Dashboard'
              }
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 5+: Fertig → Dashboard */}
      {step >= 5 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-7
                        text-center py-16">
          <div className="text-7xl leading-none">✅</div>
          <div className="flex flex-col gap-3">
            <h1 className="font-['Bebas_Neue'] text-[clamp(44px,12vw,64px)]
                           tracking-wide text-[#F0EDE4] leading-none">
              PROFIL IST LIVE.
            </h1>
            <p className="text-sm text-white/45 max-w-[280px] mx-auto leading-relaxed">
              {werkstatt?.name ?? 'Deine Werkstatt'} ist jetzt für Rider
              im DACH-Raum sichtbar. Anfragen kommen direkt ins Dashboard.
            </p>
          </div>
          <button
            onClick={finish}
            disabled={saving}
            className="w-full max-w-[280px] h-12 rounded-xl bg-[#E8A829] text-[#111111]
                       font-semibold text-sm flex items-center justify-center gap-2
                       disabled:opacity-50 active:scale-[0.97] transition-all"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : 'Zum Dashboard'
            }
          </button>
        </div>
      )}

    </div>
  )
}
