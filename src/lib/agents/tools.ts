// Read-only data tools for Agent Control. Server-side only — every caller
// must have passed the superadmin check first. No tool writes, sends or
// changes anything. Personal contact data (emails, phone numbers, private
// message bodies) never leaves this file.

import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js'
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const PLACEHOLDER_DOMAIN = '@motodigital.local'
const DAY_MS = 24 * 60 * 60 * 1000

function admin(): SupabaseClient {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString()

async function count(q: PromiseLike<{ count: number | null }>): Promise<number> {
  const { count } = await q
  return count ?? 0
}

/** auth.users facts we may expose: claimed (real email) + email confirmed. Never the address itself. */
async function authFacts(db: SupabaseClient): Promise<Map<string, { claimed: boolean; confirmed: boolean }>> {
  const facts = new Map<string, { claimed: boolean; confirmed: boolean }>()
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data?.users.length) break
    for (const u of data.users) {
      facts.set(u.id, {
        claimed: !(u.email ?? '').endsWith(PLACEHOLDER_DOMAIN),
        confirmed: !!u.email_confirmed_at,
      })
    }
    if (data.users.length < 1000) break
  }
  return facts
}

// ── Platform stats (also feeds the café numbers) ─────────────────────

export interface PlatformStats {
  /** founding_partner workshops owned by a real, confirmed account */
  foundingMembers: number
  /** real account registered, email not confirmed yet */
  foundingPending: number
  foundingLimit: number
  workshops: number
  riders: number
  bikesActive: number
  pageViews30d: number
  newSignups30d: number
  conversations30d: number
  messages30d: number
  contactRequests30d: number
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const db = admin()
  const since30 = daysAgo(30)
  const real = (q: any) => q.or('is_bot.is.null,is_bot.eq.false')

  const [
    { data: founding }, facts, workshops, riders, bikesActive, pageViews30d,
    { data: recent }, conversations30d, messages30d, contactRequests30d,
  ] = await Promise.all([
    // Unclaimed seed profiles also get the founding_partner default — filtered below
    db.from('workshops').select('owner_id').eq('subscription_tier', 'founding_partner').is('deleted_at', null),
    authFacts(db),
    count(real(db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'custom-werkstatt'))),
    count(real(db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'rider'))),
    count(db.from('bikes').select('id', { count: 'exact', head: true }).eq('status', 'active')),
    count(db.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since30)),
    real(db.from('profiles').select('id').gte('created_at', since30)) as Promise<{ data: { id: string }[] | null }>,
    count(db.from('conversations').select('id', { count: 'exact', head: true }).gte('created_at', since30)),
    count(db.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', since30)),
    count(db.from('contact_submissions').select('id', { count: 'exact', head: true }).gte('created_at', since30)),
  ])

  const owners = (founding ?? []).map((w: { owner_id: string }) => facts.get(w.owner_id)).filter(f => f?.claimed)
  const foundingMembers = owners.filter(f => f!.confirmed).length
  const foundingPending = owners.length - foundingMembers
  // Real sign-ups only — profiles we seeded ourselves have placeholder accounts
  const newSignups30d = (recent ?? []).filter(p => facts.get(p.id)?.claimed).length

  return {
    foundingMembers, foundingPending, foundingLimit: 100, workshops, riders, bikesActive, pageViews30d,
    newSignups30d, conversations30d, messages30d, contactRequests30d,
  }
}

// ── Workshops ─────────────────────────────────────────────────────────

const GetWorkshopsInput = z.object({
  city: z.string().max(80).optional(),
  limit: z.number().int().min(1).max(60).optional(),
})

