-- Stage 1.4: Enable authenticated access for remote functional testing
-- Scope:
-- - Keeps access limited to authenticated users (not anon)
-- - Grants read/write needed by current app modules
-- - Uses permissive RLS for testing phase
--
-- IMPORTANT:
-- Before production, replace these policies with role-based restrictions.

grant usage on schema public to authenticated;

grant select, insert, update on table public.usuarios to authenticated;
grant select, insert, update on table public.celulas to authenticated;
grant select, insert, update on table public.hermanos to authenticated;
grant select, insert, update on table public.procesos to authenticated;
grant select, insert, update on table public.observaciones to authenticated;
grant select, insert, update on table public.discipulado to authenticated;
grant select, insert, update on table public.eventos to authenticated;
grant select, insert, update on table public.evento_participantes to authenticated;
grant select, insert, update on table public.eddi_notas to authenticated;
grant select, insert, update on table public.publicaciones_change_log to authenticated;
grant select, insert, update on table public.ministerio_change_log to authenticated;
grant select, insert, update on table public.observaciones_servicio to authenticated;
grant select, insert, update on table public.adoracion_perfiles to authenticated;
grant select, insert, update on table public.adoracion_horarios to authenticated;
grant select, insert, update on table public.multimedia_perfiles to authenticated;
grant select, insert, update on table public.multimedia_horarios to authenticated;
grant select, insert, update on table public.multimedia_equipos to authenticated;
grant select, insert, update on table public.misericordia_perfiles to authenticated;
grant select, insert, update on table public.misericordia_horarios to authenticated;
grant select, insert, update on table public.misericordia_insumos to authenticated;
grant select, insert, update on table public.misericordia_mensajes_biblicos to authenticated;
grant select, insert, update on table public.import_batches to authenticated;
grant select, insert, update on table public.import_rows to authenticated;
grant select, insert on table public.audit_logs to authenticated;

alter table public.usuarios enable row level security;
alter table public.celulas enable row level security;
alter table public.hermanos enable row level security;
alter table public.procesos enable row level security;
alter table public.observaciones enable row level security;
alter table public.discipulado enable row level security;
alter table public.eventos enable row level security;
alter table public.evento_participantes enable row level security;
alter table public.eddi_notas enable row level security;
alter table public.publicaciones_change_log enable row level security;
alter table public.ministerio_change_log enable row level security;
alter table public.observaciones_servicio enable row level security;
alter table public.adoracion_perfiles enable row level security;
alter table public.adoracion_horarios enable row level security;
alter table public.multimedia_perfiles enable row level security;
alter table public.multimedia_horarios enable row level security;
alter table public.multimedia_equipos enable row level security;
alter table public.misericordia_perfiles enable row level security;
alter table public.misericordia_horarios enable row level security;
alter table public.misericordia_insumos enable row level security;
alter table public.misericordia_mensajes_biblicos enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_rows enable row level security;
alter table public.audit_logs enable row level security;

-- Generic authenticated policies (testing)
drop policy if exists "auth_all_select_usuarios" on public.usuarios;
create policy "auth_all_select_usuarios"
on public.usuarios for select to authenticated using (true);

drop policy if exists "auth_all_insert_usuarios" on public.usuarios;
create policy "auth_all_insert_usuarios"
on public.usuarios for insert to authenticated with check (true);

