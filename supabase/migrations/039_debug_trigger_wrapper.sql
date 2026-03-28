-- Debug: replace trigger with error-logging wrapper to capture the exact error
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role text;
  profile_role user_role;
  base_username text;
  final_username text;
  attempts int := 0;
  err_msg text;
  err_detail text;
  err_hint text;
  err_context text;
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
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts >= 5 THEN
        RAISE EXCEPTION 'Could not generate unique username for %', new.email;
      END IF;
      final_username := base_username || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS
        err_msg = MESSAGE_TEXT,
        err_detail = PG_EXCEPTION_DETAIL,
        err_hint = PG_EXCEPTION_HINT,
        err_context = PG_EXCEPTION_CONTEXT;
      RAISE EXCEPTION 'Profile insert failed: % | detail: % | hint: % | context: %',
        err_msg, err_detail, err_hint, err_context;
    END;
  END LOOP;

  RETURN new;
END;
$$;
