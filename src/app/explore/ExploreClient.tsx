'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ChevronLeft, ChevronRight, Plus, ThumbsUp, Trash2, MapPin, Calendar, ExternalLink, Navigation, Bell, MoreHorizontal, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MediaItem } from '@/components/bike/MediaSlider'
import PostImageCarousel from '@/components/explore/PostImageCarousel'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import { formatRelativeTime } from '@/lib/utils'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { LoginModal } from '@/components/ui/LoginModal'
import { getProfileUrl } from '@/lib/utils/profileLink'
import RiderList from '@/components/explore/RiderStories'
import { useAuth } from '@/hooks/useAuth'
import LazyMap from '@/components/map/LazyMap'
import LazyRideMap from '@/components/map/LazyRideMap'


/* ── Types ─────────────────────────────────────────────── */

type Category = 'alle' | 'allgemein' | 'projekte' | 'events' | 'hilfe' | 'biete-suche' | 'in-der-naehe' | 'freunde'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'alle', label: 'Explore' },
  { value: 'freunde', label: 'Freunde' },
  { value: 'in-der-naehe', label: 'In der Nähe' },
  { value: 'events', label: 'Events' },
]

// Composer tags: categories the user can post in
const COMPOSER_TAGS: { value: Category; label: string }[] = [
  { value: 'in-der-naehe', label: 'In der Nähe' },
  { value: 'events', label: 'Events' },
]

interface RideStop {
  name: string
  lon: number
  lat: number
}

interface CommunityPost {
  id: string
  body: string | null
  media_urls: string[]
  created_at: string
  topic: Category | null
  user_id: string
  author_name: string
  author_initials: string
  author_avatar: string | null
  likes_count: number
  liked_by_me: boolean
  latitude: number | null
  longitude: number | null
  location_name: string | null
  event_slug: string | null
  author_role: string | null
  author_slug: string | null
  author_username: string | null
  bike_id: string | null
  bike_title: string | null
  bike_slug: string | null
  // Ride fields
  post_type: 'post' | 'ride'
  ride_visibility: 'public' | 'friends' | null
  ride_stops: RideStop[] | null
  ride_start_at: string | null
  ride_max_participants: number | null
  ride_participant_count: number
  ride_joined_by_me: boolean
  ride_participant_avatars: { name: string; avatar_url: string | null }[]
}

/* ── Sidebar: Rider list item ──────────────────────────── */

interface SidebarRider {
  slug: string
  name: string
  initials: string
  bio: string
  avatar?: string
  isOnline: boolean
}

