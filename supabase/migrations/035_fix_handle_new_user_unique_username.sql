-- Fix: handle_new_user() must generate a unique username
-- Previously, duplicate email prefixes (max@gmail.com + max@web.de → "max")
-- caused a UNIQUE violation on profiles.username → "Database error saving new user"
-- Now: try base username first, on collision append random 4-char suffix, retry up to 5 times.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  meta_role text;
  profile_role user_role;
  base_username text;
  final_username text;
  attempts int := 0;
BEGIN
  meta_role := new.raw_user_meta_data->>'role';

  profile_role := CASE meta_role
    WHEN 'custom-werkstatt' THEN 'custom-werkstatt'::user_role
    WHEN 'rider'            THEN 'rider'::user_role
    ELSE                         'rider'::user_role
  END;

  base_username := LOWER(COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  ));

  -- Try base username first, then append random suffix on collision
  final_username := base_username;
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
      VALUES (
        new.id,
        final_username,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        profile_role
      );
      -- Success — exit loop
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts >= 5 THEN
        RAISE EXCEPTION 'Could not generate unique username for %', new.email;
      END IF;
      final_username := base_username || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
    END;
  END LOOP;

  RETURN new;
END;
$$;
