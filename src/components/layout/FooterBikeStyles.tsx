'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STYLE_MAP: Record<string, { slug: string; label: string }> = {
  cafe_racer:     { slug: 'cafe-racer',     label: 'Cafe Racer' },
  bobber:         { slug: 'bobber',         label: 'Bobber' },
  scrambler:      { slug: 'scrambler',      label: 'Scrambler' },
  tracker:        { slug: 'tracker',        label: 'Tracker' },
  chopper:        { slug: 'chopper',        label: 'Chopper' },
  naked:          { slug: 'naked',          label: 'Naked' },
  brat_style:     { slug: 'brat-style',     label: 'Brat Style' },
  street_fighter: { slug: 'street-fighter', label: 'Street Fighter' },
  enduro:         { slug: 'enduro',         label: 'Enduro' },
  old_school:     { slug: 'old-school',     label: 'Old School' },
  street:         { slug: 'street',         label: 'Street' },
  other:          { slug: 'basis-bike',    label: 'Basis-Bike' },
}

export default function FooterBikeStyles() {
  const [links, setLinks] = useState<{ label: string; href: string }[]>([])

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('bikes') as any)
      .select('style')
      .eq('status', 'active')
      .then(({ data }: { data: { style: string }[] | null }) => {
        const active = new Set((data ?? []).map(r => r.style))
        setLinks(
          Array.from(active)
            .filter(s => STYLE_MAP[s])
            .sort((a, b) => STYLE_MAP[a].label.localeCompare(STYLE_MAP[b].label))
            .map(s => ({ label: STYLE_MAP[s].label, href: `/bikes/${STYLE_MAP[s].slug}` }))
        )
      })
  }, [])

  return (
    <>
      {links.map(l => (
        <li key={l.label}>
          <Link href={l.href} className="text-sm text-white/45 hover:text-white transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </>
  )
}
