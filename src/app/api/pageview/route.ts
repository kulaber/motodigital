import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SECTION_MAP: Record<string, string> = {
  '/bikes': 'Custom Bikes',
  '/custom-bike': 'Custom Bikes',
  '/custom-werkstatt': 'Werkstattsuche',
  '/explore': 'Explore',
  '/magazine': 'Magazin',
  '/rider': 'Rider',
  '/events': 'Events',
  '/marken': 'Marken',
}

function getSection(path: string): string {
  for (const [prefix, section] of Object.entries(SECTION_MAP)) {
    if (path === prefix || path.startsWith(prefix + '/')) return section
  }
  if (path === '/' || path === '') return 'Startseite'
  if (path.startsWith('/__event/contact-click')) return 'Kontaktanfragen'
  return 'Sonstige'
}

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }

    const supabase = await createClient()
    const section = getSection(path)
    const userAgent = req.headers.get('user-agent') ?? null

    await (supabase.from('page_views') as any).insert({
      path,
      section,
      referrer: referrer || null,
      user_agent: userAgent,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
