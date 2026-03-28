'use client'

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import type { BuildPost } from '@/lib/supabase/build-posts'

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

/* ── Lightbox ── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn .25s ease',
        cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          cursor: 'pointer',
          lineHeight: 1,
        }}
        aria-label="Close"
      >
        ✕
      </button>
      <img
        src={src}
        alt="Bild vergrößert"
        style={{ maxWidth: '92vw', maxHeight: '92vh', borderRadius: 8, objectFit: 'contain' }}
      />
    </div>
  )
}

/* ── Image grid ── */
function ImageGrid({ urls, onTap }: { urls: string[]; onTap: (url: string) => void }) {
  const imgStyle = (extra: CSSProperties = {}): CSSProperties => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'zoom-in',
    display: 'block',
    ...extra,
  })

  if (urls.length === 0) return null

  if (urls.length === 1) {
    return (
      <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
        <img src={urls[0]} alt="Beitragsbild" style={imgStyle()} onClick={() => onTap(urls[0])} />
      </div>
    )
  }

  if (urls.length === 2) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        {urls.map((u, idx) => (
          <div key={u} style={{ aspectRatio: '1', overflow: 'hidden' }}>
            <img src={u} alt={`Beitragsbild ${idx + 1}`} style={imgStyle()} onClick={() => onTap(u)} />
          </div>
        ))}
      </div>
    )
  }

  // 3+: big left + stack right
  const right = urls.slice(1, 3)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
      <div style={{ gridRow: '1 / span 2', overflow: 'hidden' }}>
        <img src={urls[0]} alt="Beitragsbild 1" style={imgStyle({ height: '100%' })} onClick={() => onTap(urls[0])} />
      </div>
      {right.map((u, idx) => (
        <div key={u} style={{ overflow: 'hidden' }}>
          <img src={u} alt={`Beitragsbild ${idx + 2}`} style={imgStyle({ aspectRatio: '1' })} onClick={() => onTap(u)} />
        </div>
      ))}
    </div>
  )
}

/* ── Parts row ── */
function PartsRow({ parts }: { parts: BuildPost['build_post_parts'] }) {
  const [open, setOpen] = useState(false)
  if (parts.length === 0) return null

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: C.tealLight,
          border: 'none',
          borderRadius: 8,
          padding: '5px 10px',
          fontSize: 13,
          color: C.teal,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {open ? '▾' : '▸'} {parts.length} Teile
      </button>
      {open && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {parts.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.textSub }}>
              <span>{p.name}</span>
              {p.price != null && <span style={{ fontWeight: 600 }}>{p.price} €</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── PostCard ── */
export default function PostCard({ post }: { post: BuildPost }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const date = new Date(post.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <div
        ref={ref}
        style={{
          background: C.surface,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity .4s ease, transform .4s ease',
        }}
      >
        <ImageGrid urls={post.media_urls ?? []} onTap={setLightbox} />

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{post.title}</h3>
            <span style={{ fontSize: 12, color: C.textMuted, whiteSpace: 'nowrap', marginLeft: 12 }}>{date}</span>
          </div>
          {post.body && (
            <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: C.textSub }}>{post.body}</p>
          )}
          <PartsRow parts={post.build_post_parts ?? []} />
        </div>
      </div>
    </>
  )
}
