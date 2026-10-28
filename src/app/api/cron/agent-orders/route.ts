import { createClient } from '@supabase/supabase-js'
import { getAgent, COS } from '@/lib/agents/definitions'
import { runAgent, orderStepTask, ORDER_SUMMARY_TASK } from '@/lib/agents/runAgent'

// Weekly repeats of founder-approved team orders. Produces DRAFTS only:
// results land in the Ablage, articles as magazine drafts awaiting approval.
// Nothing is published or sent. Triggered by Vercel Cron (see vercel.json).
export const runtime = 'nodejs'
export const maxDuration = 800

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Not Found', { status: 404 })
  }
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: 'ANTHROPIC_API_KEY fehlt' }, { status: 500 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // One due order per invocation keeps each run well inside the time limit
  const { data: order } = await db.from('agent_orders')
    .select('id, plan, created_by, next_run_at')
    .eq('recurrence', 'weekly').eq('active', true)
    .in('status', ['approved', 'done', 'error'])
    .lte('next_run_at', new Date().toISOString())
    .order('next_run_at', { ascending: true })
    .limit(1)
    .maybeSingle() as { data: { id: string; plan: { agent_id: string; instruction: string }[]; created_by: string; next_run_at: string } | null }

  if (!order) return Response.json({ ran: 0 })

  // Claim it first so an overlapping invocation does not run it twice
  const nextRun = new Date(Math.max(Date.now(), new Date(order.next_run_at).getTime()) + WEEK_MS).toISOString()
  await db.from('agent_orders').update({ status: 'running', next_run_at: nextRun }).eq('id', order.id)

  let previous: string | null = null
  let ok = true
  for (const step of order.plan) {
    const agent = getAgent(step.agent_id)
    if (!agent) continue
    const r = await runAgent({
      db, agent, task: orderStepTask(agent, step.instruction),
      handoffFromId: previous, orderId: order.id, source: 'schedule', runBy: order.created_by,
    })
    if (!r.ok) { ok = false; break }
    previous = r.id
  }
  if (ok) {
    await runAgent({
      db, agent: getAgent(COS.id)!, task: ORDER_SUMMARY_TASK,
      orderId: order.id, source: 'schedule', runBy: order.created_by,
    })
  }

  await db.from('agent_orders').update({ status: ok ? 'done' : 'error', last_run_at: new Date().toISOString() }).eq('id', order.id)
  return Response.json({ ran: 1, order: order.id, ok })
}
