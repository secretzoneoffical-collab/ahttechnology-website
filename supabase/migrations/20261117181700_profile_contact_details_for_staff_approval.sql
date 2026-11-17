begin;

alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text;

update public.profiles p
set email = lower(u.email),
    phone = nullif(btrim(u.raw_user_meta_data ->> 'phone'), '')
from auth.users u
where u.id = p.id
  and (p.email is distinct from lower(u.email)
       or p.phone is distinct from nullif(btrim(u.raw_user_meta_data ->> 'phone'), ''));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_role text;
  initial_status text;
  customer_name text;
  customer_phone text;
  new_customer_id uuid;
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

  customer_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  customer_phone := nullif(btrim(new.raw_user_meta_data ->> 'phone'), '');

  insert into public.profiles (id, full_name, avatar_url, email, phone, role, status)
  values (
    new.id,
    customer_name,
    null,
    lower(new.email),
    customer_phone,
    requested_role,
    initial_status
  )
  on conflict (id) do nothing;

  if requested_role = 'customer' then
    if customer_name is null
       or char_length(customer_name) < 2
       or char_length(customer_name) > 160
       or customer_phone is null
       or char_length(customer_phone) < 7
       or char_length(customer_phone) > 30 then
      raise exception 'Customer registration requires a valid name and phone number'
        using errcode = '22023';
    end if;

    insert into public.customers (
      customer_type,
      full_name,
      email,
      phone,
      status,
      source
    )
    values (
      'individual',
      customer_name,
      lower(new.email),
      customer_phone,
      'prospect',
      'website'
    )
    returning id into new_customer_id;

    insert into public.customer_users (customer_id, user_id)
    values (new_customer_id, new.id);
  end if;

  return new;
end;
$function$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  update public.profiles
     set email = lower(new.email)
   where id = new.id;
  return new;
end;
$function$;

revoke all on function public.sync_auth_user_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_auth_user_email();

commit;