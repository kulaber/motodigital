import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'
import { getAgent } from '@/lib/agents/definitions'
import { runAgent, orderStepTask, ORDER_SUMMARY_TASK, type RunEvent } from '@/lib/agents/runAgent'
import type { RunTask } from '@/lib/agents/context'

// Agents only run when an admin clicks — this route is the click entry point.
export const runtime = 'nodejs'
export const maxDuration = 300

const Body = z.object({
  agentId: z.string().min(1).max(40),
  // Either a predefined task chip …
  taskIndex: z.number().int().min(0).max(10).optional(),
  // … or a step of an approved team order
  orderId: z.string().uuid().optional(),
  orderStep: z.number().int().min(0).max(10).optional(),
  orderSummary: z.boolean().optional(),
  details: z.string().max(4000).default(''),
  handoffFromId: z.string().uuid().nullable().optional(),
})

export async function POST(request: Request) {
  const userId = await getSuperadminId()
  if (!userId) return new Response('Not Found', { status: 404 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY ist nicht gesetzt' }, { status: 500 })
  }

  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  const b = parsed.data

  const agent = getAgent(b.agentId)
  if (!agent) return Response.json({ error: 'Unbekannter Agent' }, { status: 400 })

  const db = await createClient()
  let task: RunTask | null = null
  let orderId: string | null = null

  if (b.orderId) {
    // Order steps come from the stored, approved plan — never from the request body
    const { data: order } = await (db.from('agent_orders') as any)
      .select('id, status, plan').eq('id', b.orderId).maybeSingle() as { data: { id: string; status: string; plan: { agent_id: string; instruction: string }[] } | null }
    if (!order || !['approved', 'running'].includes(order.status)) {
      return Response.json({ error: 'Auftrag ist nicht freigegeben' }, { status: 409 })
    }
    orderId = order.id
    if (b.orderSummary) {
      if (agent.id !== 'cos') return Response.json({ error: 'Zusammenfassung nur durch den Chief of Staff' }, { status: 400 })
      task = ORDER_SUMMARY_TASK
    } else {
      const step = b.orderStep != null ? order.plan[b.orderStep] : undefined
      if (!step || step.agent_id !== agent.id) return Response.json({ error: 'Schritt passt nicht zum Plan' }, { status: 400 })
      task = orderStepTask(agent, step.instruction)
      if (order.status === 'approved') await (db.from('agent_orders') as any).update({ status: 'running' }).eq('id', order.id)
    }
  } else if (b.taskIndex != null && agent.tasks[b.taskIndex]) {
    const t = agent.tasks[b.taskIndex]
    task = { label: t.t, prompt: t.p, team: t.ab, words: t.words }
  }
  if (!task) return Response.json({ error: 'Unbekannte Aufgabe' }, { status: 400 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: RunEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + '\n'))
      try {
        await runAgent({
          db, agent, task: task!, orderId,
          details: b.details,
          handoffFromId: b.handoffFromId ?? null,
          source: orderId ? 'order' : 'manual',
          runBy: userId,
          onEvent: send,
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
