grant delete on table public.observaciones to authenticated;

drop policy if exists "auth_all_delete_observaciones" on public.observaciones;
create policy "auth_all_delete_observaciones"
on public.observaciones for delete to authenticated using (true);
