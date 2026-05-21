-- Stage 1.1: Development permissions for browser access with anon key.
-- IMPORTANT:
-- - This is intentionally permissive for local/dev bootstrap.
-- - Tighten policies before production rollout.

grant usage on schema public to anon, authenticated;

grant select, insert, update on table public.celulas to anon, authenticated;
grant select, insert, update on table public.hermanos to anon, authenticated;
grant select on table public.procesos to anon, authenticated;
grant insert on table public.audit_logs to anon, authenticated;

alter table public.celulas enable row level security;
alter table public.hermanos enable row level security;
alter table public.procesos enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "dev_celulas_select_all" on public.celulas;
create policy "dev_celulas_select_all"
on public.celulas
for select
to anon, authenticated
using (true);

drop policy if exists "dev_celulas_insert_all" on public.celulas;
create policy "dev_celulas_insert_all"
on public.celulas
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev_celulas_update_all" on public.celulas;
create policy "dev_celulas_update_all"
on public.celulas
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev_hermanos_select_all" on public.hermanos;
create policy "dev_hermanos_select_all"
on public.hermanos
for select
to anon, authenticated
using (true);

drop policy if exists "dev_hermanos_insert_all" on public.hermanos;
create policy "dev_hermanos_insert_all"
on public.hermanos
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev_hermanos_update_all" on public.hermanos;
create policy "dev_hermanos_update_all"
on public.hermanos
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev_procesos_select_all" on public.procesos;
create policy "dev_procesos_select_all"
on public.procesos
for select
to anon, authenticated
using (true);

drop policy if exists "dev_audit_logs_insert_all" on public.audit_logs;
create policy "dev_audit_logs_insert_all"
on public.audit_logs
for insert
to anon, authenticated
with check (true);

