'use server'

import { createClient } from '@/lib/supabase/server'

// ── Result types (exported for UI components) ──

export interface BikeResult {
  id: string
  title: string
  slug: string
  make: string
  model: string
  year: number
  style: string
  city: string | null
  cover_url: string | null
  price: number
  price_on_request: boolean
  owner_name: string
  owner_slug: string
  owner_type: 'rider' | 'workshop'
}

export interface WorkshopResult {
  id: string
  name: string
  slug: string
  city: string | null
  logo_url: string | null
  services: string[]
  bike_count: number
}

export interface RiderResult {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  riding_style: string | null
  city: string | null
  bike_count: number
  follower_count: number
}

export interface SearchResults {
  bikes: BikeResult[]
  workshops: WorkshopResult[]
  riders: RiderResult[]
}

// ── Internal row types for Supabase query results ──

interface BikeRow {
  id: string
  title: string
  slug: string | null
  make: string
  model: string
  year: number
  style: string
  city: string | null
  price: number
  price_on_request: boolean
  bike_images: { url: string; is_cover: boolean; position: number }[]
  profiles: { username: string; full_name: string | null; slug: string | null } | null
  workshops: { name: string; slug: string } | null
}

interface WorkshopRow {
  id: string
  name: string
  slug: string
  city: string | null
  logo_url: string | null
  services: string[]
  bikes: { count: number }[]
}

interface RiderRow {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  riding_style: string | null
  city: string | null
  bikes: { count: number }[]
  followers: { count: number }[]
}

type Tab = 'all' | 'bikes' | 'workshops' | 'riders'

export async function searchAll(
  query: string,
  tab: Tab = 'all',
): Promise<SearchResults> {
  const q = query.trim()
  if (!q || q.length < 2) {
    return { bikes: [], workshops: [], riders: [] }
  }

  const supabase = await createClient()
  const pattern = `%${q}%`
  const results: SearchResults = { bikes: [], workshops: [], riders: [] }

  // ── BIKES ──
  if (tab === 'all' || tab === 'bikes') {
    const { data } = await (supabase.from('bikes') as ReturnType<typeof supabase.from>)
      .select(`
        id, title, slug, make, model, year, style, city,
        price, price_on_request,
        bike_images(url, is_cover, position),
        profiles!bikes_seller_id_fkey(username, full_name, slug),
        workshops(name, slug)
      `)
      .eq('status', 'active')
      .or(`title.ilike.${pattern},make.ilike.${pattern},model.ilike.${pattern},city.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(tab === 'bikes' ? 20 : 5)

    const bikes = (data ?? []) as unknown as BikeRow[]
    results.bikes = bikes.map((b) => {
      const imgs = b.bike_images ?? []
      const cover =
        imgs.find((i) => i.is_cover)?.url ??
        imgs.sort((a, z) => a.position - z.position)[0]?.url ??
        null
      return {
        id: b.id,
        title: b.title,
        slug: b.slug ?? b.id,
        make: b.make,
        model: b.model,
        year: b.year,
        style: b.style,
        city: b.city,
        cover_url: cover,
        price: b.price,
        price_on_request: b.price_on_request,
        owner_name: b.workshops?.name ?? b.profiles?.full_name ?? b.profiles?.username ?? '',
        owner_slug: b.workshops?.slug ?? b.profiles?.slug ?? b.profiles?.username ?? '',
        owner_type: b.workshops ? ('workshop' as const) : ('rider' as const),
      }
    })
  }

  // ── WORKSHOPS ──
  if (tab === 'all' || tab === 'workshops') {
    const { data } = await (supabase.from('workshops') as ReturnType<typeof supabase.from>)
      .select(`
        id, name, slug, city, logo_url, services,
        bikes(count)
      `)
      .or(`name.ilike.${pattern},city.ilike.${pattern},description.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(tab === 'workshops' ? 20 : 5)

    const workshops = (data ?? []) as unknown as WorkshopRow[]
    results.workshops = workshops.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      city: w.city,
      logo_url: w.logo_url,
      services: w.services ?? [],
      bike_count: w.bikes?.[0]?.count ?? 0,
    }))
  }

  // ── RIDER ──
  if (tab === 'all' || tab === 'riders') {
    const { data } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
      .select(`
        id, username, full_name, avatar_url, riding_style, city,
        bikes(count),
        followers!followers_following_id_fkey(count)
      `)
      .eq('role', 'rider')
      .not('slug', 'is', null)
      .or(`username.ilike.${pattern},full_name.ilike.${pattern},city.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(tab === 'riders' ? 20 : 5)

    const riders = (data ?? []) as unknown as RiderRow[]
    results.riders = riders.map((r) => ({
      id: r.id,
      username: r.username,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      riding_style: r.riding_style,
      city: r.city,
      bike_count: r.bikes?.[0]?.count ?? 0,
      follower_count: r.followers?.[0]?.count ?? 0,
    }))
  }

  return results
}
