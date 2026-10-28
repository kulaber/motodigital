import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSuperadminId } from '@/lib/auth/requireSuperadmin'
import { MAGAZINE_TAG } from '@/lib/magazine/articles'

const Body = z.object({ action: z.enum(['publish', 'reject']) })

/** The founder's approval: publish (goes live immediately) or reject an article draft */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSuperadminId()
  if (!userId) return new Response('Not Found', { status: 404 })

  const { id } = await params
  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !z.string().uuid().safeParse(id).success) return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 })

  const db = await createClient()
  const now = new Date().toISOString()
  const patch = parsed.data.action === 'publish'
    ? { status: 'published', approved_by: userId, published_at: now, updated_at: now }
    : { status: 'rejected', updated_at: now }

  const { data, error } = await (db.from('magazine_articles') as any)
    .update(patch).eq('id', id).eq('status', 'draft')
    .select('id, slug, status').maybeSingle() as { data: { id: string; slug: string; status: string } | null; error: unknown }
  if (error) return Response.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  if (!data) return Response.json({ error: 'Entwurf nicht gefunden oder schon bearbeitet' }, { status: 409 })

  if (data.status === 'published') {
    revalidateTag(MAGAZINE_TAG)
    revalidatePath('/[locale]/magazine', 'layout')
    revalidatePath('/sitemap.xml')
  }
  return Response.json({ article: data, url: data.status === 'published' ? `/magazine/${data.slug}` : null })
}
