import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'
import { createPlan } from '@/lib/agents/plan'

export const runtime = 'nodejs'
export const maxDuration = 120

const Body = z.object({
  instruction: z.string().min(5).max(3000),
  recurrence: z.enum(['none', 'weekly']).default('none'),
})

/** Chief of Staff drafts a plan. Stored as 'planned' — nothing runs until approval. */
export async function POST(request: Request) {
  const userId = await getSuperadminId()
  if (!userId) return new Response('Not Found', { status: 404 })

  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Bitte einen Auftrag mit mindestens 5 Zeichen eingeben.' }, { status: 400 })

  const db = await createClient()
  const { data: briefingRow } = await (db.from('agent_briefing') as any)
    .select('content').eq('scope', 'global').maybeSingle() as { data: { content: string } | null }

  try {
    const plan = await createPlan(parsed.data.instruction, briefingRow?.content ?? '')
    const { data: order, error } = await (db.from('agent_orders') as any).insert({
      instruction: parsed.data.instruction,
      summary: plan.summary,
      plan: plan.steps,
      recurrence: parsed.data.recurrence,
      status: 'planned',
      created_by: userId,
    }).select('id, instruction, summary, plan, recurrence, status, active, next_run_at, created_at').single()
    if (error) throw new Error(error.message)
    return Response.json({ order })
  } catch (e) {
    const message = e instanceof Anthropic.APIError ? `API-Fehler ${e.status ?? ''}`.trim() : e instanceof Error ? e.message : 'Plan fehlgeschlagen'
    return Response.json({ error: message }, { status: 500 })
  }
}
