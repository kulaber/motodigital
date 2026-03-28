-- Cleanup: remove temporary debug functions
DROP FUNCTION IF EXISTS public.debug_profile_columns();
DROP FUNCTION IF EXISTS public.debug_trigger_source();
DROP FUNCTION IF EXISTS public.debug_auth_triggers();
DROP FUNCTION IF EXISTS public.debug_function_info();
DROP FUNCTION IF EXISTS public.debug_test_profile_insert();
