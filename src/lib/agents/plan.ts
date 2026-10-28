// Chief of Staff turns a free-text order into a step plan (structured output).
// The plan is only stored — nothing runs until the founder approves it.

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { BASE, COS, allAgents } from './definitions'

const staff = allAgents().filter(a => a.id !== COS.id)
const STAFF_IDS = staff.map(a => a.id) as [string, ...string[]]

const PlanSchema = z.object({
  summary: z.string().describe('Ein Satz: was das Team erreichen soll'),
  steps: z.array(z.object({
    agent_id: z.enum(STAFF_IDS),
    instruction: z.string().describe('Konkrete Arbeitsanweisung für diesen Mitarbeiter, 1–3 Sätze'),
  })).min(1).max(6),
})

export type OrderPlan = z.infer<typeof PlanSchema>

const roster = staff.map(a => {
  const extra = a.tools?.includes('save_article_draft')
    ? ' Kann Magazin-Artikel komplett schreiben und als Entwurf speichern (Veröffentlichung nur nach Freigabe des Gründers).'
    : a.id === 'dev' ? ' Schreibt Tickets für Website-Änderungen; ändert selbst nichts am Code.' : ''
  return `- ${a.id}: ${a.n} (${a.areaName}) — ${a.job}${extra}`
}).join('\n')

export async function createPlan(instruction: string, briefing: string): Promise<OrderPlan> {
  const client = new Anthropic()
  const response = await client.messages.parse({
    model: COS.model!,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: zodOutputFormat(PlanSchema) },
    system: [
      BASE,
      '',
      'Du bist der Chief of Staff von MotoDigital. Der Gründer gibt dir einen Auftrag für das Team. Zerlege ihn in so wenige Schritte wie nötig (höchstens 6) und weise jeden Schritt genau einem Mitarbeiter zu. Die Schritte laufen nacheinander; jeder Mitarbeiter bekommt nur das Ergebnis des direkt vorherigen Schritts als Übergabe. Beziehe nur Mitarbeiter ein, die wirklich etwas beitragen — jeder Schritt kostet Zeit und Geld.',
      'Reihenfolge: Zulieferung vor Verwendung. Wer ein Ergebnis braucht, kommt nach dem, der es liefert. Ein Artikel wird beim Speichern endgültig als Entwurf abgelegt — alles, was hinein soll, muss vorher feststehen. Die Redaktion findet passende Werkstätten und bestehende Artikel selbst über ihre Daten-Tools und braucht dafür keinen Vorschritt.',
      'Wiederkehrende Routine-Aufträge (z. B. jede Woche ein Beitrag) plane schlank mit höchstens 3 Schritten. Prüfschritte (Recht, Qualität) nur, wenn der Auftrag sie verlangt oder ein echtes Risiko besteht.',
      'Niemand im Team veröffentlicht oder versendet etwas selbst. Artikel landen als Entwurf, Nachrichten und Posts als Text in der Ablage, Website-Änderungen als Ticket.',
      '',
      'Team:',
      roster,
    ].join('\n'),
    messages: [{
      role: 'user',
      content: `${briefing.trim() ? `Briefing:\n${briefing.trim()}\n\n` : ''}Auftrag des Gründers:\n${instruction}`,
    }],
  })
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error('Der Chief of Staff konnte keinen Plan erstellen.')
  }
  return response.parsed_output
}
