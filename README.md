# MotoDigital

Custom Bikes, Builder & Builds — Platform MVP

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (Postgres + PostGIS + Auth + Realtime + Storage)
- **Maps**: Mapbox GL JS
- **Hosting**: Vercel
- **Images**: Supabase Storage → Cloudflare Images (Phase 2)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/motodigital.git
cd motodigital
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase + Mapbox credentials
```

### 3. Supabase setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema (runs migrations)
supabase db push

# Generate TypeScript types (after schema is live)
npm run db:types
```

### 4. Supabase Storage buckets

In the Supabase Dashboard → Storage, create:
- `bike-images` (public)
- `avatars` (public)

### 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── auth/login/          # Login page + form
│   ├── auth/register/       # Register page
│   ├── auth/callback/       # OAuth + magic link handler
│   ├── bikes/[id]/          # Bike detail page
│   ├── map/                 # Main map view (entry point)
│   ├── dashboard/           # Seller dashboard
│   └── workshops/[slug]/    # Workshop profile
├── components/
│   ├── bike/                # BikeCard, BikeGallery, BikeForm
│   ├── map/                 # MapView, SearchBar
│   ├── messaging/           # ContactButton, ChatWindow
│   ├── workshop/            # WorkshopCard
│   └── ui/                  # Button, Input, Dialog (shadcn)
├── hooks/
│   ├── useAuth.ts           # Session state
│   └── useMessages.ts       # Realtime messaging
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server Component client
│   └── utils.ts             # cn(), formatPrice(), etc.
├── middleware.ts             # Auth route protection
└── types/
    └── database.ts          # Generated Supabase types
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

## Deploy to Vercel

```bash
npx vercel
# Add env vars in Vercel dashboard
```

## GitHub Setup (first time)

```bash
git init
git add .
git commit -m "feat: initial MotoDigital MVP setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/motodigital.git
git push -u origin main
```
