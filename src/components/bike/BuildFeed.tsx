'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import PostCard from './PostCard'
import NewPostSheet from './NewPostSheet'
import { fetchBuildPosts, createBuildPost, type BuildPost } from '@/lib/supabase/build-posts'
import { createClient } from '@/lib/supabase/client'
import { useToast, ToastContainer } from '@/components/ui/Toast'

/* ── colour tokens ── */
const C = {
  bg: '#F6F4F1',
  surface: '#FFFFFF',
  border: '#E5E1DB',
  text: '#1C1A17',
  textSub: '#6A6560',
  textMuted: '#A09992',
  teal: '#2AABAB',
  tealLight: '#EAF7F7',
} as const

export default function BuildFeed({ bikeId }: { bikeId: string }) {
  const [posts, setPosts] = useState<BuildPost[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { toasts, success, error } = useToast()

  useEffect(() => {
    fetchBuildPosts(bikeId)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [bikeId])

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  const handlePublish = async (data: { title: string; body: string; files: File[]; parts: { name: string; price: number | null }[] }) => {
    if (!userId) { error('Nicht angemeldet'); return }
    try {
      const post = await createBuildPost(bikeId, userId, data.title, data.body || null, data.files, data.parts)
      setPosts(prev => [post, ...prev])
      setSheetOpen(false)
      success('Step veröffentlicht 🎉')
    } catch {
      error('Fehler beim Veröffentlichen')
    }
  }

  const containerStyle: CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: C.bg,
    minHeight: 200,
    padding: '20px 0',
  }

  const ctaBtn: CSSProperties = {
    width: '100%',
    padding: '16px 0',
    border: `2px dashed ${C.teal}`,
    borderRadius: 14,
    background: C.tealLight,
    color: C.teal,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: 24,
  }

  const fab: CSSProperties = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: C.text,
    color: '#fff',
    border: 'none',
    fontSize: 26,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    zIndex: 100,
    lineHeight: 1,
  }

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
        <span style={{ color: C.textMuted, fontSize: 14 }}>Lade…</span>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Primary CTA */}
      <button style={ctaBtn} onClick={() => setSheetOpen(true)}>
        Step dokumentieren
      </button>

      {/* Posts or empty state */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
            Dokumentiere deinen ersten Build-Step.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button style={fab} onClick={() => setSheetOpen(true)} aria-label="Neuer Step">
        +
      </button>

      {/* Sheet */}
      <NewPostSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onPublish={handlePublish} />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}
