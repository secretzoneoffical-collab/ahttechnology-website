# AHT — Ali Hany Technology

Official bilingual website and customer portal for AHT — Business Systems & IT Solutions.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase Auth and PostgreSQL
- Supabase SSR cookie-based sessions

## Local development

1. Install Node.js (LTS).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local`.
4. Set the Supabase project URL and publishable key in `.env.local`.
5. Start the development server:

   ```bash
   npm run dev
   ```

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Only the Supabase publishable key belongs in browser-accessible environment variables. Never commit a secret/service_role key.

## Current implementation

- Full English/Arabic language switcher shared across public pages, with persistent browser preference and localized navigation, home, about, services, and contact form
- Service catalogue covering AHT's eight approved service groups
- Public service inquiry form connected to Supabase PostgreSQL
- Admin-only service request inbox at `/admin/requests` with status updates, internal notes, and last-contact timestamps
- CRM customer directory at `/admin/customers`, customer profiles, lead conversion from service requests, customer status, internal notes, and linked request history
- Staff directory at `/admin/team` and admin-only role/status management for existing accounts at `/admin/users`; Admin accounts cannot be changed through the UI
- Responsive AHT design foundation
- Supabase browser and server clients
- Session refresh through the Next.js root proxy
- Email/password sign-in
- Password recovery and update flow
- Protected dashboard for Admin, Staff, and Customer roles
- Admin project management: project creation, CRM customer linking, progress, stages, tasks, team assignment, updates, and private document uploads
- Staff workspace: assigned projects, assigned-task status updates, and internal project notes
- Customer project portal: customer-visible milestones, tasks, progress updates, and signed private-file downloads
- Sign-out route

## Important setup notes

- The Supabase `public.profiles` table and its row-level security policies are provisioned in the connected project.
- The Supabase `public.service_requests` table accepts only the contact fields needed for a new website inquiry; public reads are blocked, while active admins can review, update, and link requests to customer records.
- The Supabase `public.customers` table is admin-only under RLS, with unique normalized email addresses to reduce duplicate customer profiles.
- The service request table uses RLS, column-level insert grants, input length constraints, and admin-only read/update policies.
- Project records use RLS across seven project tables. Customer visibility is enforced by database policies, not only by UI filtering.
- Project documents are stored in a private Storage bucket (`aht-project-files`) with short-lived signed download URLs. Storage writes/deletes are currently Admin-only.
- Configure the Supabase Auth Site URL and allowed redirect URLs for the eventual deployment origin before testing password recovery.
- Public self-registration is intentionally not implemented.
- No administrator account is created by this repository.
- GitHub Actions runs ESLint, TypeScript, and production build checks on pushes and pull requests to `main`.
- The live Supabase project has the Project Management schema, RLS, private Storage, and policy hardening applied. See [the project implementation specification](docs/PROJECT_MANAGEMENT_SPEC.md).
- Six legacy migration files are still missing from the repository; see [migration recovery notes](docs/LEGACY_MIGRATION_RECOVERY.md). This is a fresh-install reproducibility gap, not a missing schema on the live project.
- Cross-customer isolation tests still require controlled test identities in a non-production environment.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` locally before release.


## First administrator setup

The first Admin is intentionally not created automatically. Follow [the secure bootstrap guide](docs/ADMIN_BOOTSTRAP.md) as the Supabase project owner after creating the intended Auth user.
