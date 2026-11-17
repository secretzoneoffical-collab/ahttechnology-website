-- Restrict staff task updates to status/completion fields only.
begin;

create or replace function private.guard_project_task_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $task_guard$
begin
  if not private.is_admin() and (
    new.id is distinct from old.id
    or new.project_id is distinct from old.project_id
    or new.stage_id is distinct from old.stage_id
    or new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.priority is distinct from old.priority
    or new.assigned_to is distinct from old.assigned_to
    or new.due_date is distinct from old.due_date
    or new.customer_visible is distinct from old.customer_visible
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Staff may only update task status and completion fields';
  end if;

  if new.status = 'done' then
    new.completed_at := coalesce(new.completed_at, now());
  else
    new.completed_at := null;
  end if;
  return new;
end;
$task_guard$;

revoke all on function private.guard_project_task_update() from public, anon;

commit;
