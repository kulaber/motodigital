'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

export type ToastType = 'success' | 'error'
export type Toast = { id: number; type: ToastType; message: string }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  function show(type: ToastType, message: string) {
    const id = Date.now()
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }
  return { toasts, success: (m: string) => show('success', m), error: (m: string) => show('error', m) }
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 ${
          t.type === 'success' ? 'bg-[#222222] text-white' : 'bg-red-500 text-white'
        }`}>
          {t.type === 'success'
            ? <CheckCircle size={15} className="flex-shrink-0 text-[#06a5a5]" />
            : <AlertCircle size={15} className="flex-shrink-0 text-white" />
          }
          {t.message}
        </div>
      ))}
    </div>
  )
}
