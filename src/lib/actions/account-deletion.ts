'use server'

import crypto from 'crypto'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestAccountDeletion(password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Nicht angemeldet' }

  // Verify password
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })
  if (signInErr) return { error: 'Passwort ist falsch' }

  // Create HMAC token (24h expiry)
  const expires = Date.now() + 24 * 60 * 60 * 1000
  const payload = `delete:${user.id}:${expires}`
  const token = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(payload)
    .digest('hex')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://motodigital.de'
  const confirmUrl = `${baseUrl}/api/account/confirm-deletion?uid=${encodeURIComponent(user.id)}&t=${token}&exp=${expires}`

  const { error: emailError } = await resend.emails.send({
    from: 'MotoDigital <noreply@motodigital.de>',
    to: user.email,
    subject: 'Account-Löschung bestätigen',
    text: `Du hast die Löschung deines MotoDigital-Accounts angefordert.\n\nKlicke auf diesen Link, um die Löschung zu bestätigen:\n${confirmUrl}\n\nDer Link ist 24 Stunden gültig.\n\nWenn du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #222222; font-size: 20px; margin-bottom: 8px;">Account-Löschung bestätigen</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Du hast die Löschung deines MotoDigital-Accounts angefordert.
          Diese Aktion ist <strong>endgültig</strong> — alle deine Daten, Bikes, Nachrichten und Medien werden unwiderruflich gelöscht.
        </p>
        <a href="${confirmUrl}"
           style="display: inline-block; background: #dc2626; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 999px; text-decoration: none;">
          Account endgültig löschen
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px; line-height: 1.5;">
          Der Link ist 24 Stunden gültig.<br/>
          Wenn du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail einfach.
        </p>
      </div>
    `,
  })

  if (emailError) {
    console.error('[Account Deletion] Resend error:', emailError)
    return { error: 'E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.' }
  }

  return { success: true }
}
