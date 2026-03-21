'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bookmark, MessageCircle, ChevronRight, Clock, Users, Send, ImageIcon, Video, X, Plus, Heart, Calendar, ExternalLink, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BUILDS, type Build } from '@/lib/data/builds'
import { EVENTS, type Event } from '@/lib/data/events'
import { RIDERS } from '@/lib/data/riders'
import { BUILDERS, type Builder } from '@/lib/data/builders'
import { formatRelativeTime } from '@/lib/utils'

/* ── Types ─────────────────────────────────────────────── */

type Category = 'alle' | 'allgemein' | 'projekte' | 'events' | 'hilfe' | 'biete-suche'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'projekte', label: 'Projekte' },
  { value: 'events', label: 'Events' },
  { value: 'hilfe', label: 'Hilfe' },
  { value: 'biete-suche', label: 'Biete/Suche' },
]

// Composer tags include "Allgemein" + all filter categories except "Alle"
const COMPOSER_TAGS: { value: Category; label: string }[] = [
  { value: 'allgemein', label: 'Allgemein' },
  ...CATEGORIES.filter(c => c.value !== 'alle'),
]

interface CommunityPost {
  id: string
  body: string | null
  media_urls: string[]
  created_at: string
  topic: Category | null
  event_slug: string | null
  user_id: string
  author_name: string
  author_initials: string
  author_avatar: string | null
  likes_count: number
  liked_by_me: boolean
}

interface PartItem {
  id: string
  kind: 'suche' | 'biete'
  title: string
  description: string
  userName: string
  userInitials: string
  userAvatar?: string
  city: string
  createdAt: string
}

interface WorkshopPost {
  id: string
  workshopName: string
  workshopSlug: string
  workshopInitials: string
  workshopAvatar?: string
  city: string
  body: string
  imageUrl?: string
  createdAt: string
}

type FeedItem =
  | { type: 'build'; data: Build; sortDate: string }
  | { type: 'event'; data: Event; sortDate: string }
  | { type: 'part'; data: PartItem; sortDate: string }
  | { type: 'workshop-post'; data: WorkshopPost; sortDate: string }
  | { type: 'community'; data: CommunityPost; sortDate: string }

/* ── Mock data ─────────────────────────────────────────── */

const PARTS: PartItem[] = [
  {
    id: 'p1',
    kind: 'biete',
    title: 'Mikuni VM32 Vergaser-Set (4x)',
    description: 'Komplett überholt, passt auf Honda CB500/550. Düsensatz inklusive.',
    userName: 'Lukas Bauer',
    userInitials: 'LB',
    userAvatar: RIDERS[0].avatar,
    city: 'Berlin',
    createdAt: '2026-03-19T14:00:00Z',
  },
  {
    id: 'p2',
    kind: 'suche',
    title: 'Öhlins Federbeine für BMW R80',
    description: 'Suche passende Öhlins Federbeine (340mm) für meinen R80 Bobber-Umbau.',
    userName: 'Felix Hoffmann',
    userInitials: 'FH',
    userAvatar: RIDERS[2].avatar,
    city: 'München',
    createdAt: '2026-03-18T09:30:00Z',
  },
  {
    id: 'p3',
    kind: 'biete',
    title: 'Motogadget m.unit blue',
    description: 'Neu & originalverpackt. Habe doppelt bestellt — Neupreis 299 €, VB 220 €.',
    userName: 'Sarah Klein',
    userInitials: 'SK',
    userAvatar: RIDERS[3].avatar,
    city: 'Köln',
    createdAt: '2026-03-17T16:45:00Z',
  },
]

