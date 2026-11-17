-- Public self-registration with server-enforced account types.
-- Customer: active immediately. Staff: pending administrator approval.
begin;

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('active', 'pending', 'suspended'));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_role text;
  initial_status text;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'account_type' in ('customer', 'staff')
      then new.raw_user_meta_data ->> 'account_type'
    else 'customer'
  end;

  initial_status := case
    when requested_role = 'staff' then 'pending'
    else 'active'
  end;

  insert into public.profiles (id, full_name, avatar_url, role, status)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    null,
    requested_role,
    initial_status
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create or replace function private.admin_update_profile_access(
  target_user_id uuid,
  new_role text,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  affected_rows integer;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if target_user_id is null
     or target_user_id = auth.uid()
     or new_role not in ('customer', 'staff')
     or new_status not in ('active', 'pending', 'suspended')
     or (new_status = 'pending' and new_role <> 'staff') then
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
$function$;

revoke all on function private.admin_update_profile_access(uuid, text, text) from public, anon;
grant execute on function private.admin_update_profile_access(uuid, text, text) to authenticated;

commit;
