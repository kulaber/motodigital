// Data tools for Agent Control. Server-side only — every caller must have
// passed the superadmin check (or the cron secret) first. All tools read,
// except save_article_draft, which only stores a DRAFT and is granted to the
// editorial agent alone. Nothing is published or sent by an agent. Personal
// contact data (emails, phone numbers, private message bodies) never leaves
// this file.

import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js'
import type Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { ARTICLES } from '@/lib/data/magazine'

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

// Strict tool schemas can't carry minimum/maximum for integers, so ranges are
// clamped here instead of rejected
const intIn = (min: number, max: number) =>
  z.number().int().optional().transform(v => (v == null ? v : Math.min(max, Math.max(min, v))))

// ── Workshops ─────────────────────────────────────────────────────────

const GetWorkshopsInput = z.object({
  city: z.string().max(80).optional(),
  limit: intIn(1, 60),
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
  days: intIn(1, 180),
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
  limit: intIn(1, 60),
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

// ── Magazine ──────────────────────────────────────────────────────────

async function getMagazineArticles() {
  const db = admin()
  const { data } = await db.from('magazine_articles').select('slug, title, category, tags, status, published_at').order('created_at', { ascending: false }).limit(200)
  return {
    articles: [
      ...(data ?? []).map((a: any) => ({ slug: a.slug, title: a.title, category: a.category, tags: a.tags, status: a.status })),
      ...ARTICLES.map(a => ({ slug: a.slug, title: a.title, category: a.category, tags: a.tags, status: 'published' })),
    ],
  }
}

const SECTION_TYPES = ['intro', 'h2', 'p', 'list', 'quote', 'cta'] as const

const Section = z.object({
  type: z.enum(SECTION_TYPES),
  text: z.string().max(3000).optional(),
  items: z.array(z.string().max(500)).max(20).optional(),
  href: z.string().max(200).optional(),
  label: z.string().max(60).optional(),
}).superRefine((s, ctx) => {
  if (s.type === 'list' ? !s.items?.length : !s.text?.trim()) ctx.addIssue({ code: 'custom', message: `${s.type} braucht ${s.type === 'list' ? 'items' : 'text'}` })
  if (s.type === 'cta' && (!s.href?.startsWith('/') || !s.label)) ctx.addIssue({ code: 'custom', message: 'cta braucht label und eine interne href, die mit / beginnt' })
})

const SaveDraftInput = z.object({
  title: z.string().min(10).max(120),
  slug: z.string().min(3).max(90),
  meta_title: z.string().min(10).max(70),
  meta_description: z.string().min(50).max(170),
  category: z.enum(['guide', 'interview', 'build-story']),
  excerpt: z.string().min(40).max(300),
  tags: z.array(z.string().max(40)).max(10),
  related_workshop_slugs: z.array(z.string().max(90)).max(12),
  faq: z.array(z.object({ q: z.string().max(200), a: z.string().max(800) })).max(6),
  content: z.array(Section).min(4).max(60),
})

const slugify = (s: string) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

/** The only write tool: stores an article as DRAFT. Publishing is a founder action. */
async function saveArticleDraft(input: z.infer<typeof SaveDraftInput>, ctx: ToolContext) {
  const db = admin()
  const base = slugify(input.slug) || slugify(input.title)
  const { data: taken } = await db.from('magazine_articles').select('slug').like('slug', `${base}%`)
  const takenSet = new Set([...(taken ?? []).map((r: any) => r.slug), ...ARTICLES.map(a => a.slug)])
  let slug = base
  for (let i = 2; takenSet.has(slug); i++) slug = `${base}-${i}`

  // Cover: first related workshop's cover photo (our own storage), if any
  let cover: string | null = null
  let relatedBuilder: string | null = null
  if (input.related_workshop_slugs.length) {
    const { data: ws } = await db.from('profiles').select('id, slug').in('slug', input.related_workshop_slugs).eq('role', 'custom-werkstatt')
    const first = input.related_workshop_slugs.map(s => (ws ?? []).find((w: any) => w.slug === s)).find(Boolean) as { id: string; slug: string } | undefined
    if (first) {
      relatedBuilder = first.slug
      const { data: m } = await db.from('builder_media').select('url').eq('builder_id', first.id).eq('type', 'image').order('position').limit(1)
      cover = m?.[0]?.url ?? null
    }
  }

  const words = input.content.reduce((n, s) => n + `${s.text ?? ''} ${(s.items ?? []).join(' ')}`.split(/\s+/).filter(Boolean).length, 0)
  const content = input.content.map(s => (
    s.type === 'list' ? { type: 'list', items: s.items }
      : s.type === 'cta' ? { type: 'cta', text: s.text, href: s.href, label: s.label }
        : { type: s.type, text: s.text }
  ))

  const { data, error } = await db.from('magazine_articles').insert({
    slug, title: input.title, meta_title: input.meta_title, meta_description: input.meta_description,
    category: input.category, excerpt: input.excerpt, cover_image: cover, tags: input.tags,
    related_builder_slug: relatedBuilder, faq: input.faq, content,
    read_time: `${Math.max(3, Math.round(words / 200))} min`,
    status: 'draft', created_by_agent: ctx.agentId, source_output_id: ctx.outputId,
  }).select('id').single()
  if (error) throw new Error(`Entwurf konnte nicht gespeichert werden: ${error.message}`)
  return { saved: true, id: data.id, slug, status: 'draft', words, note: 'Entwurf gespeichert. Er wird erst veröffentlicht, wenn der Gründer ihn freigibt.' }
}

// ── Tool registry ─────────────────────────────────────────────────────

export interface ToolContext {
  agentId: string
  outputId: string
}

const noArgs = z.object({})

const SECTION_SCHEMA = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: [...SECTION_TYPES] },
    text: { type: 'string', description: 'Text für intro, h2, p, quote und den Satz neben dem cta-Button' },
    items: { type: 'array', items: { type: 'string' }, description: 'Nur für list' },
    href: { type: 'string', description: 'Nur für cta: interner Pfad, z. B. /custom-werkstatt/<slug> oder /magazine/<slug>' },
    label: { type: 'string', description: 'Nur für cta: Button-Text, z. B. „Profil ansehen“' },
  },
  required: ['type'],
  additionalProperties: false,
}

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
          limit: { type: 'integer', description: 'Maximale Anzahl, 1 bis 60 (Standard 40)' },
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
        properties: { days: { type: 'integer', description: 'Zeitraum in Tagen, 1 bis 180 (Standard 30)' } },
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
        properties: { limit: { type: 'integer', description: 'Maximale Anzahl, 1 bis 60 (Standard 30)' } },
        required: [],
        additionalProperties: false,
      },
    },
  },
  get_magazine_articles: {
    schema: noArgs,
    run: async () => getMagazineArticles(),
    def: {
      name: 'get_magazine_articles',
      description: 'Alle Magazin-Artikel (veröffentlicht und Entwürfe) mit Slug, Titel, Kategorie und Tags — um Doppelungen zu vermeiden und intern zu verlinken (/magazine/<slug>).',
      input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false },
    },
  },
  // ── Write tool: only offered to agents that list it in definitions.ts ──
  save_article_draft: {
    schema: SaveDraftInput,
    run: saveArticleDraft,
    write: true,
    def: {
      name: 'save_article_draft',
      description: 'Speichert einen Magazin-Artikel als ENTWURF. Er wird nicht veröffentlicht — der Gründer prüft und gibt ihn frei. Abschnitte: intro (Einstieg), h2 (Zwischenüberschrift), p (Absatz), list (Aufzählung), quote (Zitat-Kasten, keine erfundenen Zitate von Personen), cta (Satz plus Button mit internem Link). Keine Bilder.',
      input_schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'H1, 10–120 Zeichen' },
          slug: { type: 'string', description: 'URL-Slug in Kleinbuchstaben mit Bindestrichen' },
          meta_title: { type: 'string', description: 'max. 60 Zeichen' },
          meta_description: { type: 'string', description: '120–155 Zeichen' },
          category: { type: 'string', enum: ['guide', 'interview', 'build-story'] },
          excerpt: { type: 'string', description: 'Teaser, 1–2 Sätze' },
          tags: { type: 'array', items: { type: 'string' } },
          related_workshop_slugs: { type: 'array', items: { type: 'string' }, description: 'Slugs der verlinkten Werkstätten aus get_workshops; die erste liefert das Titelbild' },
          faq: { type: 'array', items: { type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } }, required: ['q', 'a'], additionalProperties: false } },
          content: { type: 'array', items: SECTION_SCHEMA },
        },
        required: ['title', 'slug', 'meta_title', 'meta_description', 'category', 'excerpt', 'tags', 'related_workshop_slugs', 'faq', 'content'],
        additionalProperties: false,
      },
    },
  },
} as const

