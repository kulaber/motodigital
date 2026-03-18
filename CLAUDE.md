# MotoDigital — Claude Code Configuration

> Motorcycle marketplace for custom bikes, builders & workshops.
> Stack: Next.js 15 · Tailwind CSS v4 · shadcn/ui · Supabase · Mapbox GL JS · Cloudinary · Vercel

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19, Server Components) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres + PostGIS + RLS + Realtime + Storage) |
| Auth | Supabase Auth (Magic Link) |
| Maps | Mapbox GL JS (proximity/PostGIS search) |
| Images | Cloudinary |
| Deployment | Vercel |
| Repo | github.com/kulaber/motodigital |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (magic link)
│   ├── (dashboard)/        # Workshop dashboard
│   ├── bikes/              # Bike listings + detail pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── map/                # MapView, proximity search
│   ├── bikes/              # BikeCard, BikeDetail
│   └── dashboard/          # Workshop panels
├── hooks/
│   ├── useAuth.ts
│   └── useMessages.ts
├── lib/
│   ├── supabase/           # Client, server, middleware clients
│   └── mapbox/
└── types/                  # TypeScript types (generated from Supabase)
```

---

## 🎨 Brand & Design System

```css
/* Brand Colors */
--color-teal:    #2AABAB;   /* Primary — links, CTAs, accents */
--color-creme:   #F0EDE4;   /* Background / light surfaces */
--color-dark:    #111111;   /* Dark mode base */

/* Typography */
font-family: 'Plus Jakarta Sans', sans-serif;

/* Aesthetic */
/* Dark mode default · Airbnb-style rounded cards · Clean, premium feel */
```

**Design Rules:**
- Use `rounded-2xl` or `rounded-3xl` for cards (Airbnb aesthetic)
- Teal `#2AABAB` for interactive elements, never for backgrounds
- Creme `#F0EDE4` for text on dark, or light-mode backgrounds
- Prefer `shadcn/ui` components; extend with Tailwind v4 utilities
- Images always via Cloudinary — never `<img src>` with raw paths

---

## 🗄️ Database Conventions

### UUID Generation
```sql
-- ✅ ALWAYS use this (Supabase-compatible)
gen_random_uuid()

-- ❌ NEVER use this (requires extension not available on Vercel)
uuid_generate_v4()
```

### Supabase Client Usage
```typescript
// Server Components / Route Handlers / Server Actions
import { createServerClient } from '@/lib/supabase/server'

// Client Components
import { createBrowserClient } from '@/lib/supabase/client'

// Middleware
import { createMiddlewareClient } from '@/lib/supabase/middleware'
```

### Single Row Queries
```typescript
// ✅ ALWAYS use maybeSingle() — returns null if not found
const { data } = await supabase.from('bikes').select().eq('id', id).maybeSingle()

// ❌ NEVER use single() — throws error if row not found (breaks Vercel build)
const { data } = await supabase.from('bikes').select().eq('id', id).single()
```

### Row Level Security (RLS)
- **ALL tables MUST have RLS enabled** — never disable in production
- Every table needs explicit policies for: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Workshop owners can only read/write their own data
- Bike listings marked `is_private = true` are only visible to the owner
- Use `auth.uid()` for ownership checks, never trust client-sent user IDs
- Views must use `security_invoker = true`

```sql
-- ✅ Correct ownership check
CREATE POLICY "owner_update" ON bikes
  FOR UPDATE USING (auth.uid() = owner_id);

-- ❌ Never trust client-sent IDs
-- WHERE user_id = $clientProvidedUserId
```

### PostGIS / Proximity Search
```sql
-- Core search function (already in schema)
search_bikes_nearby(lat FLOAT, lng FLOAT, radius_km FLOAT)

-- Geography columns use SRID 4326
-- Always cast: ST_MakePoint(lng, lat)::geography
```

### Migrations
- All schema changes via Supabase migration files, never direct SQL in production
- Migration files: `supabase/migrations/YYYYMMDD_description.sql`
- Run locally with `supabase db push` before deploying

---

## 🔐 Security Rules

