# Supabase Migration & Schema Audit

> **Historical snapshot note:** Sections below document the initial audit before Project Management was added. See the follow-up at the end for the current live schema and migration state.

**Project:** `mdvxbvaasspxqusrvfiq`  
**Repository branch checked:** `main`  
**Audit date:** 2026-11-17  
**Purpose:** Record the live database inventory and migration-history discrepancy without changing the live database.

## Executive finding

The Supabase migration ledger contains seven applied migration records, while the repository currently tracks only one SQL file under `supabase/migrations/`.

The tracked file is:

- `20261117153944_secure_admin_profile_access.sql`

The latest ledger record is:

- Version: `20261117153944`
- Name: `secure_admin_profile_access`

The logical migration name matches, but the version/timestamp does not. The GitHub path history query returned only the currently tracked migration file; it did not reveal the other six SQL files. Therefore, the tracked file must **not** be assumed to be an exact reconstruction of the ledger's latest migration, and the six missing migrations must not be recreated from their names alone.

## Applied migration ledger (Supabase)

| Version | Name |
|---|---|
| `20261117145226` | `lock_down_internal_security_definer_functions` |
| `20261117145302` | `move_admin_helper_to_private_schema` |
| `20261117151038` | `create_public_service_requests` |
| `20261117151331` | `add_service_request_follow_up_fields` |
| `20261117152011` | `enable_admin_staff_role_management` |
| `20261117152058` | `consolidate_profile_update_policies` |
| `20261117153944` | `secure_admin_profile_access` |

## Live schema inventory

The inspected application schemas contain three tables. RLS is enabled on all three.

| Table | Purpose / key observations |
|---|---|
| `public.profiles` | Profile linked to `auth.users(id)`; roles are `admin`, `staff`, `customer`; statuses are `active`, `suspended`. |
| `public.service_requests` | Public website inquiry intake plus admin follow-up fields; status values include `new`, `contacted`, `qualified`, `closed`, `spam`; source is constrained to `website`. |
| `public.customers` | Customer/company records with type, status, source, contact details, and notes. |

### RLS policies observed

- `profiles_select_own_or_admin`: authenticated users can read their own profile; active admins can read profiles under the policy predicate.
- `profiles_update_self_or_admin`: self-update and admin-update paths are constrained by row predicates and role/status checks.
- `customers_admin_insert`, `customers_admin_select`, `customers_admin_update`: customer operations are limited to authenticated admins.
- `service_requests_public_insert`: `anon` and `authenticated` can submit rows only when status is `new` and source is `website`.
- `service_requests_admin_select`, `service_requests_admin_update`: reading and updating requests are restricted to authenticated admins.

### Functions observed

- `private.is_admin()`: stable SQL SECURITY DEFINER helper; returns true only for the current user's active admin profile.
- `private.admin_update_profile_access(uuid,text,text)`: PL/pgSQL SECURITY DEFINER function; checks the caller is an active admin, prevents self-change and admin-target changes, and validates role/status values.
- `public.admin_update_profile_access(uuid,text,text)`: SQL invoker wrapper around the private helper.
- `private.prevent_self_profile_access_change()`: trigger function preventing a user from changing their own role or status.
- `public.handle_new_auth_user()`: creates a customer profile from a newly inserted auth user and uses fixed server-side role/status values.
- `public.set_profile_updated_at()`: updates the profile timestamp.
- `public.rls_auto_enable()`: event-trigger function that attempts to enable RLS on newly created public tables.

### Triggers observed in the inspected application schemas

- `profiles.prevent_self_profile_access_change`
- `profiles.profiles_set_updated_at`

The trigger inventory query was scoped to `public` and `private`; it does not establish whether an auth-schema trigger is installed.

### Indexes and constraints

The live catalog inspection returned the expected primary keys, profile-to-auth foreign key, service-request-to-customer foreign key, table check constraints, and supporting indexes for customer name/status/email and service-request date/status/customer/follow-up lookup.

### Table grants observed

- `authenticated`: SELECT on profiles and service_requests; INSERT/SELECT/UPDATE on customers. Row-level policies further constrain access.
- `anon`: no table-level SELECT/UPDATE grants were returned for these application tables. The public request form's INSERT access is governed by its column grants and RLS policy; do not infer public read access.
- `service_role`: broad table privileges, as expected for the privileged server role.
- `postgres`: owner-level privileges.

## What this audit does not claim

- It is not a full schema dump or a deployable baseline migration.
- It does not reconstruct the missing six migration SQL files.
- It does not prove that every auth setting, auth-schema trigger, storage policy, or runtime flow has been tested.
- It does not certify the contents of the migration ledger from SQL source; the ledger provides version/name records, not the original SQL bodies.

## Safe recovery plan

1. Preserve the seven ledger records as the authoritative applied-version list.
2. Recover the original six missing SQL files from the original authoring environment, backups, or another repository copy if available.
3. Compare each recovered file with the live catalog and ledger before adding it to version control.
4. Resolve the version mismatch for the tracked `secure_admin_profile_access` file by comparing its exact SQL with the live database definition and the recorded migration source.
5. Only after the full schema is exported and reviewed, create a clearly labelled baseline for fresh environments. Do not replay a baseline against this live project.
6. Run CI and a fresh-environment migration test before declaring migration reproducibility complete.

**Live database changes made during this audit:** None. All database queries in this audit were read-only.


## Authentication configuration and flow review (2026-11-17)

### Verified from repository code

