'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function WorkshopCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) setShow(true)
    })
  }, [])

  if (!show) return null

  return (
    <section className="max-w-6xl mx-auto px-5 lg:px-8 pb-16">
      <Link href="/auth/register?role=custom-werkstatt" className="group rounded-2xl overflow-hidden relative bg-[#111111] block">
        <div className="absolute inset-0">
          <Image
            src="/custom-werkstatt.png"
            alt="Custom Werkstatt"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover opacity-30 scale-100 group-hover:scale-110 transition-transform duration-[1200ms] ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-transparent" />
        </div>
        <div className="relative z-10 p-8 py-12 text-center flex flex-col items-center justify-center min-h-[180px]">
          <h3 className="text-sm font-bold text-white mb-1">Founding Partner — Nur 10 Plätze</h3>
          <p className="text-xs text-white/50 leading-relaxed mb-4">€39/Monat statt €79 — für die ersten 10 Werkstätten. Werde direkt von Riders gefunden.</p>
          <span className="inline-flex bg-[#06a5a5] hover:bg-[#058f8f] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors">Jetzt Founding Partner sichern</span>
        </div>
      </Link>
    </section>
  )
}
