-- Private project document storage and row-level access.
-- Apply only after migration history is reconciled and the project foundation migration is applied.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aht-project-files',
  'aht-project-files',
  false,
  15728640,
  array['application/pdf','image/jpeg','image/png','image/webp','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = excluded.allowed_mime_types;

create policy aht_project_files_read on storage.objects
for select to authenticated
using (
  bucket_id = 'aht-project-files'
  and case
    when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then (
      private.can_access_project(split_part(name, '/', 1)::uuid)
      and exists (
        select 1 from public.project_files f
        where f.storage_path = storage.objects.name
          and f.project_id = split_part(storage.objects.name, '/', 1)::uuid
          and (
            private.is_admin()
            or private.is_assigned_project_staff(f.project_id)
            or (f.customer_visible and private.is_linked_project_customer(f.project_id))
          )
      )
    )
    else false
  end
);

create policy aht_project_files_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'aht-project-files'
  and case
    when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then (
      private.can_access_project(split_part(name, '/', 1)::uuid)
      and (private.is_admin() or private.is_assigned_project_staff(split_part(name, '/', 1)::uuid))
    )
    else false
  end
);

create policy aht_project_files_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'aht-project-files'
  and private.is_admin()
);

commit;
