# Supabase Migration & Schema Audit

**Project:** `mdvxbvaasspxqusrvfiq`  
**Repository branch checked:** `main`  
**Audit date:** 2026-11-17  
**Purpose:** Record the live database inventory and migration-history discrepancy without changing the live database.

## Executive finding

The Supabase migration ledger contains seven applied migration records, while the repository currently tracks only one SQL file under `supabase/migrations/`.

The tracked file is:

- `20261117173800_secure_admin_profile_access.sql`

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
