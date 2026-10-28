import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'
import { getPlatformStats } from '@/lib/agents/tools'
import AgentControlLoader from './AgentControlLoader'
import type { AblageItem } from './AgentControl'

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
  const [stats, { data: briefingRow }, { data: outputs }] = await Promise.all([
    getPlatformStats(),
    (db.from('agent_briefing') as any).select('content').eq('scope', 'global').maybeSingle() as Promise<{ data: { content: string } | null }>,
    (db.from('agent_outputs') as any)
      .select('id, agent_key, task, output, created_at')
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(300) as Promise<{ data: { id: string; agent_key: string; task: string; output: string; created_at: string }[] | null }>,
  ])

  // Ablage: latest 12 results per agent
  const ablage: Record<string, AblageItem[]> = {}
  for (const o of outputs ?? []) {
    const list = (ablage[o.agent_key] ??= [])
    if (list.length < 12) list.push({ id: o.id, task: o.task, text: o.output, at: o.created_at })
  }

  return <AgentControlLoader stats={stats} briefing={briefingRow?.content ?? ''} ablage={ablage} />
}
