// One agent run: build context → Claude with tools (manual streaming loop)
// → store the result in agent_outputs. Shared by the click-to-run API route
// and the scheduled (weekly) team orders.

import Anthropic from '@anthropic-ai/sdk'
import { DEFAULT_MODEL, getAgent, type ResolvedAgent } from './definitions'
import { getPlatformStats, runAgentTool, toolsForAgent } from './tools'
import { systemPrompt, userPrompt, type AgentDb, type RunTask } from './context'

const MAX_TURNS = 8

export type RunEvent =
  | { type: 'start'; id: string }
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string }
  | { type: 'done'; id: string; output: string }
  | { type: 'error'; message: string }

export interface RunParams {
  /** Client for agent_* tables: session client (RLS) for clicks, service role for schedules */
  db: AgentDb
  agent: ResolvedAgent
  task: RunTask
  details?: string
  handoffFromId?: string | null
  orderId?: string | null
  source: 'manual' | 'order' | 'schedule'
  runBy: string
  onEvent?: (e: RunEvent) => void
}

export interface RunResult {
  id: string | null
  output: string
  ok: boolean
  error?: string
}

export async function runAgent(p: RunParams): Promise<RunResult> {
  const emit = p.onEvent ?? (() => {})
  const { db, agent, task } = p
  const model = agent.model ?? DEFAULT_MODEL
  const granted = agent.tools ?? []

  const [{ data: briefingRow }, handoffRow, stats] = await Promise.all([
    db.from('agent_briefing').select('content').eq('scope', 'global').maybeSingle() as Promise<{ data: { content: string } | null }>,
    p.handoffFromId
      ? (db.from('agent_outputs').select('agent_key, output').eq('id', p.handoffFromId).eq('status', 'done').maybeSingle() as Promise<{ data: { agent_key: string; output: string } | null }>)
      : Promise.resolve({ data: null }),
    getPlatformStats(),
  ])
  const handoff = handoffRow.data
    ? { from: getAgent(handoffRow.data.agent_key)?.n ?? handoffRow.data.agent_key, text: handoffRow.data.output }
    : null

  const prompt = await userPrompt({
    task, stats, handoff, db,
    details: p.details ?? '',
    briefing: briefingRow?.content ?? '',
    orderId: p.orderId,
  })

  const { data: row, error: insertError } = await db.from('agent_outputs')
    .insert({
      agent_key: agent.id,
      area_key: agent.areaId,
      task: task.label,
      details: p.details || null,
      handoff_from: handoff ? p.handoffFromId : null,
      order_id: p.orderId ?? null,
      source: p.source,
      status: 'running',
      model,
      run_by: p.runBy,
    })
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }
  if (insertError || !row) {
    emit({ type: 'error', message: 'Lauf konnte nicht angelegt werden' })
    return { id: null, output: '', ok: false, error: 'insert failed' }
  }
  const runId = row.id
  emit({ type: 'start', id: runId })

  const client = new Anthropic()
  const tools = toolsForAgent(granted).map(t => ({ ...t, eager_input_streaming: true }))
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: prompt }]
  const toolLog: { name: string; input: unknown; error: boolean }[] = []
  let output = ''
  let inputTokens = 0
  let outputTokens = 0
  let jsonRetries = 0

  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const s = client.beta.messages.stream({
        model,
        max_tokens: 32000,
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
        emit({ type: 'text', delta })
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
        output += (output ? '\n\n' : '') + 'Diese Aufgabe wurde vom Modell abgelehnt.'
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
        emit({ type: 'tool', name: tu.name })
        const [content, isError] = await runAgentTool(tu.name, tu.input, { agentId: agent.id, outputId: runId }, granted)
        toolLog.push({ name: tu.name, input: tu.name === 'save_article_draft' ? { title: (tu.input as { title?: string })?.title } : tu.input, error: isError })
        return { type: 'tool_result' as const, tool_use_id: tu.id, content, is_error: isError }
      }))
      // All results of a turn go back in one user message
      messages.push({ role: 'user', content: results })
    }

    output = output.trim()
    await db.from('agent_outputs').update({
      output, tool_calls: toolLog, status: 'done',
      input_tokens: inputTokens, output_tokens: outputTokens,
    }).eq('id', runId)
    emit({ type: 'done', id: runId, output })
    return { id: runId, output, ok: true }
  } catch (err) {
    const message = err instanceof Anthropic.RateLimitError
      ? 'Zu viele Anfragen, bitte kurz warten.'
      : err instanceof Anthropic.APIError
        ? `API-Fehler ${err.status ?? ''}`.trim()
        : 'Der Mitarbeiter konnte nicht antworten.'
    await db.from('agent_outputs').update({
      output: output || null, tool_calls: toolLog, status: 'error',
      input_tokens: inputTokens, output_tokens: outputTokens,
    }).eq('id', runId)
    emit({ type: 'error', message })
    return { id: runId, output, ok: false, error: message }
  }
}

/** Task for one step of a team order (free text from the plan) */
export function orderStepTask(agent: ResolvedAgent, instruction: string): RunTask {
  return {
    label: 'Team-Auftrag',
    prompt: instruction,
    words: agent.tools?.includes('save_article_draft') ? 1500 : 350,
  }
}

/** Final Chief of Staff summary of a team order */
export const ORDER_SUMMARY_TASK: RunTask = {
  label: 'Zusammenfassung Team-Auftrag',
  prompt: 'Fasse die Ergebnisse dieses Team-Auftrags für den Gründer zusammen: was erledigt ist, was er freigeben muss (z. B. Artikel-Entwürfe unter „Freigaben“ im Café), was offen ist und die nächsten Schritte mit Zuständigkeit.',
  team: true,
  words: 300,
}
