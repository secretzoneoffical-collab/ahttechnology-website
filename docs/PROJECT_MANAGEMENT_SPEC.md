# AHT Project Management & Customer Portal — Implementation Specification

**Status:** Project schema, RLS, private Storage, and policy/index hardening are applied to the live Supabase project. Admin, staff, and customer project pages are implemented in GitHub; end-to-end identity-based isolation tests remain pending.  
**Repository:** `secretzoneoffical-collab/ahttechnology-website`  
**Supabase project:** `mdvxbvaasspxqusrvfiq`  
**Scope:** Internal AHT project operations and isolated customer self-service portal.

## 1. Current verified baseline

The original core application tables are:
- `profiles`: Auth-linked user profile and application role (`admin`, `staff`, `customer`).
- `customers`: CRM customer/company record.
- `service_requests`: Website inquiries, optionally linked to a CRM customer.

The live project now also contains seven Project Management tables, all with RLS enabled:
- `customer_users`
- `projects`
- `project_team`
- `project_stages`
- `project_tasks`
- `project_updates`
- `project_files`

The private `aht-project-files` Storage bucket is installed. No production Auth users or project records were created during this implementation; identity-based end-to-end testing remains pending.

## 2. Product behavior

### AHT Admin
- Create and edit projects and link each project to one CRM customer.
- Assign internal staff to a project.
- Manage milestones/stages, tasks, due dates, status, and progress.
- Publish customer-visible progress updates.
- Upload project files and control whether each file is customer-visible.
- See all customers and projects permitted to the active AHT admin role.

### Staff
- See projects explicitly assigned to them.
- Update assigned tasks and add internal work notes.
- Cannot manage customer-account links, project ownership, or admin access.

### Customer
- Sign in to the existing account.
- See only projects belonging to a CRM customer record explicitly linked to their Auth user.
- See customer-visible stages, tasks, progress updates, and files only.
- Cannot see internal notes, hidden tasks, staff-only files, other customers, or unassigned projects.
- No public self-registration is required; customer accounts are provisioned by AHT.

## 3. Proposed relational model

| Table | Purpose | Key relationships |
|---|---|---|
| `customer_users` | Maps one or more Auth users to a CRM customer | `customer_id -> customers.id`, `user_id -> auth.users.id` |
| `projects` | Project master record, status, dates, progress | `customer_id -> customers.id` |
| `project_team` | Internal staff assignments | `project_id -> projects.id`, `user_id -> profiles.id` |
| `project_stages` | Ordered project milestones/phases | `project_id -> projects.id` |
| `project_tasks` | Work items with assignee, dates, status, visibility | `project_id -> projects.id`, optional stage and assignee |
| `project_updates` | Timeline updates / announcements | `project_id -> projects.id`, author -> profiles |
| `project_files` | File metadata and customer visibility | `project_id -> projects.id`, uploader -> profiles |

Use UUID primary keys, foreign keys, created/updated timestamps, constrained status values, and indexes on ownership, project, assignee, and timeline lookup columns. Keep files in a private Supabase Storage bucket; the database row and Storage object policy must enforce the same project/customer authorization.

## 4. Authorization rules

- `admin`: active admins can manage all project records.
- `staff`: active staff can access only projects with a matching `project_team` assignment; write permissions are limited by table and operation.
- `customer`: active customer profiles can read only projects whose `customer_id` is mapped to their `auth.uid()` through `customer_users`.
- Customer-facing reads must additionally filter tasks, updates, and files by their explicit customer-visible flag.
- Customers must not be able to insert or update project ownership, team membership, role/status, progress, or internal notes.
- Every UPDATE policy must include both `USING` and `WITH CHECK`; do not rely on client-side filtering.
- SECURITY DEFINER helpers, if needed, must live in a non-exposed schema, pin an empty/controlled search_path, validate `auth.uid()`, and have explicit EXECUTE grants.
- Storage downloads must use private bucket policies tied to the same project/customer mapping; never expose public object URLs for private project documents.

## 5. Implemented application layer

The repository now includes an Admin project list/create/edit experience, customer account linking on CRM profiles, staff assignment and task assignment, status/progress controls, editable stages/tasks, per-record customer visibility, project updates, and private-file upload/download. The Staff workspace shows assigned projects, lets staff update their assigned tasks, and accepts internal-only notes. The Customer portal shows only customer-visible project information and uses short-lived signed document links. The pages are implemented and the project schema is live; end-to-end identity-based authorization tests still need dedicated test accounts. These pages depend on the live project schema and use Supabase RLS for access control. Their end-to-end behavior still requires authenticated admin, staff, and customer test accounts.

## 6. Live migration status

The following six project migrations are applied to the live Supabase project and tracked in GitHub at their exact live versions:

- `20261117163107_create_project_management_foundation.sql` — seven project/customer-link tables, indexes, authorization helpers, RLS policies, and task-integrity triggers.
- `20261117163111_private_project_file_storage.sql` — private `aht-project-files` bucket and Storage object policies.
- `20261117163133_project_portal_policy_performance.sql` — policy consolidation and foreign-key indexes.
- `20261117163157_admin_only_project_storage_uploads.sql` — restrict Storage writes/deletes to Admin.
- `20261117164416_validate_project_memberships.sql` — active customer/staff membership validation and task-assignee integrity.
- `20261117164631_restrict_staff_task_edits.sql` — staff task updates are limited to status and completion fields.

The first six legacy migration SQL files remain absent from the repository. Do not invent their contents or replay them against the live database. See `docs/LEGACY_MIGRATION_RECOVERY.md`.

## 7. Implementation status

1. **Data model and access design** — completed.
2. **Project schema, RLS, private Storage, and policy hardening** — applied to live Supabase.
3. **Admin project management** — implemented in GitHub.
4. **Customer account linking and portal** — implemented in GitHub.
5. **Staff workspace** — implemented in GitHub.
6. **Security advisor and privilege checks** — verified; Security Advisor returned zero findings.
7. **Cross-customer runtime tests** — pending controlled Admin, Staff, Customer A, and Customer B identities.
8. **Legacy migration recovery and clean-install replay** — pending.

## 8. Safety and rollout constraints

- The project management migrations have been applied to the live Supabase database; future DDL changes must be added as versioned migrations.
- Do not create real customer accounts or test passwords in production during implementation.
- Do not enable public sign-up to support customer onboarding.
- Do not use Vercel during this development phase; finish repository work and CI first.
- The seven legacy migration files are not all present in GitHub; recover the original SQL or create a separately reviewed baseline before claiming fresh-install reproducibility.
- A project portal must not be described as operational until schema, UI, RLS, Storage policies, and cross-customer isolation tests all pass.

## 9. Acceptance criteria

- An active AHT admin can create a project for an existing CRM customer and assign staff.
- A linked customer account can see that project after login.
- A different customer account cannot list, select, update, or download any resource belonging to that project.
- Staff see only assigned projects.
- Customer-visible flags are enforced by RLS and Storage, not merely hidden in React.
- Progress and timeline changes are reflected in the customer portal.
- Inactive users and unauthenticated visitors cannot access protected project resources.
