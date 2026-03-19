'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Heart, Trash2, ImageIcon, X, Send, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'

interface Post {
  id: string
  body: string | null
  media_urls: string[]
  created_at: string
  user_id: string
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
  const [body, setBody] = useState('')
  const [mediaFiles, setMediaFiles] = useState<{ file: File; url: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const canPost = !!userId

  async function loadPosts() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: postsData, error: postsError } = await (supabase.from('community_posts') as any)
      .select('id, body, media_urls, created_at, user_id')
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

    const mapped: Post[] = (postsData as { id: string; body: string | null; media_urls: string[]; created_at: string; user_id: string }[]).map(p => {
      const profile = profileMap[p.user_id] ?? null
      const name = profile?.full_name ?? 'Unbekannt'
      return {
        id: p.id,
        body: p.body,
        media_urls: p.media_urls ?? [],
        created_at: p.created_at,
        user_id: p.user_id,
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
    })

    if (!insertError) {
      setBody('')
      setMediaFiles([])
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

  return (
    <div className="flex flex-col gap-4">

      {/* Create post — only logged in */}
      {canPost && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#EBEBEB] p-4">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Was fährst du gerade? Teile es mit der Community…"
            rows={3}
            style={{ resize: 'none' }}
            className="w-full text-sm text-[#222222] placeholder:text-[#222222]/30 outline-none bg-transparent leading-relaxed"
          />

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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors"
              >
                <Video size={15} />
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
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-12 text-center">
          <p className="text-sm font-semibold text-[#222222]/30 mb-1">Noch keine Beiträge</p>
          <p className="text-xs text-[#222222]/20">Sei der Erste — teile dein Bike mit der Community!</p>
        </div>
      ) : (
        posts.map(post => (
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

      {/* Body */}
      {post.body && (
        <p className="px-4 pb-3 text-sm text-[#222222]/80 leading-relaxed whitespace-pre-wrap">{post.body}</p>
      )}

      {/* Media */}
      {post.media_urls.length > 0 && (
        <div className={`grid gap-0.5 ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.media_urls.map((url, i) => (
            url.match(/\.(mp4|mov|webm)(\?|$)/i) ? (
              <video key={i} src={url} controls className="w-full block bg-black" style={{ maxHeight: '750px' }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="w-full block cursor-pointer"
                style={{ maxHeight: '750px' }}
                onClick={() => setLightbox(url)}
              />
            )
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-[#F7F7F7]">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            post.liked_by_me ? 'text-red-500' : 'text-[#222222]/40 hover:text-red-400'
          }`}
        >
          <Heart size={14} className={post.liked_by_me ? 'fill-red-500' : ''} />
          {post.likes_count > 0 && <span>{post.likes_count}</span>}
          Gefällt mir
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