async function getWorkshops(input: z.infer<typeof GetWorkshopsInput>) {
  const db = admin()
  let q = (db.from('profiles') as any)
    .select('id, full_name, slug, city, specialty, tags, bases, since_year, website_url, instagram_url, avatar_url, bio, bio_long, created_at, is_verified')
    .eq('role', 'custom-werkstatt')
    .or('is_bot.is.null,is_bot.eq.false')
    .order('created_at', { ascending: false })
    .limit(input.limit ?? 40)
  if (input.city) q = q.ilike('city', `%${input.city}%`)
  const { data: rows } = await q as { data: any[] | null }
  if (!rows?.length) return { workshops: [] }

  const ids = rows.map(r => r.id)
  const [{ data: ws }, { data: media }, { data: bikes }, facts] = await Promise.all([
    db.from('workshops').select('owner_id, subscription_tier').in('owner_id', ids),
    db.from('builder_media').select('builder_id').in('builder_id', ids),
    db.from('bikes').select('seller_id').in('seller_id', ids).eq('status', 'active'),
    authFacts(db),
  ])
  const tier = new Map((ws ?? []).map((w: any) => [w.owner_id, w.subscription_tier]))
  const tally = (list: any[] | null, key: string) => {
    const m = new Map<string, number>()
    for (const r of list ?? []) m.set(r[key], (m.get(r[key]) ?? 0) + 1)
    return m
  }
  const mediaCount = tally(media, 'builder_id')
  const bikeCount = tally(bikes, 'seller_id')

  return {
    workshops: rows.map(r => ({
      name: r.full_name,
      profile_url: r.slug ? `https://motodigital.io/custom-werkstatt/${r.slug}` : null,
      city: r.city,
      styles: r.specialty,
      services: r.tags,
      brands: r.bases,
      since_year: r.since_year,
      website: r.website_url,
      instagram: r.instagram_url,
      tier: tier.get(r.id) ?? null,
      claimed: facts.get(r.id)?.claimed ?? null,
      listed_since: r.created_at?.slice(0, 10),
      photos: mediaCount.get(r.id) ?? 0,
      active_bikes: bikeCount.get(r.id) ?? 0,
      has_logo: !!r.avatar_url,
      has_description: !!(r.bio || r.bio_long),
    })),
  }
}

// ── Incomplete profiles ───────────────────────────────────────────────

const GetIncompleteInput = z.object({
  role: z.enum(['custom-werkstatt', 'rider', 'all']).optional(),
})

async function getIncompleteProfiles(input: z.infer<typeof GetIncompleteInput>) {
  const db = admin()
  let q = (db.from('profiles') as any)
    .select('id, full_name, username, role, slug, city, address, lat, avatar_url, bio, bio_long, onboarding_completed, onboarding_step, created_at')
    .or('is_bot.is.null,is_bot.eq.false')
    .in('role', input.role && input.role !== 'all' ? [input.role] : ['custom-werkstatt', 'rider'])
    .order('created_at', { ascending: false })
    .limit(200)
  const { data: rows } = await q as { data: any[] | null }
  const ids = (rows ?? []).map(r => r.id)
  const [{ data: media }, facts] = await Promise.all([
    ids.length ? db.from('builder_media').select('builder_id').in('builder_id', ids) : Promise.resolve({ data: [] as any[] }),
    authFacts(db),
  ])
  const withMedia = new Set((media ?? []).map((m: any) => m.builder_id))

  const incomplete = (rows ?? []).map(r => {
    const missing: string[] = []
    if (facts.get(r.id) && !facts.get(r.id)!.confirmed) missing.push('E-Mail nicht bestätigt')
    if (!r.onboarding_completed) missing.push(`Onboarding offen (Schritt ${r.onboarding_step ?? 0})`)
    if (!r.slug) missing.push('nicht öffentlich (kein Slug)')
    if (!r.bio && !r.bio_long) missing.push('keine Beschreibung')
    if (!r.city && !r.address) missing.push('kein Ort')
    if (r.role === 'custom-werkstatt') {
      if (r.lat == null) missing.push('nicht auf der Karte')
      if (!r.avatar_url) missing.push('kein Logo')
      if (!withMedia.has(r.id)) missing.push('keine Fotos')
    }
    return {
      name: r.full_name || r.username,
      role: r.role,
      claimed: facts.get(r.id)?.claimed ?? null,
      registered: r.created_at?.slice(0, 10),
      missing,
    }
  }).filter(p => p.missing.length > 0)

  return { count: incomplete.length, profiles: incomplete.slice(0, 60) }
}

