'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useParams } from 'next/navigation'

interface Props {
  variant?: 'header' | 'footer' | 'mobile'
}

const LABELS: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
}

const FLAGS: Record<string, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
}

export default function LanguageSwitcher({ variant = 'header' }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('LanguageSwitcher')
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function switchTo(next: string) {
    if (next === locale) {
      setOpen(false)
      return
    }
    setOpen(false)
    startTransition(() => {
      // Preserve dynamic params (e.g. [slug]) across the locale switch.
      // next-intl resolves the translated pathname for the target locale.
      router.replace(
        // @ts-expect-error — pathname template accepts string params at runtime
        { pathname, params },
        { locale: next }
      )
    })
  }

  if (variant === 'mobile') {
    return (
      <div className="flex gap-2">
        {routing.locales.map((l) => (
          <button
            key={l}
            onClick={() => switchTo(l)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
              l === locale
                ? 'bg-[#222222] text-white'
                : 'bg-[#F0F0F0] text-[#222222]/70 hover:bg-[#E5E5E5]'
            }`}
            aria-label={`${t('label')}: ${LABELS[l]}`}
          >
            <span>{FLAGS[l]}</span>
            {LABELS[l]}
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div ref={ref} className="relative inline-block">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-[#222222]/10 bg-white px-4 py-2 text-sm text-[#222222]/70 hover:text-[#222222] hover:border-[#222222]/20 transition"
        >
          <Globe size={14} />
          <span>{LABELS[locale]}</span>
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border border-[#222222]/10 bg-white shadow-xl overflow-hidden z-50">
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchTo(l)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm text-[#222222]/70 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{FLAGS[l]}</span>
                  {LABELS[l]}
                </span>
                {l === locale && <Check size={14} className="text-[#06a5a5]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Header variant — compact icon button + dropdown
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[#717171] hover:text-[#222222] hover:bg-[#222222]/5 transition-all px-2.5 py-2 rounded-lg"
        aria-label={t('label')}
      >
        <Globe size={16} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {locale}
        </span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-40 rounded-xl border border-[#222222]/10 bg-white shadow-xl overflow-hidden z-50">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-[#222222]/70 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{FLAGS[l]}</span>
                {LABELS[l]}
              </span>
              {l === locale && <Check size={14} className="text-[#06a5a5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
