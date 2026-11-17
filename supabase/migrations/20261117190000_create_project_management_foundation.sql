-- AHT Project Management foundation
-- Reviewed repository migration draft. Do NOT apply to the live project until
-- the incomplete historical migration chain has been reconciled and reviewed.

begin;

create table if not exists public.customer_users (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint customer_users_customer_user_key unique (customer_id, user_id),
  constraint customer_users_user_key unique (user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  project_code text not null unique,
  name text not null,
  description text,
  status text not null default 'planned'
    check (status in ('planned','active','on_hold','completed','cancelled')),
  progress_percent smallint not null default 0
    check (progress_percent between 0 and 100),
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_nonempty check (length(btrim(name)) > 0),
  constraint projects_code_nonempty check (length(btrim(project_code)) > 0),
  constraint projects_date_order check (due_date is null or start_date is null or due_date >= start_date)
);

create table if not exists public.project_team (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint project_team_project_user_key unique (project_id, user_id)
);

create table if not exists public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','in_progress','completed','blocked')),
  progress_percent smallint not null default 0
    check (progress_percent between 0 and 100),
  start_date date,
  due_date date,
  completed_at timestamptz,
  customer_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_stages_name_nonempty check (length(btrim(name)) > 0),
  constraint project_stages_date_order check (due_date is null or start_date is null or due_date >= start_date)
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo','in_progress','blocked','done','cancelled')),
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  customer_visible boolean not null default false,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_tasks_title_nonempty check (length(btrim(title)) > 0)
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  body text not null,
  customer_visible boolean not null default false,
  created_at timestamptz not null default now(),
  constraint project_updates_title_nonempty check (length(btrim(title)) > 0),
  constraint project_updates_body_nonempty check (length(btrim(body)) > 0)
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  customer_visible boolean not null default false,
  created_at timestamptz not null default now(),
  constraint project_files_name_nonempty check (length(btrim(file_name)) > 0)
);

create index if not exists customer_users_user_idx on public.customer_users(user_id);
create index if not exists projects_customer_idx on public.projects(customer_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists project_team_user_idx on public.project_team(user_id, project_id);
create index if not exists project_stages_project_order_idx on public.project_stages(project_id, sort_order);
create index if not exists project_tasks_project_status_idx on public.project_tasks(project_id, status);
create index if not exists project_tasks_assignee_idx on public.project_tasks(assigned_to);
create index if not exists project_updates_project_created_idx on public.project_updates(project_id, created_at desc);
create index if not exists project_files_project_created_idx on public.project_files(project_id, created_at desc);

-- Keep task ownership and customer visibility under administrator control.
create or replace function private.guard_project_task_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  if not private.is_admin() and (
    new.project_id is distinct from old.project_id
    or new.assigned_to is distinct from old.assigned_to
    or new.customer_visible is distinct from old.customer_visible
    or new.created_by is distinct from old.created_by
  ) then
    raise exception 'Only an administrator can change task ownership or customer visibility';
  end if;

  if new.stage_id is not null and not exists (
    select 1 from public.project_stages s
    where s.id = new.stage_id and s.project_id = new.project_id
  ) then
    raise exception 'Task stage must belong to the same project';
  end if;

  return new;
end;
$;

create or replace function private.validate_project_task_stage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  if new.stage_id is not null and not exists (
    select 1 from public.project_stages s
    where s.id = new.stage_id and s.project_id = new.project_id
  ) then
    raise exception 'Task stage must belong to the same project';
  end if;
  return new;
end;
$;

revoke all on function private.guard_project_task_update() from public, anon;
revoke all on function private.validate_project_task_stage() from public, anon;

create trigger project_tasks_guard_update
before update on public.project_tasks
for each row execute function private.guard_project_task_update();

create trigger project_tasks_validate_stage
before insert or update of project_id, stage_id on public.project_tasks
for each row execute function private.validate_project_task_stage();

-- SECURITY DEFINER helpers are isolated in the existing private schema.
create or replace function private.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.is_admin()
    or exists (
      select 1
      from public.profiles p
      join public.project_team pt on pt.user_id = p.id
      where p.id = auth.uid()
        and p.status = 'active'
        and p.role = 'staff'
        and pt.project_id = target_project_id
    )
    or exists (
      select 1
      from public.profiles p
      join public.customer_users cu on cu.user_id = p.id
      join public.projects pr on pr.customer_id = cu.customer_id
      where p.id = auth.uid()
        and p.status = 'active'
        and p.role = 'customer'
        and pr.id = target_project_id
    ),
    false
  );
