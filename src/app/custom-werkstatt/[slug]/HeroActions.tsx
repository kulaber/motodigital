'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Share2, Facebook, Twitter, Link2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoginModal } from '@/components/ui/LoginModal'

interface Props {
  name: string
  builderId: string | null
  slug: string
  iconOnly?: boolean
}

export default function HeroActions({ name, builderId: initialBuilderId, slug, iconOnly }: Props) {
  const [shareOpen, setShareOpen]     = useState(false)
  const [copied, setCopied]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [userId, setUserId]           = useState<string | null>(null)
  const [builderId, setBuilderId]     = useState<string | null>(initialBuilderId)
  const [showLogin, setShowLogin]     = useState(false)
  const ref    = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Auth + ggf. builderId per slug nachschlagen + gespeichert-Status laden
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Wenn keine builderId übergeben wurde, per Slug in DB nachschlagen
      let resolvedId = initialBuilderId
      if (!resolvedId) {
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('id')
          .eq('slug', slug)
          .eq('role', 'custom-werkstatt')
          .maybeSingle()
        resolvedId = profile?.id ?? null
        if (resolvedId) setBuilderId(resolvedId)
      }

      if (!resolvedId) return
      const { data } = await (supabase.from('saved_builders') as any)
        .select('builder_id')
        .eq('user_id', user.id)
        .eq('builder_id', resolvedId)
        .maybeSingle()
      setSaved(!!data)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Außerhalb-Klick schließt Share-Popup
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSave() {
    if (!userId) { setShowLogin(true); return }
    if (!builderId || loadingSave) return
    setLoadingSave(true)
    if (saved) {
      await (supabase.from('saved_builders') as any)
        .delete()
        .eq('user_id', userId)
        .eq('builder_id', builderId)
      setSaved(false)
    } else {
      await (supabase.from('saved_builders') as any)
        .insert({ user_id: userId, builder_id: builderId })
      setSaved(true)
    }
    setLoadingSave(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => { setCopied(false); setShareOpen(false) }, 1800)
  }

  const url  = typeof window !== 'undefined' ? window.location.href : ''
  const text = `${name} auf MotoDigital`

  return (
    <div className={`flex items-center gap-2${iconOnly ? '' : ' flex-shrink-0 pb-1'}`} ref={ref}>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="bike_save"
      />
      {/* Speichern */}
      <button
        onClick={handleSave}
        disabled={loadingSave}
        className={iconOnly
          ? `w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all disabled:opacity-60 ${saved ? 'bg-[#06a5a5] text-white' : 'bg-white/90 text-[#222] hover:bg-white'}`
          : `flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all disabled:opacity-60 ${saved ? 'bg-[#06a5a5] border-[#06a5a5] text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`
        }
        aria-label={saved ? 'Gespeichert' : 'Speichern'}
      >
        {iconOnly
          ? <Star size={17} className={saved ? 'fill-white' : ''} />
          : <><Star size={13} className={saved ? 'fill-white' : ''} />{saved ? 'Gespeichert' : 'Speichern'}</>
        }
      </button>

      {/* Teilen */}
      <div className="relative">
        <button
          onClick={() => setShareOpen(v => !v)}
          className={iconOnly
            ? 'w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-[#222] shadow-md hover:bg-white transition-all'
            : 'flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all'
          }
          aria-label="Teilen"
        >
          <Share2 size={iconOnly ? 17 : 13} />
          {!iconOnly && ' Teilen'}
        </button>

        {shareOpen && (
          <div className={`absolute ${iconOnly ? 'top-full mt-2' : 'bottom-full mb-2'} right-0 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#EBEBEB] overflow-hidden w-52 z-50`}>
            <div className="px-4 py-3 border-b border-[#F0F0F0]">
              <p className="text-xs font-semibold text-[#222222]">Seite teilen</p>
            </div>
            <div className="py-1.5">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
              >
                <Facebook size={15} className="text-[#1877F2] flex-shrink-0" />
                <span className="text-sm text-[#222222]">Facebook</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
              >
                <Twitter size={15} className="text-[#1DA1F2] flex-shrink-0" />
                <span className="text-sm text-[#222222]">X / Twitter</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" className="flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-sm text-[#222222]">WhatsApp</span>
              </a>
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F7F7] transition-colors border-t border-[#F0F0F0]"
              >
                {copied ? <Check size={15} className="text-[#06a5a5] flex-shrink-0" /> : <Link2 size={15} className="text-[#717171] flex-shrink-0" />}
                <span className={`text-sm ${copied ? 'text-[#06a5a5]' : 'text-[#222222]'}`}>
                  {copied ? 'Link kopiert!' : 'Link kopieren'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
