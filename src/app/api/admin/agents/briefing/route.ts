import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'

// The briefing is written by the admin, never by an agent.
const Body = z.object({ content: z.string().max(10000) })

export async function PUT(request: Request) {
  const userId = await getSuperadminId()
  if (!userId) return new Response('Not Found', { status: 404 })

  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  const db = await createClient()
  const { error } = await (db.from('agent_briefing') as any).upsert(
    { scope: 'global', content: parsed.data.content, updated_by: userId, updated_at: new Date().toISOString() },
    { onConflict: 'scope' },
  )
  if (error) return Response.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  return Response.json({ ok: true })
}