drop policy if exists "auth_all_update_usuarios" on public.usuarios;
create policy "auth_all_update_usuarios"
on public.usuarios for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_celulas" on public.celulas;
create policy "auth_all_select_celulas"
on public.celulas for select to authenticated using (true);
drop policy if exists "auth_all_insert_celulas" on public.celulas;
create policy "auth_all_insert_celulas"
on public.celulas for insert to authenticated with check (true);
drop policy if exists "auth_all_update_celulas" on public.celulas;
create policy "auth_all_update_celulas"
on public.celulas for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_hermanos" on public.hermanos;
create policy "auth_all_select_hermanos"
on public.hermanos for select to authenticated using (true);
drop policy if exists "auth_all_insert_hermanos" on public.hermanos;
create policy "auth_all_insert_hermanos"
on public.hermanos for insert to authenticated with check (true);
drop policy if exists "auth_all_update_hermanos" on public.hermanos;
create policy "auth_all_update_hermanos"
on public.hermanos for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_procesos" on public.procesos;
create policy "auth_all_select_procesos"
on public.procesos for select to authenticated using (true);
drop policy if exists "auth_all_insert_procesos" on public.procesos;
create policy "auth_all_insert_procesos"
on public.procesos for insert to authenticated with check (true);
drop policy if exists "auth_all_update_procesos" on public.procesos;
create policy "auth_all_update_procesos"
on public.procesos for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_observaciones" on public.observaciones;
create policy "auth_all_select_observaciones"
on public.observaciones for select to authenticated using (true);
drop policy if exists "auth_all_insert_observaciones" on public.observaciones;
create policy "auth_all_insert_observaciones"
on public.observaciones for insert to authenticated with check (true);
drop policy if exists "auth_all_update_observaciones" on public.observaciones;
create policy "auth_all_update_observaciones"
on public.observaciones for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_discipulado" on public.discipulado;
create policy "auth_all_select_discipulado"
on public.discipulado for select to authenticated using (true);
drop policy if exists "auth_all_insert_discipulado" on public.discipulado;
create policy "auth_all_insert_discipulado"
on public.discipulado for insert to authenticated with check (true);
drop policy if exists "auth_all_update_discipulado" on public.discipulado;
create policy "auth_all_update_discipulado"
on public.discipulado for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_eventos" on public.eventos;
create policy "auth_all_select_eventos"
on public.eventos for select to authenticated using (true);
drop policy if exists "auth_all_insert_eventos" on public.eventos;
create policy "auth_all_insert_eventos"
on public.eventos for insert to authenticated with check (true);
drop policy if exists "auth_all_update_eventos" on public.eventos;
create policy "auth_all_update_eventos"
on public.eventos for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_evento_participantes" on public.evento_participantes;
create policy "auth_all_select_evento_participantes"
on public.evento_participantes for select to authenticated using (true);
drop policy if exists "auth_all_insert_evento_participantes" on public.evento_participantes;
create policy "auth_all_insert_evento_participantes"
on public.evento_participantes for insert to authenticated with check (true);
drop policy if exists "auth_all_update_evento_participantes" on public.evento_participantes;
create policy "auth_all_update_evento_participantes"
on public.evento_participantes for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_eddi_notas" on public.eddi_notas;
create policy "auth_all_select_eddi_notas"
on public.eddi_notas for select to authenticated using (true);
drop policy if exists "auth_all_insert_eddi_notas" on public.eddi_notas;
create policy "auth_all_insert_eddi_notas"
on public.eddi_notas for insert to authenticated with check (true);
drop policy if exists "auth_all_update_eddi_notas" on public.eddi_notas;
create policy "auth_all_update_eddi_notas"
on public.eddi_notas for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_publicaciones_change_log" on public.publicaciones_change_log;
create policy "auth_all_select_publicaciones_change_log"
on public.publicaciones_change_log for select to authenticated using (true);
drop policy if exists "auth_all_insert_publicaciones_change_log" on public.publicaciones_change_log;
create policy "auth_all_insert_publicaciones_change_log"
on public.publicaciones_change_log for insert to authenticated with check (true);
drop policy if exists "auth_all_update_publicaciones_change_log" on public.publicaciones_change_log;
create policy "auth_all_update_publicaciones_change_log"
on public.publicaciones_change_log for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_ministerio_change_log" on public.ministerio_change_log;
create policy "auth_all_select_ministerio_change_log"
on public.ministerio_change_log for select to authenticated using (true);
drop policy if exists "auth_all_insert_ministerio_change_log" on public.ministerio_change_log;
create policy "auth_all_insert_ministerio_change_log"
on public.ministerio_change_log for insert to authenticated with check (true);
drop policy if exists "auth_all_update_ministerio_change_log" on public.ministerio_change_log;
create policy "auth_all_update_ministerio_change_log"
on public.ministerio_change_log for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_observaciones_servicio" on public.observaciones_servicio;
create policy "auth_all_select_observaciones_servicio"
on public.observaciones_servicio for select to authenticated using (true);
drop policy if exists "auth_all_insert_observaciones_servicio" on public.observaciones_servicio;
create policy "auth_all_insert_observaciones_servicio"
on public.observaciones_servicio for insert to authenticated with check (true);
drop policy if exists "auth_all_update_observaciones_servicio" on public.observaciones_servicio;
create policy "auth_all_update_observaciones_servicio"
on public.observaciones_servicio for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_adoracion_perfiles" on public.adoracion_perfiles;
create policy "auth_all_select_adoracion_perfiles"
on public.adoracion_perfiles for select to authenticated using (true);
drop policy if exists "auth_all_insert_adoracion_perfiles" on public.adoracion_perfiles;
create policy "auth_all_insert_adoracion_perfiles"
on public.adoracion_perfiles for insert to authenticated with check (true);
drop policy if exists "auth_all_update_adoracion_perfiles" on public.adoracion_perfiles;
create policy "auth_all_update_adoracion_perfiles"
on public.adoracion_perfiles for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_adoracion_horarios" on public.adoracion_horarios;
create policy "auth_all_select_adoracion_horarios"
on public.adoracion_horarios for select to authenticated using (true);
drop policy if exists "auth_all_insert_adoracion_horarios" on public.adoracion_horarios;
create policy "auth_all_insert_adoracion_horarios"
on public.adoracion_horarios for insert to authenticated with check (true);
drop policy if exists "auth_all_update_adoracion_horarios" on public.adoracion_horarios;
create policy "auth_all_update_adoracion_horarios"
on public.adoracion_horarios for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_multimedia_perfiles" on public.multimedia_perfiles;
create policy "auth_all_select_multimedia_perfiles"
on public.multimedia_perfiles for select to authenticated using (true);
drop policy if exists "auth_all_insert_multimedia_perfiles" on public.multimedia_perfiles;
create policy "auth_all_insert_multimedia_perfiles"
on public.multimedia_perfiles for insert to authenticated with check (true);
drop policy if exists "auth_all_update_multimedia_perfiles" on public.multimedia_perfiles;
create policy "auth_all_update_multimedia_perfiles"
on public.multimedia_perfiles for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_multimedia_horarios" on public.multimedia_horarios;
create policy "auth_all_select_multimedia_horarios"
on public.multimedia_horarios for select to authenticated using (true);
drop policy if exists "auth_all_insert_multimedia_horarios" on public.multimedia_horarios;
create policy "auth_all_insert_multimedia_horarios"
on public.multimedia_horarios for insert to authenticated with check (true);
drop policy if exists "auth_all_update_multimedia_horarios" on public.multimedia_horarios;
create policy "auth_all_update_multimedia_horarios"
on public.multimedia_horarios for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_multimedia_equipos" on public.multimedia_equipos;
create policy "auth_all_select_multimedia_equipos"
on public.multimedia_equipos for select to authenticated using (true);
drop policy if exists "auth_all_insert_multimedia_equipos" on public.multimedia_equipos;
create policy "auth_all_insert_multimedia_equipos"
on public.multimedia_equipos for insert to authenticated with check (true);
drop policy if exists "auth_all_update_multimedia_equipos" on public.multimedia_equipos;
create policy "auth_all_update_multimedia_equipos"
on public.multimedia_equipos for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_misericordia_perfiles" on public.misericordia_perfiles;
create policy "auth_all_select_misericordia_perfiles"
on public.misericordia_perfiles for select to authenticated using (true);
drop policy if exists "auth_all_insert_misericordia_perfiles" on public.misericordia_perfiles;
create policy "auth_all_insert_misericordia_perfiles"
on public.misericordia_perfiles for insert to authenticated with check (true);
drop policy if exists "auth_all_update_misericordia_perfiles" on public.misericordia_perfiles;
create policy "auth_all_update_misericordia_perfiles"
on public.misericordia_perfiles for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_misericordia_horarios" on public.misericordia_horarios;
create policy "auth_all_select_misericordia_horarios"
on public.misericordia_horarios for select to authenticated using (true);
drop policy if exists "auth_all_insert_misericordia_horarios" on public.misericordia_horarios;
create policy "auth_all_insert_misericordia_horarios"
on public.misericordia_horarios for insert to authenticated with check (true);
drop policy if exists "auth_all_update_misericordia_horarios" on public.misericordia_horarios;
create policy "auth_all_update_misericordia_horarios"
on public.misericordia_horarios for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_misericordia_insumos" on public.misericordia_insumos;
create policy "auth_all_select_misericordia_insumos"
on public.misericordia_insumos for select to authenticated using (true);
drop policy if exists "auth_all_insert_misericordia_insumos" on public.misericordia_insumos;
create policy "auth_all_insert_misericordia_insumos"
on public.misericordia_insumos for insert to authenticated with check (true);
drop policy if exists "auth_all_update_misericordia_insumos" on public.misericordia_insumos;
create policy "auth_all_update_misericordia_insumos"
on public.misericordia_insumos for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_misericordia_mensajes_biblicos" on public.misericordia_mensajes_biblicos;
create policy "auth_all_select_misericordia_mensajes_biblicos"
on public.misericordia_mensajes_biblicos for select to authenticated using (true);
drop policy if exists "auth_all_insert_misericordia_mensajes_biblicos" on public.misericordia_mensajes_biblicos;
create policy "auth_all_insert_misericordia_mensajes_biblicos"
on public.misericordia_mensajes_biblicos for insert to authenticated with check (true);
drop policy if exists "auth_all_update_misericordia_mensajes_biblicos" on public.misericordia_mensajes_biblicos;
create policy "auth_all_update_misericordia_mensajes_biblicos"
on public.misericordia_mensajes_biblicos for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_import_batches" on public.import_batches;
create policy "auth_all_select_import_batches"
on public.import_batches for select to authenticated using (true);
drop policy if exists "auth_all_insert_import_batches" on public.import_batches;
create policy "auth_all_insert_import_batches"
on public.import_batches for insert to authenticated with check (true);
drop policy if exists "auth_all_update_import_batches" on public.import_batches;
create policy "auth_all_update_import_batches"
on public.import_batches for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_import_rows" on public.import_rows;
create policy "auth_all_select_import_rows"
on public.import_rows for select to authenticated using (true);
drop policy if exists "auth_all_insert_import_rows" on public.import_rows;
create policy "auth_all_insert_import_rows"
on public.import_rows for insert to authenticated with check (true);
drop policy if exists "auth_all_update_import_rows" on public.import_rows;
create policy "auth_all_update_import_rows"
on public.import_rows for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_select_audit_logs" on public.audit_logs;
create policy "auth_all_select_audit_logs"
on public.audit_logs for select to authenticated using (true);
drop policy if exists "auth_all_insert_audit_logs" on public.audit_logs;
create policy "auth_all_insert_audit_logs"
on public.audit_logs for insert to authenticated with check (true);

