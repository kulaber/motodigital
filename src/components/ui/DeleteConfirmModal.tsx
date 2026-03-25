'use client'

import { useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title?: string
}

export function DeleteConfirmModal({ open, onClose, onConfirm, loading, title }: DeleteConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()

    // Focus trap
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] transition-colors"
        >
          <X size={15} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle size={22} className="text-red-500" />
          </div>

          <h3 id="delete-modal-title" className="text-base font-bold text-[#222222] mb-1">
            {title ?? 'Willst du diesen Beitrag wirklich löschen?'}
          </h3>
          <p className="text-sm text-[#717171] mb-6">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>

          <div className="flex gap-3 w-full">
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#222222] bg-[#F7F7F7] hover:bg-[#EEEEEE] rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-colors"
            >
              {loading ? 'Wird gelöscht…' : 'Löschen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
