begin;

create or replace function private.prevent_self_profile_contact_change()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if (select auth.uid()) = old.id
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

drop trigger if exists prevent_self_profile_contact_change on public.profiles;
create trigger prevent_self_profile_contact_change
before update of email, phone on public.profiles
for each row
execute function private.prevent_self_profile_contact_change();

commit;