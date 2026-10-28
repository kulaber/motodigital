-- Agent Control (/admin/agents): archive of agent runs + founder briefing.
-- Admins are profiles.role = 'superadmin'. Both tables are admin-only via RLS.
-- Idempotent so it can be re-run on Dev and Prod.

-- Helper for RLS: SECURITY DEFINER avoids recursive RLS evaluation on profiles
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

-- ── agent_outputs: one row per agent run (the "Ablage") ──────────────
CREATE TABLE IF NOT EXISTS public.agent_outputs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key     text NOT NULL,
  area_key      text NOT NULL,
  task          text NOT NULL,
  details       text,
  handoff_from  uuid REFERENCES public.agent_outputs(id) ON DELETE SET NULL,
  output        text,
  tool_calls    jsonb NOT NULL DEFAULT '[]'::jsonb,
  status        text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'done', 'error')),
  model         text,
  input_tokens  integer,
  output_tokens integer,
  run_by        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_outputs_agent_created_idx
  ON public.agent_outputs (agent_key, created_at DESC);

ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_outputs: superadmin select" ON public.agent_outputs;
CREATE POLICY "agent_outputs: superadmin select" ON public.agent_outputs
  FOR SELECT USING (public.is_superadmin());

DROP POLICY IF EXISTS "agent_outputs: superadmin insert" ON public.agent_outputs;
CREATE POLICY "agent_outputs: superadmin insert" ON public.agent_outputs
  FOR INSERT WITH CHECK (public.is_superadmin() AND run_by = auth.uid());

DROP POLICY IF EXISTS "agent_outputs: superadmin update" ON public.agent_outputs;
CREATE POLICY "agent_outputs: superadmin update" ON public.agent_outputs
  FOR UPDATE USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "agent_outputs: superadmin delete" ON public.agent_outputs;
CREATE POLICY "agent_outputs: superadmin delete" ON public.agent_outputs
  FOR DELETE USING (public.is_superadmin());

-- ── agent_briefing: founder briefing ('global' or per area) ──────────
CREATE TABLE IF NOT EXISTS public.agent_briefing (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope       text NOT NULL UNIQUE,
  content     text NOT NULL DEFAULT '',
  updated_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_briefing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_briefing: superadmin select" ON public.agent_briefing;
CREATE POLICY "agent_briefing: superadmin select" ON public.agent_briefing
  FOR SELECT USING (public.is_superadmin());

DROP POLICY IF EXISTS "agent_briefing: superadmin insert" ON public.agent_briefing;
CREATE POLICY "agent_briefing: superadmin insert" ON public.agent_briefing
  FOR INSERT WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "agent_briefing: superadmin update" ON public.agent_briefing;
CREATE POLICY "agent_briefing: superadmin update" ON public.agent_briefing
  FOR UPDATE USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "agent_briefing: superadmin delete" ON public.agent_briefing;
CREATE POLICY "agent_briefing: superadmin delete" ON public.agent_briefing
  FOR DELETE USING (public.is_superadmin());