type ToolName = keyof typeof REGISTRY
type ToolEntry = { schema: z.ZodTypeAny; run: (input: any, ctx: ToolContext) => Promise<unknown>; write?: boolean; def: object }

const isWrite = (name: string) => !!(REGISTRY[name as ToolName] as ToolEntry | undefined)?.write

/** Read-only tools for everyone, plus the write tools an agent is explicitly granted */
export function toolsForAgent(extra: string[] = []): Anthropic.Beta.BetaTool[] {
  return (Object.entries(REGISTRY) as [string, ToolEntry][])
    .filter(([name]) => !isWrite(name) || extra.includes(name))
    .map(([, t]) => ({ ...t.def, strict: true })) as Anthropic.Beta.BetaTool[]
}

/** Validate + run a tool. Write tools only run if granted. Returns [resultJson, isError]. */
export async function runAgentTool(name: string, input: unknown, ctx: ToolContext, granted: string[] = []): Promise<[string, boolean]> {
  const tool = REGISTRY[name as ToolName] as ToolEntry | undefined
  if (!tool) return [JSON.stringify({ error: `Unbekanntes Tool: ${name}` }), true]
  if (tool.write && !granted.includes(name)) return [JSON.stringify({ error: `Tool nicht erlaubt: ${name}` }), true]
  const parsed = tool.schema.safeParse(input ?? {})
  if (!parsed.success) return [JSON.stringify({ INVALID_INPUT: parsed.error.flatten() }), true]
  try {
    return [JSON.stringify(await tool.run(parsed.data, ctx)), false]
  } catch (e) {
    return [JSON.stringify({ error: e instanceof Error ? e.message : 'Tool fehlgeschlagen' }), true]
  }
}
