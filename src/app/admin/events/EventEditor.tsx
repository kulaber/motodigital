'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, X } from 'lucide-react'
import type { Event } from '@/lib/data/events'

const inputCls = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors'
const labelCls = 'block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5'

function formatEventAsTs(event: Event): string {
  const tagsStr = event.tags.map(t => JSON.stringify(t)).join(', ')
  const urlLine = event.url ? `\n    url: ${JSON.stringify(event.url)},` : ''
  return `  {
    id: ${event.id},
    name: ${JSON.stringify(event.name)},
    date: ${JSON.stringify(event.date)},
    location: ${JSON.stringify(event.location)},
    description: ${JSON.stringify(event.description)},
    tags: [${tagsStr}],${urlLine}
  },`
}

export default function EventEditor({ initialEvent }: { initialEvent?: Event }) {
  const isNew = !initialEvent

  const [name, setName]               = useState(initialEvent?.name ?? '')
  const [date, setDate]               = useState(initialEvent?.date ?? '')
  const [location, setLocation]       = useState(initialEvent?.location ?? '')
  const [description, setDescription] = useState(initialEvent?.description ?? '')
  const [tags, setTags]               = useState(initialEvent?.tags.join(', ') ?? '')
  const [url, setUrl]                 = useState(initialEvent?.url ?? '')
  const [copied, setCopied]           = useState(false)
  const [successBanner, setSuccessBanner] = useState(false)

  const handleSave = async () => {
    const event: Event = {
      id: initialEvent?.id ?? Date.now(),
      slug: initialEvent?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      date,
      location,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ...(url ? { url } : {}),
    }
    const code = formatEventAsTs(event)
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setSuccessBanner(true)
      setTimeout(() => setCopied(false), 2500)
      setTimeout(() => setSuccessBanner(false), 6000)
    } catch {
      alert(code)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      {/* Success banner */}
      {successBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500/15 border-b border-green-500/25 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-green-400 font-semibold">
            Code wurde kopiert — in{' '}
            <code className="font-mono bg-green-500/10 px-1.5 py-0.5 rounded text-xs">src/lib/data/events.ts</code> einfügen
          </p>
          <button onClick={() => setSuccessBanner(false)} className="text-green-400/60 hover:text-green-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className={`max-w-2xl mx-auto px-4 pb-16 lg:px-8 ${successBanner ? 'pt-20' : 'pt-8'}`}>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors">
            <ArrowLeft size={13} /> Events
          </Link>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#058f8f] transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Kopiert!' : 'Speichern / Code kopieren'}
          </button>
        </div>

        <h1 className="text-xl font-bold text-[#222222] mb-8">
          {isNew ? 'Neues Event' : 'Event bearbeiten'}
        </h1>

        {/* Form */}
        <div className="flex flex-col gap-5">

          {/* Basic info */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-5">Event-Details</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputCls + ' text-base font-semibold'}
                  placeholder="Glemseck 101"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Datum</label>
                  <input
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className={inputCls}
                    placeholder="September 2026"
                  />
                  <p className="text-[10px] text-[#222222]/20 mt-1">Freitext, z.B. &quot;September 2026&quot;</p>
                </div>

                <div>
                  <label className={labelCls}>Ort</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className={inputCls}
                    placeholder="Leonberg, Deutschland"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Beschreibung</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={inputCls + ' resize-y'}
                  placeholder="Beschreibung des Events..."
                />
              </div>
            </div>
          </div>

          {/* Tags & URL */}
          <div className="bg-white border border-[#222222]/6 rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#222222]/30 mb-5">Zusatzinfo</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Tags (kommagetrennt)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className={inputCls}
                  placeholder="Sprint, Custom, Classic"
                />
                {tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#222222]/5 text-[#222222]/40 border border-[#222222]/8">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>URL (optional)</label>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className={inputCls}
                  placeholder="https://glemseck.de"
                />
                <p className="text-[10px] text-[#222222]/20 mt-1">Offizielle Event-Website für den &quot;Mehr Info&quot;-Link</p>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-5 py-3.5 rounded-full hover:bg-[#058f8f] transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Code kopiert!' : 'Speichern / Code kopieren'}
          </button>

          <p className="text-[10px] text-[#222222]/20 text-center leading-relaxed">
            Generiert TypeScript-Code und kopiert ihn in die Zwischenablage. In{' '}
            <code className="font-mono">src/lib/data/events.ts</code> einfügen.
          </p>

        </div>
      </div>
    </div>
  )
}
