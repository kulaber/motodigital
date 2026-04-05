'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { verifyInviteToken, sendInvitationEmail } from '@/lib/invite'

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** Accept invite: set password + optional location, then auto-login. */
export async function acceptInvite(data: {
  pid: string
  token: string
  exp: string
  password: string
  address?: string
  lat?: number | null
  lng?: number | null
}) {
  const expires = parseInt(data.exp)
  if (!verifyInviteToken(data.pid, data.token, expires)) {
    return { error: 'Ungültiger oder abgelaufener Link. Bitte fordere eine neue Einladung an.' }
  }

  if (data.password.length < 8) {
    return { error: 'Passwort muss mindestens 8 Zeichen haben.' }
  }

  const admin = getAdmin()

  // Get user email
  const { data: { user } } = await admin.auth.admin.getUserById(data.pid)
  if (!user?.email) return { error: 'Account nicht gefunden.' }

  // Already set up?
  if (user.last_sign_in_at) {
    return { error: 'Dein Account wurde bereits eingerichtet.' }
  }

  // Set password
  const { error: pwError } = await admin.auth.admin.updateUserById(data.pid, {
    password: data.password,
  })
  if (pwError) return { error: pwError.message }

  // Update location if provided
  if (data.address) {
    await admin.from('profiles').update({
      address: data.address,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
    }).eq('id', data.pid)
  }

  // Auto-login (sets session cookies + last_sign_in_at)
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.password,
  })
  if (signInError) return { error: signInError.message }

  return { success: true }
}

/** Resend invitation email — superadmin only. */
export async function resendInvitation(profileId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { data: me } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (me?.role !== 'superadmin') return { error: 'Keine Berechtigung' }

  const admin = getAdmin()

  const { data: { user: target } } = await admin.auth.admin.getUserById(profileId)
  if (!target?.email) return { error: 'Kein Nutzer gefunden' }

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, username')
    .eq('id', profileId)
    .maybeSingle()

  const name = (profile as { full_name: string | null; username: string | null } | null)?.full_name
    ?? (profile as { full_name: string | null; username: string | null } | null)?.username
    ?? 'Werkstatt'

  try {
    await sendInvitationEmail(target.email, profileId, name)
    return { success: true }
  } catch (err) {
    console.error('[Resend Invitation]', err)
    return { error: 'E-Mail konnte nicht gesendet werden.' }
  }
}
