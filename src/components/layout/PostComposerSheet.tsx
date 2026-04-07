'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ImageIcon, Video, Send, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/utils/compressImage'

type Category = 'allgemein' | 'in-der-naehe' | 'events'

const COMPOSER_TAGS: { value: Category; label: string }[] = [
  { value: 'in-der-naehe', label: 'In der Nähe' },
  { value: 'events', label: 'Events' },
]

export default function PostComposerSheet() {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [composerTag, setComposerTag] = useState<Category>('allgemein')
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [composerLocation, setComposerLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  function handleClose() {
    setOpen(false)
    setBody('')
    setComposerTag('allgemein')
    setComposerLocation(null)
    setMediaFiles([])
    setError(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newFiles = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setMediaFiles(prev => [...prev, ...newFiles].slice(0, 4))
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hasContent = body.trim() || mediaFiles.length > 0 || (composerTag === 'in-der-naehe' && composerLocation)
    if (!user || !hasContent) return
    setSubmitting(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []
      for (const { file: rawFile } of mediaFiles) {
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
      }

      await (supabase.from('community_posts') as any).insert({
        user_id: user.id,
        body: body.trim() || null,
        media_urls: uploadedUrls,
        topic: composerTag,
        ...(composerTag === 'in-der-naehe' && composerLocation ? {
          latitude: composerLocation.lat,
          longitude: composerLocation.lng,
          location_name: composerLocation.address,
        } : {}),
      })

      handleClose()
      router.push('/explore')
      router.refresh()
    } catch {
      setError('Fehler beim Posten. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleTagToggle(tag: Category) {
    if (composerTag === tag) {
      setComposerTag('allgemein')
      if (tag === 'in-der-naehe') setComposerLocation(null)
    } else {
      setComposerTag(tag)
      if (tag === 'in-der-naehe') {
        // Auto-request geolocation
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            setComposerLocation({ lat, lng, address: 'Mein Standort' })
            // Reverse geocode
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
            }
          },
          () => {
            // Fallback: IP geolocation
            fetch('https://ipapi.co/json/')
              .then(r => r.json())
              .then(data => {
                if (data.latitude && data.longitude) {
                  setComposerLocation({
                    lat: data.latitude,
                    lng: data.longitude,
                    address: [data.city, data.region].filter(Boolean).join(', ') || 'Mein Standort',
                  })
                }
              })
              .catch(() => {})
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
        )
      }
    }
  }

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
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up"
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#222222]/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-[#222222]/6">
          <h2 className="text-base font-bold text-[#222222]">Poste, was dich bewegt</h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Was bewegt dich gerade?"
            rows={4}
            style={{ resize: 'none' }}
            className="w-full text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-transparent leading-relaxed"
          />

          {/* Tag selector */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {COMPOSER_TAGS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTagToggle(t.value)}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                  composerTag === t.value
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'text-[#222222]/40 border-[#222222]/6 hover:border-[#222222]/20'
                }`}
              >
                {t.value === 'in-der-naehe' && <MapPin size={11} />}
                {t.label}
              </button>
            ))}
          </div>

          {/* Location display */}
          {composerTag === 'in-der-naehe' && composerLocation && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#06a5a5] bg-[#06a5a5]/8 px-3 py-2 rounded-xl">
              <MapPin size={12} />
              <span className="truncate">{composerLocation.address}</span>
            </div>
          )}

          {/* Media previews */}
          {mediaFiles.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {mediaFiles.map((m, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#222222]/6 flex-shrink-0">
                  {m.file.type.startsWith('video/') ? (
                    <video src={m.url} className="w-full h-full object-cover" muted preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 mt-3">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-1">
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors">
                <ImageIcon size={18} />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors">
                <Video size={18} />
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting || (composerTag === 'in-der-naehe' && !composerLocation) || (!body.trim() && mediaFiles.length === 0 && !(composerTag === 'in-der-naehe' && composerLocation))}
              className="flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
            >
              <Send size={13} />
              {submitting ? 'Wird gepostet...' : 'Posten'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}
