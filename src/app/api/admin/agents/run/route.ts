import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'
import { getAgent } from '@/lib/agents/definitions'
import { AGENT_TOOLS, getPlatformStats, runAgentTool } from '@/lib/agents/tools'
import { systemPrompt, userPrompt } from '@/lib/agents/context'

// Agents only run when an admin clicks — this route is the only entry point.
export const runtime = 'nodejs'
export const maxDuration = 120

const MODEL = 'claude-opus-5-5'
const MAX_TURNS = 6

const Body = z.object({
  agentId: z.string().min(1).max(40),
  taskIndex: z.number().int().min(0).max(10),
  details: z.string().max(4000).default(''),
  handoffFromId: z.string().uuid().nullable().optional(),
})

type StreamEvent =
  | { type: 'start'; id: string }
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string }
  | { type: 'done'; id: string; output: string }
  | { type: 'error'; message: string }

const notFound = () => new Response('Not Found', { status: 404 })

export async function POST(request: Request) {
  const userId = await getSuperadminId()
  if (!userId) return notFound()

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY ist nicht gesetzt' }, { status: 500 })
  }

  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  const { agentId, taskIndex, details, handoffFromId } = parsed.data

  const agent = getAgent(agentId)
  const task = agent?.tasks[taskIndex]
  if (!agent || !task) return Response.json({ error: 'Unbekannter Agent oder Aufgabe' }, { status: 400 })

  // Session client: agent tables are protected by RLS (is_superadmin())
  const db = await createClient()

  const [{ data: briefingRow }, handoffRow, stats] = await Promise.all([
    (db.from('agent_briefing') as any).select('content').eq('scope', 'global').maybeSingle() as Promise<{ data: { content: string } | null }>,
    handoffFromId
      ? ((db.from('agent_outputs') as any).select('agent_key, output').eq('id', handoffFromId).eq('status', 'done').maybeSingle() as Promise<{ data: { agent_key: string; output: string } | null }>)
      : Promise.resolve({ data: null }),
    getPlatformStats(),
  ])
  const handoff = handoffRow.data
    ? { from: getAgent(handoffRow.data.agent_key)?.n ?? handoffRow.data.agent_key, text: handoffRow.data.output }
    : null

  const prompt = await userPrompt({
    task, details, stats, handoff, db,
    briefing: briefingRow?.content ?? '',
  })

  const { data: row, error: insertError } = await (db.from('agent_outputs') as any)
    .insert({
      agent_key: agent.id,
      area_key: agent.areaId,
      task: task.t,
      details: details || null,
      handoff_from: handoff ? handoffFromId : null,
      status: 'running',
      model: MODEL,
      run_by: userId,
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }
  if (insertError || !row) return Response.json({ error: 'Lauf konnte nicht angelegt werden' }, { status: 500 })
  const runId = row.id

  const client = new Anthropic()
  const tools = AGENT_TOOLS.map(t => ({ ...t, eager_input_streaming: true }))
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + '\n'))
      const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: prompt }]
      const toolLog: { name: string; input: unknown; error: boolean }[] = []
      let output = ''
      let inputTokens = 0
      let outputTokens = 0
      let jsonRetries = 0

      send({ type: 'start', id: runId })

      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const s = client.beta.messages.stream({
            model: MODEL,
            max_tokens: 16000,
            thinking: { type: 'adaptive' },
            output_config: { effort: 'medium' },
            system: systemPrompt(agent),
            tools,
            messages,
            // Server-side fallback if the model declines — routed by refusal category
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
          })
          s.on('text', delta => {
            output += delta
            send({ type: 'text', delta })
          })

          let message: Anthropic.Beta.BetaMessage
          try {
            message = await s.finalMessage()
            jsonRetries = 0
          } catch (err) {
            // Only an unparseable tool input is retried; API errors propagate
            if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err
            continue
          }
          inputTokens += message.usage.input_tokens
          outputTokens += message.usage.output_tokens

          if (message.stop_reason === 'refusal') {
            output += output ? '\n\n' : ''
            output += 'Diese Aufgabe wurde vom Modell abgelehnt.'
            break
          }
          if (message.stop_reason === 'pause_turn') {
            messages.push({ role: 'assistant', content: message.content })
            continue
          }

          const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use')
          if (toolUses.length === 0) break
          if (message.stop_reason === 'max_tokens') throw new Error('Tool-Eingabe abgeschnitten (max_tokens)')

          messages.push({ role: 'assistant', content: message.content })
          const results = await Promise.all(toolUses.map(async tu => {
            send({ type: 'tool', name: tu.name })
            const [content, isError] = await runAgentTool(tu.name, tu.input)
            toolLog.push({ name: tu.name, input: tu.input, error: isError })
            return { type: 'tool_result' as const, tool_use_id: tu.id, content, is_error: isError }
          }))
          // All results of a turn go back in one user message
          messages.push({ role: 'user', content: results })
        }

        output = output.trim()
        await (db.from('agent_outputs') as any).update({
          output, tool_calls: toolLog, status: 'done',
          input_tokens: inputTokens, output_tokens: outputTokens,
        }).eq('id', runId)
        send({ type: 'done', id: runId, output })
      } catch (err) {
        const message = err instanceof Anthropic.RateLimitError
          ? 'Zu viele Anfragen, bitte kurz warten.'
          : err instanceof Anthropic.APIError
            ? `API-Fehler ${err.status ?? ''}`.trim()
            : 'Der Mitarbeiter konnte nicht antworten.'
        await (db.from('agent_outputs') as any).update({
          output: output || null, tool_calls: toolLog, status: 'error',
          input_tokens: inputTokens, output_tokens: outputTokens,
        }).eq('id', runId)
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
