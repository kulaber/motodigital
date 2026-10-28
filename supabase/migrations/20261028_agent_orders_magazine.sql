-- Agent Control, part 2: team orders (planned by the Chief of Staff, approved
-- by the founder, optionally repeated weekly as drafts) and magazine articles
-- stored in the database (agents save drafts, only the founder publishes).
-- Requires 20261028_agent_control.sql (is_superadmin(), agent_outputs).

-- ── agent_orders ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_orders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction  text NOT NULL,
  summary      text,
  plan         jsonb NOT NULL DEFAULT '[]'::jsonb,
  status       text NOT NULL DEFAULT 'planned'
               CHECK (status IN ('planned', 'approved', 'running', 'done', 'error', 'rejected')),
  recurrence   text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly')),
  active       boolean NOT NULL DEFAULT true,
  next_run_at  timestamptz,
  last_run_at  timestamptz,
  created_by   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approved_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_orders_due_idx
  ON public.agent_orders (next_run_at) WHERE recurrence = 'weekly' AND active;

ALTER TABLE public.agent_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_orders: superadmin select" ON public.agent_orders;
CREATE POLICY "agent_orders: superadmin select" ON public.agent_orders
  FOR SELECT USING (public.is_superadmin());

DROP POLICY IF EXISTS "agent_orders: superadmin insert" ON public.agent_orders;
CREATE POLICY "agent_orders: superadmin insert" ON public.agent_orders
  FOR INSERT WITH CHECK (public.is_superadmin() AND created_by = auth.uid());

DROP POLICY IF EXISTS "agent_orders: superadmin update" ON public.agent_orders;
CREATE POLICY "agent_orders: superadmin update" ON public.agent_orders
  FOR UPDATE USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "agent_orders: superadmin delete" ON public.agent_orders;
CREATE POLICY "agent_orders: superadmin delete" ON public.agent_orders
  FOR DELETE USING (public.is_superadmin());

-- ── agent_outputs: link runs to orders ───────────────────────────────
ALTER TABLE public.agent_outputs
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.agent_orders(id) ON DELETE SET NULL;
ALTER TABLE public.agent_outputs
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
ALTER TABLE public.agent_outputs DROP CONSTRAINT IF EXISTS agent_outputs_source_check;
ALTER TABLE public.agent_outputs
  ADD CONSTRAINT agent_outputs_source_check CHECK (source IN ('manual', 'order', 'schedule'));

-- ── magazine_articles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.magazine_articles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text NOT NULL UNIQUE,
  title                 text NOT NULL,
  meta_title            text NOT NULL,
  meta_description      text NOT NULL,
  category              text NOT NULL CHECK (category IN ('build-story', 'interview', 'guide')),
  excerpt               text NOT NULL,
  cover_image           text,
  tags                  text[] NOT NULL DEFAULT '{}',
  related_slugs         text[] NOT NULL DEFAULT '{}',
  related_builder_slug  text,
  faq                   jsonb NOT NULL DEFAULT '[]'::jsonb,
  content               jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_time             text,
  author                text NOT NULL DEFAULT 'MotoDigital Redaktion',
  status                text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'rejected')),
  created_by_agent      text,
  source_output_id      uuid REFERENCES public.agent_outputs(id) ON DELETE SET NULL,
  approved_by           uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS magazine_articles_status_published_idx
  ON public.magazine_articles (status, published_at DESC);

ALTER TABLE public.magazine_articles ENABLE ROW LEVEL SECURITY;

-- Everyone may read published articles; drafts are admin-only
DROP POLICY IF EXISTS "magazine_articles: public read published" ON public.magazine_articles;
CREATE POLICY "magazine_articles: public read published" ON public.magazine_articles
  FOR SELECT USING (status = 'published' OR public.is_superadmin());

DROP POLICY IF EXISTS "magazine_articles: superadmin insert" ON public.magazine_articles;
CREATE POLICY "magazine_articles: superadmin insert" ON public.magazine_articles
  FOR INSERT WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "magazine_articles: superadmin update" ON public.magazine_articles;
CREATE POLICY "magazine_articles: superadmin update" ON public.magazine_articles
  FOR UPDATE USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "magazine_articles: superadmin delete" ON public.magazine_articles;
CREATE POLICY "magazine_articles: superadmin delete" ON public.magazine_articles
  FOR DELETE USING (public.is_superadmin());
