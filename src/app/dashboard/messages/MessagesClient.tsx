'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, MessageCircle, Trash2 } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'
import { formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Conversation } from './page'

interface Props {
  conversations: Conversation[]
  userId: string
}


function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <Image src={avatarUrl} alt={name} width={36} height={36} className="rounded-full object-cover border border-[#222222]/8 flex-shrink-0" />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#222222]/10 border border-[#DDDDDD]/30 flex items-center justify-center text-xs font-bold text-[#717171] flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[#222222]/5">
        <h1 className="text-sm font-semibold text-[#222222]">Nachrichten</h1>
        <p className="text-xs text-[#222222]/30 mt-0.5">{conversations.length} Konversation{conversations.length !== 1 ? 'en' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#222222]/5">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <MessageCircle size={32} className="text-[#222222]/10 mb-3" />
            <p className="text-sm text-[#222222]/30">Noch keine Nachrichten</p>
          </div>
        )}
        {conversations.map(conv => {
          const name = conv.other?.full_name ?? conv.other?.username ?? 'Unbekannt'
          const isSelected = conv.id === selectedId
          const hasUnread = conv.unread_count > 0
          return (
            <div
              key={conv.id}
              className={`group relative flex items-start gap-3 px-4 py-3.5 border-l-2 transition-colors ${
                isSelected
                  ? 'bg-[#06a5a5]/5 border-[#06a5a5]'
                  : hasUnread
                  ? 'bg-[#06a5a5]/3 border-[#06a5a5]/30 hover:bg-[#06a5a5]/6'
                  : 'border-transparent hover:bg-[#222222]/3'
              }`}
            >
              <button
                onClick={() => onSelect(conv.id)}
                className="flex items-start gap-3 flex-1 min-w-0 text-left"
              >
                <div className="relative flex-shrink-0">
                  <Avatar name={name} avatarUrl={conv.other?.avatar_url} />
                  {hasUnread && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#06a5a5] rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${hasUnread && !isSelected ? 'font-bold text-[#222222]' : 'font-semibold text-[#222222]'}`}>
                      {name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {conv.last_message_at && (
                        <span className={`text-[10px] ${hasUnread && !isSelected ? 'text-[#06a5a5] font-semibold' : 'text-[#222222]/25'}`}>
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      )}
                      {hasUnread && !isSelected && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-[#06a5a5] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  {conv.bike && (
                    <p className={`text-xs truncate ${hasUnread && !isSelected ? 'text-[#222222]/50' : 'text-[#222222]/35'}`}>
                      {conv.bike.title}
                    </p>
                  )}
                </div>
              </button>

              {/* Delete button — visible on hover */}
              <button
                onClick={() => onDelete(conv.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-[#222222]/20 hover:text-red-400"
                title="Konversation löschen"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MessageThread({
  conversationId,
  userId,
  conv,
  onBack,
  myAvatarUrl,
}: {
  conversationId: string
  userId: string
  conv: Conversation
  onBack: () => void
  myAvatarUrl: string | null
}) {
  const { messages, loading, sendMessage } = useMessages(conversationId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const name = conv.other?.full_name ?? conv.other?.username ?? 'Unbekannt'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setText('')
    await sendMessage(body, userId)
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-[#222222]/5 flex-shrink-0">
        <button
          onClick={onBack}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#222222]/5 transition-colors text-[#222222]/50"
        >
          <ArrowLeft size={16} />
        </button>
        <Avatar name={name} avatarUrl={conv.other?.avatar_url} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#222222]">{name}</p>
          {conv.bike && <p className="text-xs text-[#222222]/35 truncate">{conv.bike.title}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-2">
        {loading && (
          <div className="flex flex-col gap-2 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-8 rounded-2xl bg-[#222222]/5 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 self-end'}`} />
            ))}
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <p className="text-xs text-[#222222]/25">Noch keine Nachrichten — schreib als Erster!</p>
          </div>
        )}
        {messages.map(msg => {
          const isOwn = msg.sender_id === userId
          const avatarUrl = isOwn ? myAvatarUrl : conv.other?.avatar_url
          const name = isOwn ? 'Ich' : (conv.other?.full_name ?? conv.other?.username ?? '?')
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {/* Other person avatar — left */}
              {!isOwn && (
                <div className="relative flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-[#222222]/8 bg-[#F7F7F7] flex items-center justify-center text-[10px] font-bold text-[#717171]">
                  {avatarUrl
                    ? <Image src={avatarUrl} alt={name} fill sizes="28px" className="object-cover" />
                    : name.charAt(0).toUpperCase()
                  }
                </div>
              )}

              <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isOwn
                  ? 'bg-[#06a5a5] text-white rounded-br-sm'
                  : 'bg-[#F7F7F7] text-[#222222] rounded-bl-sm border border-[#222222]/5'
              }`}>
                {msg.body}
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/40' : 'text-[#222222]/25'}`}>
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>

              {/* Own avatar — right */}
              {isOwn && (
                <div className="relative flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-[#222222]/8 bg-[#06a5a5]/10 flex items-center justify-center text-[10px] font-bold text-[#06a5a5]">
                  {avatarUrl
                    ? <Image src={avatarUrl} alt="Ich" fill sizes="28px" className="object-cover" />
                    : 'I'
                  }
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-[#222222]/5 flex-shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Nachricht schreiben…"
          className="flex-1 bg-[#F7F7F7] border border-[#222222]/8 rounded-full px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/25 outline-none focus:border-[#06a5a5]/40 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-full bg-[#06a5a5] hover:bg-[#058f8f] disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0"
        >
          <Send size={14} className="text-white" />
        </button>
      </form>
    </div>
  )
}

export default function MessagesClient({ conversations: initial, userId }: Props) {
  const searchParams = useSearchParams()
  const convParam = searchParams.get('conv')
  const [conversations, setConversations] = useState(initial)
  const [selectedId,   setSelectedId]   = useState<string | null>(
    convParam && initial.some(c => c.id === convParam) ? convParam : null
  )
  const [myAvatarUrl,  setMyAvatarUrl]  = useState<string | null>(null)
  const selectedConv = conversations.find(c => c.id === selectedId) ?? null
  const supabase = createClient()

  async function handleDelete(convId: string) {
    // Fetch current deleted_for, append userId, update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('conversations') as any)
      .select('deleted_for')
      .eq('id', convId)
      .maybeSingle()

    const current: string[] = data?.deleted_for ?? []
    if (!current.includes(userId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('conversations') as any)
        .update({ deleted_for: [...current, userId] })
        .eq('id', convId)
    }

    // Optimistic UI update
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (selectedId === convId) setSelectedId(null)
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('profiles') as any)
      .select('avatar_url')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }: { data: { avatar_url: string | null } | null }) => {
        setMyAvatarUrl(data?.avatar_url ?? null)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Nachrichten als gelesen markieren + Header-Badge aktualisieren
  useEffect(() => {
    if (!selectedId) return
    ;(supabase.from('messages') as any)
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', selectedId)
      .neq('sender_id', userId)
      .is('read_at', null)
      .then(() => {
        window.dispatchEvent(new CustomEvent('messages-read'))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-12">
      <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-full divide-x divide-[#222222]/5">

          {/* Conversation list — hidden on mobile when a chat is open */}
          <div className={`${selectedId ? 'hidden lg:flex' : 'flex'} flex-col h-full overflow-hidden`}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          </div>

          {/* Message thread */}
          <div className={`${selectedId ? 'flex' : 'hidden lg:flex'} flex-col h-full overflow-hidden`}>
            {selectedConv ? (
              <MessageThread
                key={selectedId!}
                conversationId={selectedId!}
                userId={userId}
                conv={selectedConv}
                onBack={() => setSelectedId(null)}
                myAvatarUrl={myAvatarUrl}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
                <MessageCircle size={40} className="text-[#222222]/8 mb-3" />
                <p className="text-sm text-[#222222]/25">Wähle eine Konversation aus</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
