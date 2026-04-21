'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { submitContactForm } from './actions'

type ContactFormLabels = {
  name: string
  email: string
  subject: string
  message: string
  submit: string
  success: string
  error: string
}

export default function ContactForm({ labels }: { labels?: ContactFormLabels } = {}) {
  const l: ContactFormLabels = labels ?? {
    name: 'Name',
    email: 'E-Mail',
    subject: 'Betreff',
    message: 'Nachricht',
    submit: 'Senden',
    success: 'Deine Nachricht wurde gesendet. Wir melden uns innerhalb von 24 Stunden.',
    error: 'Beim Senden ist ein Fehler aufgetreten. Bitte versuche es erneut.',
  }

  const [pending, setPending]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [errors, setErrors]     = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setErrors({})

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const result = await submitContactForm(formData)

      if (result.success) {
        setSuccess(true)
        form.reset()
      } else if (result.error) {
        setErrors(result.error as Record<string, string[]>)
      }
    } catch {
      setErrors({ _form: [l.error] })
    } finally {
      setPending(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <CheckCircle size={32} className="mx-auto mb-4 text-emerald-400" />
        <p className="text-sm text-white/70">
          {l.success}
        </p>
      </div>
    )
  }

  const fieldClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#2AABAB]/50 focus:ring-1 focus:ring-[#2AABAB]/25 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-white/40 mb-1.5">
            {l.name}
          </label>
          <input id="name" name="name" type="text" required className={fieldClass} />
          <FieldError errors={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-white/40 mb-1.5">
            {l.email}
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} />
          <FieldError errors={errors.email} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs font-medium text-white/40 mb-1.5">
          {l.subject}
        </label>
        <input id="subject" name="subject" type="text" required className={fieldClass} />
        <FieldError errors={errors.subject} />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-white/40 mb-1.5">
          {l.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${fieldClass} resize-none`}
        />
        <FieldError errors={errors.message} />
      </div>

      {errors._form && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={14} />
          {errors._form[0]}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 bg-[#2AABAB] text-white text-sm font-semibold px-7 py-3 rounded-full hover:bg-[#239393] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? '…' : l.submit}
        <Send size={14} />
      </button>
    </form>
  )
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="mt-1 text-xs text-red-400">{errors[0]}</p>
}
