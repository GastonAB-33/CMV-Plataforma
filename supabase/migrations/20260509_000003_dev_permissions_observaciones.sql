-- Stage 1.2: Development permissions for observaciones.
-- Keep restrictive policies for production hardening in a later stage.

grant select, insert on table public.observaciones to anon, authenticated;

alter table public.observaciones enable row level security;

drop policy if exists "dev_observaciones_select_all" on public.observaciones;
create policy "dev_observaciones_select_all"
on public.observaciones
for select
to anon, authenticated
using (true);

drop policy if exists "dev_observaciones_insert_all" on public.observaciones;
create policy "dev_observaciones_insert_all"
on public.observaciones
for insert
to anon, authenticated
with check (true);

