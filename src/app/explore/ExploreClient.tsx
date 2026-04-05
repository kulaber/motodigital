'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ChevronLeft, ChevronRight, Send, ImageIcon, Video, X, Plus, ThumbsUp, Trash2, MapPin, Calendar, ExternalLink, Navigation, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MediaItem } from '@/components/bike/MediaSlider'
import PostImageCarousel from '@/components/explore/PostImageCarousel'
import { formatEventDate } from '@/lib/data/events'
import type { Event } from '@/lib/data/events'
import { formatRelativeTime } from '@/lib/utils'
import { compressImage } from '@/lib/utils/compressImage'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import MapboxAddressInput from '@/components/ui/MapboxAddressInput'
import { LoginModal } from '@/components/ui/LoginModal'
import { getProfileUrl } from '@/lib/utils/profileLink'
import dynamic from 'next/dynamic'
import RiderList from '@/components/explore/RiderStories'
import { useAuth } from '@/hooks/useAuth'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

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

function CommunityPostCard({ post, onLike, loggedIn, userId, isSuperadmin, onDelete, onLoginRequired, allEvents }: { post: CommunityPost; onLike: () => void; loggedIn: boolean; userId: string | null; isSuperadmin?: boolean; onDelete?: () => void; onLoginRequired?: (context: 'like' | 'comment') => void; allEvents: Event[] }) {
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
    <div className="bg-white rounded-2xl border border-[#222222]/6 overflow-hidden">
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
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            title="Beitrag löschen"
          >
            <Trash2 size={15} />
          </button>
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

      {imageUrls.length > 0 && (
        <div className="mt-3">
          <PostImageCarousel
            items={urlsToMediaItems(imageUrls)}
            alt={post.author_name}
            onDoubleClick={() => {
              if (!loggedIn) { onLoginRequired?.('like'); return }
              if (!post.liked_by_me) onLike()
            }}
          />
        </div>
      )}

      {/* Location map */}
      {post.latitude != null && post.longitude != null && (
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
            <MiniMap lat={post.latitude} lng={post.longitude} locationName={post.location_name} />
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
}

export default function ExploreClient({ userId, isSuperadmin, riders = [] }: Props) {
  const [category, setCategory] = useState<Category>('alle')
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginContext, setLoginContext] = useState<'like' | 'comment'>('like')
  const { toasts, success: showSuccess, error: showError } = useToast()

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false)
  const [body, setBody] = useState('')
  const [composerTag, setComposerTag] = useState<Category>('allgemein')
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [composerLocation, setComposerLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [composerEventSlug, setComposerEventSlug] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [composerStuck, setComposerStuck] = useState(false)
  const composerSentinelRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const canPost = !!userId
  const [sidebarRiders, setSidebarRiders] = useState<SidebarRider[]>([])
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [followingProfiles, setFollowingProfiles] = useState<{ id: string; username: string; full_name: string; avatar_url: string | null }[]>([])

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const { unreadNotificationCount } = useAuth()

  // Load events from Supabase
  useEffect(() => {
    (supabase.from('events') as any).select('*').order('date_start', { ascending: true })
      .then(({ data }: { data: Event[] | null }) => { if (data) setAllEvents(data) })
  }, [supabase])

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

  // Load community posts from Supabase
  const loadPosts = useCallback(async () => {
    const { data: postsData } = await (supabase.from('community_posts') as any)
      .select('id, body, media_urls, created_at, user_id, topic, latitude, longitude, location_name, event_slug')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!postsData || postsData.length === 0) { setCommunityPosts([]); setLoadingPosts(false); return }

    const userIds = [...new Set((postsData as { user_id: string }[]).map(p => p.user_id))]
    const { data: profilesData } = await (supabase.from('profiles') as any)
      .select('id, full_name, avatar_url, role, slug, username')
      .in('id', userIds)

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null; role: string | null; slug: string | null; username: string | null }> = {}
    for (const prof of (profilesData ?? [])) profileMap[prof.id] = prof

    // Load likes
    const { data: likesData } = await (supabase.from('community_post_likes') as any)
      .select('post_id, user_id')

    const likesMap: Record<string, { count: number; byMe: boolean }> = {}
    for (const l of (likesData ?? [])) {
      if (!likesMap[l.post_id]) likesMap[l.post_id] = { count: 0, byMe: false }
      likesMap[l.post_id].count++
      if (l.user_id === userId) likesMap[l.post_id].byMe = true
    }

    const mapped: CommunityPost[] = (postsData as { id: string; body: string | null; media_urls: string[]; created_at: string; user_id: string; topic: string | null; latitude: number | null; longitude: number | null; location_name: string | null; event_slug: string | null }[]).map(p => {
      const profile = profileMap[p.user_id] ?? null
      const name = profile?.full_name ?? 'Unbekannt'
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
      }
    })

    setCommunityPosts(mapped)
    setLoadingPosts(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Load IDs of users the current user follows + their profiles for @mention
  useEffect(() => {
    if (!userId) return
    async function loadFollowing() {
      const { data } = await (supabase.from('followers') as any)
        .select('following_id')
        .eq('follower_id', userId)
      if (!data) return
      const ids = data.map((r: { following_id: string }) => r.following_id)
      setFollowingIds(new Set(ids))

      if (ids.length > 0) {
        const { data: profiles } = await (supabase.from('profiles') as any)
          .select('id, username, slug, full_name, avatar_url')
          .in('id', ids)
        if (profiles) {
          setFollowingProfiles(
            (profiles as { id: string; username: string | null; slug: string | null; full_name: string | null; avatar_url: string | null }[])
              .filter(p => p.username || p.slug || p.full_name)
              .map(p => ({
                id: p.id,
                username: p.slug ?? p.username ?? p.full_name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                full_name: p.full_name ?? p.username ?? 'Unbekannt',
                avatar_url: p.avatar_url,
              }))
          )
        }
      }
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newFiles = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setMediaFiles(prev => [...prev, ...newFiles].slice(0, 4))
    e.target.value = ''
  }

  // Mention autocomplete: filtered suggestions
  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return followingProfiles.filter(
      p => p.username.toLowerCase().includes(q) || p.full_name.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [mentionQuery, followingProfiles])

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setBody(val)

    // Detect @mention query from cursor position
    const cursor = e.target.selectionStart ?? val.length
    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@([a-zA-Z0-9_äöüÄÖÜß-]*)$/)
    if (match) {
      setMentionQuery(match[1])
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  function insertMention(username: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const cursor = textarea.selectionStart ?? body.length
    const textBefore = body.slice(0, cursor)
    const atPos = textBefore.lastIndexOf('@')
    if (atPos === -1) return
    const newBody = body.slice(0, atPos) + `@${username} ` + body.slice(cursor)
    setBody(newBody)
    setMentionQuery(null)
    // Refocus textarea after React re-render
    requestAnimationFrame(() => {
      textarea.focus()
      const newCursor = atPos + username.length + 2
      textarea.setSelectionRange(newCursor, newCursor)
    })
  }

  function handleMentionKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery === null || mentionSuggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex(i => (i + 1) % mentionSuggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex(i => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(mentionSuggestions[mentionIndex].username)
    } else if (e.key === 'Escape') {
      setMentionQuery(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hasContent = body.trim() || mediaFiles.length > 0 || (composerTag === 'in-der-naehe' && composerLocation) || (composerTag === 'events' && composerEventSlug)
    if (!userId || !hasContent) return
    setSubmitting(true)

    const uploadedUrls: string[] = []
    for (const { file: rawFile } of mediaFiles) {
      const file = await compressImage(rawFile, 1200)
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await (supabase.storage as any)
        .from('community-media')
        .upload(path, file, { contentType: file.type })
      if (!error && data) {
        const { data: urlData } = (supabase.storage as any).from('community-media').getPublicUrl(data.path)
        uploadedUrls.push(urlData.publicUrl)
      }
    }

    await (supabase.from('community_posts') as any).insert({
      user_id: userId,
      body: body.trim() || null,
      media_urls: uploadedUrls,
      topic: composerTag,
      ...(composerTag === 'in-der-naehe' && composerLocation ? {
        latitude: composerLocation.lat,
        longitude: composerLocation.lng,
        location_name: composerLocation.address,
      } : {}),
      ...(composerTag === 'events' && composerEventSlug ? {
        event_slug: composerEventSlug,
      } : {}),
    })

    setBody('')
    setComposerTag('allgemein')
    setComposerLocation(null)
    setComposerEventSlug(null)
    setMediaFiles([])
    setComposerOpen(false)
    setSubmitting(false)
    await loadPosts()
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
      <main className="flex-1 min-w-0 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
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

        {/* Heading + filter pills (outside sticky parent so RiderList can sit full-width) */}
        <div className="max-w-[560px] mx-auto lg:mx-0">
          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1 justify-center lg:justify-start">
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

        {/* Mobile rider list — full width (between pills and composer) */}
        <RiderList riders={riders} />

        {/* Composer + card stream share one parent so sticky works through the full scroll */}
        <div className="max-w-[560px] mx-auto lg:mx-0">
          {/* Composer sentinel */}
          <div ref={composerSentinelRef} className="h-0" />

          {/* Composer */}
          {canPost ? (
            <div className={`sticky top-[73px] z-20 bg-white rounded-2xl border border-[#222222]/6 overflow-hidden mb-4 transition-all duration-300 ease-in-out origin-top ${composerStuck && !composerOpen ? 'mx-12 sm:mx-20 shadow-md scale-[0.92]' : 'mx-0 shadow-sm scale-100'}`}>
              {!composerOpen ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F7F7F7] transition-colors"
                >
                  <span className="text-sm text-[#222222]/30 flex-1">Poste, was dich bewegt…</span>
                  <span className="w-8 h-8 rounded-full bg-[#06a5a5] flex items-center justify-center flex-shrink-0">
                    <Plus size={16} className="text-white" />
                  </span>
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="relative p-4 animate-expand">
                  <button
                    type="button"
                    onClick={() => { setComposerOpen(false); setBody(''); setComposerTag('allgemein'); setComposerLocation(null); setComposerEventSlug(null); setMediaFiles([]); setMentionQuery(null) }}
                    className="absolute top-3 right-3 z-40 w-7 h-7 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors"
                  >
                    <X size={15} />
                  </button>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      autoFocus
                      value={body}
                      onChange={handleBodyChange}
                      onKeyDown={handleMentionKeyDown}
                      placeholder="Poste, was dich bewegt…"
                      rows={4}
                      style={{ resize: 'none' }}
                      className="w-full text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-transparent leading-relaxed"
                    />
                    {/* @mention autocomplete dropdown */}
                    {mentionQuery !== null && mentionSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 bottom-0 translate-y-full z-30 bg-white rounded-xl border border-[#222222]/10 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                        {mentionSuggestions.map((p, i) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertMention(p.username) }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                              i === mentionIndex ? 'bg-[#06a5a5]/8' : 'hover:bg-[#F7F7F7]'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full bg-[#F0F0F0] overflow-hidden flex-shrink-0">
                              {p.avatar_url ? (
                                <Image src={p.avatar_url} alt={p.full_name} width={28} height={28} className="object-cover w-full h-full" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#222222]/40">
                                  {p.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-[#222222] truncate leading-tight">{p.full_name}</p>
                              <p className="text-[11px] text-[#717171] truncate">@{p.username}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tag selector */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {COMPOSER_TAGS.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          if (composerTag === t.value) {
                            // Toggle off → back to default
                            setComposerTag('allgemein')
                            if (t.value === 'in-der-naehe') setComposerLocation(null)
                            if (t.value === 'events') setComposerEventSlug(null)
                          } else {
                            setComposerTag(t.value)
                            // Auto-request geolocation for "In der Nähe"
                            if (t.value === 'in-der-naehe') {
                              const reverseGeocode = (lat: number, lng: number) => {
                                const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                                if (token) {
                                  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=de&limit=1&types=address,place,locality`)
                                    .then(r => r.json())
                                    .then(json => {
                                      if (json.features?.[0]) {
                                        setComposerLocation({ lat, lng, address: json.features[0].place_name })
                                      }
                                    })
                                    .catch(() => {})
                                }
                              }

                              const tryBrowserGeo = () => {
                                if (!navigator.geolocation) { fallbackIPGeo(); return }
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    const { latitude: lat, longitude: lng } = pos.coords
                                    setComposerLocation({ lat, lng, address: 'Mein Standort' })
                                    reverseGeocode(lat, lng)
                                  },
                                  () => fallbackIPGeo(),
                                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
                                )
                              }

                              const fallbackIPGeo = () => {
                                fetch('https://ipapi.co/json/')
                                  .then(r => r.json())
                                  .then(data => {
                                    if (data.latitude && data.longitude) {
                                      const lat = data.latitude as number
                                      const lng = data.longitude as number
                                      const address = [data.city, data.region].filter(Boolean).join(', ') || 'Mein Standort'
                                      setComposerLocation({ lat, lng, address })
                                      reverseGeocode(lat, lng)
                                    } else {
                                      showError('Standort konnte nicht ermittelt werden. Bitte manuell eingeben.')
                                    }
                                  })
                                  .catch(() => showError('Standort konnte nicht ermittelt werden. Bitte manuell eingeben.'))
                              }

                              tryBrowserGeo()
                            }
                          }
                        }}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                          composerTag === t.value
                            ? 'bg-[#222222] text-white border-[#222222]'
                            : 'text-[#222222]/40 border-[#222222]/6 hover:border-[#222222]/20'
                        }`}
                      >
                        {t.value === 'in-der-naehe' && <MapPin size={11} />}
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Location picker for "In der Nähe" */}
                  {composerTag === 'in-der-naehe' && (
                    <div className="mt-3">
                      <MapboxAddressInput
                        initialValue={composerLocation?.address ?? ''}
                        placeholder="Standort eingeben…"
                        onSelect={(place) => {
                          if (place) {
                            setComposerLocation({ lat: place.lat, lng: place.lng, address: place.address })
                          } else {
                            setComposerLocation(null)
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Event selector for "Events" */}
                  {composerTag === 'events' && (
                    <div className="mt-3">
                      <select
                        value={composerEventSlug ?? ''}
                        onChange={e => setComposerEventSlug(e.target.value || null)}
                        className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-2.5 text-sm text-[#222222] outline-none focus:border-[#06a5a5] transition-colors"
                      >
                        <option value="">Event auswählen…</option>
                        {allEvents.map(ev => (
                          <option key={ev.slug} value={ev.slug}>
                            {ev.name} — {formatEventDate(ev)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Media previews */}
                  {mediaFiles.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {mediaFiles.map((m, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#222222]/6 flex-shrink-0">
                          {m.file.type.startsWith('video/') ? (
                            <video src={m.url} className="w-full h-full object-cover" muted preload="metadata" />
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
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || (composerTag === 'in-der-naehe' && !composerLocation) || (!body.trim() && mediaFiles.length === 0 && !(composerTag === 'in-der-naehe' && composerLocation) && !(composerTag === 'events' && composerEventSlug))}
                      className="flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#058f8f] disabled:opacity-40 transition-all"
                    >
                      <Send size={12} />
                      {submitting ? 'Wird gepostet…' : 'Posten'}
                    </button>
                  </div>
                </form>
              )}
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
              filteredPosts.map(post => (
                <CommunityPostCard key={post.id} post={post} onLike={() => handleLike(post.id)} loggedIn={!!userId} userId={userId} isSuperadmin={isSuperadmin} onDelete={() => setDeleteTargetId(post.id)} onLoginRequired={(ctx) => { setLoginContext(ctx); setShowLogin(true) }} allEvents={allEvents} />
              ))
            )}
          </div>
        </div>
      </main>

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeletePost}
        loading={deleting}
      />

      <ToastContainer toasts={toasts} />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        triggerContext={loginContext}
      />
    </>
  )
}
