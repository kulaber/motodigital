-- Workshop FAQ for the public profile page (/custom-werkstatt/<slug>).
-- Workshops edit it in their own profile form, superadmins in the admin
-- editor — the existing profiles RLS policies already cover both, so no new
-- policy is needed. The check keeps the shape the page and its FAQPage schema
-- expect (mirrored by profileFaqsSchema in src/lib/werkstatt/profileContent.ts):
-- at most 10 entries, each {q, a} with a question of 1–200 and an answer of
-- 1–1500 characters.
--
-- One statement per `supabase db query` call. Idempotent.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faqs jsonb;

CREATE OR REPLACE FUNCTION public.valid_profile_faqs(faqs jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT faqs IS NULL OR (
    jsonb_typeof(faqs) = 'array'
    AND jsonb_array_length(faqs) <= 10
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(faqs) AS f
      WHERE jsonb_typeof(f) <> 'object'
         OR coalesce(jsonb_typeof(f -> 'q'), '') <> 'string'
         OR coalesce(jsonb_typeof(f -> 'a'), '') <> 'string'
         OR char_length(f ->> 'q') NOT BETWEEN 1 AND 200
         OR char_length(f ->> 'a') NOT BETWEEN 1 AND 1500
    )
  )
$$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_faqs_valid;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_faqs_valid CHECK (public.valid_profile_faqs(faqs));
