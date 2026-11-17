revoke update (role, status) on table public.profiles from authenticated;

create or replace function private.admin_update_profile_access(
  target_user_id uuid,
  new_role text,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if target_user_id is null
     or target_user_id = auth.uid()
     or new_role not in ('customer', 'staff')
     or new_status not in ('active', 'suspended') then
    raise exception 'Invalid profile access update' using errcode = '22023';
  end if;

  update public.profiles
     set role = new_role,
         status = new_status,
         updated_at = now()
   where id = target_user_id
     and role <> 'admin';

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Target profile not found or protected' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function private.admin_update_profile_access(uuid, text, text) from public, anon;
grant execute on function private.admin_update_profile_access(uuid, text, text) to authenticated;

create or replace function public.admin_update_profile_access(
  target_user_id uuid,
  new_role text,
  new_status text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.admin_update_profile_access(target_user_id, new_role, new_status);
$$;

revoke all on function public.admin_update_profile_access(uuid, text, text) from public, anon;
grant execute on function public.admin_update_profile_access(uuid, text, text) to authenticated;