$$;

create or replace function private.is_assigned_project_staff(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.project_team pt on pt.user_id = p.id
    where p.id = auth.uid()
      and p.status = 'active'
      and p.role = 'staff'
      and pt.project_id = target_project_id
  );
$$;

create or replace function private.is_linked_project_customer(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.customer_users cu on cu.user_id = p.id
    join public.projects pr on pr.customer_id = cu.customer_id
    where p.id = auth.uid()
      and p.status = 'active'
      and p.role = 'customer'
      and pr.id = target_project_id
  );
$$;

revoke all on function private.can_access_project(uuid) from public, anon;
revoke all on function private.is_assigned_project_staff(uuid) from public, anon;
revoke all on function private.is_linked_project_customer(uuid) from public, anon;
grant execute on function private.can_access_project(uuid) to authenticated;
grant execute on function private.is_assigned_project_staff(uuid) to authenticated;
grant execute on function private.is_linked_project_customer(uuid) to authenticated;

alter table public.customer_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_team enable row level security;
alter table public.project_stages enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_files enable row level security;

-- Remove direct table access from anonymous users; authenticated access is policy-gated.
revoke all on public.customer_users, public.projects, public.project_team,
  public.project_stages, public.project_tasks, public.project_updates, public.project_files
from anon;
grant select, insert, update, delete on public.customer_users, public.projects,
  public.project_team, public.project_stages, public.project_tasks,
  public.project_updates, public.project_files to authenticated;

create policy customer_users_admin_all on public.customer_users
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy customer_users_read_self on public.customer_users
for select to authenticated
using (user_id = auth.uid());

create policy projects_read_authorized on public.projects
for select to authenticated
using (private.can_access_project(id));

create policy projects_admin_all on public.projects
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy project_team_read_project_members on public.project_team
for select to authenticated
using (private.is_admin() or user_id = auth.uid() or private.is_assigned_project_staff(project_id));

create policy project_team_admin_all on public.project_team
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy project_stages_read_authorized on public.project_stages
for select to authenticated
using (
  private.is_admin()
  or (private.is_assigned_project_staff(project_id))
  or (customer_visible and private.is_linked_project_customer(project_id))
);

create policy project_stages_admin_all on public.project_stages
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy project_tasks_read_authorized on public.project_tasks
for select to authenticated
using (
  private.is_admin()
  or private.is_assigned_project_staff(project_id)
  or (customer_visible and private.is_linked_project_customer(project_id))
);

create policy project_tasks_staff_insert on public.project_tasks
for insert to authenticated
with check (
  private.is_admin()
  or (
    private.is_assigned_project_staff(project_id)
    and created_by = auth.uid()
  )
);

create policy project_tasks_staff_update on public.project_tasks
for update to authenticated
using (private.is_admin() or (private.is_assigned_project_staff(project_id) and assigned_to = auth.uid()))
with check (private.is_admin() or (private.is_assigned_project_staff(project_id) and assigned_to = auth.uid()));

create policy project_tasks_admin_delete on public.project_tasks
for delete to authenticated
using (private.is_admin());

create policy project_updates_read_authorized on public.project_updates
for select to authenticated
using (
  private.is_admin()
  or private.is_assigned_project_staff(project_id)
  or (customer_visible and private.is_linked_project_customer(project_id))
);

create policy project_updates_staff_insert on public.project_updates
for insert to authenticated
with check (
  (private.is_admin() or private.is_assigned_project_staff(project_id))
  and author_id = auth.uid()
);

create policy project_updates_admin_update on public.project_updates
for update to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy project_updates_admin_delete on public.project_updates
for delete to authenticated
using (private.is_admin());

create policy project_files_read_authorized on public.project_files
for select to authenticated
using (
  private.is_admin()
  or private.is_assigned_project_staff(project_id)
  or (customer_visible and private.is_linked_project_customer(project_id))
);

create policy project_files_staff_insert on public.project_files
for insert to authenticated
with check (
  (private.is_admin() or private.is_assigned_project_staff(project_id))
  and uploaded_by = auth.uid()
);

create policy project_files_admin_update on public.project_files
for update to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy project_files_admin_delete on public.project_files
for delete to authenticated
using (private.is_admin());

-- Do not create a public bucket. Storage policies will be added only after
-- the project-file authorization and object-key convention are independently tested.

commit;
