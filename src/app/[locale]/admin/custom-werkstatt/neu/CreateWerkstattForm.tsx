'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Shield, Plus } from 'lucide-react'

export default function CreateWerkstattForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')

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
    setName(value)
    setUsername(slug)
  }

  async function handleSubmit() {
    if (!name.trim() || !username.trim()) {
      setError('Name und Username sind erforderlich')
      return
    }
    setSaving(true)
    setError(null)

    const res = await fetch('/api/admin/werkstatt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        username: username.trim(),
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Unbekannter Fehler')
      return
    }

    // Redirect to full edit form (same as workshop self-edit)
    router.push(`/admin/custom-werkstatt/${data.username}/edit`)
    router.refresh()
  }

  const inputClass = 'w-full bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-[#222222] placeholder-[#1A1714]/20 focus:outline-none focus:border-[#DDDDDD]/50 transition-colors'

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
            Nach dem Anlegen wirst du zum vollstaendigen Profil-Formular weitergeleitet.
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
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="z.B. Thunderbike Customs"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#222222]/40 uppercase tracking-widest mb-1.5">
              Username / Slug *
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="wird-automatisch-generiert"
              className={inputClass}
            />
          </div>
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
            disabled={saving || !name.trim() || !username.trim()}
            className="inline-flex items-center gap-2 bg-[#06a5a5] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#058f8f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            {saving ? 'Wird erstellt...' : 'Werkstatt anlegen & bearbeiten'}
          </button>
        </div>
      </div>
    </>
  )
}
