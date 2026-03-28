-- Temporary debug: check NOT NULL columns on profiles
-- This migration creates a helper function to diagnose the trigger issue
CREATE OR REPLACE FUNCTION public.debug_profile_columns()
RETURNS TABLE(column_name text, is_nullable text, column_default text)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT column_name::text, is_nullable::text, column_default::text
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
  ORDER BY ordinal_position;
$$;

-- Debug: return trigger function source
CREATE OR REPLACE FUNCTION public.debug_trigger_source()
RETURNS text LANGUAGE sql SECURITY DEFINER AS $$
  SELECT p.prosrc FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'handle_new_user' AND n.nspname = 'public'
  LIMIT 1;
$$;

-- Debug: check triggers on auth.users
CREATE OR REPLACE FUNCTION public.debug_auth_triggers()
RETURNS TABLE(trigger_name text, event_manipulation text, action_statement text)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT t.trigger_name::text, t.event_manipulation::text, t.action_statement::text
  FROM information_schema.triggers t
  WHERE t.event_object_schema = 'auth' AND t.event_object_table = 'users';
$$;
