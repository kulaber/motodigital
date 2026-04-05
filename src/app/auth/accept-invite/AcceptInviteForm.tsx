'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, MapPin, Wrench, CheckCircle } from 'lucide-react'
import { acceptInvite } from '@/lib/actions/invite'

type Props = {
  pid: string
  token: string
  exp: string
  email: string
  werkstattName: string
}

type Suggestion = { place_name: string; center: [number, number] }

export default function AcceptInviteForm({ pid, token, exp, email, werkstattName }: Props) {
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const router = useRouter()

  // ── Address autocomplete ──
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  function handleAddressInput(val: string) {
    setAddress(val)
    setLat(null)
    setLng(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); return }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${mapboxToken}&language=de&country=de,at,ch&types=address,place&limit=5`
        )
        const json = await res.json()
        setSuggestions(json.features ?? [])
      } catch {
        setSuggestions([])
      }
    }, 280)
  }

  function selectSuggestion(s: Suggestion) {
    setAddress(s.place_name)
    setLng(s.center[0])
    setLat(s.center[1])
    setSuggestions([])
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPw) { setError('Passwörter stimmen nicht überein.'); return }
    if (password.length < 8) { setError('Mindestens 8 Zeichen.'); return }

    setLoading(true)
    setError(null)

    const result = await acceptInvite({
      pid, token, exp, password,
      address: address || undefined,
      lat, lng,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#06a5a5]/10 flex items-center justify-center">
            <CheckCircle size={24} className="text-[#06a5a5]" />
          </div>
          <h1 className="text-lg font-bold text-white mb-1">Konto eingerichtet</h1>
          <p className="text-sm text-white/40">Du wirst jetzt weitergeleitet…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#06a5a5]/10 flex items-center justify-center">
            <Wrench size={20} className="text-[#06a5a5]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Willkommen bei MotoDigital</h1>
          {werkstattName && (
            <p className="text-sm text-white/40">
              Dein Werkstatt-Profil <span className="text-white/60 font-medium">{werkstattName}</span> ist bereit.
            </p>
          )}
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* E-Mail (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">E-Mail</label>
              <div className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50">
                {email}
              </div>
            </div>

            {/* Passwort */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Neues Passwort</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Passwort bestätigen */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Passwort bestätigen</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Passwort wiederholen"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Standort */}
            <div className="relative">
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Standort der Werkstatt</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  value={address}
                  onChange={e => handleAddressInput(e.target.value)}
                  placeholder="Adresse eingeben…"
                  autoComplete="off"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <MapPin size={12} className="text-white/25 flex-shrink-0" />
                      <span className="text-sm text-white/70 truncate">{s.place_name}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-white/20 mt-1">Kann später in den Einstellungen geändert werden.</p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06a5a5] text-white font-semibold py-3 rounded-full text-sm hover:bg-[#058f8f] disabled:opacity-50 transition-all mt-1 cursor-pointer"
            >
              {loading ? 'Wird eingerichtet…' : 'Konto einrichten'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
