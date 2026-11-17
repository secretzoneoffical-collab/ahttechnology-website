# First Admin Account Bootstrap

The AHT website intentionally does not create an administrator automatically and does not expose public sign-up. The first administrator must be provisioned manually by the Supabase project owner.

## Before you start

- Confirm that you are signed in to the correct Supabase project: `mdvxbvaasspxqusrvfiq`.
- Choose the exact email address that will own the first AHT administrator account.
- Do not share passwords, access tokens, or service-role keys with anyone.

## Step 1 — Create the account

1. Open **Supabase Dashboard → Authentication → Users**.
2. Use **Add user** to create the account with the intended administrator email and a strong temporary password.
3. Confirm the email in the dashboard if the project requires email confirmation.
4. The database trigger `on_auth_user_created` should create a matching row in `public.profiles` with the default role `customer`.

Do not enable public sign-up just to create this first account.

## Step 2 — Verify the profile exists

In **SQL Editor**, run this read-only query after replacing the email:

```sql
select
  u.id,
  u.email,
  p.role,
  p.status
from auth.users as u
left join public.profiles as p on p.id = u.id
where lower(u.email) = lower('YOUR_ADMIN_EMAIL');
```

Confirm that exactly one user is returned and that a profile exists. If the profile is missing, stop and investigate the auth trigger before continuing.

## Step 3 — Promote the intended account

Only after confirming the exact email and profile, run this statement in the Supabase SQL Editor as the project owner:

```sql
update public.profiles as p
set
  role = 'admin',
  status = 'active',
  updated_at = now()
from auth.users as u
where p.id = u.id
  and lower(u.email) = lower('YOUR_ADMIN_EMAIL')
returning p.id, p.full_name, p.role, p.status;
```

Check that exactly one row is returned and that its role is `admin` and status is `active`. If zero or more than one row is affected, stop and verify the account instead of broadening the query.

## Step 4 — Test access

1. Sign in through `/login` using that account.
2. Confirm that `/dashboard` displays the Admin link.
3. Open `/admin` and verify the dashboard, requests, customers, users, and team pages.
4. Sign out and confirm that protected pages redirect unauthenticated visitors to login.

## Security notes

- This is a one-time owner-operated bootstrap procedure. The website does not provide a public way to create or promote an Admin.
- The Admin role must not be assigned to an unverified email or a shared mailbox.
- Never put a Supabase `service_role` key in browser code, GitHub source files, or public environment variables.
- Existing RLS policies and server-side checks continue to enforce access after bootstrap.
- Staff/customer access can be managed from **Admin → Users & Permissions** after the first Admin signs in.
