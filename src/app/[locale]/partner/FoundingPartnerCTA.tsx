'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Crown } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

const FOUNDING_MEMBER_LIMIT = 100

export default function FoundingPartnerCTA({ slotsLeft }: { slotsLeft: number }) {
  const t = useTranslations('Partner')
  const { user } = useAuthContext()
  const router = useRouter()

  const soldOut = slotsLeft <= 0
  const slotsUsed = FOUNDING_MEMBER_LIMIT - slotsLeft

  const handleStart = () => {
    if (!user) {
      router.push('/auth/register?role=custom-werkstatt&redirect=/partner')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="border border-[#06a5a5]/30 rounded-2xl p-6 flex flex-col bg-[#06a5a5]/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(6,165,165,0.08) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="w-11 h-11 rounded-xl bg-[#06a5a5]/10 border border-[#06a5a5]/20 flex items-center justify-center mb-4">
          <Crown size={24} className="text-[#06a5a5]" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{t('foundingPartnerTitle')}</h3>

        <p className="text-sm text-white/40 leading-relaxed mb-3 flex-1">
          {t('foundingPartnerBody')}
        </p>

        <p className={`text-sm font-semibold mb-6 ${soldOut ? 'text-red-400' : 'text-[#06a5a5]'}`}>
          {soldOut
            ? t('foundingPartnerSoldOut')
            : t('slotsRemaining', { slots: slotsUsed })
          }
        </p>

        <button
          onClick={handleStart}
          disabled={soldOut}
          className="inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {soldOut ? t('foundingPartnerSoldOut') : t('foundingPartnerCta')}
        </button>
      </div>
    </div>
  )
}
