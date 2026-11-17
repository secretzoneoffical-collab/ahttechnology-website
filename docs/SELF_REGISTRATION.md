# AHT Self-Registration and Account Approval

## Public registration

The registration page is `/signup`. Users choose one of two account types:

- **Customer:** account profile status is set to `active` by the database trigger. A phone number is required. The trigger creates a CRM customer record with source `website` and status `prospect`, then creates the matching `customer_users` relationship.
- **Staff:** profile status is set to `pending`. A phone number is optional. Pending staff cannot access the staff workspace or project details.

The browser sends the requested account type as Auth user metadata, but the database trigger accepts only `customer` or `staff`. Any other value, including `admin`, becomes `customer`. The browser never receives a privileged database key.

## Administrator approval

The Admin reviews new applicants at `/admin/users`. The table includes name, email, phone, requested role, status, and registration date.

- Set a pending staff account to **active** to approve it.
- Set it to **suspended** to keep access blocked.
- The Team directory at `/admin/team` shows staff contact details and pending/active/suspended counts.

The update action verifies the current user through the server-side `requireAdmin()` guard and calls the restricted database function `admin_update_profile_access`. Admin accounts cannot be self-selected or edited from this page.

## Access boundaries

- Pending or suspended accounts are blocked from the dashboard.
- Project detail pages independently require an active profile.
- Staff project access remains limited to assigned projects and tasks.
- Customer project access remains limited to the CRM customer record linked through `customer_users` and customer-visible project data.
- A database trigger prevents users from changing their own profile role or status.

## Email confirmation

Customer profile activation and Supabase Auth email confirmation are separate controls. A customer profile is created as active, but if Supabase Email confirmation is enabled, the user must confirm their email before receiving a session and signing in. Staff remain pending even after email confirmation until an Admin approves them.

The connected project tools do not expose the live Auth provider confirmation/SMTP settings. Verify the Email provider's confirmation requirement, Site URL, allowed redirect URLs, and delivery configuration in the Supabase Dashboard before public launch.

## Database migrations

- `20261117175030_customer_staff_self_registration.sql`: introduces the pending status and server-enforced account type.
- `20261117181554_customer_signup_crm_link.sql`: creates CRM customer records and portal links for customer signups.
- `20261117181700_profile_contact_details_for_staff_approval.sql`: stores email/phone on profiles, backfills existing Auth users, and syncs email changes.

The three migrations are applied to the live Supabase project. Their tracked filenames match the current migration ledger.

## Verification status

Verified:
- The Auth user creation trigger is installed.
- Its live function sets customer accounts active and staff accounts pending.
- Customer signup writes the CRM customer and `customer_users` link in the same database transaction.
- Profile role/status self-change protection is installed.
- Admin and Team pages now display applicant contact details.

Not yet verified with real test identities:
- End-to-end customer signup and email confirmation.
- End-to-end staff signup, pending denial, and Admin approval.
- Customer project isolation and staff assignment restrictions with separate test accounts.

No test accounts were created as part of this implementation.
