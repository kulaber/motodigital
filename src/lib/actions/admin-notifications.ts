'use server'

import { Resend } from 'resend'
import { createClient as createAdmin } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifyNewRegistration(data: { name: string; email: string; role: string }) {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Find all superadmin emails
    const { data: superadmins } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'superadmin')

    if (!superadmins?.length) return

    const emails: string[] = []
    for (const sa of superadmins) {
      const { data: { user } } = await admin.auth.admin.getUserById(sa.id)
      if (user?.email) emails.push(user.email)
    }

    if (!emails.length) return

    const roleLabel = data.role === 'custom-werkstatt' ? 'Custom Werkstatt' : 'Rider'
    const time = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' })

    await resend.emails.send({
      from: 'MotoDigital <noreply@motodigital.de>',
      to: emails,
      subject: `Neue Registrierung: ${roleLabel} — ${data.name}`,
      text: `Neue Registrierung auf MotoDigital:\n\nName: ${data.name}\nE-Mail: ${data.email}\nRolle: ${roleLabel}\nZeitpunkt: ${time}`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
          <h2 style="color: #222222; font-size: 18px; margin-bottom: 16px;">Neue Registrierung</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 13px; width: 90px;">Name</td>
              <td style="padding: 10px 0; font-size: 14px; color: #222;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 13px;">E-Mail</td>
              <td style="padding: 10px 0; font-size: 14px; color: #222;"><a href="mailto:${data.email}" style="color: #06a5a5;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 13px;">Rolle</td>
              <td style="padding: 10px 0; font-size: 14px; color: #222;">
                <span style="display: inline-block; background: ${data.role === 'custom-werkstatt' ? '#06a5a5' : '#222'}; color: #fff; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px;">
                  ${roleLabel}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #999; font-size: 13px;">Zeitpunkt</td>
              <td style="padding: 10px 0; font-size: 14px; color: #222;">${time}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #bbb; font-size: 11px;">Diese E-Mail wurde automatisch von MotoDigital gesendet.</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Admin Notification] Error:', err)
  }
}
