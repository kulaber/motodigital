'use client'

import { useState, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import {
  ArrowLeft,
  Copy,
  Check,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react'
import type { Article, ArticleSection } from '@/lib/data/magazine'

// ─── Section type config ────────────────────────────────────────────────────

const SECTION_TYPES = ['intro', 'h2', 'p', 'quote', 'image', 'list', 'cta'] as const
type SectionType = typeof SECTION_TYPES[number]

const SECTION_BADGE: Record<SectionType, string> = {
  intro: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  h2:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  p:     'bg-[#222222]/8 text-[#222222]/50 border-[#222222]/10',
  quote: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  image: 'bg-green-500/10 text-green-400 border-green-500/20',
  list:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  cta:   'bg-[#222222]/10 text-[#717171] border-[#DDDDDD]/20',
}

const SECTION_LABEL: Record<SectionType, string> = {
  intro: 'Intro',
  h2:    'Überschrift',
  p:     'Absatz',
  quote: 'Zitat',
  image: 'Bild',
  list:  'Liste',
  cta:   'CTA',
}

function createEmptySection(type: SectionType): ArticleSection {
  switch (type) {
    case 'intro': return { type: 'intro', text: '' }
    case 'h2':    return { type: 'h2', text: '' }
    case 'p':     return { type: 'p', text: '' }
    case 'quote': return { type: 'quote', text: '', author: '' }
    case 'image': return { type: 'image', src: '', caption: '' }
    case 'list':  return { type: 'list', items: [] }
    case 'cta':   return { type: 'cta', text: '', href: '', label: '' }
  }
}

function getSectionPreview(section: ArticleSection): string {
  switch (section.type) {
    case 'intro':
    case 'h2':
    case 'p':
      return section.text.slice(0, 70) || '(leer)'
    case 'quote':
      return `"${section.text.slice(0, 60)}"` || '(leer)'
    case 'image':
      return section.src.slice(0, 60) || '(kein Bild)'
    case 'list':
      return section.items.length > 0 ? `${section.items.length} Punkte` : '(leer)'
    case 'cta':
      return section.label || section.text || '(leer)'
  }
}

// ─── Input / Textarea helpers ────────────────────────────────────────────────

const inputCls = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors'
const labelCls = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5'

// ─── Section editor ──────────────────────────────────────────────────────────

function SectionEditor({
  section,
  onChange,
}: {
  section: ArticleSection
  onChange: (updated: ArticleSection) => void
}) {
  if (section.type === 'intro' || section.type === 'h2' || section.type === 'p') {
    return (
      <div>
        <label className={labelCls}>Text</label>
        <textarea
          rows={section.type === 'h2' ? 2 : 4}
          value={section.text}
          onChange={e => onChange({ ...section, text: e.target.value })}
          className={inputCls + ' resize-y'}
          placeholder={section.type === 'h2' ? 'Überschrift...' : 'Text...'}
        />
      </div>
    )
  }

  if (section.type === 'quote') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Zitat</label>
          <textarea
            rows={3}
            value={section.text}
            onChange={e => onChange({ ...section, text: e.target.value })}
            className={inputCls + ' resize-y'}
            placeholder="Zitat-Text..."
          />
        </div>
        <div>
          <label className={labelCls}>Autor (optional)</label>
          <input
            type="text"
            value={section.author ?? ''}
            onChange={e => onChange({ ...section, author: e.target.value })}
            className={inputCls}
            placeholder="Max Mustermann"
          />
        </div>
      </div>
    )
  }

  if (section.type === 'image') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Bild URL</label>
          <input
            type="text"
            value={section.src}
            onChange={e => onChange({ ...section, src: e.target.value })}
            className={inputCls}
            placeholder="https://..."
          />
          {section.src && (
            <div className="mt-2 rounded-xl overflow-hidden border border-[#222222]/8 h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={section.src} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div>
          <label className={labelCls}>Bildunterschrift (optional)</label>
          <input
            type="text"
            value={section.caption ?? ''}
            onChange={e => onChange({ ...section, caption: e.target.value })}
            className={inputCls}
            placeholder="Bildbeschreibung..."
          />
        </div>
      </div>
    )
  }

  if (section.type === 'list') {
    return (
      <div>
        <label className={labelCls}>Listenpunkte (ein Punkt pro Zeile)</label>
        <textarea
          rows={5}
          value={section.items.join('\n')}
          onChange={e => onChange({ ...section, items: e.target.value.split('\n') })}
          className={inputCls + ' resize-y'}
          placeholder={'Punkt 1\nPunkt 2\nPunkt 3'}
        />
        <p className="text-[10px] text-[#222222]/25 mt-1">{section.items.filter(i => i.trim()).length} Punkte</p>
      </div>
    )
  }

  if (section.type === 'cta') {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls}>Text</label>
          <input
            type="text"
            value={section.text}
            onChange={e => onChange({ ...section, text: e.target.value })}
            className={inputCls}
            placeholder="Beschreibungstext..."
          />
        </div>
        <div>
          <label className={labelCls}>Link (href)</label>
          <input
            type="text"
            value={section.href}
            onChange={e => onChange({ ...section, href: e.target.value })}
            className={inputCls}
            placeholder="/bikes/cafe-racer"
          />
        </div>
        <div>
          <label className={labelCls}>Button-Label</label>
          <input
            type="text"
            value={section.label}
            onChange={e => onChange({ ...section, label: e.target.value })}
            className={inputCls}
            placeholder="Jetzt ansehen"
          />
        </div>
      </div>
    )
  }

  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function formatArticleAsTs(article: Article): string {
  const indent = (obj: unknown, depth = 1): string => {
    const pad = '  '.repeat(depth)
    const closePad = '  '.repeat(depth - 1)
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      const items = obj.map(item => `${pad}${indent(item, depth + 1)}`).join(',\n')
      return `[\n${items},\n${closePad}]`
    }
    if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `${pad}${k}: ${indent(v, depth + 1)}`)
        .join(',\n')
      return `{\n${entries},\n${closePad}}`
    }
    return JSON.stringify(obj)
  }
  return `  ${indent(article)},`
}