- There is no application sign-up or registration page in the `app/` route tree. The visible authentication routes are login, password recovery, password update, callback, and sign-out.
- Login uses `signInWithPassword`; it does not create accounts.
- Login and callback redirect handling reject values that do not start with a single slash and reject backslashes, preventing common protocol-relative and backslash-based open redirects.
- Password recovery sends users to `/auth/callback?next=/update-password`.
- The callback exchanges the PKCE code for a session before redirecting.
- The update-password page asks for at least 8 characters in the browser. This is client-side validation only; the authoritative minimum and complexity rules must be configured in Supabase Auth.
- The root proxy calls `getClaims()` immediately after creating the Supabase server client, following the current SSR session-refresh pattern.
- Sign-out is a POST route and redirects to `/login`.

### Verified from the live database

- `auth.users` currently contains **0 users**. Therefore no real login, recovery, MFA enrollment, or admin bootstrap flow has yet been exercised against an actual account.
- No verified MFA factors are currently present. This does not prove that MFA is disabled at the project configuration level.
- An `AFTER INSERT` trigger named `on_auth_user_created` exists on `auth.users`.
- The trigger calls `public.handle_new_auth_user()`, a SECURITY DEFINER function with an empty search_path. It creates a profile with fixed `role='customer'` and `status='active'`; user metadata is used only for full name and avatar. It does not promote new users to admin.

### Configuration not exposed by the connected read-only project tools

The available project/database tools do not expose the live Auth dashboard configuration for:
- Allow-new-user-signups / invite-only mode
- Email confirmation requirement and SMTP delivery configuration
- Site URL and exact allowed redirect URL list
- Minimum password length, complexity, and leaked-password protection
- Session timeouts, refresh-token rotation, and inactivity limits
- MFA enrollment policy and required assurance level
- Auth rate limits and CAPTCHA/bot protection

These settings must be checked in Supabase Dashboard under Authentication. They have **not** been changed by this audit.

### Required manual dashboard verification before launch

1. If AHT customer accounts are invite-only, disable public signups under Authentication > Providers > Email (confirm the exact current dashboard label).
2. Set the production Site URL and allow only exact trusted callback URLs; retain localhost only for development. Avoid broad wildcards in production.
3. Set minimum password length to at least 8 (prefer 12 or more where appropriate) and enable the strongest practical password rules. Enable leaked-password protection if the plan supports it.
4. Require email confirmation if the account onboarding process depends on verified email delivery; test SMTP and recovery delivery.
5. Review session lifetime, inactivity timeout, refresh-token rotation, and MFA policy. Consider requiring MFA for admin accounts.
6. Review built-in Auth rate limits and enable CAPTCHA/anti-bot protection if public auth endpoints are exposed.

### Remaining runtime tests

After creating a controlled test account and confirming the intended signup policy:
- Test valid and invalid login.
- Test direct access to `/admin` and `/dashboard` while logged out.
- Test active customer, inactive customer, staff, and admin access boundaries.
- Test password recovery end-to-end, including expired/reused links.
- Test sign-out and verify the old session no longer authorizes protected routes.
- Test redirect inputs such as `//attacker.example`, `/\\\\attacker.example`, and external absolute URLs.
- Test that a newly created auth user receives only a customer profile and cannot reach admin functionality.

**Auth configuration changes made during this audit:** None. **Auth users created:** None. **Live database changes:** None.


## Follow-up: Project Portal applied to live Supabase (2026-11-17)

The six project-portal migrations have since been applied successfully to the live Supabase project. Current ledger entries now include:

- `20261117163107_create_project_management_foundation`
- `20261117163111_private_project_file_storage`
- `20261117163133_project_portal_policy_performance`
- `20261117163157_admin_only_project_storage_uploads`
- `20261117164416_validate_project_memberships`
- `20261117164631_restrict_staff_task_edits`

The following seven tables are now present in `public`, all with RLS enabled:
`customer_users`, `projects`, `project_team`, `project_stages`, `project_tasks`, `project_updates`, and `project_files`.

The private Storage bucket `aht-project-files` is present with a 15 MiB file limit and an allowlist for PDF, JPEG, PNG, WebP, TXT, DOCX, and XLSX. The bucket is not public. Object writes and deletes are restricted to active admins. Reads require a matching project-file metadata row and project-level authorization.

Additional authorization hardening:
- Staff can read only projects assigned to them and may update only task status/completion fields on tasks assigned to their own account.
- Database triggers enforce active customer and staff membership, ensure task assignees belong to the project team, and clear task assignments when a team member is removed.
- Staff task updates are restricted to tasks assigned to their own user ID.
- Database triggers prevent staff from changing task project ownership, assignee, customer visibility, or creator, and prevent a task from referencing a stage belonging to another project.
- Customer access is mapped through `customer_users` and customer-visible flags.
- Customer accounts cannot read the project team roster.
- Task creation and project-file metadata creation are admin-only. Staff-created project updates must remain internal.

Verification after application:
- All seven project portal tables report RLS enabled.
- Anonymous role has no table SELECT privileges on projects, tasks, or files and cannot execute project authorization helpers.
- Authenticated role has EXECUTE on the authorization helper.
- Supabase Security Advisor returned zero findings.
- Performance Advisor no longer reports missing FK indexes, repeated auth-initplan evaluation, or multiple permissive policies. Remaining unused-index notices are informational and expected while the new project tables are empty.

No Auth users or project records were created during this implementation. Therefore cross-customer runtime isolation still requires controlled test identities in a non-production environment.

The first six legacy migration SQL files remain missing from GitHub. The current ledger-to-file alignment and recovery plan are documented in `docs/LEGACY_MIGRATION_RECOVERY.md`. The project portal migrations are tracked using their exact live version numbers.


**Legacy source caveat:** The final legacy migration filename now uses the exact live ledger version `20261117153944`, but its SQL body has not been independently verified against the original applied source. The first six legacy migration files are still missing. The six Project Portal migrations, by contrast, were applied from the tracked SQL and their filenames now match the resulting live ledger versions.
