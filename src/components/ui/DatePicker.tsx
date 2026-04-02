'use client'

import { useState, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
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

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface DatePickerProps {
  value: string              // "YYYY-MM-DD" or ""
  onChange: (v: string) => void
  min?: string               // "YYYY-MM-DD"
  placeholder?: string
  compact?: boolean
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function formatDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export default function DatePicker({
  value,
  onChange,
  min,
  placeholder = 'Datum wählen',
  compact,
}: DatePickerProps) {
  const now = new Date()
  const parsed = value ? new Date(value + 'T00:00:00') : null
  const initYear = parsed?.getFullYear() ?? now.getFullYear()
  const initMonth = parsed?.getMonth() ?? now.getMonth()
  const [viewYear, setViewYear] = useState(initYear)
  const [viewMonth, setViewMonth] = useState(initMonth)
  const [open, setOpen] = useState(false)
  const [lastValue, setLastValue] = useState(value)

  // Sync view to value when it changes externally (without useEffect)
  if (value !== lastValue) {
    setLastValue(value)
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }

  const { refs: floatingRefs, floatingStyles, context } = useFloating({
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

  // Wrap ref setters to avoid React compiler "refs during render" error
  const setReference = useCallback((node: HTMLElement | null) => { floatingRefs.setReference(node) }, [floatingRefs])
  const setFloating = useCallback((node: HTMLElement | null) => { floatingRefs.setFloating(node) }, [floatingRefs])

  const dismiss = useDismiss(context, { outsidePress: true })
  const { getFloatingProps } = useInteractions([dismiss])

  // Calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7 // Monday = 0

  const todayIso = new Date().toISOString().split('T')[0]

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const selectDay = (day: number) => {
    onChange(toIso(viewYear, viewMonth, day))
    setOpen(false)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Pad to full rows of 7
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      {/* Trigger */}
      <button
        ref={setReference}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={
          compact
            ? `flex-shrink-0 h-8 flex items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium text-left transition-colors focus:outline-none ${
                value ? 'bg-[#222222]/8 border-[#222222]/25' : 'bg-white border-[#d4d4d4] hover:border-[#999]'
              }`
            : 'w-full flex items-center justify-between bg-white border border-[#222222]/10 rounded-xl px-4 py-3 text-sm text-left transition-colors hover:border-[#DDDDDD]/50 focus:outline-none focus:border-[#DDDDDD]/50'
        }
      >
        <span className={value ? 'text-[#333]' : 'text-[#333]'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {compact ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="m6 9 6 6 6-6"/></svg>
        ) : (
          <Calendar size={15} className="text-[#222222]/25 flex-shrink-0" />
        )}
      </button>

      {/* Popover */}
      {open && (
        <FloatingPortal>
          <div
            ref={setFloating}
            style={{ ...floatingStyles, zIndex: 9999 }}
            {...getFloatingProps()}
            className="bg-white border border-[#222222]/10 rounded-xl shadow-2xl p-4 w-[280px]"
          >
            {/* Month / Year header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#222222]/40 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-sm font-semibold text-[#222222]">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#222222]/40 hover:text-[#222222] hover:bg-[#222222]/5 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-[#222222]/30 uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />

                const iso = toIso(viewYear, viewMonth, day)
                const isSelected = iso === value
                const isToday = iso === todayIso
                const isDisabled = min ? iso < min : false

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => selectDay(day)}
                    className={`
                      w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-sm transition-colors
                      ${isSelected
                        ? 'bg-[#06a5a5] text-white font-semibold'
                        : isToday
                          ? 'border border-[#06a5a5]/30 text-[#222222] hover:bg-[#06a5a5]/10'
                          : isDisabled
                            ? 'text-[#222222]/15 cursor-not-allowed'
                            : 'text-[#222222]/70 hover:bg-[#222222]/5'
                      }
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  )
}