const WORKSHOP_POSTS: WorkshopPost[] = [
  {
    id: 'wp1',
    workshopName: 'Jakob Kraft',
    workshopSlug: 'jakob-kraft',
    workshopInitials: 'JK',
    workshopAvatar: BUILDERS[0].team?.[0]?.avatar,
    city: 'Berlin',
    body: 'Der neue SR500 Tracker ist endlich fertig! 8 Monate Arbeit, komplett handgefertigt. Danke an alle, die uns auf dem Weg begleitet haben.',
    imageUrl: BUILDS[0].coverImg,
    createdAt: '2026-03-21T08:00:00Z',
  },
  {
    id: 'wp2',
    workshopName: 'Max Steiner',
    workshopSlug: 'max-steiner',
    workshopInitials: 'MS',
    workshopAvatar: BUILDERS[1].team?.[0]?.avatar,
    city: 'München',
    body: 'Samstag ist Open-Garage-Day! Kommt vorbei, schaut euch die aktuellen Projekte an und trinkt einen Kaffee mit uns. Ab 11 Uhr geht\'s los.',
    createdAt: '2026-03-20T16:00:00Z',
  },
  {
    id: 'wp3',
    workshopName: 'Studio Nord',
    workshopSlug: 'studio-nord',
    workshopInitials: 'SN',
    workshopAvatar: BUILDERS[2].team?.[0]?.avatar,
    city: 'Hamburg',
    body: 'Neues Projekt gestartet: Kawasaki Z650 Tracker-Umbau für einen Kunden aus Kiel. Updates folgen hier!',
    imageUrl: BUILDS[3]?.coverImg,
    createdAt: '2026-03-19T11:00:00Z',
  },
]

const BUILD_DATES = [
  '2026-03-20T10:00:00Z', '2026-03-17T15:00:00Z', '2026-03-14T12:00:00Z',
  '2026-03-11T08:00:00Z', '2026-03-08T18:00:00Z', '2026-03-05T11:00:00Z',
]
const EVENT_DATES = [
  '2026-03-21T09:00:00Z', '2026-03-16T14:00:00Z', '2026-03-13T10:00:00Z',
  '2026-03-09T16:00:00Z', '2026-03-06T12:00:00Z', '2026-03-03T09:00:00Z',
]

function seedNum(str: string, max: number, offset = 0): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h + offset) % max
}

/* ── Sidebar: Workshop list item ───────────────────────── */

