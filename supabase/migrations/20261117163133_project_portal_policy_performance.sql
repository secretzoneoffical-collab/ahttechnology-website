-- Performance and policy consolidation for the AHT project portal.
begin;

create index if not exists customer_users_created_by_idx on public.customer_users(created_by);
create index if not exists project_files_uploaded_by_idx on public.project_files(uploaded_by);
create index if not exists project_tasks_created_by_idx on public.project_tasks(created_by);
create index if not exists project_tasks_stage_idx on public.project_tasks(stage_id);
create index if not exists project_team_assigned_by_idx on public.project_team(assigned_by);
create index if not exists project_updates_author_idx on public.project_updates(author_id);
create index if not exists projects_created_by_idx on public.projects(created_by);

drop policy if exists customer_users_admin_all on public.customer_users;
drop policy if exists customer_users_read_self on public.customer_users;
create policy customer_users_read_self_or_admin on public.customer_users
for select to authenticated
using (private.is_admin() or user_id = (select auth.uid()));
create policy customer_users_admin_insert on public.customer_users
for insert to authenticated with check (private.is_admin());
create policy customer_users_admin_update on public.customer_users
for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy customer_users_admin_delete on public.customer_users
for delete to authenticated using (private.is_admin());

drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_insert on public.projects
for insert to authenticated with check (private.is_admin());
create policy projects_admin_update on public.projects
for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy projects_admin_delete on public.projects
for delete to authenticated using (private.is_admin());

drop policy if exists project_team_admin_all on public.project_team;
drop policy if exists project_team_read_project_members on public.project_team;
create policy project_team_read_project_members on public.project_team
for select to authenticated
using (private.is_admin() or user_id = (select auth.uid()) or private.is_assigned_project_staff(project_id));
create policy project_team_admin_insert on public.project_team
for insert to authenticated with check (private.is_admin());
create policy project_team_admin_update on public.project_team
for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy project_team_admin_delete on public.project_team
for delete to authenticated using (private.is_admin());

drop policy if exists project_stages_admin_all on public.project_stages;
create policy project_stages_admin_insert on public.project_stages
for insert to authenticated with check (private.is_admin());
create policy project_stages_admin_update on public.project_stages
for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy project_stages_admin_delete on public.project_stages
for delete to authenticated using (private.is_admin());

drop policy if exists project_tasks_staff_update on public.project_tasks;
create policy project_tasks_staff_update on public.project_tasks
for update to authenticated
using (private.is_admin() or (private.is_assigned_project_staff(project_id) and assigned_to = (select auth.uid())))
with check (private.is_admin() or (private.is_assigned_project_staff(project_id) and assigned_to = (select auth.uid())));

drop policy if exists project_updates_staff_insert on public.project_updates;
create policy project_updates_staff_insert on public.project_updates
for insert to authenticated
with check (
  (private.is_admin() or private.is_assigned_project_staff(project_id))
  and author_id = (select auth.uid())
  and customer_visible = false
);

drop policy if exists project_files_admin_insert on public.project_files;
create policy project_files_admin_insert on public.project_files
for insert to authenticated with check (private.is_admin() and uploaded_by = (select auth.uid()));

commit;
