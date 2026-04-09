'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
  useDismiss,
  useInteractions,
} from '@floating-ui/react'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

interface TimePickerProps {
  value: string              // "HH:MM" or ""
  onChange: (v: string) => void
  minTime?: string           // "HH:MM" — times before this are disabled
  placeholder?: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function TimePicker({
  value,
  onChange,
  minTime,
  placeholder = 'Uhrzeit wählen',
}: TimePickerProps) {
  const [open, setOpen] = useState(false)

  const parsedHour = value ? parseInt(value.split(':')[0]) : null
  const parsedMinute = value ? parseInt(value.split(':')[1]) : null

  const minH = minTime ? parseInt(minTime.split(':')[0]) : 0
  const minM = minTime ? parseInt(minTime.split(':')[1]) : 0

  const hourRef = useRef<HTMLDivElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ['top-start'], padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const setReference = useCallback(
    (node: HTMLElement | null) => { refs.setReference(node) },
    [refs],
  )
  const setFloating = useCallback(
    (node: HTMLElement | null) => { refs.setFloating(node) },
    [refs],
  )

  const dismiss = useDismiss(context, { outsidePress: true })
  const { getFloatingProps } = useInteractions([dismiss])

  // Scroll selected hour into view when opened
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      if (parsedHour !== null && hourRef.current) {
        const el = hourRef.current.querySelector(`[data-hour="${parsedHour}"]`)
        el?.scrollIntoView({ block: 'center' })
      }
    }, 50)
    return () => clearTimeout(t)
  }, [open, parsedHour])

  function isHourDisabled(h: number): boolean {
    if (!minTime) return false
    return h < minH
  }

  function isMinuteDisabled(m: number): boolean {
    if (!minTime) return false
    const h = parsedHour ?? -1
    if (h < minH) return true
    if (h === minH) return m < minM
    return false
  }

  function selectHour(h: number) {
    let m = parsedMinute ?? 0
    // Snap to nearest valid 15-min step
    if (!MINUTES.includes(m)) m = 0
    // If current minute is disabled for the new hour, pick first valid minute
    if (minTime && h === minH && m < minM) {
      const first = MINUTES.find(v => v >= minM)
      m = first !== undefined ? first : 0
    }
    onChange(`${pad(h)}:${pad(m)}`)
  }

  function selectMinute(m: number) {
    const h = parsedHour ?? (minTime ? minH : 0)
    onChange(`${pad(h)}:${pad(m)}`)
  }

  const displayValue = value ? `${pad(parsedHour!)}:${pad(parsedMinute!)}` : ''

  return (
    <div>
      {/* Trigger */}
      <button
        ref={setReference}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-left transition-colors hover:border-[#DDDDDD]/50 focus:outline-none"
      >
        <span className={value ? 'text-[#333]' : 'text-[#222222]/30'}>
          {displayValue || placeholder}
        </span>
        <Clock size={15} className="text-[#222222]/25 flex-shrink-0" />
      </button>

      {/* Popover */}
      {open && (
        <FloatingPortal>
          <div
            ref={setFloating}
            style={{ ...floatingStyles, zIndex: 9999 }}
            {...getFloatingProps()}
            className="bg-white border border-[#222222]/10 rounded-xl shadow-2xl overflow-hidden w-[160px]"
          >
            <div className="flex" style={{ height: 240 }}>
              {/* Hours column */}
              <div
                ref={hourRef}
                className="flex-1 overflow-y-auto border-r border-[#222222]/6 scrollbar-hide"
              >
                {HOURS.map(h => {
                  const disabled = isHourDisabled(h)
                  const selected = h === parsedHour
                  return (
                    <button
                      key={h}
                      data-hour={h}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectHour(h)}
                      className={`w-full py-2.5 text-center text-sm transition-colors ${
                        selected
                          ? 'bg-[#06a5a5] text-white font-semibold'
                          : disabled
                            ? 'text-[#222222]/15 cursor-not-allowed'
                            : 'text-[#222222]/70 hover:bg-[#222222]/5'
                      }`}
                    >
                      {pad(h)}
                    </button>
                  )
                })}
              </div>

              {/* Minutes column */}
              <div className="flex-1 flex flex-col justify-center">
                {MINUTES.map(m => {
                  const disabled = isMinuteDisabled(m)
                  const selected = m === parsedMinute
                  return (
                    <button
                      key={m}
                      data-minute={m}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectMinute(m)}
                      className={`w-full py-2.5 text-center text-sm transition-colors ${
                        selected
                          ? 'bg-[#06a5a5] text-white font-semibold'
                          : disabled
                            ? 'text-[#222222]/15 cursor-not-allowed'
                            : 'text-[#222222]/70 hover:bg-[#222222]/5'
                      }`}
                    >
                      {pad(m)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  )
}
