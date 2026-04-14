import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/data/events'
import EventsClient from './EventsClient'

export const revalidate = 3600 // ISR: events change infrequently

export const metadata: Metadata = {
  title: 'Custom Motorcycle Events 2026 — MotoDigital',
  description: 'Die wichtigsten Custom-Motorcycle-Events in Europa 2026 — Glemseck 101, Wheels & Waves, Cafe Racer Festival und mehr.',
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data } = await (supabase.from('events') as any)
    .select('id, slug, name, date_start, date_end, location, description, tags, url, image')
    .order('date_start', { ascending: true })
    .limit(200)

  const events = (data ?? []) as Event[]

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      <Header activePage="events" />

      {/* Hero */}
      <section className="pt-28 pb-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/explore" className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[#F0F0F0] transition-colors" aria-label="Zurück">
              <ArrowLeft size={18} className="text-[#222222]" />
            </Link>
            <p className="text-xs font-semibold text-[#717171] uppercase tracking-widest">Events 2026</p>
          </div>
          <h1 className="font-bold text-[#222222] leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
            Custom Motorcycle Events
          </h1>
          <p className="text-[#222222]/40 text-base max-w-[55ch] leading-relaxed">
            Die besten Custom-Moto-Events in Europa — festivals, shows und races für die Community.
          </p>
        </div>
      </section>

      {/* Filtered events list */}
      <section className="pb-20">
        <EventsClient events={events} />
      </section>

      <Footer />
    </div>
  )
}
