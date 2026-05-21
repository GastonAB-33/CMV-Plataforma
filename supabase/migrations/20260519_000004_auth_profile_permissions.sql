-- Stage 1.2: Auth profile permissions for app login with Supabase Auth.
-- Allows authenticated users to read only their active profile from public.usuarios.

grant select on table public.usuarios to authenticated;

alter table public.usuarios enable row level security;

drop policy if exists "auth_usuarios_select_self" on public.usuarios;
create policy "auth_usuarios_select_self"
on public.usuarios
for select
to authenticated
using (
  activo = true
  and lower(email) = lower(auth.jwt() ->> 'email')
);

