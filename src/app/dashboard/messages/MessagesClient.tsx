'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUp, MessageCircle, Trash2, Search, ImageIcon, X, Plus, Camera } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'
import { formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Conversation } from './page'

interface Props {
  conversations: Conversation[]
  userId: string
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢']

/* ─── Avatar ─── */
function Avatar({ name, avatarUrl, sm }: { name: string; avatarUrl?: string | null; sm?: boolean }) {
  const dim = sm ? 'w-8 h-8 text-[10px]' : 'w-11 h-11 text-sm'
  if (avatarUrl) {
    return (
      <span className={`block ${dim} rounded-full overflow-hidden flex-shrink-0`}>
        <Image src={avatarUrl} alt={name} width={44} height={44} className="w-full h-full object-cover" />
      </span>
    )
  }
  return (
    <div className={`${dim} rounded-full bg-[#F7F7F7] border border-[#E0E0E0] flex items-center justify-center font-bold text-[#717171] flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

/* ─── Message body renderer (text, image, or combined) ─── */
function MessageBody({ body, isOwn: _isOwn, onImageClick }: { body: string; isOwn: boolean; onImageClick: (url: string) => void }) {
  // Pure image
  if (body.startsWith('[img:') && body.endsWith(']')) {
    const url = body.slice(5, -1)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Bild"
        onClick={() => onImageClick(url)}
        className="block max-w-[240px] rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
      />
    )
  }
  // Combined: "text\n[img:URL]"
  const imgMatch = body.match(/^([\s\S]+)\n\[img:(.+)\]$/)
  if (imgMatch) {
    const [, text, url] = imgMatch
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm leading-relaxed text-[#222222]">{text}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Bild"
          onClick={() => onImageClick(url)}
          className="block max-w-[240px] rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity"
        />
      </div>
    )
  }
  return (
    <span className="text-sm leading-relaxed text-[#222222]">
      {body}
    </span>
  )
}

/* ─── Profile search result type ─── */
type ProfileResult = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  role: string
  slug: string | null
}

/* ─── Conversation List ─── */
function ConversationList({
  conversations,
  selectedId,
  userId,
  onSelect,
  onDelete,
  onNewConversation,
}: {
  conversations: Conversation[]
  selectedId: string | null
  userId: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNewConversation: (conv: Conversation) => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'alle' | 'ungelesen'>('alle')
  const [profileResults, setProfileResults] = useState<ProfileResult[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  // Search profiles when query >= 2 chars
  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setProfileResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('profiles') as any)
        .select('id, full_name, username, avatar_url, role, slug')
        .or(`full_name.ilike.%${value}%,username.ilike.%${value}%`)
        .in('role', ['rider', 'custom-werkstatt'])
        .neq('id', userId)
        .limit(8)
      setProfileResults((data ?? []) as ProfileResult[])
      setSearching(false)
    }, 300)
  }

  async function startConversation(profile: ProfileResult) {
    // Check if conversation already exists
    const existingConv = conversations.find(c => c.other?.id === profile.id)
    if (existingConv) {
      setSearch('')
      setProfileResults([])
      onSelect(existingConv.id)
      return
    }

    // Create new conversation (current user = buyer, selected profile = seller)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created } = await (supabase.from('conversations') as any)
      .insert({ seller_id: profile.id, buyer_id: userId })
      .select('id')
      .maybeSingle()

    if (created?.id) {
      const newConv: Conversation = {
        id: created.id,
        last_message_at: null,
        unread_count: 0,
        bike: null,
        other: {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          role: profile.role,
          slug: profile.slug,
        },
      }
      onNewConversation(newConv)
      setSearch('')
      setProfileResults([])
      onSelect(created.id)
    }
  }

  const showProfileResults = search.trim().length >= 2

  const filtered = conversations.filter(c => {
    const name = c.other?.full_name ?? c.other?.username ?? ''
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      (c.bike?.title ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'alle' || c.unread_count > 0
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    // Unread conversations always on top
    if (a.unread_count > 0 && b.unread_count === 0) return -1
    if (a.unread_count === 0 && b.unread_count > 0) return 1
    // Then by last_message_at descending
    const aTime = a.last_message_at ?? ''
    const bTime = b.last_message_at ?? ''
    return bTime.localeCompare(aTime)
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#222222]">Nachrichten</h1>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#222222]/30 pointer-events-none" />
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Person suchen…"
            className="w-full bg-[#F7F7F7] rounded-full pl-8 pr-8 py-2 text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none focus:outline-none focus:ring-0"
          />
          {search && (
            <button onClick={() => { setSearch(''); setProfileResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#222222]/25 hover:text-[#222222]/50">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter pills (hidden during profile search) */}
        {!showProfileResults && (
          <div className="flex gap-2">
            {(['alle', 'ungelesen'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-[#222222] text-white'
                    : 'bg-[#F7F7F7] text-[#222222]/60 hover:bg-[#EEEEEE]'
                }`}
              >
                {f === 'alle' ? 'Alle' : 'Ungelesen'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile search results */}
      {showProfileResults && (
        <div className="flex-1 overflow-y-auto">
          {searching && (
            <div className="px-5 py-8 text-center">
              <p className="text-xs text-[#222222]/30">Suche…</p>
            </div>
          )}
          {!searching && profileResults.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-xs text-[#222222]/30">Keine Personen gefunden</p>
            </div>
          )}
          {!searching && profileResults.map(p => {
            const name = p.full_name ?? p.username ?? 'Unbekannt'
            return (
              <div
                key={p.id}
                onClick={() => startConversation(p)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
              >
                <Avatar name={name} avatarUrl={p.avatar_url} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#222222] truncate">{name}</p>
                  <p className="text-[11px] text-[#222222]/35">
                    {p.role === 'rider' ? 'Rider' : 'Custom Werkstatt'}
                  </p>
                </div>
                <Plus size={14} className="text-[#222222]/20 flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {/* Conversation list */}
      {!showProfileResults && (
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageCircle size={28} className="text-[#222222]/10 mb-2" />
              <p className="text-sm text-[#222222]/30">Keine Nachrichten</p>
            </div>
          )}
          {filtered.map(conv => {
            const name = conv.other?.full_name ?? conv.other?.username ?? 'Unbekannt'
            const isSelected = conv.id === selectedId
            const hasUnread = conv.unread_count > 0
            return (
              <div
                key={conv.id}
                className={`group relative flex items-center gap-3 px-5 py-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#F7F7F7]' : hasUnread ? 'bg-[#06a5a5]/[0.04] hover:bg-[#06a5a5]/[0.07]' : 'hover:bg-[#FAFAFA]'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar name={name} avatarUrl={conv.other?.avatar_url} />
                  {hasUnread && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#06a5a5] rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${hasUnread && !isSelected ? 'font-bold' : 'font-semibold'} text-[#222222]`}>
                      {name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {conv.last_message_at && (
                        <span className={`text-[11px] ${hasUnread && !isSelected ? 'text-[#06a5a5] font-semibold' : 'text-[#222222]/30'}`}>
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      )}
                      {hasUnread && !isSelected && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-[#06a5a5] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  {conv.bike && (
                    <p className="text-xs text-[#222222]/40 truncate">{conv.bike.title}</p>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-50 text-[#222222]/20 hover:text-red-400"
                  title="Löschen"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Message Thread ─── */
function MessageThread({
  conversationId,
  userId,
  conv,
  onBack,
  myAvatarUrl,
  onSent,
}: {
  conversationId: string
  userId: string
  conv: Conversation
  onBack: () => void
  myAvatarUrl: string | null
  onSent: () => void
}) {
  const { messages, loading, sendMessage } = useMessages(conversationId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  // reactions: { [messageId]: { [emoji]: { count, userReacted } } }
  const [reactions, setReactions] = useState<Record<string, Record<string, { count: number; userReacted: boolean }>>>({})
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string } | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const initialLoadRef = useRef(true)
  const supabase = createClient()
  const name = conv.other?.full_name ?? conv.other?.username ?? 'Unbekannt'
  const profileSlug = conv.other?.slug ?? conv.other?.username
  const profileHref = profileSlug
    ? conv.other?.role === 'custom-werkstatt'
      ? `/custom-werkstatt/${profileSlug}`
      : `/rider/${profileSlug}`
    : null

  useEffect(() => {
    initialLoadRef.current = false
    const el = scrollContainerRef.current
    if (!el) return
    // Use requestAnimationFrame to ensure DOM is fully painted before scrolling
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  }, [messages])

  // Load reactions + subscribe to realtime
  useEffect(() => {
    if (!messages.length) return

    const msgIds = messages.map(m => m.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('message_reactions') as any)
      .select('message_id, user_id, emoji')
      .in('message_id', msgIds)
      .then(({ data }: { data: { message_id: string; user_id: string; emoji: string }[] | null }) => {
        if (!data) return
        const map: Record<string, Record<string, { count: number; userReacted: boolean }>> = {}
        for (const r of data) {
          if (!map[r.message_id]) map[r.message_id] = {}
          if (!map[r.message_id][r.emoji]) map[r.message_id][r.emoji] = { count: 0, userReacted: false }
          map[r.message_id][r.emoji].count++
          if (r.user_id === userId) map[r.message_id][r.emoji].userReacted = true
        }
        setReactions(map)
      })

    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reactions' }, (payload) => {
        const r = payload.new as { message_id: string; user_id: string; emoji: string }
        if (r.user_id === userId) return // eigene bereits optimistisch gesetzt
        setReactions(prev => {
          const cur = prev[r.message_id]?.[r.emoji] ?? { count: 0, userReacted: false }
          return { ...prev, [r.message_id]: { ...(prev[r.message_id] ?? {}), [r.emoji]: { count: cur.count + 1, userReacted: false } } }
        })
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'message_reactions' }, (payload) => {
        const r = payload.old as { message_id: string; user_id: string; emoji: string }
        if (r.user_id === userId) return // eigene bereits optimistisch gesetzt
        setReactions(prev => {
          const cur = prev[r.message_id]?.[r.emoji]
          if (!cur) return prev
          return { ...prev, [r.message_id]: { ...(prev[r.message_id] ?? {}), [r.emoji]: { count: Math.max(0, cur.count - 1), userReacted: false } } }
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, conversationId])

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    // Auto-resize
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleSend() {
    const body = text.trim()
    if ((!body && !previewFile) || sending || uploading) return

    if (previewFile) {
      await handleImageSend(previewFile.file, body)
      return
    }

    setSending(true)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage(body, userId)
    setSending(false)
    onSent()
  }

  async function handleImageSend(file: File, caption = '') {
    setUploading(true)
    const blobUrl = previewFile!.url
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${conversationId}/${Date.now()}.${ext}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.storage as any)
      .from('chat-images')
      .upload(path, file, { contentType: file.type })

    const imgUrl = (!error && data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.storage as any).from('chat-images').getPublicUrl(data.path).data.publicUrl
      : blobUrl

    const body = caption ? `${caption}\n[img:${imgUrl}]` : `[img:${imgUrl}]`
    await sendMessage(body, userId)

    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setPreviewFile(null)
    setUploading(false)
    onSent()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewFile({ file, url })
    e.target.value = ''
  }

  async function handleReact(msgId: string, emoji: string) {
    setHoveredMsgId(null)
    const already = reactions[msgId]?.[emoji]?.userReacted ?? false

    // Optimistic update — sofort anzeigen
    setReactions(prev => {
      const cur = prev[msgId]?.[emoji] ?? { count: 0, userReacted: false }
      return {
        ...prev,
        [msgId]: {
          ...(prev[msgId] ?? {}),
          [emoji]: {
            count: already ? Math.max(0, cur.count - 1) : cur.count + 1,
            userReacted: !already,
          },
        },
      }
    })

    if (already) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('message_reactions') as any)
        .delete()
        .eq('message_id', msgId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('message_reactions') as any)
        .insert({ message_id: msgId, user_id: userId, emoji })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#222222]/5 flex-shrink-0">
        <button
          onClick={onBack}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#222222]/5 transition-colors text-[#222222]/50"
        >
          <ArrowLeft size={16} />
        </button>
        {profileHref ? (
          <Link href={profileHref} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <Avatar name={name} avatarUrl={conv.other?.avatar_url} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#222222]">{name}</p>
              {conv.bike && <p className="text-xs text-[#222222]/35 truncate">{conv.bike.title}</p>}
            </div>
          </Link>
        ) : (
          <>
            <Avatar name={name} avatarUrl={conv.other?.avatar_url} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#222222]">{name}</p>
              {conv.bike && <p className="text-xs text-[#222222]/35 truncate">{conv.bike.title}</p>}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
        {loading && (
          <div className="flex flex-col gap-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-10 rounded-2xl bg-[#222222]/5 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 self-end'}`} />
            ))}
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <p className="text-xs text-[#222222]/25">Noch keine Nachrichten</p>
          </div>
        )}
        {messages.map(msg => {
          const isOwn = msg.sender_id === userId
          const avatarUrl = isOwn ? myAvatarUrl : conv.other?.avatar_url
          const msgReactions = reactions[msg.id] ?? {}
          const hasReactions = Object.values(msgReactions).some(v => v.count > 0)

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
            >
              {/* Other avatar */}
              {!isOwn && (
                <div className="relative flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-[#F7F7F7] flex items-center justify-center text-[10px] font-bold text-[#717171]">
                  {avatarUrl
                    ? <Image src={avatarUrl} alt={name} fill sizes="28px" className="object-cover" />
                    : name.charAt(0).toUpperCase()
                  }
                </div>
              )}

              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[72%]`}>
                {/* Emoji reaction bar (shown on hover) */}
                <div className={`transition-all duration-150 mb-1 ${hoveredMsgId === msg.id ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'}`}>
                  <div className="flex gap-0.5 bg-white rounded-full shadow-lg border border-[#222222]/8 px-1.5 py-1">
                    {REACTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(msg.id, emoji)}
                        className="text-sm px-1.5 py-0.5 rounded-full hover:bg-[#222222]/6 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bubble */}
                {msg.body.startsWith('[img:') ? (
                  <div className="rounded-2xl overflow-hidden">
                    <MessageBody body={msg.body} isOwn={isOwn} onImageClick={setLightboxUrl} />
                  </div>
                ) : (
                  <div className={`px-4 py-3 rounded-2xl ${
                    isOwn
                      ? 'bg-[#F7F7F7] rounded-br-sm border border-[#222222]/5'
                      : 'bg-[#F7F7F7] rounded-bl-sm border border-[#222222]/5'
                  }`}>
                    <MessageBody body={msg.body} isOwn={isOwn} onImageClick={setLightboxUrl} />
                    <p className="text-[10px] mt-1.5 text-[#222222]/30">
                      {formatRelativeTime(msg.created_at)}
                    </p>
                  </div>
                )}

                {/* Reaction indicators */}
                {hasReactions && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {Object.entries(msgReactions).filter(([, v]) => v.count > 0).map(([emoji, v]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(msg.id, emoji)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                          v.userReacted
                            ? 'bg-[#06a5a5]/10 border-[#06a5a5]/30 text-[#06a5a5]'
                            : 'bg-white border-[#222222]/10 text-[#222222]/60 hover:border-[#222222]/20'
                        }`}
                      >
                        {emoji} <span className="text-[10px] font-semibold">{v.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Own avatar */}
              {isOwn && (
                <div className="relative flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-[#06a5a5]/10 flex items-center justify-center text-[10px] font-bold text-[#06a5a5]">
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

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-[#222222]/5 bg-white pb-24 md:pb-0">

        {/* Image preview */}
        {previewFile && (
          <div className="px-4 pt-3">
            <div className="relative inline-block">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#222222]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewFile.url} alt="Vorschau" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#222222] rounded-full flex items-center justify-center text-white"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

        {/* Mobile: einzeiliges Layout */}
        <div className="flex items-center gap-2 px-3 py-3 sm:hidden">
          <button
            type="button"
            onClick={() => setPlusMenuOpen(true)}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[#555] active:bg-[#E0E0E0] transition-colors"
          >
            <Plus size={18} />
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
            placeholder="Nachricht schreiben..."
            className="flex-1 bg-white border border-[#E5E5E5] rounded-full px-4 h-10 text-[#222222] placeholder:text-[#999] outline-none focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !previewFile) || sending || uploading}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#F0F0F0] disabled:opacity-30 flex items-center justify-center transition-colors active:bg-[#E0E0E0]"
          >
            <ArrowUp size={16} className="text-[#555]" />
          </button>
        </div>

        {/* Desktop: mehrzeiliges Layout */}
        <div className="hidden sm:flex items-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-10 h-10 rounded-full border border-[#222222]/10 flex items-center justify-center text-[#222222]/40 hover:text-[#222222]/60 transition-colors mb-0.5"
          >
            <ImageIcon size={16} />
          </button>
          <div className="flex-1 relative bg-[#F7F7F7] border border-[#222222]/8 rounded-2xl focus-within:border-[#222222]/60 focus-within:bg-white transition-colors">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben…"
              rows={3}
              style={{ resize: 'none' }}
              className="w-full bg-transparent px-4 pt-3 pb-3 text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none focus:outline-none focus:ring-0 leading-relaxed"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !previewFile) || sending || uploading}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-[#06a5a5] hover:bg-[#058f8f] disabled:opacity-30 flex items-center justify-center transition-all mb-0.5"
          >
            <ArrowUp size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Plus-Menü Bottom Sheet (mobil) */}
      {plusMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:hidden" onClick={() => setPlusMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-t-2xl pb-8 pt-2 animate-slide-up-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#222222]/10 rounded-full mx-auto mb-4" />
            <button
              className="w-full flex items-center gap-4 px-6 py-4 active:bg-[#F7F7F7] transition-colors"
              onClick={() => { setPlusMenuOpen(false); fileInputRef.current?.click() }}
            >
              <div className="w-11 h-11 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                <ImageIcon size={20} className="text-[#333]" />
              </div>
              <span className="text-[#222222] font-medium">Foto oder Video hinzufügen</span>
            </button>
            <button
              className="w-full flex items-center gap-4 px-6 py-4 active:bg-[#F7F7F7] transition-colors"
              onClick={() => { setPlusMenuOpen(false); cameraInputRef.current?.click() }}
            >
              <div className="w-11 h-11 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                <Camera size={20} className="text-[#333]" />
              </div>
              <span className="text-[#222222] font-medium">Kamera</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Vollbild"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

/* ─── Main export ─── */
export default function MessagesClient({ conversations: initial, userId }: Props) {
  const searchParams = useSearchParams()
  const convParam = searchParams.get('conv')
  const [conversations, setConversations] = useState(initial)
  const [selectedId, setSelectedId] = useState<string | null>(
    convParam && initial.some(c => c.id === convParam) ? convParam : null
  )
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null)
  const selectedConv = conversations.find(c => c.id === selectedId) ?? null
  const supabase = createClient()
  const selectedIdRef = useRef(selectedId)

  async function handleDelete(convId: string) {
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

  // selectedIdRef immer aktuell halten
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])

  // Realtime: neue Nachricht → Konversation nach oben + unread_count updaten
  useEffect(() => {
    const channel = supabase
      .channel('conv-order')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as { conversation_id: string; sender_id: string; created_at: string }
          setConversations(prev => {
            const idx = prev.findIndex(c => c.id === msg.conversation_id)
            if (idx === -1) return prev
            const conv = prev[idx]
            const isActive = selectedIdRef.current === msg.conversation_id
            const isOtherUser = msg.sender_id !== userId
            const updated = {
              ...conv,
              last_message_at: msg.created_at,
              unread_count: isOtherUser && !isActive ? conv.unread_count + 1 : conv.unread_count,
            }
            // Konversation an erste Stelle
            const rest = prev.filter(c => c.id !== msg.conversation_id)
            return [updated, ...rest]
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedId) return
    // Sofort lokal als gelesen markieren
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, unread_count: 0 } : c
    ))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="flex-1 overflow-hidden min-h-0 lg:px-8 lg:py-6">
      <div className="h-full bg-white overflow-hidden lg:rounded-2xl lg:border lg:border-[#222222]/6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] h-full">

          {/* Left: conversation list */}
          <div className={`${selectedId ? 'hidden lg:flex' : 'flex'} flex-col h-full overflow-hidden border-r border-[#222222]/6`}>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              userId={userId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              onNewConversation={conv => setConversations(prev => [conv, ...prev])}
            />
          </div>

          {/* Right: message thread */}
          <div className={`${selectedId ? 'flex' : 'hidden lg:flex'} flex-col h-full overflow-hidden`}>
            {selectedConv ? (
              <MessageThread
                key={selectedId!}
                conversationId={selectedId!}
                userId={userId}
                conv={selectedConv}
                onBack={() => setSelectedId(null)}
                myAvatarUrl={myAvatarUrl}
                onSent={() => {
                  const now = new Date().toISOString()
                  setConversations(prev => {
                    const updated = prev.map(c =>
                      c.id === selectedId ? { ...c, last_message_at: now } : c
                    )
                    return [
                      ...updated.filter(c => c.id === selectedId),
                      ...updated.filter(c => c.id !== selectedId),
                    ]
                  })
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
                <MessageCircle size={40} className="text-[#222222]/8 mb-3" />
                <p className="text-sm font-semibold text-[#222222]/25">Wähle eine Konversation aus</p>
                <p className="text-xs text-[#222222]/15 mt-1">Deine Nachrichten erscheinen hier</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
