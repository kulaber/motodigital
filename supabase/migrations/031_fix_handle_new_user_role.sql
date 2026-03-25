-- ============================================================
-- Fix: handle_new_user trigger must persist role from metadata
-- Previously the role was never written → all new users got
-- the default 'rider' regardless of what they selected.
-- ============================================================

-- Ensure 'custom-werkstatt' is a valid enum value
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'custom-werkstatt';

-- Replace trigger function to also save role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  meta_role text;
  profile_role user_role;
BEGIN
  meta_role := new.raw_user_meta_data->>'role';

  profile_role := CASE meta_role
    WHEN 'custom-werkstatt' THEN 'custom-werkstatt'::user_role
    WHEN 'rider'            THEN 'rider'::user_role
    ELSE                         'rider'::user_role
  END;

  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    profile_role
  );
  RETURN new;
END;
$$;
