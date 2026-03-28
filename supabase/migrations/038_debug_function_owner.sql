-- Debug: check function owner, schema, and all handle_new_user functions
CREATE OR REPLACE FUNCTION public.debug_function_info()
RETURNS TABLE(schema_name text, func_name text, owner_name text, security_type text)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT n.nspname::text, p.proname::text, r.rolname::text,
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  JOIN pg_roles r ON p.proowner = r.oid
  WHERE p.proname = 'handle_new_user';
$$;

-- Debug: try to simulate what the trigger does (test insert with a fake UUID)
CREATE OR REPLACE FUNCTION public.debug_test_profile_insert()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  err_msg text;
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    gen_random_uuid(),
    'debug_test_' || substr(gen_random_uuid()::text, 1, 8),
    'Debug Test',
    NULL,
    'rider'::user_role
  );
  RETURN 'SUCCESS';
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS err_msg = MESSAGE_TEXT;
  RETURN 'ERROR: ' || err_msg;
END;
$$;
