-- Enforce active customer/staff memberships and task assignment integrity.
begin;

create or replace function private.validate_project_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $membership$
declare
  profile_role text;
  profile_status text;
begin
  select p.role, p.status into profile_role, profile_status
  from public.profiles p
  where p.id = new.user_id;

  if tg_table_name = 'customer_users' then
    if profile_role is distinct from 'customer' or profile_status is distinct from 'active' then
      raise exception 'Customer links require an active customer profile';
    end if;
  elsif tg_table_name = 'project_team' then
    if profile_role is distinct from 'staff' or profile_status is distinct from 'active' then
      raise exception 'Project team members must be active staff';
    end if;
  end if;
  return new;
end;
$membership$;

create or replace function private.validate_project_task_stage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $task_integrity$
begin
  if new.stage_id is not null and not exists (
    select 1 from public.project_stages s
    where s.id = new.stage_id and s.project_id = new.project_id
  ) then
    raise exception 'Task stage must belong to the same project';
  end if;

  if new.assigned_to is not null and not exists (
    select 1
    from public.project_team pt
    join public.profiles p on p.id = pt.user_id
    where pt.project_id = new.project_id
      and pt.user_id = new.assigned_to
      and p.role = 'staff'
      and p.status = 'active'
  ) then
    raise exception 'Task assignee must be active staff assigned to this project';
  end if;
  return new;
end;
$task_integrity$;

create or replace function private.clear_project_tasks_after_team_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $team_cleanup$
begin
  update public.project_tasks
  set assigned_to = null, updated_at = now()
  where project_id = old.project_id and assigned_to = old.user_id;
  return old;
end;
$team_cleanup$;

revoke all on function private.validate_project_membership() from public, anon;
revoke all on function private.validate_project_task_stage() from public, anon;
revoke all on function private.clear_project_tasks_after_team_removal() from public, anon;

drop trigger if exists customer_users_validate_active_customer on public.customer_users;
create trigger customer_users_validate_active_customer
before insert or update of customer_id, user_id on public.customer_users
for each row execute function private.validate_project_membership();

drop trigger if exists project_team_validate_active_staff on public.project_team;
create trigger project_team_validate_active_staff
before insert or update of project_id, user_id on public.project_team
for each row execute function private.validate_project_membership();

drop trigger if exists project_tasks_validate_stage on public.project_tasks;
create trigger project_tasks_validate_stage
before insert or update of project_id, stage_id, assigned_to on public.project_tasks
for each row execute function private.validate_project_task_stage();

drop trigger if exists project_team_clear_task_assignments on public.project_team;
create trigger project_team_clear_task_assignments
after delete on public.project_team
for each row execute function private.clear_project_tasks_after_team_removal();

commit;
