import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'
import { getPlatformStats } from '@/lib/agents/tools'
import AgentControlLoader from './AgentControlLoader'
import type { AblageItem, ArticleDraft, TeamOrder } from './AgentControl'

// Title only for admins — static metadata would leak into the 404 response
export async function generateMetadata(): Promise<Metadata> {
  return (await getSuperadminId())
    ? { title: 'Agent Control', robots: { index: false, follow: false } }
    : {}
}

export const dynamic = 'force-dynamic'

export default async function AgentControlPage() {
  // The admin layout already 404s non-admins; checked again so the page is safe on its own
  if (!(await getSuperadminId())) notFound()

  const db = await createClient()
  const [stats, { data: briefingRow }, { data: outputs }, { data: drafts }, { data: orders }] = await Promise.all([
    getPlatformStats(),
    (db.from('agent_briefing') as any).select('content').eq('scope', 'global').maybeSingle() as Promise<{ data: { content: string } | null }>,
    (db.from('agent_outputs') as any)
      .select('id, agent_key, task, output, created_at')
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(300) as Promise<{ data: { id: string; agent_key: string; task: string; output: string; created_at: string }[] | null }>,
    (db.from('magazine_articles') as any)
      .select('id, slug, title, excerpt, category, content, faq, meta_title, meta_description, cover_image, read_time, created_by_agent, created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(30) as Promise<{ data: ArticleDraft[] | null }>,
    (db.from('agent_orders') as any)
      .select('id, instruction, summary, plan, recurrence, status, active, next_run_at, last_run_at, created_at')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(30) as Promise<{ data: TeamOrder[] | null }>,
  ])

  // Ablage: latest 12 results per agent
  const ablage: Record<string, AblageItem[]> = {}
  for (const o of outputs ?? []) {
    const list = (ablage[o.agent_key] ??= [])
    if (list.length < 12) list.push({ id: o.id, task: o.task, text: o.output, at: o.created_at })
  }

  return (
    <AgentControlLoader
      stats={stats}
      briefing={briefingRow?.content ?? ''}
      ablage={ablage}
      drafts={drafts ?? []}
      orders={orders ?? []}
    />
  )
}
