create or replace function public.contract_object_allowed(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (storage.foldername(object_name))[1] = auth.uid()::text
    or (storage.foldername(object_name))[1] in (
      select org_id::text
      from public.profiles
      where id = auth.uid()
        and org_id is not null
    );
$$;

revoke all on function public.contract_object_allowed(text) from public;
grant execute on function public.contract_object_allowed(text) to authenticated;

drop policy if exists "org members upload contracts" on storage.objects;
drop policy if exists "org members read own contract files" on storage.objects;
drop policy if exists "contract owners read files" on storage.objects;
drop policy if exists "contract owners upload files" on storage.objects;
drop policy if exists "contract owners update files" on storage.objects;
drop policy if exists "contract owners delete files" on storage.objects;

create policy "contract owners read files"
  on storage.objects for select
  using (
    bucket_id = 'contracts'
    and public.contract_object_allowed(name)
  );

create policy "contract owners upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'contracts'
    and public.contract_object_allowed(name)
  );

create policy "contract owners update files"
  on storage.objects for update
  using (
    bucket_id = 'contracts'
    and public.contract_object_allowed(name)
  )
  with check (
    bucket_id = 'contracts'
    and public.contract_object_allowed(name)
  );

create policy "contract owners delete files"
  on storage.objects for delete
  using (
    bucket_id = 'contracts'
    and public.contract_object_allowed(name)
  );