// ── Recent inquiries ──────────────────────────────────────────────────

const GetInquiriesInput = z.object({
  days: z.number().int().min(1).max(180).optional(),
})

async function getRecentInquiries(input: z.infer<typeof GetInquiriesInput>) {
  const db = admin()
  const since = daysAgo(input.days ?? 30)
  const [{ data: contact }, { data: convs }] = await Promise.all([
    db.from('contact_submissions').select('subject, message, created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(30),
    db.from('conversations').select('id, bike_id, seller_id, created_at, last_message_at').gte('last_message_at', since).order('last_message_at', { ascending: false }).limit(50),
  ])

  const convIds = (convs ?? []).map((c: any) => c.id)
  const sellerIds = [...new Set((convs ?? []).map((c: any) => c.seller_id).filter(Boolean))]
  const bikeIds = [...new Set((convs ?? []).map((c: any) => c.bike_id).filter(Boolean))]
  const [{ data: msgs }, { data: sellers }, { data: bikes }] = await Promise.all([
    convIds.length ? db.from('messages').select('conversation_id').in('conversation_id', convIds) : Promise.resolve({ data: [] as any[] }),
    sellerIds.length ? db.from('profiles').select('id, full_name, role').in('id', sellerIds) : Promise.resolve({ data: [] as any[] }),
    bikeIds.length ? db.from('bikes').select('id, title').in('id', bikeIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const msgCount = new Map<string, number>()
  for (const m of msgs ?? []) msgCount.set(m.conversation_id, (msgCount.get(m.conversation_id) ?? 0) + 1)
  const seller = new Map((sellers ?? []).map((s: any) => [s.id, s]))
  const bike = new Map((bikes ?? []).map((b: any) => [b.id, b.title]))

  // Strip email addresses and phone numbers from free text before it goes to the model
  const scrub = (t: string | null) => (t ?? '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[E-Mail entfernt]')
    .replace(/\+?\d[\d\s/().-]{7,}\d/g, '[Telefon entfernt]')
    .slice(0, 800)

  return {
    contact_form: (contact ?? []).map((c: any) => ({ date: c.created_at?.slice(0, 10), subject: scrub(c.subject), message: scrub(c.message) })),
    // Metadata only — private message bodies are never read
    platform_conversations: (convs ?? []).map((c: any) => ({
      started: c.created_at?.slice(0, 10),
      last_activity: c.last_message_at?.slice(0, 10),
      messages: msgCount.get(c.id) ?? 0,
      recipient: seller.get(c.seller_id)?.full_name ?? null,
      recipient_role: seller.get(c.seller_id)?.role ?? null,
      about_bike: c.bike_id ? bike.get(c.bike_id) ?? null : null,
    })),
  }
}

// ── Bikes ─────────────────────────────────────────────────────────────

const GetBikesInput = z.object({
  limit: z.number().int().min(1).max(60).optional(),
})

async function getBikes(input: z.infer<typeof GetBikesInput>) {
  const db = admin()
  const { data } = await (db.from('bikes') as any)
    .select('title, make, model, year, style, status, city, created_at, view_count, is_featured, slug, bike_images(id)')
    .order('created_at', { ascending: false })
    .limit(input.limit ?? 30) as { data: any[] | null }
  return {
    bikes: (data ?? []).map(b => ({
      title: b.title, make: b.make, model: b.model, year: b.year, style: b.style,
      status: b.status, city: b.city, listed: b.created_at?.slice(0, 10),
      views: b.view_count ?? 0, featured: !!b.is_featured, images: b.bike_images?.length ?? 0,
      url: b.slug ? `https://motodigital.io/custom-bike/${b.slug}` : null,
    })),
  }
}

// ── Tool registry ─────────────────────────────────────────────────────

const noArgs = z.object({})

const REGISTRY = {
  get_platform_stats: {
    schema: noArgs,
    run: async () => getPlatformStats(),
    def: {
      name: 'get_platform_stats',
      description: 'Live-Kennzahlen von motodigital.io: Founding Members (echte, bestätigte Konten, von 100) und noch unbestätigte Anmeldungen, gelistete Werkstätten inkl. von MotoDigital angelegter Profile, Rider (ohne Demo-Profile), aktive Bikes, Seitenaufrufe, Neuanmeldungen, Unterhaltungen, Nachrichten und Kontaktanfragen der letzten 30 Tage.',
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    },
  },
  get_workshops: {
    schema: GetWorkshopsInput,
    run: getWorkshops,
    def: {
      name: 'get_workshops',
      description: 'Werkstätten auf der Plattform mit Ort, Stilen, Leistungen, Marken, Website, Instagram, Tarif (founding_partner), ob das Profil übernommen ist (claimed), Anzahl Fotos und Bikes sowie ob Logo und Beschreibung vorhanden sind. Optional nach Stadt filtern.',
      input_schema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'Teil des Städtenamens, z. B. "Berlin"' },
          limit: { type: 'integer', minimum: 1, maximum: 60, description: 'Maximale Anzahl (Standard 40)' },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  get_incomplete_profiles: {
    schema: GetIncompleteInput,
    run: getIncompleteProfiles,
    def: {
      name: 'get_incomplete_profiles',
      description: 'Profile mit Lücken (unbestätigte E-Mail, Onboarding offen, nicht öffentlich, keine Beschreibung, kein Ort, nicht auf der Karte, kein Logo, keine Fotos) samt Liste, was jeweils fehlt.',
      input_schema: {
        type: 'object',
        properties: { role: { type: 'string', enum: ['custom-werkstatt', 'rider', 'all'], description: 'Standard: all' } },
        required: [],
        additionalProperties: false,
      },
    },
  },
  get_recent_inquiries: {
    schema: GetInquiriesInput,
    run: getRecentInquiries,
    def: {
      name: 'get_recent_inquiries',
      description: 'Anfragen über das Kontaktformular (Betreff und Text, Kontaktdaten entfernt) und Metadaten zu Unterhaltungen auf der Plattform (Datum, Empfänger, Bike, Anzahl Nachrichten — keine Nachrichteninhalte).',
      input_schema: {
        type: 'object',
        properties: { days: { type: 'integer', minimum: 1, maximum: 180, description: 'Zeitraum in Tagen (Standard 30)' } },
        required: [],
        additionalProperties: false,
      },
    },
  },
  get_bikes: {
    schema: GetBikesInput,
    run: getBikes,
    def: {
      name: 'get_bikes',
      description: 'Zuletzt eingestellte Bikes mit Marke, Modell, Stil, Status, Ort, Aufrufen, Anzahl Bilder und Link.',
      input_schema: {
        type: 'object',
        properties: { limit: { type: 'integer', minimum: 1, maximum: 60, description: 'Maximale Anzahl (Standard 30)' } },
        required: [],
        additionalProperties: false,
      },
    },
  },
} as const

type ToolName = keyof typeof REGISTRY

export const AGENT_TOOLS: Anthropic.Beta.BetaTool[] = Object.values(REGISTRY).map(t => ({
  ...t.def,
  strict: true,
})) as Anthropic.Beta.BetaTool[]

/** Validate + run a tool. Returns [resultJson, isError]. */
export async function runAgentTool(name: string, input: unknown): Promise<[string, boolean]> {
  const tool = REGISTRY[name as ToolName]
  if (!tool) return [JSON.stringify({ error: `Unbekanntes Tool: ${name}` }), true]
  const parsed = (tool.schema as z.ZodTypeAny).safeParse(input ?? {})
  if (!parsed.success) return [JSON.stringify({ INVALID_INPUT: parsed.error.flatten() }), true]
  try {
    const result = await (tool.run as (i: any) => Promise<unknown>)(parsed.data)
    return [JSON.stringify(result), false]
  } catch (e) {
    return [JSON.stringify({ error: e instanceof Error ? e.message : 'Tool fehlgeschlagen' }), true]
  }
}
