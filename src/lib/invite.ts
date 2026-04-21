import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export function createInviteToken(profileId: string) {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 Tage
  const token = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(`invite:${profileId}:${expires}`)
    .digest('hex')
  return { token, expires }
}

export function verifyInviteToken(profileId: string, token: string, expires: number): boolean {
  if (Date.now() > expires) return false
  const expected = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(`invite:${profileId}:${expires}`)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function sendInvitationEmail(email: string, profileId: string, werkstattName: string) {
  const { token, expires } = createInviteToken(profileId)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://motodigital.io'
  const inviteUrl = `${baseUrl}/auth/accept-invite?pid=${encodeURIComponent(profileId)}&t=${token}&exp=${expires}`

  await resend.emails.send({
    from: 'MotoDigital <noreply@motodigital.de>',
    to: email,
    subject: `${werkstattName} — Dein Werkstatt-Profil auf MotoDigital`,
    text: `Hallo!\n\nDein Werkstatt-Profil "${werkstattName}" auf MotoDigital ist bereit.\nKlicke auf den Link, um dein Konto einzurichten:\n\n${inviteUrl}\n\nDer Link ist 7 Tage gültig.\n\nViele Grüße,\nDein MotoDigital Team`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #222222; font-size: 20px; margin-bottom: 8px;">Dein Werkstatt-Profil ist bereit</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Dein Profil <strong>${werkstattName}</strong> wurde auf MotoDigital angelegt.
          Richte jetzt dein Konto ein, um dein Profil zu verwalten.
        </p>
        <a href="${inviteUrl}"
           style="display: inline-block; background: #06a5a5; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 999px; text-decoration: none;">
          Konto einrichten
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px; line-height: 1.5;">
          Der Link ist 7 Tage gültig.<br/>
          Wenn du diese E-Mail nicht erwartet hast, kannst du sie ignorieren.
        </p>
      </div>
    `,
  })
}