export default function ArticleEditor({ initialArticle }: { initialArticle?: Article }) {
  const isNew = !initialArticle

  const [title, setTitle]                   = useState(initialArticle?.title ?? '')
  const [slug, setSlug]                     = useState(initialArticle?.slug ?? '')
  const [slugManual, setSlugManual]         = useState(!!initialArticle)
  const [excerpt, setExcerpt]               = useState(initialArticle?.excerpt ?? '')
  const [coverImage, setCoverImage]         = useState(initialArticle?.coverImage ?? '')
  const [metaTitle, setMetaTitle]           = useState(initialArticle?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(initialArticle?.metaDescription ?? '')
  const [category, setCategory]             = useState<Article['category']>(initialArticle?.category ?? 'build-story')
  const [categoryLabel, setCategoryLabel]   = useState(initialArticle?.categoryLabel ?? 'Build Story')
  const [readTime, setReadTime]             = useState(initialArticle?.readTime ?? '')
  const [author, setAuthor]                 = useState(initialArticle?.author ?? 'MotoDigital Redaktion')
  const [publishedAt, setPublishedAt]       = useState(initialArticle?.publishedAt ?? new Date().toISOString().split('T')[0])
  const [tags, setTags]                     = useState(initialArticle?.tags.join(', ') ?? '')
  const [relatedBuilderSlug, setRelatedBuilderSlug] = useState(initialArticle?.relatedBuilderSlug ?? '')
  const [relatedBuildSlug, setRelatedBuildSlug]     = useState(initialArticle?.relatedBuildSlug ?? '')
  const [sections, setSections]             = useState<ArticleSection[]>(initialArticle?.content ?? [])
  const [expandedIdx, setExpandedIdx]       = useState<number | null>(null)
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [copied, setCopied]                 = useState(false)
  const [successBanner, setSuccessBanner]   = useState(false)

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val)
    if (!slugManual) setSlug(slugify(val))
  }, [slugManual])

  const handleCategoryChange = (cat: Article['category']) => {
    setCategory(cat)
    const labelMap: Record<Article['category'], string> = {
      'build-story': 'Build Story',
      'interview':   'Interview',
      'guide':       'Guide',
    }
    setCategoryLabel(labelMap[cat])
  }

  const addSection = (type: SectionType) => {
    setSections(prev => [...prev, createEmptySection(type)])
    setExpandedIdx(sections.length)
    setShowAddDropdown(false)
  }

  const updateSection = (idx: number, updated: ArticleSection) => {
    setSections(prev => prev.map((s, i) => i === idx ? updated : s))
  }

  const removeSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx))
    setExpandedIdx(null)
  }

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const next = direction === 'up' ? idx - 1 : idx + 1
    if (next < 0 || next >= sections.length) return
    setSections(prev => {
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
    setExpandedIdx(next)
  }

  const handleSave = async () => {
    const article: Article = {
      slug,
      title,
      metaTitle,
      metaDescription,
      category,
      categoryLabel,
      excerpt,
      coverImage,
      publishedAt,
      readTime,
      author,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ...(relatedBuilderSlug ? { relatedBuilderSlug } : {}),
      ...(relatedBuildSlug   ? { relatedBuildSlug }   : {}),
      content: sections,
    }
    const code = formatArticleAsTs(article)
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setSuccessBanner(true)
      setTimeout(() => setCopied(false), 2500)
      setTimeout(() => setSuccessBanner(false), 6000)
    } catch {
      // fallback: show alert
      alert(code)
    }
  }

  const metaTitleLen = metaTitle.length
  const metaDescLen  = metaDescription.length

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      {/* Success banner */}
      {successBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500/15 border-b border-green-500/25 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-green-400 font-semibold">
            Code wurde kopiert — in <code className="font-mono bg-green-500/10 px-1.5 py-0.5 rounded text-xs">src/lib/data/magazine.ts</code> einfügen
          </p>
          <button onClick={() => setSuccessBanner(false)} className="text-green-400/60 hover:text-green-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 pb-16 lg:px-8 ${successBanner ? 'pt-20' : 'pt-8'}`}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/magazine" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            <ArrowLeft size={13} /> Magazin
          </Link>
          <div className="flex items-center gap-3">
            {slug && (
              <a href={`/magazine/${slug}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] border border-[#222222]/10 hover:border-[#222222]/25 px-3 py-1.5 rounded-full transition-all">
                <ExternalLink size={11} /> Vorschau
              </a>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Kopiert!' : 'Speichern / Code kopieren'}
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#222222] mb-8">
          {isNew ? 'Neuer Beitrag' : 'Beitrag bearbeiten'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT PANEL ── */}
          <div className="flex flex-col gap-5">

            {/* Beitrag card */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-5">Beitrag</p>

              <div className="flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className={labelCls}>Titel</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    className={inputCls + ' text-base font-semibold'}
                    placeholder="Beitragstitel..."
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className={labelCls}>Excerpt / Teaser</label>
                  <textarea
                    rows={3}
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className={inputCls + ' resize-y'}
                    placeholder="Kurze Zusammenfassung für Listenansicht und SEO..."
                  />
                </div>

                {/* Cover image */}
                <div>
                  <label className={labelCls}>Cover-Bild URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    className={inputCls}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {coverImage && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[#222222]/8 h-48">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content / Sections card */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30">Inhalt</p>
                <span className="text-xs text-[#222222]/25">{sections.length} Abschnitte</span>
              </div>

              {/* Sections list */}
              <div className="flex flex-col gap-2 mb-4">
                {sections.map((section, idx) => {
                  const isExpanded = expandedIdx === idx
                  return (
                    <div key={idx} className={`border rounded-xl transition-all ${isExpanded ? 'border-[#DDDDDD]/30 bg-white' : 'border-[#222222]/8 bg-white/50 hover:border-[#222222]/15'}`}>
                      {/* Section header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${SECTION_BADGE[section.type as SectionType]}`}>
                          {SECTION_LABEL[section.type as SectionType]}
                        </span>
                        <span className="text-xs text-[#222222]/45 flex-1 truncate">
                          {getSectionPreview(section)}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-[#222222]/25 hover:text-[#222222] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Nach oben"
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === sections.length - 1}
                            className="p-1 rounded text-[#222222]/25 hover:text-[#222222] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Nach unten"
                          >
                            <ChevronDown size={13} />
                          </button>
                          <button
                            onClick={() => removeSection(idx)}
                            className="p-1 rounded text-[#222222]/25 hover:text-red-400 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded editor */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-[#222222]/6 pt-4">
                          <SectionEditor
                            section={section}
                            onChange={updated => updateSection(idx, updated)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}

                {sections.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-[#222222]/10 rounded-xl">
                    <p className="text-sm text-[#222222]/25">Noch keine Abschnitte — füge deinen ersten hinzu</p>
                  </div>
                )}
              </div>

              {/* Add section dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAddDropdown(prev => !prev)}
                  className="inline-flex items-center gap-2 text-xs text-[#717171] border border-[#DDDDDD]/25 hover:border-[#DDDDDD]/50 hover:bg-[#222222]/5 px-4 py-2.5 rounded-full transition-all font-semibold"
                >
                  <Plus size={13} /> Abschnitt hinzufügen
                  <ChevronDown size={11} className={`transition-transform ${showAddDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAddDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-[#222222]/10 rounded-xl shadow-2xl z-20 py-1 min-w-[180px]">
                    {SECTION_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#222222]/60 hover:text-[#222222] hover:bg-[#222222]/4 transition-colors text-left"
                      >
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${SECTION_BADGE[type]}`}>
                          {SECTION_LABEL[type]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT PANEL (sticky) ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-8">

            {/* SEO card */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-4">SEO</p>

              <div className="flex flex-col gap-4">
                {/* Slug */}
                <div>
                  <label className={labelCls}>Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
                    className={inputCls + ' font-mono text-xs'}
                    placeholder="mein-artikel-slug"
                  />
                  {!slugManual && title && (
                    <p className="text-[10px] text-[#222222]/20 mt-1">Auto-generiert aus Titel</p>
                  )}
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#222222]/40 uppercase tracking-widest">Meta Title</label>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      metaTitleLen >= 50 && metaTitleLen <= 60
                        ? 'text-green-400 bg-green-500/10'
                        : metaTitleLen > 0
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-[#222222]/25 bg-[#222222]/5'
                    }`}>
                      {metaTitleLen}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    className={inputCls}
                    placeholder="50–60 Zeichen ideal..."
                  />
                  {metaTitleLen > 0 && (metaTitleLen < 50 || metaTitleLen > 60) && (
                    <p className="text-[10px] text-amber-400/70 mt-1">
                      {metaTitleLen < 50 ? `Noch ${50 - metaTitleLen} Zeichen bis zum Ziel` : `${metaTitleLen - 60} Zeichen über dem Limit`}
                    </p>
                  )}
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#222222]/40 uppercase tracking-widest">Meta Description</label>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      metaDescLen >= 120 && metaDescLen <= 160
                        ? 'text-green-400 bg-green-500/10'
                        : metaDescLen > 0
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-[#222222]/25 bg-[#222222]/5'
                    }`}>
                      {metaDescLen}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    className={inputCls + ' resize-y'}
                    placeholder="120–160 Zeichen ideal..."
                  />
                  {metaDescLen > 0 && (metaDescLen < 120 || metaDescLen > 160) && (
                    <p className="text-[10px] text-amber-400/70 mt-1">
                      {metaDescLen < 120 ? `Noch ${120 - metaDescLen} Zeichen bis zum Ziel` : `${metaDescLen - 160} Zeichen über dem Limit`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings card */}
            <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-4">Einstellungen</p>

              <div className="flex flex-col gap-4">
                {/* Category */}
                <div>
                  <label className={labelCls}>Kategorie</label>
                  <select
                    value={category}
                    onChange={e => handleCategoryChange(e.target.value as Article['category'])}
                    className={inputCls}
                  >
                    <option value="build-story">Build Story</option>
                    <option value="interview">Interview</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>

                {/* Read time */}
                <div>
                  <label className={labelCls}>Lesezeit</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={e => setReadTime(e.target.value)}
                    className={inputCls}
                    placeholder="8 min"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className={labelCls}>Autor</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    className={inputCls}
                    placeholder="MotoDigital Redaktion"
                  />
                </div>

                {/* Published at */}
                <div>
                  <label className={labelCls}>Veröffentlicht am</label>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={e => setPublishedAt(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className={labelCls}>Tags (kommagetrennt)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className={inputCls}
                    placeholder="Cafe Racer, Berlin, Custom"
                  />
                </div>

                {/* Related builder slug */}
                <div>
                  <label className={labelCls}>Builder Slug (optional)</label>
                  <input
                    type="text"
                    value={relatedBuilderSlug}
                    onChange={e => setRelatedBuilderSlug(e.target.value)}
                    className={inputCls}
                    placeholder="jakob-kraft"
                  />
                </div>

                {/* Related build slug */}
                <div>
                  <label className={labelCls}>Build Slug (optional)</label>
                  <input
                    type="text"
                    value={relatedBuildSlug}
                    onChange={e => setRelatedBuildSlug(e.target.value)}
                    className={inputCls}
                    placeholder="berlin-ghost"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3.5 rounded-full hover:bg-[#058f8f] transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Code kopiert!' : 'Speichern / Code kopieren'}
            </button>

            <p className="text-[10px] text-[#222222]/20 text-center leading-relaxed">
              Generiert TypeScript-Code und kopiert ihn in die Zwischenablage. In{' '}
              <code className="font-mono">src/lib/data/magazine.ts</code> einfügen.
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