function WorkshopItem({ builder }: { builder: Builder }) {
  return (
    <Link href={`/custom-werkstatt/${builder.slug}`} className="flex items-center gap-3 group py-2">
      <div className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {builder.avatarUrl ? (
          <Image src={builder.avatarUrl} alt={builder.name} width={36} height={36} className="object-cover w-full h-full" />
        ) : (
          <span className="text-[11px] font-bold text-[#222222]/40">{builder.initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate leading-tight">
          {builder.name}
        </p>
        <p className="text-[11px] text-[#717171] truncate">{builder.specialty} · {builder.city}</p>
      </div>
    </Link>
  )
}

/* ── Sidebar: Rider list item ──────────────────────────── */

function RiderItem({ rider }: { rider: typeof RIDERS[number] }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-[#F0F0F0] flex-shrink-0 overflow-hidden">
        {rider.avatar ? (
          <Image src={rider.avatar} alt={rider.name} width={36} height={36} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-[#222222]/40">
            {rider.initials}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[#222222] truncate leading-tight">{rider.name}</p>
        <p className="text-[11px] text-[#717171] truncate">{rider.style} · {rider.city}</p>
      </div>
    </div>
  )
}

/* ── Feed: Build / Projekt Card ────────────────────────── */

function BuildCard({ build }: { build: Build }) {
  const saves = 5 + seedNum(build.slug, 45)
  const comments = seedNum(build.slug, 20, 7)

  return (
    <div className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden hover:shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={build.coverImg}
          alt={build.title}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-[#06a5a5] text-white rounded-full">
            {build.style}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#222222] text-base mb-1">{build.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#717171] mb-2">
          <MapPin size={12} />
          <span>{build.city}, {build.country}</span>
        </div>
        <p className="text-sm text-[#717171] line-clamp-2 mb-3">{build.tagline}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[10px] font-bold text-[#222222]/40">
              {build.builder.initials}
            </div>
            <span className="text-xs text-[#717171]">{build.builder.name}</span>
          </div>
          <div className="flex items-center gap-3 text-[#B0B0B0]">
            <span className="flex items-center gap-1 text-xs">
              <Bookmark size={13} /> {saves}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MessageCircle size={13} /> {comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Feed: Workshop Post Card ──────────────────────────── */

function WorkshopPostCard({ post }: { post: WorkshopPost }) {
  return (
    <div className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-0">
        <Link href={`/custom-werkstatt/${post.workshopSlug}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center overflow-hidden">
            {post.workshopAvatar ? (
              <Image src={post.workshopAvatar} alt={post.workshopName} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <span className="text-xs font-bold text-[#222222]/40">{post.workshopInitials}</span>
            )}
          </div>
        </Link>
        <div className="min-w-0">
          <Link href={`/custom-werkstatt/${post.workshopSlug}`} className="text-sm font-semibold text-[#222222] hover:text-[#06a5a5] transition-colors truncate block leading-tight">
            {post.workshopName}
          </Link>
          <p className="text-[11px] text-[#717171]">Custom Werkstatt · {post.city}</p>
        </div>
        <span className="ml-auto text-[11px] text-[#B0B0B0] whitespace-nowrap">{formatRelativeTime(post.createdAt)}</span>
      </div>

      <div className="px-4 pt-3 pb-4">
        <p className="text-sm text-[#222222] leading-relaxed">{post.body}</p>
      </div>

      {post.imageUrl && (
        <div className="relative aspect-video overflow-hidden">
          <Image src={post.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
        </div>
      )}
    </div>
  )
}

/* ── Feed: Event Card ──────────────────────────────────── */

function EventCard({ event }: { event: Event }) {
  const participants = 12 + event.id * 5

  return (
    <div className="bg-white rounded-2xl border border-[#222222]/6 p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="px-2.5 py-1 text-[11px] font-semibold bg-violet-50 text-violet-600 rounded-full">
          Event
        </span>
      </div>

      <h3 className="font-bold text-[#222222] text-base mb-1">{event.name}</h3>

      <div className="flex items-center gap-4 text-xs text-[#717171] mb-2">
        <span className="flex items-center gap-1.5">
          <Clock size={12} /> {event.date}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={12} /> {event.location}
        </span>
      </div>

      <p className="text-sm text-[#717171] line-clamp-2 mb-3">{event.description}</p>

      <div className="flex items-center gap-2.5">
        <div className="flex -space-x-2">
          {RIDERS.slice(0, 4).map((r, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-[#F0F0F0] flex-shrink-0">
              {r.avatar ? (
                <Image src={r.avatar} alt={r.name} width={28} height={28} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">{r.initials}</div>
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-[#717171] flex items-center gap-1">
          <Users size={12} /> {participants} Teilnehmer
        </span>
      </div>
    </div>
  )
}

/* ── Feed: Teile Card ──────────────────────────────────── */

function PartCard({ part }: { part: PartItem }) {
  const isBiete = part.kind === 'biete'

  return (
    <div className="bg-white rounded-2xl border border-[#222222]/6 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
          isBiete
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-amber-50 text-amber-600'
        }`}>
          {isBiete ? 'Biete' : 'Suche'}
        </span>
      </div>

      <h3 className="font-semibold text-[#222222] text-sm mb-1">{part.title}</h3>
      <p className="text-sm text-[#717171] line-clamp-2 mb-3">{part.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-[#F0F0F0] flex-shrink-0">
            {part.userAvatar ? (
              <Image src={part.userAvatar} alt={part.userName} width={24} height={24} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">{part.userInitials}</div>
            )}
          </div>
          <span className="text-xs text-[#717171]">{part.userName}</span>
        </div>
        <span className="text-[11px] text-[#B0B0B0]">{formatRelativeTime(part.createdAt)}</span>
      </div>
    </div>
  )
}

/* ── Feed: Community Post Card (user-generated) ────────── */

interface Comment {
  id: string
  body: string
  created_at: string
  user_name: string
  user_initials: string
  user_avatar: string | null
}

function CommunityPostCard({ post, onLike, loggedIn, userId }: { post: CommunityPost; onLike: () => void; loggedIn: boolean; userId: string | null }) {
  const [commentInputOpen, setCommentInputOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const supabase = createClient()
  const tagLabel = COMPOSER_TAGS.find(c => c.value === post.topic)?.label
  const imageUrls = (post.media_urls ?? []).filter(u => u)

  // Load comments on mount
  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('community_post_comments') as any)
        .select('id, body, created_at, user_id')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (!data || data.length === 0) return

      const userIds = [...new Set((data as { user_id: string }[]).map(c => c.user_id))]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profiles } = await (supabase.from('profiles') as any)
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      const pMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
      for (const p of (profiles ?? [])) pMap[p.id] = p

      setComments((data as { id: string; body: string; created_at: string; user_id: string }[]).map(c => {
        const prof = pMap[c.user_id]
        const name = prof?.full_name ?? 'Unbekannt'
        return {
          id: c.id,
          body: c.body,
          created_at: c.created_at,
          user_name: name,
          user_initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          user_avatar: prof?.avatar_url ?? null,
        }
      }))
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id])

  async function handleSubmitComment() {
    if (!userId || !commentText.trim()) return
    const text = commentText.trim()
    setSubmittingComment(true)

    // Optimistic: add comment to local state immediately
    const tempId = `temp-${Date.now()}`
    const optimisticComment: Comment = {
      id: tempId,
      body: text,
      created_at: new Date().toISOString(),
      user_name: post.author_name, // fallback, will be overridden if profile loads
      user_initials: '…',
      user_avatar: null,
    }

    // Try to get the commenter's profile for display
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prof } = await (supabase.from('profiles') as any)
      .select('full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    const name = prof?.full_name ?? 'Du'
    optimisticComment.user_name = name
    optimisticComment.user_initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    optimisticComment.user_avatar = prof?.avatar_url ?? null

    setComments(prev => [...prev, optimisticComment])
    setCommentText('')
    setSubmittingComment(false)

    // Persist to Supabase in background (may fail if table doesn't exist yet)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: inserted } = await (supabase.from('community_post_comments') as any)
        .insert({ post_id: post.id, user_id: userId, body: text })
        .select('id')
        .maybeSingle()

      if (inserted) {
        // Replace temp id with real id
        setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: inserted.id } : c))
      }
    } catch {
      // Table may not exist yet — comment stays in local state
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="w-10 h-10 rounded-full bg-[#F7F7F7] border border-[#222222]/8 flex items-center justify-center overflow-hidden flex-shrink-0">
          {post.author_avatar ? (
            <Image src={post.author_avatar} alt={post.author_name} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <span className="text-xs font-bold text-[#222222]/40">{post.author_initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#222222] truncate leading-tight">{post.author_name}</p>
          <p className="text-[11px] text-[#717171]">{formatRelativeTime(post.created_at)}</p>
        </div>
        {tagLabel && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#222222] text-white flex-shrink-0">
            {tagLabel}
          </span>
        )}
      </div>

      {post.body && (
        <div className="px-4 pt-3">
          <p className="text-sm text-[#222222] leading-relaxed">{post.body}</p>
        </div>
      )}

      {/* Event link */}
      {post.event_slug && (() => {
        const ev = EVENTS.find(e => e.slug === post.event_slug)
        if (!ev) return null
        const participants = 12 + ev.id * 5
        return (
          <div className="mx-4 mt-3">
            <a
              href={`/events/${ev.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl border border-[#222222]/6 hover:border-[#06a5a5]/30 hover:bg-[#06a5a5]/3 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#06a5a5]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-[#06a5a5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#222222] truncate leading-tight">{ev.name}</p>
                  <p className="text-[11px] text-[#717171]">{ev.date} · {ev.location}</p>
                </div>
                <ExternalLink size={14} className="text-[#222222]/20 group-hover:text-[#06a5a5] transition-colors flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2.5 mt-2.5 pl-12">
                <div className="flex -space-x-2">
                  {RIDERS.slice(0, 4).map((r, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-[#F0F0F0] flex-shrink-0">
                      {r.avatar ? (
                        <Image src={r.avatar} alt={r.name} width={24} height={24} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-[#222222]/40">{r.initials}</div>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-[#717171]">{participants} Teilnehmer</span>
              </div>
            </a>
          </div>
        )
      })()}

      {imageUrls.length > 0 && (
        <div className="relative aspect-video overflow-hidden mt-3">
          <Image src={imageUrls[0]} alt="" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={onLike}
          disabled={!loggedIn}
          className="flex items-center gap-1.5 group"
        >
          <Heart
            size={18}
            className={`transition-colors ${post.liked_by_me ? 'fill-[#06a5a5] text-[#06a5a5]' : 'text-[#222222]/30 group-hover:text-[#06a5a5]'}`}
          />
          {post.likes_count > 0 && (
            <span className={`text-xs font-semibold ${post.liked_by_me ? 'text-[#06a5a5]' : 'text-[#222222]/40'}`}>
              {post.likes_count}
            </span>
          )}
        </button>
        {loggedIn ? (
          <button
            type="button"
            onClick={() => setCommentInputOpen(prev => !prev)}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle size={18} className={`transition-colors ${commentInputOpen ? 'text-[#06a5a5]' : 'text-[#222222]/30 group-hover:text-[#06a5a5]'}`} />
            {comments.length > 0 && (
              <span className="text-xs font-semibold text-[#222222]/40">{comments.length}</span>
            )}
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <MessageCircle size={18} className="text-[#222222]/30" />
            {comments.length > 0 && (
              <span className="text-xs font-semibold text-[#222222]/40">{comments.length}</span>
            )}
          </span>
        )}
      </div>

      {/* Comments — only for logged-in users */}
      {loggedIn && comments.length > 0 && (
        <div className="px-4 pb-1">
          <div className="flex flex-col gap-2.5">
            {comments.map(c => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#F7F7F7] border border-[#222222]/8 flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                  {c.user_avatar ? (
                    <Image src={c.user_avatar} alt={c.user_name} width={28} height={28} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-[9px] font-bold text-[#222222]/40">{c.user_initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug">
                    <span className="font-semibold text-[#222222]">{c.user_name}</span>{' '}
                    <span className="text-[#222222]/80">{c.body}</span>
                  </p>
                  <p className="text-[10px] text-[#B0B0B0] mt-0.5">{formatRelativeTime(c.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment input — toggled by button, only logged in */}
      {loggedIn && commentInputOpen && (
        <div className="px-4 pb-4 pt-2 animate-expand">
          {loggedIn ? (
            <div className="flex items-center gap-2 border-t border-[#222222]/6 pt-3">
              <input
                autoFocus
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Kommentar schreiben…"
                className="flex-1 text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-transparent"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitComment() } }}
                disabled={submittingComment}
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={submittingComment || !commentText.trim()}
                className="text-[#06a5a5] hover:text-[#058f8f] disabled:opacity-30 transition-colors text-xs font-semibold"
              >
                Veröffentlichen
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#222222]/30 border-t border-[#222222]/6 pt-3">Melde dich an, um zu kommentieren.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

interface Props {
  userId: string | null
  userCity: string | null
}

export default function ExploreClient({ userId, userCity }: Props) {
  const [category, setCategory] = useState<Category>('alle')
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false)
  const [body, setBody] = useState('')
  const [composerTag, setComposerTag] = useState<Category>('allgemein')
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(null)
  const [eventPickerOpen, setEventPickerOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const canPost = !!userId

  // Load community posts from Supabase
  const loadPosts = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: postsData } = await (supabase.from('community_posts') as any)
      .select('id, body, media_urls, created_at, user_id, topic, event_slug')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!postsData || postsData.length === 0) { setCommunityPosts([]); return }

    const userIds = [...new Set((postsData as { user_id: string }[]).map(p => p.user_id))]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profilesData } = await (supabase.from('profiles') as any)
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
    for (const prof of (profilesData ?? [])) profileMap[prof.id] = prof

    // Load likes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: likesData } = await (supabase.from('community_post_likes') as any)
      .select('post_id, user_id')

    const likesMap: Record<string, { count: number; byMe: boolean }> = {}
    for (const l of (likesData ?? [])) {
      if (!likesMap[l.post_id]) likesMap[l.post_id] = { count: 0, byMe: false }
      likesMap[l.post_id].count++
      if (l.user_id === userId) likesMap[l.post_id].byMe = true
    }

    const mapped: CommunityPost[] = (postsData as { id: string; body: string | null; media_urls: string[]; created_at: string; user_id: string; topic: string | null; event_slug: string | null }[]).map(p => {
      const profile = profileMap[p.user_id] ?? null
      const name = profile?.full_name ?? 'Unbekannt'
      return {
        id: p.id,
        body: p.body,
        media_urls: p.media_urls ?? [],
        created_at: p.created_at,
        user_id: p.user_id,
        topic: (p.topic as Category | null) ?? null,
        event_slug: p.event_slug ?? null,
        author_name: name,
        author_initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        author_avatar: profile?.avatar_url ?? null,
        likes_count: likesMap[p.id]?.count ?? 0,
        liked_by_me: likesMap[p.id]?.byMe ?? false,
      }
    })

    setCommunityPosts(mapped)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => { loadPosts() }, [loadPosts])

  async function handleLike(postId: string) {
    if (!userId) return
    const post = communityPosts.find(p => p.id === postId)
    if (!post) return
    const optimistic = !post.liked_by_me
    setCommunityPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      liked_by_me: optimistic,
      likes_count: optimistic ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
    } : p))

    if (optimistic) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('community_post_likes') as any).insert({ post_id: postId, user_id: userId })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('community_post_likes') as any).delete().eq('post_id', postId).eq('user_id', userId)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newFiles = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setMediaFiles(prev => [...prev, ...newFiles].slice(0, 4))
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || (!body.trim() && mediaFiles.length === 0)) return
    setSubmitting(true)

    const uploadedUrls: string[] = []
    for (const { file } of mediaFiles) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.storage as any)
        .from('community-media')
        .upload(path, file, { contentType: file.type })
      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: urlData } = (supabase.storage as any).from('community-media').getPublicUrl(data.path)
        uploadedUrls.push(urlData.publicUrl)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('community_posts') as any).insert({
      user_id: userId,
      body: body.trim() || null,
      media_urls: uploadedUrls,
      topic: composerTag,
      event_slug: composerTag === 'events' ? selectedEventSlug : null,
    })

    setBody('')
    setComposerTag('allgemein')
    setSelectedEventSlug(null)
    setMediaFiles([])
    setComposerOpen(false)
    setSubmitting(false)
    await loadPosts()
  }

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []

    BUILDS.forEach((build, i) => {
      items.push({ type: 'build', data: build, sortDate: build.publishedAt ?? BUILD_DATES[i] ?? '2026-03-01' })
    })
    EVENTS.forEach((event, i) => {
      items.push({ type: 'event', data: event, sortDate: EVENT_DATES[i] ?? '2026-03-01' })
    })
    PARTS.forEach(part => {
      items.push({ type: 'part', data: part, sortDate: part.createdAt })
    })
    WORKSHOP_POSTS.forEach(post => {
      items.push({ type: 'workshop-post', data: post, sortDate: post.createdAt })
    })
    communityPosts.forEach(post => {
      items.push({ type: 'community', data: post, sortDate: post.created_at })
    })

    items.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    return items
  }, [communityPosts])

  const filteredItems = useMemo(() => {
    if (category === 'alle') return feedItems

    return feedItems.filter(item => {
      // Community posts match by their topic tag
      if (item.type === 'community') {
        return item.data.topic === category
      }
      // Static items match by type
      switch (category) {
        case 'projekte':
          return item.type === 'build'
        case 'events':
          return item.type === 'event'
        case 'hilfe':
          return false // only community posts with topic 'hilfe'
        case 'biete-suche':
          return item.type === 'part'
        default:
          return true
      }
    })
  }, [category, feedItems])

  // Sort workshops: user's city first, then others
  const nearbyWorkshops = useMemo(() => {
    if (!userCity) return BUILDERS.slice(0, 3)
    const city = userCity.toLowerCase()
    return [...BUILDERS]
      .sort((a, b) => {
        const aMatch = a.city.toLowerCase() === city ? 0 : 1
        const bMatch = b.city.toLowerCase() === city ? 0 : 1
        return aMatch - bMatch
      })
      .slice(0, 3)
  }, [userCity])

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────── */}
      <div className="hidden lg:block">
        <aside className="w-80 flex-shrink-0 flex flex-col gap-3 pt-3 pb-3 pl-4 sm:pl-5 lg:pl-8 pr-3 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">

          {/* Werkstätten in der Nähe — nur für eingeloggte Nutzer */}
          {userId && (
            <div className="bg-white rounded-2xl border border-[#222222]/6 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-2">
                Werkstätten in der Nähe
              </p>
              <div className="flex flex-col">
                {nearbyWorkshops.map(b => (
                  <WorkshopItem key={b.slug} builder={b} />
                ))}
              </div>
              <Link
                href="/custom-werkstatt"
                className="flex items-center gap-1 text-xs font-medium text-[#06a5a5] mt-2 hover:text-[#058f8f] transition-colors"
              >
                Alle anzeigen <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* Aktive Rider */}
          <div className="bg-white rounded-2xl border border-[#222222]/6 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-2">
              Aktive Rider
            </p>
            <div className="flex flex-col">
              {RIDERS.slice(0, 3).map(r => (
                <RiderItem key={r.slug} rider={r} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Feed ────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[560px]">
          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                  category === cat.value
                    ? 'bg-[#222222] text-white border-[#222222]'
                    : 'border-[#222222]/10 text-[#222222]/45 hover:border-[#DDDDDD]/40 hover:text-[#222222]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Composer */}
          {canPost ? (
            <div className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden mb-4">
              {!composerOpen ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F7F7F7] transition-colors"
                >
                  <span className="text-sm text-[#222222]/30 flex-1">Was fährst du gerade? Teile es mit der Community…</span>
                  <span className="w-8 h-8 rounded-full bg-[#06a5a5] flex items-center justify-center flex-shrink-0">
                    <Plus size={16} className="text-white" />
                  </span>
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="p-4 animate-expand">
                  <textarea
                    autoFocus
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Was fährst du gerade? Teile es mit der Community…"
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
                        onClick={() => { setComposerTag(t.value); if (t.value !== 'events') { setSelectedEventSlug(null); setEventPickerOpen(false) } }}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                          composerTag === t.value
                            ? 'bg-[#222222] text-white border-[#222222]'
                            : 'text-[#222222]/40 border-[#222222]/6 hover:border-[#222222]/20'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Event picker — shown when "Events" tag is selected */}
                  {composerTag === 'events' && (
                    <div className="mt-3 relative">
                      <button
                        type="button"
                        onClick={() => setEventPickerOpen(prev => !prev)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#222222]/6 hover:border-[#222222]/15 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-[#06a5a5]" />
                          {selectedEventSlug
                            ? EVENTS.find(e => e.slug === selectedEventSlug)?.name ?? 'Event wählen'
                            : <span className="text-[#222222]/30">Event wählen…</span>
                          }
                        </span>
                        <ChevronDown size={14} className={`text-[#222222]/30 transition-transform ${eventPickerOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {eventPickerOpen && (
                        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#222222]/6 rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.08)] overflow-hidden animate-expand">
                          {EVENTS.map(ev => (
                            <button
                              key={ev.slug}
                              type="button"
                              onClick={() => { setSelectedEventSlug(ev.slug); setEventPickerOpen(false) }}
                              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[#F7F7F7] transition-colors flex items-center justify-between ${
                                selectedEventSlug === ev.slug ? 'bg-[#06a5a5]/5 text-[#06a5a5] font-semibold' : 'text-[#222222]'
                              }`}
                            >
                              <span>{ev.name}</span>
                              <span className="text-[10px] text-[#222222]/30">{ev.date}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media previews */}
                  {mediaFiles.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {mediaFiles.map((m, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#222222]/6 flex-shrink-0">
                          {m.file.type.startsWith('video/') ? (
                            <video src={m.url} className="w-full h-full object-cover" />
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

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F0F0]">
                    <div className="flex items-center gap-1">
                      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors">
                        <ImageIcon size={15} />
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors">
                        <Video size={15} />
                      </button>
                      <button type="button" onClick={() => { setComposerOpen(false); setBody(''); setComposerTag('allgemein'); setSelectedEventSlug(null); setMediaFiles([]) }} className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors ml-1">
                        <X size={15} />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || (!body.trim() && mediaFiles.length === 0)}
                      className="flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
                    >
                      <Send size={12} />
                      {submitting ? 'Wird gepostet…' : 'Veröffentlichen'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#222222]/6 p-4 text-center mb-4">
              <p className="text-sm text-[#222222]/40 mb-3">Melde dich an, um Beiträge zu teilen</p>
              <a href="/auth/login" className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all">
                Anmelden
              </a>
            </div>
          )}

          {/* Card stream */}
          <div className="flex flex-col gap-4">
            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-[#B0B0B0] text-sm">
                Keine Einträge in dieser Kategorie.
              </div>
            )}

            {filteredItems.map((item) => {
              switch (item.type) {
                case 'build':
                  return <BuildCard key={`b-${item.data.slug}`} build={item.data} />
                case 'event':
                  return <EventCard key={`e-${item.data.id}`} event={item.data} />
                case 'part':
                  return <PartCard key={`p-${item.data.id}`} part={item.data} />
                case 'workshop-post':
                  return <WorkshopPostCard key={`wp-${item.data.id}`} post={item.data} />
                case 'community':
                  return <CommunityPostCard key={`cp-${item.data.id}`} post={item.data} onLike={() => handleLike(item.data.id)} loggedIn={!!userId} userId={userId} />
              }
            })}
          </div>
        </div>
      </main>
    </>
  )
}
