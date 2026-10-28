// Builds the prompt for an agent run — mirrors context()/team()/run() from
// docs/prototypes/agent-control.html, but with live numbers from Supabase.

import type { createClient } from '@/lib/supabase/server'
import { BASE, allAgents, type ResolvedAgent, type AgentTask } from './definitions'
import type { PlatformStats } from './tools'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const fmt = (n: number) => n.toLocaleString('de-DE')

export function statsLines(s: PlatformStats): string {
  return [
    `Founding Members: ${fmt(s.foundingMembers)} von ${s.foundingLimit}${s.foundingPending ? ` (plus ${fmt(s.foundingPending)} angemeldet, E-Mail noch unbestätigt)` : ''}`,
    `Werkstätten gelistet: ${fmt(s.workshops)}`,
    `Rider registriert: ${fmt(s.riders)}`,
    `Bikes aktiv: ${fmt(s.bikesActive)}`,
    `Seitenaufrufe (30 Tage): ${fmt(s.pageViews30d)}`,
    `Neuanmeldungen (30 Tage): ${fmt(s.newSignups30d)}`,
    `Kontaktanfragen (30 Tage): ${fmt(s.contactRequests30d)}`,
  ].join('; ')
}

/**
 * Stable system prompt (cache-friendly: no per-request values).
 * Date, numbers and briefing go into the user turn instead.
 */
export function systemPrompt(agent: ResolvedAgent): string {
  return [
    BASE,
    '',
    `Du bist ${agent.n} (${agent.r}) in der Abteilung ${agent.areaName} bei MotoDigital. Deine Verantwortung: ${agent.job} Deine Kennzahl: ${agent.kpi}.`,
    'Arbeite wie ein erfahrener Mitarbeiter: Liefere ein fertiges, direkt nutzbares Arbeitsergebnis statt allgemeiner Ratschläge. Fehlt dir eine Information, triff eine klar gekennzeichnete Annahme oder setze einen Platzhalter in eckigen Klammern. Schließe mit einer Zeile „Nächster Schritt:“. Nichts wird ohne Freigabe des Gründers veröffentlicht oder versendet. Höchstens 220 Wörter, kein Vorwort.',
    'Du hast lesende Daten-Tools für motodigital.io. Nutze sie, wenn die Aufgabe echte Zahlen, Werkstätten, Profile, Anfragen oder Bikes braucht, und nur dann. Du kannst nichts verändern oder versenden. Kontaktdaten von Personen bekommst du bewusst nicht.',
  ].join('\n')
}

interface PromptInput {
  task: AgentTask
  details: string
  stats: PlatformStats
  briefing: string
  handoff: { from: string; text: string } | null
  db: SupabaseClient
}

/** Latest result per department agent — for the Chief of Staff weekly report */
async function teamResults(db: SupabaseClient): Promise<string> {
  const { data } = await (db.from('agent_outputs') as any)
    .select('agent_key, task, output, created_at')
    .eq('status', 'done')
    .neq('agent_key', 'cos')
    .order('created_at', { ascending: false })
    .limit(80) as { data: { agent_key: string; task: string; output: string; created_at: string }[] | null }

  const latest = new Map<string, NonNullable<typeof data>[number]>()
  for (const row of data ?? []) if (!latest.has(row.agent_key)) latest.set(row.agent_key, row)

  return allAgents()
    .filter(a => a.id !== 'cos' && latest.has(a.id))
    .map(a => {
      const it = latest.get(a.id)!
      return `- ${a.n} (${a.areaName}), ${it.task}, ${new Date(it.created_at).toLocaleDateString('de-DE')}:\n${it.output.slice(0, 700)}`
    })
    .join('\n\n')
}

export async function userPrompt({ task, details, stats, briefing, handoff, db }: PromptInput): Promise<string> {
  const parts = [
    `Heute ist der ${new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}.`,
    `Aktuelle Zahlen (live aus der Datenbank): ${statsLines(stats)}.`,
  ]
  if (briefing.trim()) parts.push(`Briefing vom Gründer:\n${briefing.trim()}`)
  parts.push(`Aufgabe: ${task.p}`)
  if (task.ab) {
    const tm = await teamResults(db)
    parts.push(`Letzte Ergebnisse der Abteilungen:\n${tm || 'Noch keine Ergebnisse vorhanden. Sag das und schlage vor, welche Abteilungen zuerst arbeiten sollten.'}`)
  }
  if (details.trim()) parts.push(`Details vom Gründer:\n${details.trim()}`)
  if (handoff) parts.push(`Übergabe von deinem Kollegen ${handoff.from}:\n${handoff.text}`)
  return parts.join('\n\n')
}