### Secrets & Environment Variables
```bash
# ✅ Server-only secrets (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=   # NEVER in client code
DATABASE_URL=                # NEVER in client code
CLOUDINARY_API_SECRET=       # NEVER in client code

# ✅ Public keys (safe for client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

**Rules:**
- Variables without `NEXT_PUBLIC_` prefix MUST NOT appear in client components
- Never log secrets, tokens, or user emails
- Never commit `.env.local` — it's in `.gitignore`
- Service role key only used in server-side admin operations

### Input Validation
- All user inputs validated with **Zod** before DB writes
- Schema shared between client (react-hook-form) and server (Server Actions)
- Never pass raw form data directly to Supabase inserts

```typescript
// ✅ Always validate first
const schema = z.object({ title: z.string().min(3).max(100) })
const parsed = schema.safeParse(formData)
if (!parsed.success) return { error: parsed.error }
await supabase.from('bikes').insert(parsed.data)
```

### Authentication
- Magic Link only (no password auth)
- Session handling via Supabase Auth + middleware
- Protected routes checked in `middleware.ts` using `createMiddlewareClient`
- Never store session tokens in localStorage

### SQL Injection Prevention
- Always use Supabase query builder — never string-concatenate SQL
- For raw SQL (PostGIS functions), use parameterized `.rpc()` calls only

```typescript
// ✅ Safe
await supabase.rpc('search_bikes_nearby', { lat, lng, radius_km: 50 })

// ❌ Never do this
await supabase.from('bikes').select(`* WHERE location = '${userInput}'`)
```

---

## ⚙️ Development Commands

```bash
# Dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Supabase local
supabase start
supabase db push
supabase gen types typescript --local > src/types/supabase.ts

# Deploy
vercel --prod
```

---

## 🧩 Component Patterns

### Server Components (default)
```typescript
// Fetch data server-side — no useEffect, no loading states needed
export default async function BikeDetailPage({ params }) {
  const supabase = createServerClient()
  const { data: bike } = await supabase
    .from('bikes')
    .select('*, workshop(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (!bike) notFound()
  return <BikeDetail bike={bike} />
}
```

### Server Actions (mutations)
```typescript
'use server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const bikeSchema = z.object({ title: z.string(), price: z.number() })

export async function createBike(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = bikeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { error } = await supabase
    .from('bikes')
    .insert({ ...parsed.data, owner_id: user.id })

  return error ? { error: error.message } : { success: true }
}
```

### Client Components
- Use `'use client'` only when needed (event handlers, hooks, map)
- MapView and BikeCard with interactions = client components
- Forms use `react-hook-form` + Zod resolver

---

## 🗺️ Mapbox Integration

```typescript
// Map component is always 'use client'
// Token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
// Proximity search triggers search_bikes_nearby RPC
// Cluster markers for performance with many listings
```

---

## 🖼️ Image Handling (Cloudinary)

```typescript
// Always use Cloudinary URLs — never raw file paths
// Transformations: c_fill, w_800, h_600, q_auto, f_auto
// Upload via server-side signed uploads only (never unsigned from client)
const url = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_800,h_600,q_auto,f_auto/${publicId}`
```

---

## 👤 User Personas (Research Context)

| Name | Role | Location | Focus |
|---|---|---|---|
| Marco | Rider, 43 | — | Buying custom bikes |
| Frank | Garage Builder, 38 | Stuttgart | Building Honda CB 750 café racer |
| Micha | Workshop Owner, 46 | Leipzig | Managing custom workshop listings |
| Stefan | Parts Manufacturer, 44 | — | Selling components to builders |

Feature decisions should consider all four personas.

---

## 🚀 Deployment (Vercel)

- Branch `main` → production auto-deploy
- Preview deployments on all PRs
- Environment variables set in Vercel dashboard (not `.env`)
- Build command: `pnpm build`
- Output: `.next` (automatic with Vercel)
- Supabase RLS must be verified before merging to main

---

## ❌ Hard Rules — Never Do This

```typescript
// ❌ uuid_generate_v4() — use gen_random_uuid()
// ❌ .single() — use .maybeSingle()
// ❌ SUPABASE_SERVICE_ROLE_KEY in client components
// ❌ Disabled RLS in production tables
// ❌ Raw SQL string concatenation with user input
// ❌ Direct file uploads without Cloudinary
// ❌ localStorage for auth sessions
// ❌ Trusting client-sent user IDs for ownership
// ❌ <img src> without Cloudinary transform URL
```

---

## ✅ Pre-Commit Checklist

Before every commit:
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] No secrets in client-side code
- [ ] New tables have RLS enabled + policies
- [ ] New forms have Zod validation
- [ ] Images use Cloudinary transforms
- [ ] `.maybeSingle()` used (not `.single()`)
- [ ] `gen_random_uuid()` used (not `uuid_generate_v4()`)

---

## 🔗 Skills Installed

```bash
# Security audit (Sentry — confidence-based, no false positives)
npx skills install getsentry/skills@security-review

# Supabase Postgres best practices + RLS
npx skillsadd supabase/postgres-best-practices

# GitHub workflow automation
npx skillsadd callstackincubator/github
```

---

*Last updated: March 2026 · MotoDigital v0.1 · kulaber/motodigital*
