-- Stage 1.5: Role-feature permission matrix persisted in Supabase

create table if not exists public.role_feature_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  feature text not null,
  permission text not null check (permission in ('none', 'view', 'edit', 'manage')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role, feature)
);

create index if not exists idx_role_feature_permissions_role on public.role_feature_permissions(role);
create index if not exists idx_role_feature_permissions_feature on public.role_feature_permissions(feature);

drop trigger if exists trg_role_feature_permissions_updated_at on public.role_feature_permissions;
create trigger trg_role_feature_permissions_updated_at
before update on public.role_feature_permissions
for each row execute function public.set_updated_at();

grant select, insert, update on table public.role_feature_permissions to authenticated;
alter table public.role_feature_permissions enable row level security;

drop policy if exists "auth_all_select_role_feature_permissions" on public.role_feature_permissions;
create policy "auth_all_select_role_feature_permissions"
on public.role_feature_permissions for select to authenticated using (true);

drop policy if exists "auth_all_insert_role_feature_permissions" on public.role_feature_permissions;
create policy "auth_all_insert_role_feature_permissions"
on public.role_feature_permissions for insert to authenticated with check (true);

drop policy if exists "auth_all_update_role_feature_permissions" on public.role_feature_permissions;
create policy "auth_all_update_role_feature_permissions"
on public.role_feature_permissions for update to authenticated using (true) with check (true);

