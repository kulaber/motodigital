'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { resendVerificationEmail } from '@/lib/actions/riders'

export default function ResendEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleClick() {
    setStatus('sending')
    const result = await resendVerificationEmail(email)
    setStatus(result.error ? 'error' : 'sent')
  }

  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-500 px-3 py-1.5 whitespace-nowrap">
        <Mail size={10} /> Gesendet
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'sending'}
      className="inline-flex items-center gap-1 text-xs text-amber-500/80 hover:text-amber-600 border border-amber-400/20 hover:border-amber-400/40 px-3 py-1.5 rounded-full transition-all whitespace-nowrap disabled:opacity-50"
    >
      <Mail size={10} />
      {status === 'sending' ? 'Sende…' : status === 'error' ? 'Fehler — erneut' : 'Mail senden'}
    </button>
  )
}
