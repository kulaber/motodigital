'use server'

import { z } from 'zod'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const contactSchema = z.object({
  name:    z.string().min(2, 'Bitte gib deinen Namen ein.').max(100),
  email:   z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
  subject: z.string().min(3, 'Bitte gib einen Betreff ein.').max(200),
  message: z.string().min(10, 'Deine Nachricht sollte mindestens 10 Zeichen haben.').max(5000),
})

export async function submitContactForm(formData: FormData) {
  const raw = {
    name:    formData.get('name'),
    email:   formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  }

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, email, subject, message } = parsed.data

  // Save to DB and send email in parallel
  const supabase = await createClient()

  const [dbResult, emailResult] = await Promise.all([
    supabase
      .from('contact_submissions' as never)
      .insert(parsed.data as never),
    resend.emails.send({
      from: 'MotoDigital Support <noreply@motodigital.de>',
      to: 'info@motodigital.de',
      replyTo: email,
      subject: `Kontaktformular: ${subject}`,
      text: `Neue Nachricht über das Kontaktformular:\n\nName: ${name}\nE-Mail: ${email}\nBetreff: ${subject}\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #2AABAB;">Neue Kontaktanfrage</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">E-Mail</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Betreff</td><td style="padding: 8px 0;">${subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
      `,
    }),
  ])

  if (dbResult.error && emailResult.error) {
    return { error: { _form: ['Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'] } }
  }

  return { success: true }
}
