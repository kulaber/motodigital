'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Plus } from 'lucide-react'

export default function CreateWerkstattForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    username: '',
    city: '',
    specialty: '',
    bio: '',
    tags: '',
    since_year: '',
    is_verified: false,
  })

  /** Auto-generate slug from name */
  function handleNameChange(value: string) {
    const slug = value
      .toLowerCase()
      .replace(/[äÄ]/g, 'ae')
      .replace(/[öÖ]/g, 'oe')
      .replace(/[üÜ]/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setForm(f => ({ ...f, name: value, username: slug }))
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.username.trim()) {
      setError('Name und Username sind erforderlich')
      return
    }
    setSaving(true)
    setError(null)

    const res = await fetch('/api/admin/werkstatt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        username: form.username.trim(),
        city: form.city.trim() || null,
        specialty: form.specialty.trim() || null,
        bio: form.bio.trim() || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        since_year: form.since_year ? parseInt(form.since_year) : null,
        is_verified: form.is_verified,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Unbekannter Fehler')
      return
    }

    router.push('/admin/custom-werkstatt')
    router.refresh()
  }

  const field = (
    label: string,
    key: keyof typeof form,
    opts?: { type?: 'text' | 'textarea' | 'number'; placeholder?: string; disabled?: boolean },
  ) => {
    const { type = 'text', placeholder, disabled } = opts ?? {}
    return (
      <div>
        <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            value={form[key] as string}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 resize-none transition-colors"
          />
        ) : (
          <input
            type={type}
            value={form[key] as string}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors disabled:opacity-50"
          />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/admin/custom-werkstatt"
          className="inline-flex items-center gap-1.5 text-xs text-[#222222]/35 hover:text-[#222222] transition-colors"
        >
          <ArrowLeft size={13} /> Builder-Liste
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Shield size={14} className="text-amber-400" />
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Superadmin</p>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#222222] mb-8">Neue Werkstatt anlegen</h1>

      <div className="space-y-5">
        {/* Info */}
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#222222]/6">
          <div className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-400" />
          <p className="text-xs text-[#222222]/50">
            Die Werkstatt wird ohne E-Mail-Adresse erstellt. Du kannst sie spaeter einem Inhaber zuordnen.
          </p>
        </div>

        {/* Basis */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Basis-Informationen</h2>
          <div>
            <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="z.B. Thunderbike Customs"
              className="w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors"
            />
          </div>
          {field('Username / Slug *', 'username', { placeholder: 'wird-automatisch-generiert' })}
          <div className="grid grid-cols-2 gap-4">
            {field('Stadt', 'city', { placeholder: 'z.B. Stuttgart' })}
            {field('Seit Jahr', 'since_year', { type: 'number', placeholder: '2010' })}
          </div>
          {field('Spezialisierung', 'specialty', { placeholder: 'z.B. Cafe Racer, Bobber' })}
          {field('Bio (kurz)', 'bio', { type: 'textarea', placeholder: 'Kurzbeschreibung der Werkstatt...' })}
        </div>

        {/* Tags */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest">Tags</h2>
          {field('Leistungen (kommagetrennt)', 'tags', { placeholder: 'Umbau, Restauration, Lackierung' })}
        </div>

        {/* Status */}
        <div className="bg-white border border-[#222222]/6 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-[#222222]/30 uppercase tracking-widest mb-4">Status</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, is_verified: !f.is_verified }))}
              className={`w-10 h-6 rounded-full border-2 transition-all relative cursor-pointer ${
                form.is_verified ? 'bg-[#06a5a5] border-[#DDDDDD]' : 'bg-transparent border-[#222222]/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  form.is_verified ? 'left-4' : 'left-0.5'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#222222]">Verifizierte Werkstatt</p>
              <p className="text-xs text-[#222222]/30 mt-0.5">Zeigt das Verified-Badge auf dem Profil</p>
            </div>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{error}</div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/custom-werkstatt"
            className="text-xs text-[#222222]/35 hover:text-[#222222] transition-colors"
          >
            Abbrechen
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim() || !form.username.trim()}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#058f8f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            {saving ? 'Wird erstellt...' : 'Werkstatt anlegen'}
          </button>
        </div>
      </div>
    </>
  )
}
