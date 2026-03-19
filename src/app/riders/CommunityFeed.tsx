'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { ThumbsUp, Trash2, ImageIcon, X, Send, Video, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'

const TOPICS = [
  { value: 'showcase',   label: 'Showcase',          color: 'bg-[#06a5a5]/10 text-[#06a5a5]' },
  { value: 'hilfe',      label: 'Hilfe benötigt',    color: 'bg-amber-50 text-amber-600' },
  { value: 'fahrt',      label: 'Fahrt in der Nähe', color: 'bg-violet-50 text-violet-600' },
] as const
type Topic = typeof TOPICS[number]['value']

interface Post {
  id: string
  body: string | null
  media_urls: string[]
  created_at: string
  user_id: string
  topic: Topic | null
  author_name: string | null
  author_avatar: string | null
  author_initials: string
  likes_count: number
  liked_by_me: boolean
}

interface Props {
  userId: string | null
  userRole: string | null
}


export default function CommunityFeed({ userId, userRole }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Topic | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [body, setBody] = useState('')
  const [topic, setTopic] = useState<Topic | null>(null)
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const canPost = !!userId

  async function loadPosts() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: postsData, error: postsError } = await (supabase.from('community_posts') as any)
      .select('id, body, media_urls, created_at, user_id, topic')
      .order('created_at', { ascending: false })
      .limit(50)

    if (postsError) { console.error('loadPosts error:', postsError); setLoading(false); return }
    if (!postsData || postsData.length === 0) { setPosts([]); setLoading(false); return }

    // Fetch profiles for all authors
    const userIds = [...new Set((postsData as { user_id: string }[]).map(p => p.user_id))]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profilesData } = await (supabase.from('profiles') as any)
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
    for (const prof of (profilesData ?? [])) {
      profileMap[prof.id] = prof
    }

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

    const mapped: Post[] = (postsData as { id: string; body: string | null; media_urls: string[]; created_at: string; user_id: string; topic: string | null }[]).map(p => {
      const profile = profileMap[p.user_id] ?? null
      const name = profile?.full_name ?? 'Unbekannt'
      return {
        id: p.id,
        body: p.body,
        media_urls: p.media_urls ?? [],
        created_at: p.created_at,
        user_id: p.user_id,
        topic: (p.topic as Topic | null) ?? null,
        author_name: name,
        author_avatar: profile?.avatar_url ?? null,
        author_initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        likes_count: likesMap[p.id]?.count ?? 0,
        liked_by_me: likesMap[p.id]?.byMe ?? false,
      }
    })

    setPosts(mapped)
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Realtime: new posts
  useEffect(() => {
    const channel = supabase
      .channel('community-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, () => {
        loadPosts()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts' }, (payload) => {
        const id = (payload.old as { id: string }).id
        setPosts(prev => prev.filter(p => p.id !== id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    const { error: insertError } = await (supabase.from('community_posts') as any).insert({
      user_id: userId,
      body: body.trim() || null,
      media_urls: uploadedUrls,
      topic: topic ?? null,
    })

    if (!insertError) {
      setBody('')
      setTopic(null)
      setMediaFiles([])
      setComposerOpen(false)
      await loadPosts()
    }
    setSubmitting(false)
  }

  async function handleLike(post: Post) {
    if (!userId) return
    const optimistic = !post.liked_by_me
    setPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      liked_by_me: optimistic,
      likes_count: optimistic ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
    } : p))

    if (optimistic) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('community_post_likes') as any).insert({ post_id: post.id, user_id: userId })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('community_post_likes') as any).delete().eq('post_id', post.id).eq('user_id', userId)
    }
  }

  async function handleDelete(postId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('community_posts') as any).delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const visiblePosts = filter ? posts.filter(p => p.topic === filter) : posts

  return (
    <div className="flex flex-col gap-4">

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
            filter === null
              ? 'bg-[#222222] text-white border-[#222222]'
              : 'text-[#222222]/50 border-[#EBEBEB] hover:border-[#222222]/25 hover:text-[#222222]'
          }`}
        >
          Alle
        </button>
        {TOPICS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(prev => prev === t.value ? null : t.value as Topic)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
              filter === t.value
                ? `${t.color} border-transparent`
                : 'text-[#222222]/50 border-[#EBEBEB] hover:border-[#222222]/25 hover:text-[#222222]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Create post — only logged in */}
      {canPost && (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
          {/* Collapsed trigger */}
          {!composerOpen && (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F7F7F7] transition-colors"
            >
              <span className="text-sm text-[#222222]/30 flex-1">Was fährst du gerade? Teile es mit der Community…</span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#06a5a5] bg-[#06a5a5]/8 px-3 py-1.5 rounded-full flex-shrink-0">
                <Send size={11} />
                Posten
              </span>
            </button>
          )}

          {/* Expanded composer */}
          {composerOpen && (
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

              {/* Topic selector */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {TOPICS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTopic(prev => prev === t.value ? null : t.value as Topic)}
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                      topic === t.value
                        ? `${t.color} border-transparent`
                        : 'text-[#222222]/40 border-[#EBEBEB] hover:border-[#222222]/20'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Media previews */}
              {mediaFiles.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {mediaFiles.map((m, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#EBEBEB] flex-shrink-0">
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
                  <button type="button" onClick={() => { setComposerOpen(false); setBody(''); setTopic(null); setMediaFiles([]) }} className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors ml-1">
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
      )}

      {/* Not logged in hint */}
      {!canPost && (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4 text-center">
          <p className="text-sm text-[#222222]/40 mb-3">Melde dich an, um Beiträge zu teilen</p>
          <a href="/auth/login" className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all">
            Anmelden
          </a>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#EBEBEB] p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#F0F0F0]" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-28 bg-[#F0F0F0] rounded" />
                  <div className="h-2.5 w-16 bg-[#F0F0F0] rounded" />
                </div>
              </div>
              <div className="h-16 bg-[#F0F0F0] rounded-xl" />
            </div>
          ))}
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-12 text-center">
          <p className="text-sm font-semibold text-[#222222]/30 mb-1">
            {filter ? 'Keine Beiträge in dieser Kategorie' : 'Noch keine Beiträge'}
          </p>
          <p className="text-xs text-[#222222]/20">
            {filter ? 'Versuche einen anderen Filter.' : 'Sei der Erste — teile dein Bike mit der Community!'}
          </p>
        </div>
      ) : (
        visiblePosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            userId={userId}
            userRole={userRole}
            onLike={() => handleLike(post)}
            onDelete={() => handleDelete(post.id)}
          />
        ))
      )}
    </div>
  )
}

function VideoPlayer({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [maxH, setMaxH] = useState<number>(750)
  const iconTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (wrapRef.current) {
      const w = wrapRef.current.offsetWidth
      setMaxH(Math.round(w * 16 / 9))
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function flashIcon() {
    setShowIcon(true)
    if (iconTimer.current) clearTimeout(iconTimer.current)
    iconTimer.current = setTimeout(() => setShowIcon(false), 800)
  }

  function toggle() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.muted = false
      v.currentTime = v.currentTime <= 0.001 ? 0 : v.currentTime
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
    flashIcon()
  }

  return (
    <div ref={wrapRef} className="relative w-full cursor-pointer" style={{ maxHeight: maxH, overflow: 'hidden' }} onClick={toggle}>
      <video
        ref={videoRef}
        src={src}
        className="w-full block object-cover"
        style={{ maxHeight: maxH }}
        playsInline
        preload="metadata"
        muted
        onLoadedMetadata={e => { e.currentTarget.currentTime = 0.001 }}
        onEnded={() => setPlaying(false)}
      />
      {/* Center icon flash */}
      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center animate-ping-once">
            {playing ? <Pause size={28} className="text-white fill-white" /> : <Play size={28} className="text-white fill-white" />}
          </div>
        </div>
      )}
      {/* Static play button when paused and not yet played */}
      {!playing && !showIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <Play size={28} className="text-white fill-white ml-1" />
          </div>
        </div>
      )}
    </div>
  )
}

function MediaCarousel({ urls, onOpenLightbox }: { urls: string[]; onOpenLightbox: (url: string) => void }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const [dims, setDims] = useState<Record<number, { w: number; h: number }>>({})
  const [containerW, setContainerW] = useState(560)
  const single = urls.length === 1

  useEffect(() => {
    if (containerRef.current) setContainerW(containerRef.current.offsetWidth)
  }, [])

  const isVideo = useCallback((url: string) => !!url.match(/\.(mp4|mov|webm)(\?|$)/i), [])

  // Fixed height = height of the most landscape image (smallest rendered height)
  const fixedHeight = useMemo(() => {
    const imgIndices = urls.map((u, i) => ({ u, i })).filter(({ u }) => !isVideo(u))
    if (imgIndices.length === 0) return null
    const loaded = imgIndices.filter(({ i }) => dims[i])
    if (loaded.length < imgIndices.length) return null
    const heights = loaded.map(({ i }) => {
      const d = dims[i]
      return Math.min((d.h / d.w) * containerW, 750)
    })
    return Math.min(...heights)
  }, [dims, containerW, urls, isVideo])

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex(i => Math.min(urls.length - 1, i + 1)), [urls.length])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0))
    if (Math.abs(dx) > dy && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const n = urls.length

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{ height: fixedHeight ? `${fixedHeight}px` : 'auto' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Sliding strip */}
      <div
        style={{
          display: 'flex',
          width: `${n * 100}%`,
          height: fixedHeight ? '100%' : 'auto',
          transform: `translateX(calc(-${(index * 100) / n}%))`,
          transition: single ? 'none' : 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {urls.map((url, i) => (
          <div key={i} style={{ width: `${100 / n}%`, flexShrink: 0, height: fixedHeight ? '100%' : 'auto' }}>
            {isVideo(url) ? (
              <VideoPlayer src={url} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt=""
                className="w-full block"
                style={{
                  height: fixedHeight ? `${fixedHeight}px` : 'auto',
                  objectFit: fixedHeight ? 'cover' : undefined,
                  maxHeight: fixedHeight ? undefined : '750px',
                }}
                onLoad={e => {
                  const img = e.currentTarget
                  setDims(prev => ({ ...prev, [i]: { w: img.naturalWidth, h: img.naturalHeight } }))
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {!single && (
        <>
          {index > 0 && (
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {index < n - 1 && (
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {!single && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all ${i === index ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}

      {/* Counter top-right */}
      {!single && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-black/40 px-2 py-0.5 rounded-full">
          {index + 1} / {n}
        </span>
      )}
    </div>
  )
}

function PostCard({
  post, userId, userRole, onLike, onDelete
}: {
  post: Post
  userId: string | null
  userRole: string | null
  onLike: () => void
  onDelete: () => void
}) {
  const isOwn = userId === post.user_id
  const isAdmin = userRole === 'superadmin'
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#06a5a5]/10">
          {post.author_avatar ? (
            <Image src={post.author_avatar} alt={post.author_name ?? ''} fill sizes="40px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#06a5a5]">
              {post.author_initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#222222]">{post.author_name}</p>
          <p className="text-xs text-[#222222]/35">{formatRelativeTime(post.created_at)}</p>
        </div>
        {(isOwn || isAdmin) && (
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-[#222222]/20 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Topic badge */}
      {post.topic && (() => {
        const t = TOPICS.find(t => t.value === post.topic)
        return t ? (
          <div className="px-4 pb-2">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
          </div>
        ) : null
      })()}

      {/* Body */}
      {post.body && (
        <p className="px-4 pb-3 text-sm text-[#222222]/80 leading-relaxed whitespace-pre-wrap">{post.body}</p>
      )}

      {/* Media */}
      {post.media_urls.length > 0 && (
        <MediaCarousel urls={post.media_urls} onOpenLightbox={setLightbox} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-[#F7F7F7]">
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors group"
        >
          <ThumbsUp
            size={14}
            className={`transition-all ${post.liked_by_me ? 'fill-red-500 text-red-500 scale-110' : 'text-red-400 group-hover:text-red-500'}`}
          />
          {post.liked_by_me ? (
            <>
              {post.likes_count > 0 && <span className="text-red-500">{post.likes_count}</span>}
              <span className="text-[#222222]/40">Gefällt mir</span>
            </>
          ) : (
            <>
              {post.likes_count > 0 && <span className="text-[#222222]/40 group-hover:text-[#222222]">{post.likes_count}</span>}
              <span className="text-[#222222]/40 group-hover:text-[#222222]">Gefällt mir</span>
            </>
          )}
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
