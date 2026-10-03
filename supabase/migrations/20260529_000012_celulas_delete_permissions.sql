grant delete on table public.celulas to anon, authenticated;

drop policy if exists "auth_all_delete_celulas" on public.celulas;
create policy "auth_all_delete_celulas"
on public.celulas for delete to anon, authenticated using (true);

with canonical as (
  select id
  from public.celulas
  where lower(nombre) = 'maranata'
  order by created_at asc
  limit 1
),
duplicates as (
  select id
  from public.celulas
  where lower(nombre) in ('maranatha', 'maranatha (unificada)', 'maranata (unificada)')
)
update public.hermanos
set celula_id = (select id from canonical)
where celula_id in (select id from duplicates)
  and exists (select 1 from canonical);

with canonical as (
  select id
  from public.celulas
  where lower(nombre) = 'sion'
  order by created_at asc
  limit 1
),
duplicates as (
  select id
  from public.celulas
  where lower(nombre) in ('zion', 'zion (unificada)', 'sion (unificada)')
)
update public.hermanos
set celula_id = (select id from canonical)
where celula_id in (select id from duplicates)
  and exists (select 1 from canonical);

with canonical as (
  select id
  from public.celulas
  where lower(nombre) = 'saeta'
  order by created_at asc
  limit 1
),
duplicates as (
  select id
  from public.celulas
  where lower(nombre) in ('saetas', 'saetas (unificada)', 'saeta (unificada)')
)
update public.hermanos
set celula_id = (select id from canonical)
where celula_id in (select id from duplicates)
  and exists (select 1 from canonical);

delete from public.celulas
where lower(nombre) in (
  'maranatha',
  'maranatha (unificada)',
  'maranata (unificada)',
  'zion',
  'zion (unificada)',
  'sion (unificada)',
  'saetas',
  'saetas (unificada)',
  'saeta (unificada)'
);
