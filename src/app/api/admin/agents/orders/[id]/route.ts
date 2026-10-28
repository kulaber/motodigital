import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const Body = z.object({
  action: z.enum(['approve', 'reject', 'finish', 'fail', 'pause', 'resume']),
})

/** Founder decisions on a team order (the "Chef" approval) and run bookkeeping */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSuperadminId()
  if (!userId) return new Response('Not Found', { status: 404 })

  const { id } = await params
  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !z.string().uuid().safeParse(id).success) return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  const db = await createClient()
  const { data: order } = await (db.from('agent_orders') as any)
    .select('id, status, recurrence').eq('id', id).maybeSingle() as { data: { id: string; status: string; recurrence: string } | null }
  if (!order) return Response.json({ error: 'Auftrag nicht gefunden' }, { status: 404 })

  const now = new Date()
  const patch: Record<string, unknown> = (() => {
    switch (parsed.data.action) {
      case 'approve':
        return order.status === 'planned'
          ? { status: 'approved', approved_by: userId, approved_at: now.toISOString(), next_run_at: order.recurrence === 'weekly' ? new Date(now.getTime() + WEEK_MS).toISOString() : null }
          : {}
      case 'reject': return { status: 'rejected', active: false }
      case 'finish': return { status: 'done', last_run_at: now.toISOString() }
      case 'fail': return { status: 'error', last_run_at: now.toISOString() }
      case 'pause': return { active: false }
      case 'resume': return { active: true }
    }
  })()
  if (!Object.keys(patch).length) return Response.json({ error: 'Auftrag ist nicht im Status „geplant“' }, { status: 409 })

  const { data, error } = await (db.from('agent_orders') as any).update(patch).eq('id', id)
    .select('id, instruction, summary, plan, recurrence, status, active, next_run_at, last_run_at, created_at').single()
  if (error) return Response.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  return Response.json({ order: data })
}