function RiderItem({ rider }: { rider: SidebarRider }) {
  return (
    <Link href={`/rider/${rider.slug}`} className="flex items-center gap-3 group py-2">
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-[#2AABAB] overflow-hidden">
          {rider.avatar ? (
            <Image src={rider.avatar} alt={rider.name} width={36} height={36} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pin-logo.svg" alt="" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
        {rider.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[#222222] group-hover:text-[#06a5a5] transition-colors truncate leading-tight">{rider.name}</p>
        {rider.bio && <p className="text-[11px] text-[#717171] truncate">{rider.bio}</p>}
      </div>
    </Link>
  )
}

/* ── Helper: render @mentions as clickable links ──────── */

function renderWithMentions(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_-]+)/g)
  return parts.map((part, i) => {
    if (/^@[a-zA-Z0-9_-]+$/.test(part)) {
      const username = part.slice(1)
      return (
        <Link key={i} href={`/rider/${username}`} className="text-[#06a5a5] font-semibold hover:underline">
          {part}
        </Link>
      )
    }
    return part
  })
}

/* ── Helper: convert media URLs to MediaSlider items ───── */

const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.m4v']

function urlsToMediaItems(urls: string[]): MediaItem[] {
  return urls.filter(Boolean).map((url, i) => {
    const lower = url.toLowerCase()
    const isVideo = VIDEO_EXTS.some(ext => lower.includes(ext))
    return {
      id: `media-${i}-${url.slice(-12)}`,
      url,
      thumbnail_url: null,
      media_type: isVideo ? 'video' as const : 'image' as const,
      position: i,
    }
  })
}

/* ── Post Context Menu (3-dot dropdown) ───────────────── */

function PostContextMenu({ onShare, onDelete }: { onShare: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#222222]/30 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl shadow-black/15 border border-[#222222]/8 overflow-hidden w-44 z-50">
          <button
            type="button"
            onClick={() => { onShare(); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
          >
            <Share2 size={14} className="text-[#222222]/40" />
            Teilen
          </button>
          <div className="h-px bg-[#222222]/6 mx-3" />
          <button
            type="button"
            onClick={() => { onDelete(); setOpen(false) }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Löschen
          </button>
        </div>
      )}
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
  user_slug: string | null
  user_role: string | null
  like_count: number
  liked_by_me: boolean
}

function CommunityPostCard({ post, onLike, loggedIn, userId, isSuperadmin, onDelete, onLoginRequired, onJoinRide, onLeaveRide, allEvents, postIndex = 99 }: { post: CommunityPost; onLike: () => void; loggedIn: boolean; userId: string | null; isSuperadmin?: boolean; onDelete?: () => void; onLoginRequired?: (context: 'like' | 'comment') => void; onJoinRide?: () => void; onLeaveRide?: () => void; allEvents: Event[]; postIndex?: number }) {
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
      const { data } = await (supabase.from('community_post_comments') as any)
        .select('id, body, created_at, user_id')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (!data || data.length === 0) return

      const userIds = [...new Set((data as { user_id: string }[]).map(c => c.user_id))]
      const commentIds = (data as { id: string }[]).map(c => c.id)

      // Fetch profiles + likes in parallel (both depend only on comments data)
      const [{ data: profiles }, { data: likesData }] = await Promise.all([
        (supabase.from('profiles') as any)
          .select('id, full_name, avatar_url, slug, role')
          .in('id', userIds),
        (supabase.from('community_comment_likes') as any)
          .select('comment_id, user_id')
          .in('comment_id', commentIds),
      ])

      const pMap: Record<string, { full_name: string | null; avatar_url: string | null; slug: string | null; role: string | null }> = {}
      for (const p of (profiles ?? [])) pMap[p.id] = p

      const likeCounts: Record<string, number> = {}
      const myLikes = new Set<string>()
      for (const l of (likesData ?? []) as { comment_id: string; user_id: string }[]) {
        likeCounts[l.comment_id] = (likeCounts[l.comment_id] ?? 0) + 1
        if (l.user_id === userId) myLikes.add(l.comment_id)
      }

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
          user_slug: prof?.slug ?? null,
          user_role: prof?.role ?? null,
          like_count: likeCounts[c.id] ?? 0,
          liked_by_me: myLikes.has(c.id),
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
      user_slug: null,
      user_role: null,
      like_count: 0,
      liked_by_me: false,
    }

    // Try to get the commenter's profile for display
    const { data: prof } = await (supabase.from('profiles') as any)
      .select('full_name, avatar_url, slug, role')
      .eq('id', userId)
      .maybeSingle()

    const name = prof?.full_name ?? 'Du'
    optimisticComment.user_name = name
    optimisticComment.user_initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    optimisticComment.user_avatar = prof?.avatar_url ?? null
    optimisticComment.user_slug = prof?.slug ?? null
    optimisticComment.user_role = prof?.role ?? null

    setComments(prev => [...prev, optimisticComment])
    setCommentText('')
    setSubmittingComment(false)

    // Persist to Supabase in background (may fail if table doesn't exist yet)
    try {
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

  async function handleCommentLike(commentId: string) {
    if (!userId) return
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return
    const next = !comment.liked_by_me
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, liked_by_me: next, like_count: next ? c.like_count + 1 : Math.max(0, c.like_count - 1) } : c))
    try {
      if (next) {
        await (supabase.from('community_comment_likes') as any).insert({ comment_id: commentId, user_id: userId })
      } else {
        await (supabase.from('community_comment_likes') as any).delete().eq('comment_id', commentId).eq('user_id', userId)
      }
    } catch { /* table may not exist yet */ }
  }

  return (
    <div id={`post-${post.id}`} className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-0">
        {(() => {
          const profileHref = getProfileUrl(post.author_role, post.author_slug)
          const avatar = (
            <div className="w-10 h-10 rounded-full bg-[#2AABAB] flex items-center justify-center overflow-hidden flex-shrink-0">
              {post.author_avatar ? (
                <Image src={post.author_avatar} alt={post.author_name} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <div className="p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/pin-logo.svg" alt="" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          )
          const nameBlock = (
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold text-[#222222] truncate leading-tight ${profileHref ? 'group-hover/author:text-[#06a5a5] transition-colors' : ''}`}>{post.author_name}</p>
              <p className="text-[11px] text-[#717171]">{formatRelativeTime(post.created_at)}</p>
            </div>
          )
          return profileHref ? (
            <Link href={profileHref} className="flex items-center gap-3 min-w-0 flex-1 group/author">
              {avatar}{nameBlock}
            </Link>
          ) : (
            <>{avatar}{nameBlock}</>
          )
        })()}
        {tagLabel && post.topic !== 'allgemein' && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#222222]/8 text-[#222222]/50 flex-shrink-0">
            {tagLabel}
          </span>
        )}
        {(isSuperadmin || post.user_id === userId) && onDelete && (
          <PostContextMenu
            onShare={() => { navigator.clipboard.writeText(`${window.location.origin}/explore?post=${post.id}`) }}
            onDelete={onDelete}
          />
        )}
      </div>

      {post.body && (
        <div className="px-4 pt-3">
          <p className="text-sm text-[#222222] leading-relaxed">{renderWithMentions(post.body)}</p>
        </div>
      )}

      {/* Linked event */}
      {post.event_slug && (() => {
        const ev = allEvents.find(e => e.slug === post.event_slug)
        if (!ev) return null
        return (
          <div className="mx-4 mt-3">
            <a
              href={`/events/${ev.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#222222]/6 hover:border-[#06a5a5]/30 hover:bg-[#06a5a5]/3 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#06a5a5]/10 flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-[#06a5a5]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#222222] truncate leading-tight group-hover:text-[#06a5a5] transition-colors">{ev.name}</p>
                <p className="text-[10px] text-[#717171] truncate">{formatEventDate(ev)} · {ev.location}</p>
              </div>
              <ExternalLink size={12} className="text-[#222222]/20 group-hover:text-[#06a5a5] transition-colors flex-shrink-0" />
            </a>
          </div>
        )
      })()}

      {/* Linked bike badge */}
      {post.bike_id && post.bike_title && (
        <div className="mx-4 mt-3">
          {post.bike_slug ? (
            <Link
              href={`/custom-bike/${post.bike_slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] border border-[#222222]/6 hover:border-[#06a5a5]/25 hover:bg-[#06a5a5]/3 transition-all text-xs font-medium text-[#222222] group"
            >
              <span className="text-[11px]">🏍</span>
              <span className="group-hover:text-[#06a5a5] transition-colors truncate max-w-[200px]">{post.bike_title}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] border border-[#222222]/6 text-xs font-medium text-[#222222]">
              <span className="text-[11px]">🏍</span>
              <span className="truncate max-w-[200px]">{post.bike_title}</span>
            </span>
          )}
        </div>
      )}

      {/* ── Ride post content ── */}
      {post.post_type === 'ride' && post.ride_stops && post.ride_stops.length > 0 && (() => {
        const stops = post.ride_stops
        return (
          <>
            {/* Route pills with arrows */}
            <div className="px-4 mt-3 flex flex-wrap items-center gap-1">
              {stops.map((s, i) => (
                <span key={i} className="contents">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-medium">
                    <MapPin size={9} />
                    {s.name}
                  </span>
                  {i < stops.length - 1 && (
                    <ChevronRight size={12} className="text-[#222222]/20 flex-shrink-0 mx-0.5" />
                  )}
                </span>
              ))}
            </div>
            {/* Date/time — prominent */}
            {post.ride_start_at && (
              <div className="px-4 mt-2.5 flex items-center gap-2">
                <Calendar size={14} className="text-[#06a5a5] flex-shrink-0" />
                <span className="text-[13px] font-semibold text-[#222222]">
                  {new Date(post.ride_start_at).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  {', '}
                  {new Date(post.ride_start_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                </span>
              </div>
            )}
            {/* Participants: avatar stack + count */}
            {post.ride_max_participants && (
              <div className="px-4 mt-2 flex items-center gap-2">
                {post.ride_participant_avatars.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {post.ride_participant_avatars.slice(0, 5).map((a, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-[#F0F0F0] flex-shrink-0"
                        title={a.name}
                      >
                        {a.avatar_url ? (
                          <img src={a.avatar_url} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-[#222222]/40">
                            {a.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-xs font-medium text-[#717171]">{post.ride_participant_count} / {post.ride_max_participants} Rider</span>
              </div>
            )}
            {/* Route map — interactive, same style as explore maps */}
            {stops.length >= 1 && (
              <div className="mt-3 mx-4 rounded-2xl overflow-hidden border border-[#222222]/6">
                <LazyRideMap stops={stops} />
              </div>
            )}
          </>
        )
      })()}

      {/* Regular media (not for ride posts with route maps) */}
      {!(post.post_type === 'ride' && post.ride_stops && post.ride_stops.length >= 1) && imageUrls.length > 0 && (
        <div className="mt-3">
          <PostImageCarousel
            items={urlsToMediaItems(imageUrls)}
            alt={post.author_name}
            isPriority={postIndex < 3}
            onDoubleClick={() => {
              if (!loggedIn) { onLoginRequired?.('like'); return }
              if (!post.liked_by_me) onLike()
            }}
          />
        </div>
      )}

      {/* Location map */}
      {post.post_type !== 'ride' && post.latitude != null && post.longitude != null && (
        <div className="mt-3 mx-4 mb-1">
          {post.location_name && (
            <div className="flex items-center justify-between bg-[#F7F7F7] rounded-lg px-3 py-2 mb-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-[#222222] min-w-0">
                <MapPin size={12} className="flex-shrink-0 text-[#717171]" />
                <span className="truncate">{post.location_name}</span>
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${post.latitude},${post.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#06a5a5] hover:text-[#06a5a5]/70 transition-colors flex-shrink-0 ml-3"
              >
                <Navigation size={10} />
                Route starten
              </a>
            </div>
          )}
          <div className="rounded-lg overflow-hidden border border-[#222222]/6">
            <LazyMap lat={post.latitude} lng={post.longitude} label={post.location_name} />
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => loggedIn ? onLike() : onLoginRequired?.('like')}
          className="flex items-center gap-1.5 group"
        >
          <ThumbsUp
            size={18}
            className={`transition-colors ${post.liked_by_me ? 'fill-[#06a5a5] text-[#06a5a5]' : 'text-[#222222]/30 group-hover:text-[#06a5a5]'}`}
          />
          {post.likes_count > 0 && (
            <span className={`text-xs font-semibold ${post.liked_by_me ? 'text-[#06a5a5]' : 'text-[#222222]/40'}`}>
              {post.likes_count}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => loggedIn ? setCommentInputOpen(prev => !prev) : onLoginRequired?.('comment')}
          className="flex items-center gap-1.5 group"
        >
          <MessageCircle size={18} className={`transition-colors ${commentInputOpen ? 'text-[#06a5a5]' : 'text-[#222222]/30 group-hover:text-[#06a5a5]'}`} />
          {comments.length > 0 && (
            <span className="text-xs font-semibold text-[#222222]/40">{comments.length}</span>
          )}
        </button>
        {/* Ride: Teilnehmen / Absagen */}
        {post.post_type === 'ride' && (
          <div className="ml-auto flex items-center gap-3">
            {post.ride_joined_by_me ? (
              <>
                <button
                  type="button"
                  onClick={() => onLeaveRide?.()}
                  className="text-[11px] text-[#717171] hover:text-[#222222] transition-colors"
                >
                  Absagen
                </button>
                <span className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] px-3 py-1.5 rounded-full">
                  Angemeldet
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={() => loggedIn ? onJoinRide?.() : onLoginRequired?.('like')}
                disabled={post.ride_max_participants != null && post.ride_participant_count >= post.ride_max_participants}
                className="text-xs font-semibold text-white bg-[#06a5a5] hover:bg-[#058f8f] px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
              >
                Teilnehmen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comments — only for logged-in users */}
      {loggedIn && comments.length > 0 && (
        <div className="px-4 pb-1">
          <div className="flex flex-col gap-2.5">
            {comments.map(c => {
              const commentProfileHref = getProfileUrl(c.user_role, c.user_slug)
              return (
              <div key={c.id} className="flex gap-2.5 items-start">
                {commentProfileHref ? (
                  <Link href={commentProfileHref} className="w-7 h-7 rounded-full bg-[#2AABAB] flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                    {c.user_avatar ? (
                      <Image src={c.user_avatar} alt={c.user_name} width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/pin-logo.svg" alt="" className="w-4 h-4 object-contain" />
                    )}
                  </Link>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#2AABAB] flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                    {c.user_avatar ? (
                      <Image src={c.user_avatar} alt={c.user_name} width={28} height={28} className="object-cover w-full h-full" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/pin-logo.svg" alt="" className="w-4 h-4 object-contain" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug">
                    {commentProfileHref ? (
                      <Link href={commentProfileHref} className="font-semibold text-[#222222] hover:underline">{c.user_name}</Link>
                    ) : (
                      <span className="font-semibold text-[#222222]">{c.user_name}</span>
                    )}{' '}
                    <span className="text-[#222222]/80">{renderWithMentions(c.body)}</span>
                  </p>
                  <p className="text-[10px] text-[#B0B0B0] mt-0.5">{formatRelativeTime(c.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCommentLike(c.id)}
                  className="flex items-center gap-1 mt-1 flex-shrink-0 group/like"
                >
                  {c.like_count > 0 && (
                    <span className={`text-[10px] font-semibold ${c.liked_by_me ? 'text-[#06a5a5]' : 'text-[#222222]/30'}`}>{c.like_count}</span>
                  )}
                  <ThumbsUp size={12} className={`transition-colors ${c.liked_by_me ? 'fill-[#06a5a5] text-[#06a5a5]' : 'text-[#222222]/20 group-hover/like:text-[#06a5a5]'}`} />
                </button>
              </div>
              )
            })}
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
                Posten
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

interface StoryRider {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

interface Props {
  userId: string | null
  isSuperadmin?: boolean
  riders?: StoryRider[]
  events?: Event[]
}

const PAGE_SIZE = 10

export default function ExploreClient({ userId, isSuperadmin, riders = [], events: initialEvents = [] }: Props) {
  const [category, setCategory] = useState<Category>('alle')
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginContext, setLoginContext] = useState<'like' | 'comment'>('like')
  const { toasts, success: showSuccess, error: showError } = useToast()

  // Composer state
  const [composerStuck, setComposerStuck] = useState(false)
  const composerSentinelRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const canPost = !!userId
  const [sidebarRiders, setSidebarRiders] = useState<SidebarRider[]>([])
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const allEvents = initialEvents
  const { unreadNotificationCount, avatarUrl: myAvatarUrl, fullName: myFullName } = useAuth()
  const searchParams = useSearchParams()
  const highlightPostId = searchParams.get('post')
  const scrolledRef = useRef(false)

  // Scroll to highlighted post after initial load
  useEffect(() => {
    if (!highlightPostId || loadingPosts || scrolledRef.current) return
    scrolledRef.current = true
    requestAnimationFrame(() => {
      const el = document.getElementById(`post-${highlightPostId}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-[#2AABAB]')
      setTimeout(() => el.classList.remove('ring-2', 'ring-[#2AABAB]'), 2500)
    })
  }, [highlightPostId, loadingPosts])

  // Detect when composer becomes sticky
  useEffect(() => {
    const sentinel = composerSentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setComposerStuck(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Enrich raw posts with profile + like data + ride participants
  const enrichPosts = useCallback(async (postsData: any[]): Promise<CommunityPost[]> => {
    if (postsData.length === 0) return []

    const userIds = [...new Set(postsData.map((p: any) => p.user_id))]
    const postIds = postsData.map((p: any) => p.id)
    const bikeIds = [...new Set(postsData.map((p: any) => p.bike_id).filter(Boolean))] as string[]
    const ridePostIds = postsData.filter((p: any) => p.post_type === 'ride').map((p: any) => p.id)

    // Parallel: fetch profiles + likes + bikes + ride participants
    const fetches: [any, any, any, any] = await Promise.all([
      (supabase.from('profiles') as any)
        .select('id, full_name, avatar_url, role, slug, username')
        .in('id', userIds),
      (supabase.from('community_post_likes') as any)
        .select('post_id, user_id')
        .in('post_id', postIds),
      bikeIds.length > 0
        ? (supabase.from('bikes') as any)
            .select('id, title, slug')
            .in('id', bikeIds)
        : Promise.resolve({ data: [] }),
      ridePostIds.length > 0
        ? (supabase.from('ride_participants') as any)
            .select('ride_post_id, user_id')
            .in('ride_post_id', ridePostIds)
        : Promise.resolve({ data: [] }),
    ])
    const [{ data: profilesData }, { data: likesData }, { data: bikesData }, { data: rideParticipantsData }] = fetches

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null; role: string | null; slug: string | null; username: string | null }> = {}
    for (const prof of (profilesData ?? [])) profileMap[prof.id] = prof

    const likesMap: Record<string, { count: number; byMe: boolean }> = {}
    for (const l of (likesData ?? [])) {
      if (!likesMap[l.post_id]) likesMap[l.post_id] = { count: 0, byMe: false }
      likesMap[l.post_id].count++
      if (l.user_id === userId) likesMap[l.post_id].byMe = true
    }

    const bikeMap: Record<string, { title: string; slug: string | null }> = {}
    for (const b of (bikesData ?? [])) bikeMap[b.id] = { title: b.title, slug: b.slug }

    // Build ride participants map: { ride_post_id -> { count, joinedByMe, avatars } }
    const rideParticipantsMap: Record<string, { count: number; joinedByMe: boolean; avatars: { name: string; avatar_url: string | null }[] }> = {}
    for (const rp of (rideParticipantsData ?? []) as { ride_post_id: string; user_id: string }[]) {
      if (!rideParticipantsMap[rp.ride_post_id]) rideParticipantsMap[rp.ride_post_id] = { count: 0, joinedByMe: false, avatars: [] }
      rideParticipantsMap[rp.ride_post_id].count++
      if (rp.user_id === userId) rideParticipantsMap[rp.ride_post_id].joinedByMe = true
      const prof = profileMap[rp.user_id]
      if (prof) rideParticipantsMap[rp.ride_post_id].avatars.push({ name: prof.full_name ?? 'Unbekannt', avatar_url: prof.avatar_url })
    }

    return postsData.map(p => {
      const profile = profileMap[p.user_id] ?? null
      const name = profile?.full_name ?? 'Unbekannt'
      const bike = p.bike_id ? bikeMap[p.bike_id] : null
      const rideP = rideParticipantsMap[p.id]
      return {
        id: p.id,
        body: p.body,
        media_urls: p.media_urls ?? [],
        created_at: p.created_at,
        user_id: p.user_id,
        topic: (p.topic as Category | null) ?? null,
        author_name: name,
        author_initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        author_avatar: profile?.avatar_url ?? null,
        likes_count: likesMap[p.id]?.count ?? 0,
        liked_by_me: likesMap[p.id]?.byMe ?? false,
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        location_name: p.location_name ?? null,
        event_slug: p.event_slug ?? null,
        author_role: profile?.role ?? null,
        author_slug: profile?.slug
          ?? profile?.username
          ?? (profile?.role === 'rider' && name !== 'Unbekannt' ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null),
        author_username: profile?.username ?? profile?.slug ?? null,
        bike_id: p.bike_id ?? null,
        bike_title: bike?.title ?? null,
        bike_slug: bike?.slug ?? null,
        post_type: (p.post_type as 'post' | 'ride') ?? 'post',
        ride_visibility: (p.ride_visibility as 'public' | 'friends' | null) ?? null,
        ride_stops: p.ride_stops ?? null,
        ride_start_at: p.ride_start_at ?? null,
        ride_max_participants: p.ride_max_participants ?? null,
        ride_participant_count: rideP?.count ?? 0,
        ride_joined_by_me: rideP?.joinedByMe ?? false,
        ride_participant_avatars: rideP?.avatars ?? [],
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Load first page of posts
  const loadPosts = useCallback(async () => {
    setLoadingPosts(true)
    hasMoreRef.current = true
    offsetRef.current = 0

    const { data: postsData } = await (supabase.from('community_posts') as any)
      .select('id, body, media_urls, created_at, user_id, topic, latitude, longitude, location_name, event_slug, bike_id, post_type, ride_visibility, ride_stops, ride_start_at, ride_max_participants')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1)

    const mapped = await enrichPosts(postsData ?? [])
    setCommunityPosts(mapped)
    offsetRef.current = mapped.length
    const more = (postsData ?? []).length >= PAGE_SIZE
    hasMoreRef.current = more
    setLoadingPosts(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichPosts])

  // Load next page (uses refs to avoid stale closures / observer churn)
  const loadMorePosts = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)

    const from = offsetRef.current
    const { data: postsData } = await (supabase.from('community_posts') as any)
      .select('id, body, media_urls, created_at, user_id, topic, latitude, longitude, location_name, event_slug, bike_id, post_type, ride_visibility, ride_stops, ride_start_at, ride_max_participants')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    const mapped = await enrichPosts(postsData ?? [])
    setCommunityPosts(prev => [...prev, ...mapped])
    offsetRef.current = from + mapped.length
    const more = (postsData ?? []).length >= PAGE_SIZE
    hasMoreRef.current = more
    loadingMoreRef.current = false
    setLoadingMore(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichPosts])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Reload feed + show toast when a new post is created (from PostComposerSheet)
  useEffect(() => {
    function handlePostCreated() {
      loadPosts()
      showSuccess('Dein Beitrag ist live!')
    }
    window.addEventListener('post-created', handlePostCreated)
    return () => window.removeEventListener('post-created', handlePostCreated)
  }, [loadPosts, showSuccess])

  // Infinite scroll: observe sentinel only after initial load is done
  useEffect(() => {
    if (loadingPosts) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMorePosts() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadingPosts, loadMorePosts])

  // Load IDs of users the current user follows (for "Freunde" filter)
  useEffect(() => {
    if (!userId) return
    async function loadFollowing() {
      const { data } = await (supabase.from('followers') as any)
        .select('following_id')
        .eq('follower_id', userId)
      if (!data) return
      setFollowingIds(new Set(data.map((r: { following_id: string }) => r.following_id)))
    }
    loadFollowing()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load sidebar riders (DB + static, sorted by online status)
  useEffect(() => {
    async function loadSidebarRiders() {
      const THREE_MIN_AGO = new Date(Date.now() - 3 * 60 * 1000).toISOString()

      const { data: dbRiders } = await (supabase.from('profiles') as any)
        .select('id, full_name, slug, username, bio, avatar_url, last_seen_at')
        .eq('role', 'rider')
        .order('last_seen_at', { ascending: false, nullsFirst: false })

      const dbItems: SidebarRider[] = (dbRiders ?? [])
        .filter((r: Record<string, unknown>) => r.slug || r.username || r.full_name)
        .map((r: Record<string, unknown>) => {
          const name = (r.full_name as string | null) ?? 'Unbekannt'
          const lastSeen = r.last_seen_at as string | null
          return {
            slug: (r.slug as string | null) ?? (r.username as string | null) ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            name,
            initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
            bio: (r.bio as string | null) ?? '',
            avatar: (r.avatar_url as string | null) ?? undefined,
            isOnline: !!lastSeen && lastSeen > THREE_MIN_AGO,
          }
        })

      // Sort: online first, then alphabetical
      dbItems.sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1
        return a.name.localeCompare(b.name)
      })

      setSidebarRiders(dbItems)
    }

    loadSidebarRiders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      await (supabase.from('community_post_likes') as any).insert({ post_id: postId, user_id: userId })
    } else {
      await (supabase.from('community_post_likes') as any).delete().eq('post_id', postId).eq('user_id', userId)
    }
  }

  async function handleDeletePost() {
    if (!deleteTargetId) return
    setDeleting(true)

    // Optimistic removal
    const removedPost = communityPosts.find(p => p.id === deleteTargetId)
    setCommunityPosts(prev => prev.filter(p => p.id !== deleteTargetId))
    setDeleteTargetId(null)

    const { error } = await (supabase.from('community_posts') as any)
      .delete()
      .eq('id', deleteTargetId)

    if (error) {
      // Restore on error
      if (removedPost) setCommunityPosts(prev => [...prev, removedPost].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      showError('Fehler beim Löschen')
    } else {
      showSuccess('Beitrag wurde gelöscht')
    }
    setDeleting(false)
  }

  // Ride join modal state
  const [joinRideTarget, setJoinRideTarget] = useState<CommunityPost | null>(null)
  const [joiningRide, setJoiningRide] = useState(false)
  const [leaveRideTarget, setLeaveRideTarget] = useState<CommunityPost | null>(null)
  const [leavingRide, setLeavingRide] = useState(false)

  async function handleJoinRide() {
    if (!joinRideTarget || !userId) return
    setJoiningRide(true)
    const { error } = await (supabase.from('ride_participants') as any)
      .insert({ ride_post_id: joinRideTarget.id, user_id: userId })
    if (!error) {
      setCommunityPosts(prev => prev.map(p => p.id === joinRideTarget.id ? {
        ...p,
        ride_joined_by_me: true,
        ride_participant_count: p.ride_participant_count + 1,
        ride_participant_avatars: [...p.ride_participant_avatars, { name: myFullName ?? 'Ich', avatar_url: myAvatarUrl ?? null }],
      } : p))
      showSuccess('Du nimmst an der Fahrt teil!')
    } else {
      showError('Fehler beim Beitreten')
    }
    setJoinRideTarget(null)
    setJoiningRide(false)
  }

  async function handleLeaveRide() {
    if (!leaveRideTarget || !userId) return
    setLeavingRide(true)
    const { error } = await (supabase.from('ride_participants') as any)
      .delete()
      .eq('ride_post_id', leaveRideTarget.id)
      .eq('user_id', userId)
    if (!error) {
      setCommunityPosts(prev => prev.map(p => p.id === leaveRideTarget.id ? {
        ...p,
        ride_joined_by_me: false,
        ride_participant_count: Math.max(0, p.ride_participant_count - 1),
        ride_participant_avatars: p.ride_participant_avatars.filter(a => a.name !== (myFullName ?? 'Ich')),
      } : p))
      showSuccess('Du hast die Fahrt abgesagt.')
    } else {
      showError('Fehler beim Absagen')
    }
    setLeaveRideTarget(null)
    setLeavingRide(false)
  }

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return allEvents
      .filter(e => (e.date_end ?? e.date_start ?? '') >= today)
      .sort((a, b) => (a.date_start ?? '').localeCompare(b.date_start ?? ''))
  }, [allEvents])

  const filteredPosts = useMemo(() => {
    const sorted = [...communityPosts].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    if (category === 'alle') return sorted
    if (category === 'freunde') return sorted.filter(p => followingIds.has(p.user_id))
    if (category === 'in-der-naehe') return sorted.filter(p => p.latitude != null && p.longitude != null)
    return sorted.filter(p => p.topic === category)
  }, [category, communityPosts, followingIds])

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────── */}
      <div className="hidden lg:block">
        <aside className="w-80 flex-shrink-0 flex flex-col gap-3 pt-3 pb-3 pl-4 sm:pl-5 lg:pl-8 pr-3 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">

          {/* Alle Rider */}
          <div className="bg-white rounded-2xl border border-[#222222]/6 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]/30 mb-2">
              Alle Rider
            </p>
            <div className="flex flex-col">
              {sidebarRiders.map(r => (
                <RiderItem key={r.slug} rider={r} />
              ))}
            </div>
            <Link
              href="/rider"
              className="flex items-center gap-1 text-xs font-medium text-[#06a5a5] mt-2 hover:text-[#058f8f] transition-colors"
            >
              Alle Rider entdecken <ChevronRight size={14} />
            </Link>
          </div>
        </aside>
      </div>

      {/* ── Feed ────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pt-6 pb-16 px-4 sm:px-6 lg:px-8 bg-white lg:bg-transparent">
        {/* Mobile heading — outside max-w container so bell aligns with screen edge like Settings on profile */}
        <div className="lg:hidden relative flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold text-[#222222]">Explore</h1>
          {userId && (
            <Link
              href="/dashboard/notifications"
              className="absolute -top-3 -right-1 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/8 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-4 h-4 text-[#111111]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#2AABAB] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Heading + filter pills — sticky on scroll */}
        <div className="sticky top-[48px] lg:top-[64px] z-30 bg-white lg:bg-[#F7F7F7] pt-2 pb-2 border-b border-[#222222]/8 lg:border-b-0 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0">
          <div className="max-w-[560px] mx-auto lg:mx-0">
          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 justify-center lg:justify-start">
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
          </div>
        </div>

        {/* Mobile rider list — full width (between pills and composer) */}
        <RiderList riders={riders} />

        {/* Composer + card stream share one parent so sticky works through the full scroll */}
        <div className="max-w-[560px] mx-auto lg:mx-0">
          {/* Composer sentinel */}
          <div ref={composerSentinelRef} className="h-0" />

          {/* Composer trigger — opens PostComposerSheet (same as mobile) */}
          {canPost ? (
            <div className={`hidden md:block sticky top-[104px] lg:top-[120px] z-20 bg-white rounded-2xl border border-[#222222]/6 overflow-hidden mb-4 transition-all duration-300 ease-in-out origin-top ${composerStuck ? 'mx-12 sm:mx-20 shadow-md scale-[0.92]' : 'mx-0 shadow-sm scale-100'}`}>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open-post-composer'))}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F7F7F7] transition-colors"
              >
                <span className="text-sm text-[#222222]/30 flex-1">Poste, was dich bewegt…</span>
                <span className="w-8 h-8 rounded-full bg-[#06a5a5] flex items-center justify-center flex-shrink-0">
                  <Plus size={16} className="text-white" />
                </span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#222222]/6 p-4 text-center mb-4">
              <p className="text-sm text-[#222222]/40 mb-3">Melde dich an, um Beiträge zu teilen</p>
              <button onClick={() => { setLoginContext('comment'); setShowLogin(true) }} className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all">
                Anmelden
              </button>
            </div>
          )}

          {/* Events carousel */}
          {category === 'events' && upcomingEvents.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#222222]">Nächste Events</h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { const el = document.getElementById('events-carousel'); if (el) el.scrollBy({ left: -280, behavior: 'smooth' }) }}
                    className="w-7 h-7 rounded-full border border-[#222222]/10 hover:border-[#222222]/25 flex items-center justify-center text-[#222222]/40 hover:text-[#222222] transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => { const el = document.getElementById('events-carousel'); if (el) el.scrollBy({ left: 280, behavior: 'smooth' }) }}
                    className="w-7 h-7 rounded-full border border-[#222222]/10 hover:border-[#222222]/25 flex items-center justify-center text-[#222222]/40 hover:text-[#222222] transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div id="events-carousel" className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 scroll-smooth">
                {upcomingEvents.map(ev => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    className="flex-shrink-0 w-[260px] rounded-2xl border border-[#222222]/6 hover:border-[#06a5a5]/30 overflow-hidden bg-white transition-all group"
                  >
                    {ev.image ? (
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#F7F7F7]">
                        <Image src={ev.image} alt={ev.name} fill sizes="260px" className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-[#06a5a5] flex items-center justify-center">
                        <Calendar size={28} className="text-white/30" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs font-semibold text-[#222222] leading-snug line-clamp-1 group-hover:text-[#06a5a5] transition-colors">{ev.name}</p>
                      <p className="text-[10px] text-[#222222]/35 mt-0.5 line-clamp-1">{formatEventDate(ev)} · {ev.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Card stream */}
          <div className="flex flex-col gap-4">
            {loadingPosts ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 rounded-full border-2 border-[#2AABAB]/20 border-t-[#2AABAB] animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 text-[#B0B0B0] text-sm">
                Keine Einträge in dieser Kategorie.
              </div>
            ) : (
              filteredPosts.map((post, idx) => (
                <CommunityPostCard key={post.id} post={post} postIndex={idx} onLike={() => handleLike(post.id)} loggedIn={!!userId} userId={userId} isSuperadmin={isSuperadmin} onDelete={() => setDeleteTargetId(post.id)} onJoinRide={() => setJoinRideTarget(post)} onLeaveRide={() => setLeaveRideTarget(post)} onLoginRequired={(ctx) => { setLoginContext(ctx); setShowLogin(true) }} allEvents={allEvents} />
              ))
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-[#2AABAB]/20 border-t-[#2AABAB] animate-spin" />
            </div>
          )}
        </div>
      </main>

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeletePost}
        loading={deleting}
        title="Beitrag löschen?"
        description="Dieser Beitrag wird unwiderruflich gelöscht."
      />

      {/* Ride join confirmation modal */}
      {joinRideTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setJoinRideTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-[#222222] mb-3">Fahrt beitreten?</h3>
            <div className="flex flex-col gap-2 mb-5">
              {joinRideTarget.ride_stops && joinRideTarget.ride_stops.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {joinRideTarget.ride_stops.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-medium">
                      <MapPin size={9} />
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
              {joinRideTarget.ride_start_at && (
                <p className="text-xs text-[#717171]">
                  {new Date(joinRideTarget.ride_start_at).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {' '}um {new Date(joinRideTarget.ride_start_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                </p>
              )}
              <p className="text-xs text-[#717171]">
                Organisiert von <span className="font-semibold text-[#222222]">{joinRideTarget.author_name}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setJoinRideTarget(null)}
                className="flex-1 text-sm font-semibold text-[#717171] py-2.5 rounded-full border border-[#222222]/10 hover:bg-[#F7F7F7] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleJoinRide}
                disabled={joiningRide}
                className="flex-1 text-sm font-semibold text-white bg-[#06a5a5] py-2.5 rounded-full hover:bg-[#058f8f] disabled:opacity-50 transition-colors"
              >
                {joiningRide ? 'Wird beigetreten…' : 'Teilnehmen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave ride confirmation modal */}
      {leaveRideTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setLeaveRideTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-[#222222] mb-2">Fahrt absagen?</h3>
            <p className="text-sm text-[#717171] mb-5">Möchtest du wirklich die Fahrt absagen?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLeaveRideTarget(null)}
                className="flex-1 text-sm font-semibold text-[#717171] py-2.5 rounded-full border border-[#222222]/10 hover:bg-[#F7F7F7] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleLeaveRide}
                disabled={leavingRide}
                className="flex-1 text-sm font-semibold text-white bg-red-500 py-2.5 rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {leavingRide ? 'Wird abgesagt…' : 'Absagen'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext={loginContext}
      />
    </>
  )
}
