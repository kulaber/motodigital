'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, MessageCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useHideNavOnModal } from '@/hooks/useHideNavOnModal'
import { LoginModal } from '@/components/ui/LoginModal'
import { track } from '@/lib/track'

interface Props {
  sellerId: string
  sellerName: string
  sellerAvatarUrl?: string
  sellerRole: string | null
  bikeId: string
  bikeTitle: string
  coverImage: string | null
  fullWidth?: boolean
  renderTrigger?: (onClick: () => void) => React.ReactNode
  workshopId?: string | null
}

function Modal({
  sellerId,
  sellerName,
  sellerAvatarUrl,
  bikeId,
  bikeTitle,
  userId,
  coverImage,
  onClose,
}: {
  sellerId: string
  sellerName: string
  sellerAvatarUrl?: string
  bikeId: string
  bikeTitle: string
  userId: string
  coverImage: string | null
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)

    // Find existing conversation (check both directions)
    let { data: conv } = await (supabase.from('conversations') as any)
      .select('id')
      .or(`and(seller_id.eq.${sellerId},buyer_id.eq.${userId}),and(seller_id.eq.${userId},buyer_id.eq.${sellerId})`)
      .limit(1)
      .maybeSingle()

    if (!conv?.id) {
      const { data: created, error: insertError } = await (supabase.from('conversations') as any)
        .insert({ seller_id: sellerId, buyer_id: userId, bike_id: bikeId })
        .select('id')
        .maybeSingle()
      if (insertError) {
        // Unique constraint hit → conversation exists in other direction, re-fetch
        const { data: existing } = await (supabase.from('conversations') as any)
          .select('id')
          .or(`and(seller_id.eq.${sellerId},buyer_id.eq.${userId}),and(seller_id.eq.${userId},buyer_id.eq.${sellerId})`)
          .limit(1)
          .maybeSingle()
        conv = existing
      } else {
        conv = created
      }
    }

    if (conv?.id) {
      const body = `[bike:${bikeTitle}|${coverImage ?? ''}]\n${trimmed}`
      await (supabase.from('messages') as any)
        .insert({ conversation_id: conv.id, sender_id: userId, body })
      // Update last_message_at so conversation sorts to top
      await (supabase.from('conversations') as any)
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conv.id)
    }

    setSending(false)
    setSent(true)
  }

  const initials = sellerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-3">
            {sellerAvatarUrl ? (
              <Image src={sellerAvatarUrl} alt={sellerName} width={36} height={36} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#06a5a5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {initials}
              </div>
            )}
            <p className="text-sm font-semibold text-[#222222] leading-tight">{sellerName}</p>
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
              <p className="text-xs text-[#717171]">{sellerName} wird sich bei dir melden.</p>
              <button
                onClick={onClose}
                className="mt-2 text-xs font-semibold px-5 py-2 rounded-full bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] transition-colors"
              >
                Schließen
              </button>
            </div>
          ) : (
            <>
              {/* Bike reference */}
              <div className="flex items-center gap-3 bg-[#F7F7F7] rounded-xl px-3 py-2.5 mb-3">
                {coverImage && (
                  <Image src={coverImage} alt={bikeTitle} width={80} height={56} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] text-[#222222]/30 uppercase tracking-widest font-semibold">Anfrage zu</p>
                  <p className="text-xs font-semibold text-[#222222] truncate">{bikeTitle}</p>
                </div>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Hallo ${sellerName.split(' ')[0]}, ich interessiere mich für ${bikeTitle}…`}
                rows={5}
                className="w-full bg-[#F7F7F7] rounded-xl px-4 py-3 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none focus:ring-2 focus:ring-[#06a5a5]/30 transition-all resize-none"
              />
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

export default function ContactModal({ sellerId, sellerName, sellerAvatarUrl, sellerRole, bikeId, bikeTitle, coverImage, fullWidth, renderTrigger, workshopId }: Props) {
  const [open, setOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const { user, loading: authLoading } = useAuth()
  useHideNavOnModal(open)

  const isWerkstatt = sellerRole === 'custom-werkstatt'
  const ctaLabel = isWerkstatt ? 'Werkstatt kontaktieren' : 'Rider kontaktieren'

  function openModal() {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (workshopId) {
      track({ event_type: 'contact_click', target_type: 'bike', target_id: bikeId, workshop_id: workshopId })
    }
    setOpen(true)
  }

  if (!authLoading && user?.id === sellerId) return null

  return (
    <>
      {renderTrigger ? renderTrigger(openModal) : (
        <button
          onClick={openModal}
          className={`flex items-center justify-center gap-2 w-full bg-[#06a5a5] hover:bg-[#058f8f] text-white text-sm font-semibold py-3 transition-all ${fullWidth ? 'rounded-full shadow-lg' : 'rounded-xl'}`}
        >
          <MessageCircle size={14} />
          {ctaLabel}
        </button>
      )}

      {open && user && typeof document !== 'undefined' && createPortal(
        <Modal
          sellerId={sellerId}
          sellerName={sellerName}
          sellerAvatarUrl={sellerAvatarUrl}
          bikeId={bikeId}
          bikeTitle={bikeTitle}
          userId={user.id}
          coverImage={coverImage}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext={isWerkstatt ? 'contact_builder' : 'message'}
      />
    </>
  )
}
