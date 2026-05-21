-- Stage 1.6: Per-user special permissions (feature overrides)

create table if not exists public.user_feature_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on update cascade on delete cascade,
  feature text not null,
  permission text not null check (permission in ('view', 'edit', 'manage')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, feature)
);

create index if not exists idx_user_feature_permissions_user on public.user_feature_permissions(user_id);

drop trigger if exists trg_user_feature_permissions_updated_at on public.user_feature_permissions;
create trigger trg_user_feature_permissions_updated_at
before update on public.user_feature_permissions
for each row execute function public.set_updated_at();

grant select, insert, update, delete on table public.user_feature_permissions to authenticated;
alter table public.user_feature_permissions enable row level security;

drop policy if exists "auth_all_select_user_feature_permissions" on public.user_feature_permissions;
create policy "auth_all_select_user_feature_permissions"
on public.user_feature_permissions for select to authenticated using (true);

drop policy if exists "auth_all_insert_user_feature_permissions" on public.user_feature_permissions;
create policy "auth_all_insert_user_feature_permissions"
on public.user_feature_permissions for insert to authenticated with check (true);

drop policy if exists "auth_all_update_user_feature_permissions" on public.user_feature_permissions;
create policy "auth_all_update_user_feature_permissions"
on public.user_feature_permissions for update to authenticated using (true) with check (true);

drop policy if exists "auth_all_delete_user_feature_permissions" on public.user_feature_permissions;
create policy "auth_all_delete_user_feature_permissions"
on public.user_feature_permissions for delete to authenticated using (true);

