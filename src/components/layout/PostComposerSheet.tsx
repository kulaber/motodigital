'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, ImageIcon, Video, Send, MapPin, ChevronDown, Loader2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/utils/compressImage'
import Image from 'next/image'

type PostType = 'allgemein' | 'in-der-naehe' | 'events'

const POST_TYPE_PILLS: { value: PostType; label: string; icon: string }[] = [
  { value: 'allgemein', label: 'Beitrag', icon: '📸' },
  { value: 'in-der-naehe', label: 'In der Nähe', icon: '📍' },
  { value: 'events', label: 'Event', icon: '🏁' },
]

interface UserBike {
  id: string
  title: string
  make: string
  model: string
  year: number
  cover_url: string | null
  slug: string | null
}

interface EventOption {
  id: string
  slug: string
  name: string
  date_start: string | null
  location: string
}

export default function PostComposerSheet() {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [postType, setPostType] = useState<PostType>('allgemein')
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [composerLocation, setComposerLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Bike selector
  const [userBikes, setUserBikes] = useState<UserBike[]>([])
  const [bikesLoaded, setBikesLoaded] = useState(false)
  const [selectedBike, setSelectedBike] = useState<UserBike | null>(null)
  const [showBikeSelector, setShowBikeSelector] = useState(false)

  // Event selector
  const [events, setEvents] = useState<EventOption[]>([])
  const [eventsLoaded, setEventsLoaded] = useState(false)
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
      // Hide bottom nav
      window.dispatchEvent(new Event('modal-open'))
      // Focus textarea after animation
      setTimeout(() => textareaRef.current?.focus(), 350)
    } else {
      document.body.style.overflow = ''
      window.dispatchEvent(new Event('modal-close'))
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Lazy load user's bikes when modal opens
  useEffect(() => {
    if (!open || !user || bikesLoaded) return
    async function loadBikes() {
      const { data } = await (supabase.from('bikes') as any)
        .select('id, title, make, model, year, slug, bike_images(url, is_cover, position)')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false })
      if (data) {
        setUserBikes(data.map((b: any) => {
          const images = (b.bike_images ?? []) as { url: string; is_cover: boolean; position: number }[]
          const cover = images.find(i => i.is_cover) ?? images.sort((a, b) => a.position - b.position)[0]
          return {
            id: b.id,
            title: b.title,
            make: b.make,
            model: b.model,
            year: b.year,
            slug: b.slug,
            cover_url: cover?.url ?? null,
          }
        }))
      }
      setBikesLoaded(true)
    }
    loadBikes()
  }, [open, user, bikesLoaded, supabase])

  // Lazy load events when event type selected
  useEffect(() => {
    if (postType !== 'events' || eventsLoaded) return
    async function loadEvents() {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await (supabase.from('events') as any)
        .select('id, slug, name, date_start, location')
        .gte('date_end', today)
        .order('date_start', { ascending: true })
        .limit(30)
      setEvents(data ?? [])
      setEventsLoaded(true)
    }
    loadEvents()
  }, [postType, eventsLoaded, supabase])

  function handleClose() {
    setOpen(false)
    setBody('')
    setPostType('allgemein')
    setComposerLocation(null)
    setLocationLoading(false)
    setMediaFiles([])
    setError(null)
    setSelectedBike(null)
    setShowBikeSelector(false)
    setSelectedEventSlug(null)
    setUploadProgress(0)
    setUploadedCount(0)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newFiles = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setMediaFiles(prev => [...prev, ...newFiles].slice(0, 5))
    e.target.value = ''
  }

  function handlePostTypeChange(type: PostType) {
    setPostType(type)
    if (type === 'in-der-naehe' && !composerLocation) {
      requestLocation()
    }
    // Reset irrelevant state
    if (type !== 'in-der-naehe') setComposerLocation(null)
    if (type !== 'events') setSelectedEventSlug(null)
  }

  function requestLocation() {
    setLocationLoading(true)
    const reverseGeocode = (lat: number, lng: number) => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (token) {
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=de&limit=1&types=address,place,locality`)
          .then(r => r.json())
          .then(json => {
            if (json.features?.[0]) {
              setComposerLocation({ lat, lng, address: json.features[0].place_name })
            }
          })
          .catch(() => {})
          .finally(() => setLocationLoading(false))
      } else {
        setLocationLoading(false)
      }
    }

    const fallbackIPGeo = () => {
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
          if (data.latitude && data.longitude) {
            const lat = data.latitude as number
            const lng = data.longitude as number
            const address = [data.city, data.region].filter(Boolean).join(', ') || 'Mein Standort'
            setComposerLocation({ lat, lng, address })
            reverseGeocode(lat, lng)
          } else {
            setLocationLoading(false)
          }
        })
        .catch(() => setLocationLoading(false))
    }

    if (!navigator.geolocation) { fallbackIPGeo(); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setComposerLocation({ lat, lng, address: 'Mein Standort' })
        reverseGeocode(lat, lng)
      },
      () => fallbackIPGeo(),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    )
  }

  async function handleSubmit() {
    const hasContent = body.trim() || mediaFiles.length > 0 || (postType === 'in-der-naehe' && composerLocation) || (postType === 'events' && selectedEventSlug)
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

      const payload: Record<string, unknown> = {
        user_id: user.id,
        body: body.trim() || null,
        media_urls: uploadedUrls,
        topic: postType,
      }

      if (selectedBike) {
        payload.bike_id = selectedBike.id
      }

      if (postType === 'in-der-naehe' && composerLocation) {
        payload.latitude = composerLocation.lat
        payload.longitude = composerLocation.lng
        payload.location_name = composerLocation.address
      }

      if (postType === 'events' && selectedEventSlug) {
        payload.event_slug = selectedEventSlug
      }

      const { error: insertError } = await (supabase.from('community_posts') as any).insert(payload)
      if (insertError) throw insertError

      handleClose()
      // Signal ExploreClient to reload posts + show toast
      window.dispatchEvent(new Event('post-created'))
      router.push('/explore')
      router.refresh()
    } catch {
      setError('Fehler beim Posten. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEvent = useMemo(() =>
    events.find(e => e.slug === selectedEventSlug) ?? null,
    [events, selectedEventSlug]
  )

  const canPost = (
    !submitting &&
    (body.trim() || mediaFiles.length > 0 || (postType === 'in-der-naehe' && composerLocation) || (postType === 'events' && selectedEventSlug)) &&
    (postType !== 'events' || selectedEventSlug)
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up-sheet flex flex-col"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#222222]/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-[#222222]/6 flex-shrink-0">
          <h2 className="text-base font-bold text-[#222222]">Neuer Beitrag</h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-4">
          {/* ── POST TYPE PILLS ── */}
          <div className="flex gap-2">
            {POST_TYPE_PILLS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handlePostTypeChange(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex-1 justify-center border ${
                  postType === value
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'text-[#222222]/40 border-[#222222]/6 hover:border-[#222222]/20'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* ── LOCATION STATUS (In der Nähe) ── */}
          {postType === 'in-der-naehe' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
              composerLocation
                ? 'bg-[#06a5a5]/8 border border-[#06a5a5]/20 text-[#06a5a5]'
                : 'bg-[#F7F7F7] border border-[#222222]/6 text-[#717171]'
            }`}>
              {locationLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Standort wird ermittelt…</span>
                </>
              ) : composerLocation ? (
                <>
                  <MapPin size={12} className="flex-shrink-0" />
                  <span className="truncate">{composerLocation.address}</span>
                </>
              ) : (
                <>
                  <MapPin size={12} className="flex-shrink-0" />
                  <span>Standort nicht verfügbar</span>
                </>
              )}
            </div>
          )}

          {/* ── EVENT SELECTOR ── */}
          {postType === 'events' && (
            <div className="flex flex-col gap-2">
              {selectedEvent ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#06a5a5]/6 border border-[#06a5a5]/20">
                  <div className="w-8 h-8 rounded-lg bg-[#06a5a5]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-[#06a5a5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#222222] truncate">{selectedEvent.name}</p>
                    <p className="text-[10px] text-[#717171] truncate">
                      {selectedEvent.date_start ? new Date(selectedEvent.date_start + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      {selectedEvent.location ? ` · ${selectedEvent.location}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEventSlug(null)}
                    className="p-1 rounded-full hover:bg-[#222222]/5"
                  >
                    <X size={14} className="text-[#717171]" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
                  {events.length > 0 ? events.map(ev => (
                    <button
                      key={ev.slug}
                      type="button"
                      onClick={() => setSelectedEventSlug(ev.slug)}
                      className="flex items-center gap-3 p-2.5 rounded-xl text-left bg-[#F7F7F7] border border-[#222222]/4 hover:border-[#06a5a5]/25 hover:bg-[#06a5a5]/3 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#06a5a5]/10 flex items-center justify-center flex-shrink-0">
                        <Calendar size={12} className="text-[#06a5a5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#222222] truncate">{ev.name}</p>
                        <p className="text-[10px] text-[#717171] truncate">
                          {ev.date_start ? new Date(ev.date_start + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' }) : ''}
                          {ev.location ? ` · ${ev.location}` : ''}
                        </p>
                      </div>
                    </button>
                  )) : (
                    <p className="text-xs text-[#B0B0B0] py-2 text-center">
                      {eventsLoaded ? 'Keine bevorstehenden Events.' : 'Events werden geladen…'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── MEDIA UPLOAD ── */}
          <div className="flex flex-col gap-2">
            {mediaFiles.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {mediaFiles.map((m, i) => (
                  <div key={i} className="relative flex-shrink-0 w-[100px] h-[100px] rounded-xl overflow-hidden border border-[#222222]/6">
                    {m.file.type.startsWith('video/') ? (
                      <video src={m.url} className="w-full h-full object-cover" muted preload="metadata" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {mediaFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-[100px] h-[100px] rounded-xl border-2 border-dashed border-[#06a5a5]/25 bg-[#06a5a5]/3 flex flex-col items-center justify-center gap-1"
                  >
                    <ImageIcon size={18} className="text-[#06a5a5]" />
                    <span className="text-[10px] font-medium text-[#06a5a5]">Hinzufügen</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 rounded-xl border-2 border-dashed border-[#06a5a5]/20 bg-[#06a5a5]/3 flex flex-col items-center justify-center gap-1.5 active:bg-[#06a5a5]/6 transition-colors"
              >
                <ImageIcon size={24} className="text-[#06a5a5]" />
                <span className="text-sm font-medium text-[#06a5a5]">Fotos oder Videos</span>
                <span className="text-[11px] text-[#B0B0B0]">Bis zu 5 Dateien</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* ── CAPTION ── */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Was bewegt dich gerade?"
            maxLength={500}
            rows={4}
            style={{ resize: 'none' }}
            className="w-full text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-transparent leading-relaxed"
          />

          {/* Character counter */}
          {body.length > 400 && (
            <div className="text-right -mt-3">
              <span className={`text-xs ${body.length > 480 ? 'text-red-400' : 'text-[#B0B0B0]'}`}>
                {500 - body.length}
              </span>
            </div>
          )}

          {/* ── BIKE SELECTOR ── */}
          {userBikes.length > 0 && (
            <div className="border-t border-[#222222]/6 pt-3">
              <button
                type="button"
                onClick={() => setShowBikeSelector(!showBikeSelector)}
                className="flex items-center gap-2 text-xs text-[#717171] hover:text-[#222222] transition-colors w-full"
              >
                <span>🏍</span>
                <span>Bike verknüpfen</span>
                {selectedBike && (
                  <span className="text-[#06a5a5] font-semibold truncate">
                    · {selectedBike.title}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={`ml-auto transition-transform ${showBikeSelector ? 'rotate-180' : ''}`}
                />
              </button>

              {showBikeSelector && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {userBikes.map(bike => (
                    <button
                      key={bike.id}
                      type="button"
                      onClick={() => setSelectedBike(selectedBike?.id === bike.id ? null : bike)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                        selectedBike?.id === bike.id
                          ? 'bg-[#06a5a5]/8 border border-[#06a5a5]/25'
                          : 'bg-[#F7F7F7] border border-[#222222]/4 hover:border-[#222222]/10'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#F0F0F0] overflow-hidden flex-shrink-0">
                        {bike.cover_url ? (
                          <Image src={bike.cover_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#B0B0B0]">🏍</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${
                          selectedBike?.id === bike.id ? 'text-[#06a5a5]' : 'text-[#222222]'
                        }`}>
                          {bike.title}
                        </p>
                        <p className="text-[10px] text-[#717171]">
                          {bike.make} {bike.model} · {bike.year}
                        </p>
                      </div>
                      {selectedBike?.id === bike.id && (
                        <div className="w-5 h-5 rounded-full bg-[#06a5a5] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* ── FOOTER: Progress + Post Button ── */}
        <div
          className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-[#222222]/6 flex flex-col gap-2.5"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
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
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 5}
                className="w-9 h-9 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors disabled:opacity-30"
              >
                <Video size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canPost}
              className="flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Wird gepostet…
                </>
              ) : (
                <>
                  <Send size={13} />
                  Posten
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
