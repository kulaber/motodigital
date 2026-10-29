-- SECURITY DEFINER functions bypass RLS, and PostgREST exposes every function
-- the API roles may execute at /rest/v1/rpc/<name>.
-- (advisor: anon/authenticated_security_definer_function_executable)

-- insert_notification is only called from the SECURITY DEFINER notify_on_*
-- triggers, which run as the owner. Exposed via /rpc, anyone — even signed
-- out — could write notifications into any user's inbox.
revoke execute on function public.insert_notification(uuid, uuid, text, text, uuid) from public, anon, authenticated;

-- Trigger functions can't be called via /rpc, and firing a trigger needs no
-- EXECUTE privilege — revoke so they're not exposed at all.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and p.prorettype = 'trigger'::regtype
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.signature);
  end loop;
end
$$;
