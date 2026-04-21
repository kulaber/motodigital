'use client'

import { useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteEvent } from './actions'

interface Props {
  id: string
  name: string
}

export default function DeleteEventButton({ id, name }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Event "${name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return
    startTransition(async () => {
      const res = await deleteEvent(id)
      if (res && 'error' in res && res.error) alert(res.error)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1 text-xs text-red-400/70 hover:text-red-500 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-full transition-all whitespace-nowrap disabled:opacity-50"
    >
      {isPending ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
      Löschen
    </button>
  )
}
