-- Events can be hidden from the public site (e.g. an event whose next edition
-- can't be verified) without deleting them. RLS does the filtering, so every
-- public query — event pages, list, landing, explore, search, sitemap — drops
-- hidden rows without code changes. Superadmins still read them for the admin UI.
--
-- The new read policy is created before the old one is dropped, so public reads
-- never run without a SELECT policy. Idempotent.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "events_public_read_published" ON public.events;
CREATE POLICY "events_public_read_published" ON public.events
  FOR SELECT
  USING (
    published
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'superadmin'::user_role
    )
  );

DROP POLICY IF EXISTS "events_public_read" ON public.events;
