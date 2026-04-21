'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const STORAGE_KEY = 'md-cookie-consent'

export default function CookieBanner() {
  const t = useTranslations('CookieBanner')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const decide = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fixed z-50 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
    >
      <div className="rounded-2xl bg-[#1a1a1a]/95 backdrop-blur border border-white/10 shadow-lg p-4 sm:p-5">
        <p className="text-[13px] leading-relaxed text-white/70">
          {t('message')}
        </p>

        <button
          type="button"
          onClick={() => decide('accepted')}
          className="mt-4 w-full h-9 rounded-lg bg-[#2AABAB] hover:bg-[#2AABAB]/90 text-white text-[13px] font-medium transition-colors"
        >
          {t('accept')}
        </button>

        <div className="mt-2.5 flex items-center justify-center gap-3 text-[12px] text-white/45">
          <button
            type="button"
            onClick={() => decide('declined')}
            className="hover:text-white/70 transition-colors"
          >
            {t('decline')}
          </button>
          <span aria-hidden className="text-white/20">·</span>
          <button
            type="button"
            className="hover:text-white/70 transition-colors"
          >
            {t('settings')}
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-3 text-[11px] text-white/35">
          <Link href="/datenschutz" className="hover:text-white/60 transition-colors">
            {t('privacy')}
          </Link>
          <span aria-hidden className="text-white/15">·</span>
          <Link href="/impressum" className="hover:text-white/60 transition-colors">
            {t('imprint')}
          </Link>
        </div>
      </div>
    </div>
  )
}
