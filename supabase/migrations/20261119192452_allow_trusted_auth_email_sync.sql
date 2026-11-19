begin;

-- Direct authenticated profile edits must not spoof contact details.
-- Trusted SECURITY DEFINER Auth synchronization runs under its function owner
-- and is allowed to keep profiles.email aligned with auth.users.email.
create or replace function private.prevent_self_profile_contact_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if (select auth.uid()) = old.id
     and current_user = 'authenticated'
     and (
       new.email is distinct from old.email
       or new.phone is distinct from old.phone
     ) then
    raise exception 'Users cannot change their own profile contact details directly';
  end if;

  return new;
end;
$function$;

revoke all on function private.prevent_self_profile_contact_change() from public, anon, authenticated;

commit;