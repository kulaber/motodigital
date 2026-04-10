'use client'

import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react'
import { X, ImageIcon, Video, Loader2, Plus, Minus, MapPin, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/utils/compressImage'
import Image from 'next/image'
import LazyRideMap from '@/components/map/LazyRideMap'
import DatePicker from '@/components/ui/DatePicker'
import TimePicker from '@/components/ui/TimePicker'

type SheetTab = 'beitrag' | 'fahrt'

interface RideStop {
  name: string
  lon: number
  lat: number
}

interface MentionProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
}

interface GeocodingResult {
  id: string
  place_name: string
  text: string
  center: [number, number] // [lng, lat]
  context?: { id: string; text: string }[]
}

export default function PostComposerSheet() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<SheetTab>('beitrag')

  // ── Beitrag state ──
  const [body, setBody] = useState('')
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // @-mention autocomplete
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [mentionProfiles, setMentionProfiles] = useState<MentionProfile[]>([])
  const [mentionProfilesLoaded, setMentionProfilesLoaded] = useState(false)
  const [mentionTop, setMentionTop] = useState(0)

  // ── Fahrt state ──
  const [rideStep, setRideStep] = useState<1 | 2>(1)
  const [rideVisibility, setRideVisibility] = useState<'public' | 'friends'>('public')
  const [rideStops, setRideStops] = useState<RideStop[]>([])
  const [stopQuery, setStopQuery] = useState('')
  const [stopSuggestions, setStopSuggestions] = useState<GeocodingResult[]>([])
  const [stopLoading, setStopLoading] = useState(false)
  const [rideDate, setRideDate] = useState('')
  const [rideTime, setRideTime] = useState('')
  const [rideMaxParticipants, setRideMaxParticipants] = useState(5)
  const [rideMessage, setRideMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const rideTextareaRef = useRef<HTMLTextAreaElement>(null)
  const stopInputRef = useRef<HTMLInputElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const stopDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ left: number; right: number; bottom: number } | null>(null)
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  // Listen for global open event
  useEffect(() => {
    function handleOpen() { setOpen(true) }
    window.addEventListener('open-post-composer', handleOpen)
    return () => window.removeEventListener('open-post-composer', handleOpen)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      window.dispatchEvent(new Event('modal-open'))
      setTimeout(() => textareaRef.current?.focus(), 350)
    } else {
      document.body.style.overflow = ''
      window.dispatchEvent(new Event('modal-close'))
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Lazy load profiles for @mention when sheet opens
  useEffect(() => {
    if (!open || !user || mentionProfilesLoaded) return
    async function loadProfiles() {
      const { data } = await (supabase.from('profiles') as any)
        .select('id, username, slug, full_name, avatar_url')
        .neq('id', user!.id)
        .not('username', 'is', null)
        .limit(200)
      if (data) {
        setMentionProfiles(
          (data as { id: string; username: string | null; slug: string | null; full_name: string | null; avatar_url: string | null }[])
            .filter(p => p.username || p.slug || p.full_name)
            .map(p => ({
              id: p.id,
              username: p.slug ?? p.username ?? p.full_name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              full_name: p.full_name ?? p.username ?? 'Unbekannt',
              avatar_url: p.avatar_url,
            }))
        )
      }
      setMentionProfilesLoaded(true)
    }
    loadProfiles()
  }, [open, user, mentionProfilesLoaded, supabase])

  function handleClose() {
    setOpen(false)
    setTab('beitrag')
    setBody('')
    setMediaFiles([])
    setError(null)
    setUploadProgress(0)
    setUploadedCount(0)
    setMentionQuery(null)
    // Reset ride state
    setRideStep(1)
    setRideVisibility('public')
    setRideStops([])
    setStopQuery('')
    setStopSuggestions([])
    setRideDate('')
    setRideTime('')
    setRideMaxParticipants(5)
    setRideMessage('')
  }

  // ── Beitrag: Media handling ──

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newFiles = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setMediaFiles(prev => [...prev, ...newFiles].slice(0, 5))
    e.target.value = ''
  }

  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const f = files[0]
    setMediaFiles(prev => [...prev, { file: f, url: URL.createObjectURL(f) }].slice(0, 5))
    e.target.value = ''
  }

  // ── Beitrag: @mention ──

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return mentionProfiles.filter(
      p => p.username.toLowerCase().includes(q) || p.full_name.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [mentionQuery, mentionProfiles])

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setBody(val)
    // Auto-grow textarea
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(120, ta.scrollHeight)}px`
    // Detect @mention
    const cursor = e.target.selectionStart ?? val.length
    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@([a-zA-Z0-9_äöüÄÖÜß-]*)$/)
    if (match) {
      setMentionQuery(match[1])
      setMentionIndex(0)
      // Calculate vertical position of the caret line
      const lines = textBefore.split('\n').length
      const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 22
      setMentionTop(lines * lineHeight + 4)
    } else {
      setMentionQuery(null)
    }
  }

  function insertMention(username: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const cursor = textarea.selectionStart ?? body.length
    const textBefore = body.slice(0, cursor)
    const atPos = textBefore.lastIndexOf('@')
    if (atPos === -1) return
    const newBody = body.slice(0, atPos) + `@${username} ` + body.slice(cursor)
    setBody(newBody)
    setMentionQuery(null)
    requestAnimationFrame(() => {
      textarea.focus()
      const newCursor = atPos + username.length + 2
      textarea.setSelectionRange(newCursor, newCursor)
    })
  }

  function handleMentionKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || mentionSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex(i => (i + 1) % mentionSuggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex(i => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(mentionSuggestions[mentionIndex].username)
    } else if (e.key === 'Escape') {
      setMentionQuery(null)
    }
  }

  // ── Fahrt: Ride message with @mention ──

  function handleRideMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setRideMessage(val)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(80, ta.scrollHeight)}px`
    const cursor = e.target.selectionStart ?? val.length
    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@([a-zA-Z0-9_äöüÄÖÜß-]*)$/)
    if (match) {
      setMentionQuery(match[1])
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  function insertRideMention(username: string) {
    const textarea = rideTextareaRef.current
    if (!textarea) return
    const cursor = textarea.selectionStart ?? rideMessage.length
    const textBefore = rideMessage.slice(0, cursor)
    const atPos = textBefore.lastIndexOf('@')
    if (atPos === -1) return
    const newMsg = rideMessage.slice(0, atPos) + `@${username} ` + rideMessage.slice(cursor)
    setRideMessage(newMsg)
    setMentionQuery(null)
    requestAnimationFrame(() => {
      textarea.focus()
      const newCursor = atPos + username.length + 2
      textarea.setSelectionRange(newCursor, newCursor)
    })
  }

  function handleRideMentionKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || mentionSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex(i => (i + 1) % mentionSuggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex(i => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertRideMention(mentionSuggestions[mentionIndex].username)
    } else if (e.key === 'Escape') {
      setMentionQuery(null)
    }
  }

  // ── Fahrt: Mapbox Geocoding for stops ──

  const fetchStopSuggestions = useCallback(async (value: string) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token || value.length < 2) { setStopSuggestions([]); return }
    setStopLoading(true)
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${token}&types=address,place,locality&language=de&limit=5&country=de,at,ch`
      const res = await fetch(url)
      const json = await res.json()
      setStopSuggestions((json.features ?? []) as GeocodingResult[])
    } finally {
      setStopLoading(false)
    }
  }, [])

  function handleStopQueryChange(value: string) {
    setStopQuery(value)
    if (stopDebounceRef.current) clearTimeout(stopDebounceRef.current)
    stopDebounceRef.current = setTimeout(() => fetchStopSuggestions(value), 300)
  }

  function addStop(result: GeocodingResult) {
    const isAddress = result.id.startsWith('address.')
    let displayName: string
    if (isAddress) {
      const placeCtx = result.context?.find(c => c.id.startsWith('place.'))
      displayName = placeCtx ? `${result.text}, ${placeCtx.text}` : result.text
    } else {
      const countryCtx = result.context?.find(c => c.id.startsWith('country.'))
      displayName = countryCtx ? `${result.text}, ${countryCtx.text}` : result.text
    }
    setRideStops(prev => [...prev, { name: displayName, lon: result.center[0], lat: result.center[1] }])
    setStopQuery('')
    setStopSuggestions([])
  }

  // Position the dropdown portal relative to the sheet
  useLayoutEffect(() => {
    if (stopSuggestions.length === 0 || !stopInputRef.current || !sheetRef.current) {
      setDropdownPos(null)
      return
    }
    const inputRect = stopInputRef.current.getBoundingClientRect()
    const sheetRect = sheetRef.current.getBoundingClientRect()
    setDropdownPos({
      left: inputRect.left - sheetRect.left,
      right: sheetRect.right - inputRect.right,
      bottom: sheetRect.bottom - inputRect.top + 4,
    })
  }, [stopSuggestions])

  function removeStop(index: number) {
    setRideStops(prev => prev.filter((_, i) => i !== index))
  }


  // ── Submit: Beitrag ──

  async function handleSubmitBeitrag() {
    const hasContent = body.trim() || mediaFiles.length > 0
    if (!user || !hasContent) return
    setSubmitting(true)
    setError(null)
    setUploadProgress(0)
    setUploadedCount(0)

    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < mediaFiles.length; i++) {
        const { file: rawFile } = mediaFiles[i]
        const isVideo = rawFile.type.startsWith('video/')
        const file = isVideo ? rawFile : await compressImage(rawFile, 1200)
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data, error: uploadError } = await (supabase.storage as any)
          .from('community-media')
          .upload(path, file, { contentType: file.type })
        if (!uploadError && data) {
          const { data: urlData } = (supabase.storage as any).from('community-media').getPublicUrl(data.path)
          uploadedUrls.push(urlData.publicUrl)
        }
        setUploadedCount(i + 1)
        setUploadProgress(Math.round(((i + 1) / mediaFiles.length) * 100))
      }

      const { error: insertError } = await (supabase.from('community_posts') as any).insert({
        user_id: user.id,
        body: body.trim() || null,
        media_urls: uploadedUrls,
        topic: 'allgemein',
      })
      if (insertError) throw insertError

      handleClose()
      window.dispatchEvent(new Event('post-created'))
      router.push('/explore')
      router.refresh()
    } catch {
      setError('Fehler beim Posten. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit: Fahrt ──

  async function handleSubmitFahrt() {
    if (!user || rideStops.length === 0 || !rideDate) return
    setSubmitting(true)
    setError(null)

    try {
      const startAt = rideTime
        ? new Date(`${rideDate}T${rideTime}`).toISOString()
        : new Date(`${rideDate}T00:00:00`).toISOString()

      const { data: insertedPost, error: insertError } = await (supabase.from('community_posts') as any).insert({
        user_id: user.id,
        body: rideMessage.trim() || null,
        media_urls: [],
        topic: 'allgemein',
        post_type: 'ride',
        ride_visibility: rideVisibility,
        ride_stops: rideStops,
        ride_start_at: startAt,
        ride_max_participants: rideMaxParticipants + 1, // +1 for the creator
      }).select('id').maybeSingle()
      if (insertError) throw insertError

      // Auto-join creator as rider
      if (insertedPost?.id) {
        await (supabase.from('ride_participants') as any)
          .insert({ ride_post_id: insertedPost.id, user_id: user.id })
      }

      handleClose()
      window.dispatchEvent(new Event('post-created'))
      router.push('/explore')
      router.refresh()
    } catch {
      setError('Fehler beim Erstellen der Fahrt. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  const canPostBeitrag = !submitting && (body.trim().length > 0 || mediaFiles.length > 0)
  const canPostFahrt = !submitting && rideStops.length >= 1 && rideDate.length > 0

  // Min date/time for ride pickers (prevent past selection)
  const _now = new Date()
  const todayIso = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`
  const rideMinTime = rideDate === todayIso ? (() => {
    const h = _now.getHours()
    const nextQ = Math.ceil(_now.getMinutes() / 15) * 15
    if (nextQ >= 60) return h + 1 >= 24 ? '23:45' : `${String(h + 1).padStart(2, '0')}:00`
    return `${String(h).padStart(2, '0')}:${String(nextQ).padStart(2, '0')}`
  })() : undefined

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet — bottom on mobile, centered modal on desktop */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full md:rounded-2xl bg-white rounded-t-2xl shadow-2xl animate-slide-up-sheet md:animate-none flex flex-col"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-2 pb-0 flex-shrink-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#222222]/10" />
        </div>

        {/* Header */}
        <div className="relative flex flex-col px-5 pb-3 border-b border-[#222222]/6 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Tab pills */}
          <div className="flex justify-center pt-3">
            <div className="flex bg-[#F7F7F7] rounded-full p-1">
              {(['beitrag', 'fahrt'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setRideStep(1) }}
                  className={`flex-1 px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    tab === t
                      ? 'bg-[#222222] text-white'
                      : 'text-[#717171]'
                  }`}
                >
                  {t === 'beitrag' ? 'Beitrag erstellen' : 'Fahrt eröffnen'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* TAB 1: Beitrag                                  */}
        {/* ════════════════════════════════════════════════ */}
        {tab === 'beitrag' && (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-3">
              {/* Textarea with @mention */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={handleBodyChange}
                  onKeyDown={handleMentionKeyDown}
                  placeholder="Was bewegt dich gerade?"
                  style={{ resize: 'none', minHeight: '120px' }}
                  className="w-full text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-transparent leading-relaxed"
                />

                {/* @mention dropdown */}
                {mentionQuery !== null && mentionSuggestions.length > 0 && (
                  <div style={{ top: mentionTop }} className="absolute left-0 right-0 z-30 bg-white rounded-xl border border-[#222222]/10 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                    {mentionSuggestions.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); insertMention(p.username) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                          i === mentionIndex ? 'bg-[#06a5a5]/8' : 'hover:bg-[#F7F7F7]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-[#F0F0F0] overflow-hidden flex-shrink-0">
                          {p.avatar_url ? (
                            <Image src={p.avatar_url} alt={p.full_name} width={28} height={28} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">
                              {p.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#222222] truncate leading-tight">{p.full_name}</p>
                          <p className="text-[11px] text-[#717171] truncate">@{p.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Media preview grid */}
              {mediaFiles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {mediaFiles.map((m, i) => (
                    <div key={i} className="relative flex-shrink-0">
                      {m.file.type.startsWith('video/') ? (
                        <div className="relative w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-[#222222]/6">
                          <video src={m.url} className="w-full h-full object-cover" muted preload="metadata" />
                          <button
                            type="button"
                            onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#222222]/6">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {mediaFiles.length < 5 && !mediaFiles.some(m => m.file.type.startsWith('video/')) && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 w-[72px] h-[72px] rounded-xl border border-dashed border-[#222222]/15 flex items-center justify-center text-[#222222]/30 hover:border-[#06a5a5]/30 hover:text-[#06a5a5] transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              )}

              {/* Upload progress */}
              {submitting && mediaFiles.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[#222222]/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#06a5a5] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#06a5a5] font-medium flex-shrink-0">
                    {uploadedCount} / {mediaFiles.length}
                  </span>
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            {/* Bottom bar */}
            <div
              className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-[#222222]/6 flex items-center justify-between"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-center gap-1">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFileChange} />
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={mediaFiles.length >= 5}
                  className="w-9 h-9 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors disabled:opacity-30"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={mediaFiles.length >= 5}
                  className="w-9 h-9 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors disabled:opacity-30"
                >
                  <Video size={18} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleSubmitBeitrag}
                disabled={!canPostBeitrag}
                className="flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Wird gepostet…
                  </>
                ) : (
                  'Posten'
                )}
              </button>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* TAB 2: Fahrt                                    */}
        {/* ════════════════════════════════════════════════ */}
        {tab === 'fahrt' && (
          <>
            {/* Step indicator */}
            <div className="px-5 pb-2 flex justify-end">
              <span className="text-[10px] font-medium text-[#06a5a5] uppercase tracking-widest">
                {rideStep} von 2
              </span>
            </div>

            {/* 2-step carousel */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: rideStep === 2 ? 'translateX(-100%)' : 'translateX(0)' }}
              >
                {/* ── Step 1: Route ── */}
                <div className="w-full flex-shrink-0 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-5">
                  {/* Visibility toggle */}
                  <div>
                    <div className="flex bg-[#F7F7F7] rounded-full p-0.5">
                      {(['public', 'friends'] as const).map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setRideVisibility(v)}
                          className={`flex-1 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                            rideVisibility === v
                              ? 'bg-[#222222] text-white'
                              : 'text-[#717171]'
                          }`}
                        >
                          {v === 'public' ? 'Öffentlich' : 'Nur Freunde'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stops / Städte — Mapbox Geocoding */}
                  <div>
                    <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-wide mb-2 block">Stops / Städte</label>

                    {/* Stop chips */}
                    {rideStops.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {rideStops.map((stop, i) => (
                          <span key={i} className="contents">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-xs font-medium">
                              <MapPin size={10} />
                              {stop.name}
                              <button
                                type="button"
                                onClick={() => removeStop(i)}
                                className="ml-0.5 hover:text-red-500 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </span>
                            {i < rideStops.length - 1 && (
                              <ChevronRight size={12} className="text-[#222222]/20 flex-shrink-0" />
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search input */}
                    <div className="relative">
                      <input
                        ref={stopInputRef}
                        type="text"
                        value={stopQuery}
                        onChange={e => handleStopQueryChange(e.target.value)}
                        placeholder="Adresse, Stadt oder Ort hinzufügen..."
                        autoComplete="off"
                        className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none focus:border-[#222222]/30 transition-colors"
                      />
                      {stopLoading && (
                        <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#222222]/25" />
                      )}
                    </div>
                  </div>

                  {/* Route preview map (single stop = pin only, 2+ = with route) */}
                  {rideStops.length >= 1 && (
                    <div className="rounded-2xl overflow-hidden border border-[#222222]/6">
                      <LazyRideMap
                        key={rideStops.map(s => `${s.lon},${s.lat}`).join('|')}
                        stops={rideStops}
                        height={220}
                      />
                    </div>
                  )}
                </div>

                {/* ── Step 2: Details ── */}
                <div className="w-full flex-shrink-0 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-5">
                  {/* Date & Time */}
                  <div>
                    <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-wide mb-2 block">Startdatum & Uhrzeit</label>
                    <div className="flex gap-3">
                      {/* Desktop: custom DatePicker */}
                      <div className="flex-1 hidden md:block">
                        <DatePicker value={rideDate} onChange={setRideDate} min={todayIso} placeholder="Datum wählen" />
                      </div>
                      {/* Mobile: native date */}
                      <input
                        type="date"
                        value={rideDate}
                        min={todayIso}
                        onChange={e => setRideDate(e.target.value)}
                        className="flex-1 md:hidden bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] outline-none focus:border-[#222222]/30 transition-colors"
                      />
                      {/* Desktop: custom TimePicker */}
                      <div className="flex-1 hidden md:block">
                        <TimePicker value={rideTime} onChange={setRideTime} minTime={rideMinTime} placeholder="Uhrzeit" />
                      </div>
                      {/* Mobile: native time (15-min steps) */}
                      <input
                        type="time"
                        value={rideTime}
                        step="900"
                        min={rideMinTime}
                        onChange={e => setRideTime(e.target.value)}
                        className="flex-1 md:hidden bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] outline-none focus:border-[#222222]/30 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Max participants stepper */}
                  <div>
                    <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-wide mb-2 block text-center">Max. Teilnehmer</label>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setRideMaxParticipants(p => Math.max(2, p - 1))}
                        disabled={rideMaxParticipants <= 2}
                        className="w-9 h-9 rounded-full border border-[#222222]/10 flex items-center justify-center text-[#222222] hover:bg-[#F7F7F7] disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold text-[#222222] min-w-[60px] text-center">
                        {rideMaxParticipants} Rider
                      </span>
                      <button
                        type="button"
                        onClick={() => setRideMaxParticipants(p => Math.min(20, p + 1))}
                        disabled={rideMaxParticipants >= 20}
                        className="w-9 h-9 rounded-full border border-[#222222]/10 flex items-center justify-center text-[#222222] hover:bg-[#F7F7F7] disabled:opacity-30 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Ride message with @mention */}
                  <div>
                    <label className="text-xs font-semibold text-[#222222]/50 uppercase tracking-wide mb-2 block">Nachricht (optional)</label>
                    <div className="relative">
                      <textarea
                        ref={rideTextareaRef}
                        value={rideMessage}
                        onChange={handleRideMessageChange}
                        onKeyDown={handleRideMentionKeyDown}
                        placeholder="Schreib etwas zur Fahrt… @erwähne Rider"
                        style={{ resize: 'none', minHeight: '80px' }}
                        className="w-full text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 leading-relaxed focus:border-[#222222]/30 transition-colors"
                      />
                      {mentionQuery !== null && mentionSuggestions.length > 0 && tab === 'fahrt' && rideStep === 2 && (
                        <div className="absolute left-0 right-0 bottom-full mb-1 z-30 bg-white rounded-xl border border-[#222222]/10 shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                          {mentionSuggestions.map((p, i) => (
                            <button
                              key={p.id}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); insertRideMention(p.username) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                i === mentionIndex ? 'bg-[#06a5a5]/8' : 'hover:bg-[#F7F7F7]'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-[#F0F0F0] overflow-hidden flex-shrink-0">
                                {p.avatar_url ? (
                                  <Image src={p.avatar_url} alt={p.full_name} width={28} height={28} className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">
                                    {p.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[#222222] truncate leading-tight">{p.full_name}</p>
                                <p className="text-[11px] text-[#717171] truncate">@{p.username}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
              </div>
            </div>

            {/* Bottom bar — step-aware */}
            <div
              className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-[#222222]/6"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            >
              {rideStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setRideStep(2)}
                  disabled={rideStops.length < 1}
                  className="w-full flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
                >
                  Weiter
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRideStep(1)}
                    className="text-sm font-semibold text-[#717171] px-4 py-3"
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFahrt}
                    disabled={!canPostFahrt}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Wird erstellt…
                      </>
                    ) : (
                      'Fahrt eröffnen'
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Stop suggestions dropdown — portaled to sheet root to escape overflow-hidden */}
        {stopSuggestions.length > 0 && dropdownPos && (
          <div
            className="absolute z-[200] bg-white rounded-xl border border-[#222222]/10 shadow-lg overflow-hidden max-h-52 overflow-y-auto"
            style={{
              left: dropdownPos.left,
              right: dropdownPos.right,
              bottom: dropdownPos.bottom,
            }}
          >
            {stopSuggestions.map((s, i) => {
              const displayName = s.place_name
              return (
                <button
                  key={`${s.id}-${i}`}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); addStop(s) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#F7F7F7] transition-colors border-b border-[#222222]/5 last:border-0"
                >
                  <MapPin size={12} className="text-[#222222]/25 flex-shrink-0" />
                  <span className="text-sm text-[#222222]">{displayName}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
