// Builds the prompt for an agent run — mirrors context()/team()/run() from
// docs/prototypes/agent-control.html, but with live numbers from Supabase.

import { BASE, allAgents, type ResolvedAgent } from './definitions'
import type { PlatformStats } from './tools'

/** Any Supabase client (session client with RLS, or service role for scheduled runs) */
export type AgentDb = { from: (table: string) => any }

/** What an agent works on: a predefined task chip or a free-text order step */
export interface RunTask {
  label: string
  prompt: string
  /** Include the latest results of the departments (Chief of Staff) */
  team?: boolean
  words?: number
}

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
 * Date, numbers, briefing and word limit go into the user turn instead.
 */
export function systemPrompt(agent: ResolvedAgent): string {
  return [
    BASE,
    '',
    `Du bist ${agent.n} (${agent.r}) in der Abteilung ${agent.areaName} bei MotoDigital. Deine Verantwortung: ${agent.job} Deine Kennzahl: ${agent.kpi}.`,
    'Arbeite wie ein erfahrener Mitarbeiter: Liefere ein fertiges, direkt nutzbares Arbeitsergebnis statt allgemeiner Ratschläge. Fehlt dir eine Information, triff eine klar gekennzeichnete Annahme oder setze einen Platzhalter in eckigen Klammern. Schließe mit einer Zeile „Nächster Schritt:“. Nichts wird ohne Freigabe des Gründers veröffentlicht oder versendet. Kein Vorwort.',
    'Du hast Daten-Tools für motodigital.io. Nutze sie, wenn die Aufgabe echte Zahlen, Werkstätten, Profile, Anfragen, Bikes oder Magazin-Artikel braucht, und nur dann. Kontaktdaten von Personen bekommst du bewusst nicht.',
    ...(agent.tools?.includes('save_article_draft')
      ? ['Mit save_article_draft speicherst du Magazin-Artikel als Entwurf. Veröffentlichen kannst du nicht; das macht der Gründer nach Prüfung.']
      : ['Du kannst nichts verändern, speichern oder versenden.']),
  ].join('\n')
}

/** Latest result per department agent (optionally only within one team order) */
async function teamResults(db: AgentDb, orderId?: string | null): Promise<string> {
  let q = db.from('agent_outputs')
    .select('agent_key, task, output, created_at')
    .eq('status', 'done')
    .neq('agent_key', 'cos')
    .order('created_at', { ascending: false })
    .limit(80)
  if (orderId) q = q.eq('order_id', orderId)
  const { data } = await q as { data: { agent_key: string; task: string; output: string; created_at: string }[] | null }

  const latest = new Map<string, NonNullable<typeof data>[number]>()
  for (const row of data ?? []) if (!latest.has(row.agent_key)) latest.set(row.agent_key, row)

  return allAgents()
    .filter(a => a.id !== 'cos' && latest.has(a.id))
    .map(a => {
      const it = latest.get(a.id)!
      return `- ${a.n} (${a.areaName}), ${it.task}, ${new Date(it.created_at).toLocaleDateString('de-DE')}:\n${it.output.slice(0, 900)}`
    })
    .join('\n\n')
}

interface PromptInput {
  task: RunTask
  details: string
  stats: PlatformStats
  briefing: string
  handoff: { from: string; text: string } | null
  orderId?: string | null
  db: AgentDb
}

export async function userPrompt({ task, details, stats, briefing, handoff, orderId, db }: PromptInput): Promise<string> {
  const parts = [
    `Heute ist der ${new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}.`,
    `Aktuelle Zahlen (live aus der Datenbank): ${statsLines(stats)}.`,
  ]
  if (briefing.trim()) parts.push(`Briefing vom Gründer:\n${briefing.trim()}`)
  parts.push(`Aufgabe: ${task.prompt}\nHöchstens ${task.words ?? 220} Wörter.`)
  if (task.team) {
    const tm = await teamResults(db, orderId)
    parts.push(`${orderId ? 'Ergebnisse dieses Team-Auftrags' : 'Letzte Ergebnisse der Abteilungen'}:\n${tm || 'Noch keine Ergebnisse vorhanden. Sag das und schlage vor, welche Abteilungen zuerst arbeiten sollten.'}`)
  }
  if (details.trim()) parts.push(`Details vom Gründer:\n${details.trim()}`)
  if (handoff) parts.push(`Übergabe von deinem Kollegen ${handoff.from}:\n${handoff.text}`)
  return parts.join('\n\n')
}
