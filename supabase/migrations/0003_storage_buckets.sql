insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;
