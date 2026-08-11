-- Harden helper functions flagged by Supabase security advisors.
-- Keep in sync with remote migration harden_security_definer_helpers.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon, authenticated;
grant execute on function public.is_admin() to authenticated, service_role;

revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.is_company_member(uuid) from anon, authenticated;
grant execute on function public.is_company_member(uuid) to authenticated, service_role;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
