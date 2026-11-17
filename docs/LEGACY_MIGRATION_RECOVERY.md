# Legacy Supabase Migration Recovery

**Project:** `mdvxbvaasspxqusrvfiq`
**Checked:** 2026-11-17
**Status:** Live migration ledger verified; four project-portal migrations are now tracked at their exact applied versions.

## Applied versions currently present in Supabase

| Version | Name | Repository file |
|---|---|---|
| 20261117145226 | lock_down_internal_security_definer_functions | Missing — legacy |
| 20261117145302 | move_admin_helper_to_private_schema | Missing — legacy |
| 20261117151038 | create_public_service_requests | Missing — legacy |
| 20261117151331 | add_service_request_follow_up_fields | Missing — legacy |
| 20261117152011 | enable_admin_staff_role_management | Missing — legacy |
| 20261117152058 | consolidate_profile_update_policies | Missing — legacy |
| 20261117153944 | secure_admin_profile_access | `supabase/migrations/20261117153944_secure_admin_profile_access.sql` |
| 20261117163107 | create_project_management_foundation | `supabase/migrations/20261117163107_create_project_management_foundation.sql` |
| 20261117163111 | private_project_file_storage | `supabase/migrations/20261117163111_private_project_file_storage.sql` |
| 20261117163133 | project_portal_policy_performance | `supabase/migrations/20261117163133_project_portal_policy_performance.sql` |
| 20261117163157 | admin_only_project_storage_uploads | `supabase/migrations/20261117163157_admin_only_project_storage_uploads.sql` |

The first six versions were already applied before the project portal work but their SQL files are absent from the repository. Their exact historical SQL must not be invented from migration names. The first core tables and some functions also predate the tracked migration history, so the ledger alone is not a fresh-database bootstrap.

## What has been reconciled

- The final legacy admin-access migration file was renamed to match its live version `20261117153944`.
- All four project portal migration files were renamed to match the exact versions returned by the live Supabase migration ledger.
- The project portal schema, RLS policies, triggers, and Storage policies were applied using Supabase's migration operation and are present in the live ledger.
- No project data or Auth users were seeded.
- No Vercel deployment or configuration was performed.

## Verified live project portal state

- Seven new public tables exist: `customer_users`, `projects`, `project_team`, `project_stages`, `project_tasks`, `project_updates`, and `project_files`.
- RLS is enabled on all seven.
- The `aht-project-files` bucket exists and is private, with a 15 MiB limit and an explicit MIME allowlist.
- Storage object reads require a matching project file record and the caller's project/customer visibility permission.
- Storage writes and deletes are restricted to active admins.
- Staff can read projects assigned to them and update only tasks assigned to their own user ID. Database triggers prevent staff from changing task ownership, project ownership, task visibility, or cross-project stage references.
- Customers can read only projects mapped to their CRM customer, plus customer-visible stages, tasks, updates, and files.
- Supabase Security Advisor returned zero findings after the changes.
- Performance Advisor no longer reports unindexed foreign keys, auth-initplan policy warnings, or multiple permissive policy warnings. It reports unused indexes, which is expected before project data is populated.

## Safe next steps

1. Recover the original six legacy SQL files from the original authoring environment, a local backup, or another repository copy.
2. Compare the recovered SQL with the live catalog before committing it. Do not replay those already-applied migrations against this project.
3. Produce and review a separate, clearly labelled baseline for fresh Supabase projects. A baseline must include the pre-ledger core schema and must not be applied to this live project.
4. Run migration replay on a disposable development database after a cost-free or explicitly approved test environment is available.
5. Create controlled Admin, Staff, Customer A, and Customer B identities in a non-production environment and execute the isolation test plan in `docs/PROJECT_PORTAL_SECURITY_TEST_PLAN.md`.

## Important distinction

The live Supabase project has the project portal schema installed. The repository's legacy migration history is still incomplete, so a clean database replay is not yet certified. This does not undo the applied project migrations; it is a separate source-control/reproducibility issue.
