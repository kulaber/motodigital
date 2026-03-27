'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

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

  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_submissions' as never)
    .insert(parsed.data as never)

  if (error) {
    return { error: { _form: ['Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'] } }
  }

  return { success: true }
}
