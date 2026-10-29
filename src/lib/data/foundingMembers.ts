import { createPublicClient } from '@/lib/supabase/public'

/**
 * Founding members = founding_partner workshops owned by a claimed account
 * with a confirmed email. Seeded, unclaimed workshop profiles also carry the
 * founding_partner default, so a plain tier count would overstate it — the
 * database function filters them out without exposing auth data.
 */
export async function getFoundingMemberCount(): Promise<number> {
  const { data } = await (createPublicClient() as any)
    .rpc('founding_member_count', {}, { get: true })
    .throwOnError()
  return (data as number | null) ?? 0
}
