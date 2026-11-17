-- Storage object writes are administrator-only until staff upload workflow is implemented.
begin;
drop policy if exists aht_project_files_insert on storage.objects;
create policy aht_project_files_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'aht-project-files'
  and case
    when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then private.can_access_project(split_part(name, '/', 1)::uuid) and private.is_admin()
    else false
  end
);
commit;
