# AHT Project Management & Customer Portal — Implementation Specification

**Status:** Project schema, RLS, private Storage, and policy/index hardening are applied to the live Supabase project. Admin, staff, and customer project pages are implemented in GitHub; end-to-end identity-based isolation tests remain pending.  
**Repository:** `secretzoneoffical-collab/ahttechnology-website`  
**Supabase project:** `mdvxbvaasspxqusrvfiq`  
**Scope:** Internal AHT project operations and isolated customer self-service portal.

## 1. Current verified baseline

The live public schema currently contains only:
- `profiles`: Auth-linked user profile and application role (`admin`, `staff`, `customer`).
- `customers`: CRM customer/company record; it has no Auth user mapping.
- `service_requests`: Website inquiries, optionally linked to a CRM customer.

All three core tables have RLS enabled. The project implementation now adds `customer_users`, `projects`, `project_team`, `project_stages`, `project_tasks`, `project_updates`, and `project_files`, all with RLS enabled. The live `auth.users` table had zero users at the time of the initial audit; no production test users have been created.

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

## 5. Implemented application layer\n\nThe repository now includes an Admin project list/create page, project detail management for status/progress, stages, tasks, team assignment, updates, and private-file upload; a customer/staff dashboard; customer account linking on the CRM customer detail page; and a customer project detail page with visible milestones, tasks, updates, and signed document links. These pages depend on the live project schema and use Supabase RLS for access control. Their end-to-end behavior still requires authenticated admin, staff, and customer test accounts.\n\n## 6. Migration draft status

Repository migration drafts: `supabase/migrations/20261117190000_create_project_management_foundation.sql` (project/customer-link tables, indexes, private authorization helpers, grants, and RLS policies) and `supabase/migrations/20261117193000_private_project_file_storage.sql` (private bucket and Storage object policies). The live Supabase database was queried after the commit and still has none of these seven tables; the migration has **not** been applied. This is deliberate because the repository still lacks six historical migration files from the live migration ledger. Review the draft and reconcile migration history before applying it.

## 7. Implementation sequence

1. **Data model and access design** — this document.
2. **Database migration** — add the tables, constraints, indexes, RLS policies, and private Storage bucket/policies in a reviewed migration.
3. **Admin project management** — project list/detail/create/edit, customer link, staff assignment, stages, tasks, updates, files.
4. **Customer portal** — project list/detail and customer-visible timeline/tasks/files.
5. **Staff workspace** — assigned project and task views.
6. **Isolation tests** — two customers must never read each other's project data; unassigned staff and inactive accounts must be denied; verify Storage separately.
7. **CI and fresh-database migration test** — do not claim deployability until migrations reproduce the schema on a clean environment.

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
