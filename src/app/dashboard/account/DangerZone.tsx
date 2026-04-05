'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { requestAccountDeletion } from '@/lib/actions/account-deletion'

type Props = {
  email: string
}

export default function DangerZone({ email }: Props) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError(null)

    const result = await requestAccountDeletion(password)

    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-2xl p-5 sm:p-6">
        <p className="text-sm text-green-700 font-medium">
          Bestätigungs-E-Mail wurde an {email} gesendet.
        </p>
        <p className="text-xs text-green-600/70 mt-1.5">
          Klicke auf den Link in der E-Mail, um die Löschung zu bestätigen. Der Link ist 24 Stunden gültig.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-red-200/60 bg-white rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1.5">
        <AlertTriangle size={15} className="text-red-500" />
        <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
      </div>

      <p className="text-xs text-[#222222]/40 mb-5">
        Account und alle Daten endgültig löschen. Bikes, Nachrichten, Medien und alle anderen Inhalte werden unwiderruflich entfernt.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#222222]/35 uppercase tracking-widest mb-1.5">
            Passwort bestätigen
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Dein aktuelles Passwort"
            className="w-full bg-white border border-red-200/60 rounded-xl px-4 py-2.5 text-sm text-[#222222] placeholder:text-[#222222]/20 outline-none focus:border-red-300 transition-colors"
            required
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-red-600 disabled:opacity-50 transition-all self-start"
        >
          {loading ? 'Wird verarbeitet…' : 'Account endgültig löschen'}
        </button>
      </form>
    </div>
  )
}
