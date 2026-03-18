'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import type { OpeningHours } from '@/lib/data/builders'
import { calcOpenStatus, parseDays, nextOpening } from '@/lib/utils/openingHours'

export default function OpeningHoursWidget({ openingHours }: { openingHours: OpeningHours[] }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const status = now ? calcOpenStatus(openingHours, now) : null

  return (
    <div className="bg-white border border-[#222222]/6 rounded-2xl overflow-hidden">

      {/* Header row */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-2">
        <span className="text-base font-bold text-[#222222] tracking-tight flex-1">
          Öffnungszeiten
        </span>
        {status ? (
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap ${
            status.open ? 'text-emerald-400' : 'text-[#222222]/35'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              status.open ? 'bg-emerald-400 animate-pulse' : 'bg-[#222222]/20'
            }`} />
            {status.open ? 'Jetzt geöffnet' : 'Geschlossen'}
          </span>
        ) : (
          <span className="w-20 h-3.5 rounded-full bg-[#222222]/5 animate-pulse" />
        )}
      </div>

      {/* Sub-status */}
      {status && (
        <div className="px-5 pb-3 -mt-1">
          <p className="text-[11px] text-[#222222]/30 leading-snug">
            {status.open
              ? `Schließt heute um ${status.closesAt} Uhr`
              : status.reason === 'appointment'
                ? 'Termine auf Anfrage'
                : (() => {
                    const next = nextOpening(openingHours, now!)
                    return next ? `Öffnet wieder ${next}` : 'Keine Öffnungszeiten bekannt'
                  })()
            }
          </p>
        </div>
      )}

      <div className="mx-5 border-t border-[#222222]/5" />

      {/* Hours list */}
      <div className="px-3 py-2">
        {openingHours.map((h, i) => {
          const isToday = now ? parseDays(h.day).includes(now.getDay()) : false
          return (
            <div key={i} className="flex items-center justify-between px-2 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`w-0.5 h-3 rounded-full flex-shrink-0 ${isToday ? 'bg-[#06a5a5]' : 'bg-transparent'}`} />
                <span className={`text-xs ${isToday ? 'text-[#222222]/80 font-semibold' : 'text-[#222222]/40'}`}>
                  {h.day}
                </span>
              </div>
              <span className={`text-xs font-medium tabular-nums font-[family-name:var(--font-sans)] ${
                h.hours === 'Geschlossen'
                  ? 'text-[#222222]/20'
                  : h.hours === 'Nur nach Vereinbarung'
                    ? 'text-[#222222]/35 italic text-[11px]'
                    : 'text-[#222222]/60'
              }`}>
                {h.hours}
              </span>
            </div>
          )
        })}
      </div>
      <div className="h-1" />
    </div>
  )
}
