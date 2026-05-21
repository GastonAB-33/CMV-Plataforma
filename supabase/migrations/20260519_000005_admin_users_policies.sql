-- Stage 1.3: Policies for admin user management (APOSTOL / SUPERADMIN)

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    where lower(u.email) = lower(auth.jwt() ->> 'email')
      and u.activo = true
      and upper(u.rol) in ('APOSTOL', 'SUPERADMIN')
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

grant insert, update on table public.usuarios to authenticated;

drop policy if exists "auth_usuarios_select_self" on public.usuarios;
create policy "auth_usuarios_select_self_or_admin"
on public.usuarios
for select
to authenticated
using (
  (activo = true and lower(email) = lower(auth.jwt() ->> 'email'))
  or public.is_admin_user()
);

drop policy if exists "auth_usuarios_insert_admin" on public.usuarios;
create policy "auth_usuarios_insert_admin"
on public.usuarios
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "auth_usuarios_update_admin" on public.usuarios;
create policy "auth_usuarios_update_admin"
on public.usuarios
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

