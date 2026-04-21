'use client'

import { useState, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { ChevronRight, ImagePlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { saveOnboardingStep, completeOnboarding } from '@/lib/onboarding'
import { OnboardingProgressBar } from './OnboardingProgressBar'

const RIDING_STYLES = [
  'Cafe Racer', 'Scrambler', 'Bobber', 'Tracker',
  'Brat Style', 'Chopper', 'Restauration', 'Andere',
]

const SUGGESTED_RIDERS = [
  { username: 'skulaber',  name: 'Joe Mel Ramos', style: 'Cafe Racer' },
  { username: 'tunahan28', name: 'Tunahan Sahin',  style: 'Basis-Bike' },
  { username: 'chihiro',   name: 'Chihiro',       style: 'Scrambler'  },
]

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  riding_styles: string[] | null
  onboarding_step: number
}

export function RiderOnboarding({
  profile,
  confirmed,
  initialStep,
}: {
  profile: Profile
  confirmed: boolean
  initialStep: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]                     = useState(initialStep === 0 ? 0 : initialStep)
  const [saving, setSaving]                 = useState(false)
  const [username, setUsername]              = useState(profile.username ?? '')
  const [avatarFile, setAvatarFile]         = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview]   = useState(profile.avatar_url ?? '')
  const [selectedStyles, setSelectedStyles] = useState<string[]>(profile.riding_styles ?? [])
  const [followed, setFollowed]             = useState<string[]>([])

  const TOTAL = 4

  function toggleStyle(s: string) {
    setSelectedStyles(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function toggleFollow(username: string) {
    const wasFollowing = followed.includes(username)
    setFollowed(prev =>
      wasFollowing ? prev.filter(u => u !== username) : [...prev, username]
    )

    const { data: target } = await (supabase.from('profiles') as any)
      .select('id')
      .eq('username', username)
      .maybeSingle() as { data: { id: string } | null }

    if (!target) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (wasFollowing) {
      await (supabase.from('followers') as any)
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', target.id)
    } else {
      await (supabase.from('followers') as any)
        .insert({ follower_id: user.id, following_id: target.id })
    }
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
    // Always ensure slug is set in DB before completing
    const finalUsername = username.trim() || profile.username
    const slug = finalUsername.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    await (supabase.from('profiles') as any).update({ slug }).eq('id', profile.id)
    await completeOnboarding()
    // Notify AuthContext about the updated slug so profile links work
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { slug } }))
    router.push('/explore')
    router.refresh()
  }

  async function saveStep1() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let avatarUrl = profile.avatar_url
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    const finalUsername = username.trim() || profile.username
    const slug = finalUsername.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    await (supabase.from('profiles') as any).update({
      username: finalUsername,
      slug,
      avatar_url: avatarUrl,
    }).eq('id', profile.id)
  }

  async function saveStep2() {
    await (supabase.from('profiles') as any)
      .update({ riding_styles: selectedStyles })
      .eq('id', profile.id)
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

      {/* SCHRITT 0: Willkommen */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-7
                        text-center py-16">
          {confirmed && (
            <div className="px-3 py-1.5 rounded-full text-xs font-medium
                            bg-[#2AABAB]/10 border border-[#2AABAB]/25 text-[#2AABAB]">
              E-Mail bestätigt
            </div>
          )}
          <div className="text-7xl leading-none">🏍</div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Du bist dabei.
            </h1>
            <p className="text-sm text-white/45 max-w-[260px] mx-auto leading-relaxed">
              Willkommen in der deutschen Custom Bike Community.
              Zeig was du fährst.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            <button
              onClick={() => next()}
              className="w-full h-12 rounded-xl bg-[#2AABAB] text-white
                         font-semibold text-sm flex items-center justify-center gap-2
                         active:scale-[0.97] transition-transform"
            >
              Profil einrichten
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={finish}
              className="w-full h-10 text-white/30 text-sm
                         hover:text-white/50 transition-colors"
            >
              Direkt zur Community
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 1: Profil */}
      {step === 1 && (
        <div className="flex flex-col gap-7 flex-1 pb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Dein Profil
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Wie soll die Community dich kennen?
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden
                         border-2 border-dashed border-[#2AABAB]/35
                         bg-[#2AABAB]/6 flex items-center justify-center
                         hover:bg-[#2AABAB]/10 transition-colors"
            >
              {avatarPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                : <ImagePlus className="w-7 h-7 text-[#2AABAB]" />
              }
            </button>
            <span className="text-xs text-white/30">Profilbild hinzufügen</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="@dein_username"
              className="w-full h-12 bg-white/[0.05] border border-white/[0.08]
                         rounded-xl px-4 text-sm text-[#F0EDE4]
                         placeholder:text-white/20 outline-none
                         focus:border-[#2AABAB]/50 transition-colors"
            />
          </div>

          <div className="mt-auto">
            <button
              onClick={() => next(saveStep1)}
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
          </div>
        </div>
      )}

      {/* SCHRITT 2: Riding Style */}
      {step === 2 && (
        <div className="flex flex-col gap-7 flex-1 pb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Was fährst du?
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Beeinflusst deinen persönlichen Feed. Mehrfachauswahl möglich.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {RIDING_STYLES.map(style => {
              const sel = selectedStyles.includes(style)
              return (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium
                              border transition-all active:scale-[0.97]
                              ${sel
                                ? 'bg-[#2AABAB]/12 border-[#2AABAB]/40 text-[#2AABAB]'
                                : 'bg-white/[0.04] border-white/[0.08] text-white/45'
                              }`}
                >
                  {style}
                </button>
              )
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => next(saveStep2)}
              disabled={saving || selectedStyles.length === 0}
              className="w-full h-12 rounded-xl bg-[#2AABAB] text-white
                         font-semibold text-sm flex items-center justify-center gap-2
                         disabled:opacity-40 active:scale-[0.97] transition-all"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Weiter</span><ChevronRight className="w-4 h-4" /></>
              }
            </button>
            <button onClick={skip}
                    className="w-full h-10 text-white/25 text-sm">
              Überspringen
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 3: Erstes Bike */}
      {step === 3 && (
        <div className="flex flex-col gap-7 flex-1 pb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Zeig dein Bike
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Rider mit Bike bekommen 5x mehr Aufmerksamkeit.
            </p>
          </div>

          <button
            onClick={() => {
              saveOnboardingStep(4)
              router.push('/bikes/new?onboarding=true')
            }}
            className="w-full h-48 rounded-2xl border-2 border-dashed
                       border-[#2AABAB]/20 bg-[#2AABAB]/5
                       flex flex-col items-center justify-center gap-4
                       active:bg-[#2AABAB]/8 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-[#2AABAB]
                            flex items-center justify-center text-3xl">
              🏍
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-[#2AABAB]">
                Bike hinzufügen
              </span>
              <span className="text-xs text-white/30">
                Fotos, Modell, Story
              </span>
            </div>
          </button>

          <div className="mt-auto">
            <button
              onClick={skip}
              className="w-full h-12 rounded-xl bg-white/[0.05]
                         border border-white/[0.07]
                         text-white/40 text-sm font-medium
                         active:scale-[0.97] transition-all"
            >
              Später hinzufügen
            </button>
          </div>
        </div>
      )}

      {/* SCHRITT 4: Rider folgen */}
      {step === 4 && (
        <div className="flex flex-col gap-7 flex-1 pb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#F0EDE4]">
              Entdecke Rider
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Starte mit einem vollen Feed statt einer leeren Seite.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {SUGGESTED_RIDERS.map(rider => {
              const isFollowing = followed.includes(rider.username)
              return (
                <div
                  key={rider.username}
                  className="flex items-center gap-3 p-3.5 rounded-xl
                             bg-white/[0.04] border border-white/[0.06]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2AABAB]/15
                                  border border-[#2AABAB]/25 flex-shrink-0
                                  flex items-center justify-center text-sm">
                    🏍
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#F0EDE4]">
                      {rider.name}
                    </div>
                    <div className="text-xs text-white/35">
                      @{rider.username} · {rider.style}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(rider.username)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold
                                transition-all active:scale-[0.97]
                                ${isFollowing
                                  ? 'bg-[#2AABAB]/12 border border-[#2AABAB]/30 text-[#2AABAB]'
                                  : 'bg-[#2AABAB] text-white'
                                }`}
                  >
                    {isFollowing ? 'Folgst du' : 'Folgen'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={finish}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-[#2AABAB] text-white
                         font-semibold text-sm flex items-center justify-center gap-2
                         disabled:opacity-50 active:scale-[0.97] transition-all"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : 'Feed entdecken'
              }
            </button>
            <button
              onClick={finish}
              className="w-full h-10 text-white/25 text-sm"
            >
              Überspringen
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
