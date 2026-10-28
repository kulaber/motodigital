import { createClient } from '@/lib/supabase/server'

/**
 * Server-side superadmin check (profiles.role = 'superadmin').
 * Returns the user id for admins, null for everyone else — callers answer
 * with notFound() / 404 so the admin area does not reveal that it exists.
 */
export async function getSuperadminId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  return profile?.role === 'superadmin' ? user.id : null
}
