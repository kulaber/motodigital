'use client'

import { useState, useRef, type CSSProperties } from 'react'

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

type Part = { name: string; price: number | null }

type Props = {
  open: boolean
  onClose: () => void
  onPublish: (data: { title: string; body: string; files: File[]; parts: Part[] }) => Promise<void>
}

export default function NewPostSheet({ open, onClose, onPublish }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [showPartForm, setShowPartForm] = useState(false)
  const [partName, setPartName] = useState('')
  const [partPrice, setPartPrice] = useState('')
  const [publishing, setPublishing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setTitle('')
    setBody('')
    setFiles([])
    setPreviews([])
    setParts([])
    setShowPartForm(false)
    setPartName('')
    setPartPrice('')
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    setFiles(f => [...f, ...arr])
    arr.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(p => [...p, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (i: number) => {
    setFiles(f => f.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const addPart = () => {
    if (!partName.trim()) return
    const price = partPrice.trim() ? parseFloat(partPrice) : null
    setParts(p => [...p, { name: partName.trim(), price }])
    setPartName('')
    setPartPrice('')
    setShowPartForm(false)
  }

  const removePart = (i: number) => setParts(p => p.filter((_, idx) => idx !== i))

  const handlePublish = async () => {
    if (!title.trim() || publishing) return
    setPublishing(true)
    try {
      await onPublish({ title: title.trim(), body: body.trim(), files, parts })
      reset()
    } finally {
      setPublishing(false)
    }
  }

  const handleClose = () => { reset(); onClose() }

  if (!open) return null

  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    background: 'rgba(0,0,0,0.4)',
    animation: 'fadeIn .2s ease',
  }

  const sheet: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9001,
    background: C.surface,
    borderRadius: '20px 20px 0 0',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp .3s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  }

  const header: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
  }

  const btnBase: CSSProperties = {
    border: 'none',
    borderRadius: 10,
    padding: '8px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  return (
    <>
      <div style={overlay} onClick={handleClose} />
      <div style={sheet}>
        {/* Header */}
        <div style={header}>
          <button onClick={handleClose} style={{ ...btnBase, background: 'none', padding: 0, fontSize: 20, color: C.textMuted }}>✕</button>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Neuer Step</span>
          <button
            onClick={handlePublish}
            disabled={!title.trim() || publishing}
            style={{
              ...btnBase,
              background: title.trim() ? C.teal : C.border,
              color: title.trim() ? '#fff' : C.textMuted,
              opacity: publishing ? 0.6 : 1,
            }}
          >
            {publishing ? '…' : 'Veröffentlichen'}
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>
          {/* Image upload */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={e => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)',
                    color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                    fontSize: 12, cursor: 'pointer', lineHeight: 1, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: 10,
                border: `2px dashed ${C.border}`, background: 'none',
                color: C.textMuted, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              {previews.length ? '+ Mehr' : '+ Fotos'}
            </button>
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Überschrift"
            style={{
              width: '100%', border: 'none', outline: 'none',
              fontSize: 20, fontWeight: 700, color: C.text,
              marginBottom: 12, fontFamily: 'inherit',
              background: 'transparent',
            }}
          />

          {/* Body */}
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Was hast du gemacht? Was ist aufgefallen?"
            rows={4}
            style={{
              width: '100%', border: 'none', outline: 'none',
              fontSize: 15, color: C.textSub, resize: 'vertical',
              lineHeight: 1.55, fontFamily: 'inherit',
              background: 'transparent',
            }}
          />

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

          {/* Parts section */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: C.text }}>Verwendete Teile</h4>

            {parts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, color: C.textSub }}>{p.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.price != null && <span style={{ fontSize: 13, color: C.textMuted }}>{p.price} €</span>}
                  <button
                    onClick={() => removePart(i)}
                    style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
                  >✕</button>
                </div>
              </div>
            ))}

            {showPartForm ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <input
                  value={partName}
                  onChange={e => setPartName(e.target.value)}
                  placeholder="Bezeichnung"
                  style={{
                    flex: 2, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', color: C.text, background: 'transparent',
                  }}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && addPart()}
                />
                <input
                  value={partPrice}
                  onChange={e => setPartPrice(e.target.value)}
                  placeholder="€"
                  type="number"
                  style={{
                    flex: 1, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', color: C.text, background: 'transparent',
                  }}
                  onKeyDown={e => e.key === 'Enter' && addPart()}
                />
                <button
                  onClick={addPart}
                  style={{ ...btnBase, background: C.teal, color: '#fff', padding: '8px 12px', fontSize: 16 }}
                >✓</button>
                <button
                  onClick={() => { setShowPartForm(false); setPartName(''); setPartPrice('') }}
                  style={{ ...btnBase, background: 'none', color: C.textMuted, padding: '8px 4px', fontSize: 16 }}
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => setShowPartForm(true)}
                style={{
                  width: '100%', marginTop: 8, padding: '10px 0',
                  border: `2px dashed ${C.border}`, borderRadius: 10,
                  background: 'none', color: C.teal, fontSize: 14,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                + Teil hinzufügen
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}
