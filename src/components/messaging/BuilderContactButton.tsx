'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useHideNavOnModal } from '@/hooks/useHideNavOnModal'
import Image from 'next/image'
import { MessageCircle, X, CheckCircle } from 'lucide-react'
import { LoginModal } from '@/components/ui/LoginModal'

interface Props {
  builderId: string
  builderFirstName: string
  builderName: string
  builderAvatarUrl?: string
  bikeId?: string
  fullWidth?: boolean
}

function Modal({
  builderId,
  builderName,
  builderAvatarUrl,
  userId,
  onClose,
}: {
  builderId: string
  builderName: string
  builderAvatarUrl?: string
  userId: string
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const _initials = builderName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setError(null)

    // Find existing conversation (check both directions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: conv } = await (supabase.from('conversations') as any)
      .select('id')
      .or(`and(seller_id.eq.${builderId},buyer_id.eq.${userId}),and(seller_id.eq.${userId},buyer_id.eq.${builderId})`)
      .limit(1)
      .maybeSingle()

    if (!conv?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error: insertError } = await (supabase.from('conversations') as any)
        .insert({ seller_id: builderId, buyer_id: userId })
        .select('id')
        .maybeSingle()
      if (insertError) {
        setError('Fehler beim Senden.')
        setSending(false)
        return
      }
      conv = created
    }

    if (conv?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('messages') as any)
        .insert({ conversation_id: conv.id, sender_id: userId, body: trimmed })
    }

    setSending(false)
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-3">
            {builderAvatarUrl ? (
              <img src={builderAvatarUrl} alt={builderName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#06a5a5] flex items-center justify-center flex-shrink-0">
                <Image src="/pin-logo.svg" alt="MotoDigital Logo" width={20} height={20} className="opacity-90" />
              </div>
            )}
            <p className="text-sm font-semibold text-[#222222] leading-tight">{builderName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F7F7F7] transition-colors text-[#222222]/40 hover:text-[#222222]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle size={36} className="text-[#06a5a5]" />
              <p className="text-sm font-semibold text-[#222222]">Nachricht wurde gesendet</p>
              <p className="text-xs text-[#717171]">{builderName.split(' ')[0]} wird sich bei dir melden.</p>
              <button
                onClick={onClose}
                className="mt-2 text-xs font-semibold px-5 py-2 rounded-full bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] transition-colors"
              >
                Schließen
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Hallo ${builderName.split(' ')[0]}, ich interessiere mich für eure Arbeit…`}
                rows={5}
                className="w-full bg-[#F7F7F7] rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none focus:ring-2 focus:ring-[#06a5a5]/30 transition-all resize-none"
              />
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#06a5a5] hover:bg-[#058f8f] text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-40 transition-all"
              >
                <MessageCircle size={14} />
                {sending ? 'Wird gesendet…' : 'Nachricht senden'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BuilderContactButton({ builderId, builderFirstName, builderName, builderAvatarUrl, fullWidth }: Props) {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { user, loading: authLoading } = useAuth()
  useHideNavOnModal(open)

  if (!authLoading && user?.id === builderId) return null

  function handleClick() {
    if (!user) {
      setShowLogin(true)
      return
    }
    // Track contact button click
    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/__event/contact-click/${builderId}`, referrer: window.location.pathname }),
    }).catch(() => {})
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={authLoading}
        className={`flex items-center justify-center gap-2 w-full bg-[#06a5a5] text-white text-sm font-semibold py-3 hover:bg-[#058f8f] disabled:opacity-50 transition-all ${fullWidth ? 'rounded-full shadow-lg' : 'rounded-xl'}`}
      >
        <MessageCircle size={14} />
        {builderFirstName} kontaktieren
      </button>

      {open && user && typeof document !== 'undefined' && createPortal(
        <Modal
          builderId={builderId}
          builderName={builderName}
          builderAvatarUrl={builderAvatarUrl}
          userId={user.id}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext="contact_builder"
      />
    </>
  )
}
