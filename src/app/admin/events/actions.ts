'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function requireSuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  if (profile?.role !== 'superadmin') redirect('/dashboard')
  return { supabase, user }
}

export async function saveEvent(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name ist erforderlich' }

  const slug = (formData.get('slug') as string)?.trim()
    || name.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/(^-|-$)/g, '')
  const dateStart = (formData.get('date_start') as string) || null
  const dateEnd = (formData.get('date_end') as string) || null
  const location = (formData.get('location') as string)?.trim() ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const tagsRaw = (formData.get('tags') as string)?.trim() ?? ''
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
  const url = (formData.get('url') as string)?.trim() || null
  const image = (formData.get('image') as string)?.trim() || null

  const payload = {
    slug,
    name,
    date_start: dateStart,
    date_end: dateEnd,
    location,
    description,
    tags,
    url,
    image,
  }

  if (id) {
    const { error } = await (supabase.from('events') as any)
      .update(payload)
      .eq('id', id)

    if (error) return { error: error.message }
  } else {
    const { error } = await (supabase.from('events') as any)
      .insert(payload)

    if (error) return { error: error.message }
  }

  redirect('/admin/events')
}

export async function uploadEventImage(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Keine Datei ausgewählt' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
  const path = `${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('event-images')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from('event-images')
    .getPublicUrl(path)

  return { url: publicUrl }
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireSuperadmin()

  const { error } = await (supabase.from('events') as any)
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  redirect('/admin/events')
}
