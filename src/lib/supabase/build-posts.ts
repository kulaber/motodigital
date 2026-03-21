import { createClient } from '@/lib/supabase/client'

export type BuildPost = {
  id: string
  bike_id: string
  user_id: string
  title: string
  body: string | null
  media_urls: string[]
  created_at: string
  build_post_parts: BuildPostPart[]
}

export type BuildPostPart = {
  id: string
  post_id: string
  name: string
  price: number | null
}

const supabase = () => createClient()

export async function fetchBuildPosts(bikeId: string): Promise<BuildPost[]> {
  const client = supabase() as any
  const { data, error } = await client
    .from('build_posts')
    .select('*, build_post_parts(*)')
    .eq('bike_id', bikeId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as BuildPost[]
}

export async function createBuildPost(
  bikeId: string,
  userId: string,
  title: string,
  body: string | null,
  files: File[],
  parts: { name: string; price: number | null }[]
): Promise<BuildPost> {
  const client = supabase()

  // 1. Upload files to Supabase Storage
  const mediaUrls: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${bikeId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await client.storage
      .from('build-media')
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data: urlData } = client.storage
      .from('build-media')
      .getPublicUrl(path)
    mediaUrls.push(urlData.publicUrl)
  }

  // 2. Insert post
  const clientAny = client as any
  const { data: post, error: postError } = await clientAny
    .from('build_posts')
    .insert({
      bike_id: bikeId,
      user_id: userId,
      title,
      body: body || null,
      media_urls: mediaUrls,
    })
    .select()
    .maybeSingle()

  if (postError || !post) throw postError ?? new Error('Failed to create post')

  // 3. Insert parts
  let insertedParts: BuildPostPart[] = []
  if (parts.length > 0) {
    const { data: partsData, error: partsError } = await clientAny
      .from('build_post_parts')
      .insert(parts.map((p: { name: string; price: number | null }) => ({
        post_id: post.id,
        name: p.name,
        price: p.price,
      })))
      .select()

    if (partsError) throw partsError
    insertedParts = (partsData ?? []) as BuildPostPart[]
  }

  return { ...post, build_post_parts: insertedParts } as BuildPost
}
