-- Stage 1: Supabase base schema for CMV Plataforma
-- Includes:
-- 1) Core congregational data
-- 2) Change audit table
-- 3) Bulk import tables
-- 4) Ministry operational tables currently stored in localStorage

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  rol text not null,
  activo boolean not null default true,
  celula_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.celulas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  lider_id uuid null,
  descripcion text null,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_usuarios_celula'
  ) then
    alter table public.usuarios
      add constraint fk_usuarios_celula
      foreign key (celula_id)
      references public.celulas(id)
      on update cascade
      on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_celulas_lider'
  ) then
    alter table public.celulas
      add constraint fk_celulas_lider
      foreign key (lider_id)
      references public.usuarios(id)
      on update cascade
      on delete set null;
  end if;
end
$$;

create table if not exists public.hermanos (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  telefono text null,
  direccion text null,
  celula_id uuid null references public.celulas(id) on update cascade on delete set null,
  estado text null,
  fecha_ingreso date null,
  foto_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procesos (
  id uuid primary key default gen_random_uuid(),
  hermano_id uuid not null references public.hermanos(id) on update cascade on delete cascade,
  tipo text not null,
  estado text not null,
  fecha_inicio date null,
  fecha_fin date null,
  notas text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.observaciones (
  id uuid primary key default gen_random_uuid(),
  hermano_id uuid not null references public.hermanos(id) on update cascade on delete cascade,
  autor_id uuid null references public.usuarios(id) on update cascade on delete set null,
  fecha timestamptz not null default now(),
  detalle text null,
  comentario text not null,
  tipo text null,
  proceso text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discipulado (
  id uuid primary key default gen_random_uuid(),
  hermano_id uuid not null references public.hermanos(id) on update cascade on delete cascade,
  discipulador_id uuid null references public.usuarios(id) on update cascade on delete set null,
  estado text not null,
  fecha_inicio date null,
  fecha_fin date null,
  notas text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  tipo_contenido text not null check (tipo_contenido in ('evento', 'noticia')),
  titulo text not null,
  tipo_evento text null check (tipo_evento in ('grupal', 'individual')),
  celula_id uuid null references public.celulas(id) on update cascade on delete set null,
  fecha_realizacion date null,
  hora_realizacion time null,
  descripcion text null,
  canal_publicacion text not null check (canal_publicacion in ('interna', 'publica')),
  estado_publicacion text not null check (estado_publicacion in ('borrador', 'publicado', 'archivado')),
  publicado_en_interna timestamptz null,
  publicado_en_publica timestamptz null,
  sync_publica_estado text null check (sync_publica_estado in ('no_aplica', 'pendiente', 'sincronizado', 'error')),
  sync_publica_error text null,
  noticia_fecha date null,
  noticia_texto text null,
  noticia_imagen text null,
  noticia_badge text null,
  noticia_link text null,
  creador_id uuid null references public.usuarios(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evento_participantes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on update cascade on delete cascade,
  hermano_id uuid not null references public.hermanos(id) on update cascade on delete cascade,
  estado_asistencia text null,
  observacion text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evento_id, hermano_id)
);

create table if not exists public.eddi_notas (
  id uuid primary key default gen_random_uuid(),
  hermano_id uuid not null references public.hermanos(id) on update cascade on delete cascade,
  materia text not null,
  modulo text null,
  fecha date null,
  nota numeric(5,2) not null,
  estado text null check (estado in ('APROBADO', 'REPROBADO', 'EN_CURSO')),
  observacion text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publicaciones_change_log (
  id uuid primary key default gen_random_uuid(),
  cambio text not null,
  responsable text not null,
  detalles text null,
  created_at timestamptz not null default now()
);

create table if not exists public.ministerio_change_log (
  id uuid primary key default gen_random_uuid(),
  modulo text not null check (modulo in ('adoracion', 'multimedia', 'misericordia')),
  cambio text not null,
  responsable text not null,
  detalles text null,
  created_at timestamptz not null default now()
);

create table if not exists public.observaciones_servicio (
  id uuid primary key default gen_random_uuid(),
  hermano_id uuid not null references public.hermanos(id) on update cascade on delete cascade,
  texto text not null,
  autor text not null,
  autor_rol text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.adoracion_perfiles (
  hermano_id uuid primary key references public.hermanos(id) on update cascade on delete cascade,
  tags text[] not null default '{}',
  activo_en_ministerio boolean not null default false,
  updated_by_user_id uuid null references public.usuarios(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.adoracion_horarios (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora time not null,
  ubicacion text null,
  estado text null check (estado in ('PROGRAMADO', 'REALIZADO')),
  cantantes text[] not null default '{}',
  guitarristas text[] not null default '{}',
  bajistas text[] not null default '{}',
  pianistas text[] not null default '{}',
  bateristas text[] not null default '{}',
  setlist_song_ids text[] not null default '{}',
  source text not null check (source in ('base', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.multimedia_perfiles (
  hermano_id uuid primary key references public.hermanos(id) on update cascade on delete cascade,
  tags text[] not null default '{}',
  activo_en_ministerio boolean not null default false,
  updated_by_user_id uuid null references public.usuarios(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.multimedia_horarios (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora time not null,
  ubicacion text null,
  estado text null check (estado in ('PROGRAMADO', 'REALIZADO')),
  proyeccion text[] not null default '{}',
  luces text[] not null default '{}',
  sonido text[] not null default '{}',
  transmision text[] not null default '{}',
  source text not null check (source in ('base', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.multimedia_equipos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  observacion text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.misericordia_perfiles (
  hermano_id uuid primary key references public.hermanos(id) on update cascade on delete cascade,
  tags text[] not null default '{}',
  activo_en_ministerio boolean not null default false,
  updated_by_user_id uuid null references public.usuarios(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.misericordia_horarios (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora time not null,
  ubicacion text null,
  estado text null check (estado in ('PROGRAMADO', 'REALIZADO')),
  cocina text[] not null default '{}',
  preparacion text[] not null default '{}',
  reparto text[] not null default '{}',
  evangelismo text[] not null default '{}',
  comida text null,
  zona text null,
  calles_zona text[] not null default '{}',
  mensaje text null,
  message_ids text[] not null default '{}',
  source text not null check (source in ('base', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.misericordia_insumos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cantidad numeric(10,2) not null,
  unidad text not null check (unidad in ('UNIDAD', 'KG')),
  tipo_movimiento text not null check (tipo_movimiento in ('NUEVO', 'UTILIZADO')),
  comida text null,
  observacion text null,
  created_at timestamptz not null default now()
);

create table if not exists public.misericordia_mensajes_biblicos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  referencia_versiculo text not null,
  texto_versiculo text not null,
  nota text null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null references public.usuarios(id) on update cascade on delete set null,
  actor_email text null,
  actor_nombre text null,
  modulo text not null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_data jsonb null,
  after_data jsonb null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  modulo text not null,
  source_type text not null check (source_type in ('excel', 'google_sheets', 'csv')),
  source_name text not null,
  uploaded_by_user_id uuid null references public.usuarios(id) on update cascade on delete set null,
  status text not null check (status in ('uploaded', 'mapping', 'validated', 'confirmed', 'processed', 'failed')),
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  processed_rows integer not null default 0,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches(id) on update cascade on delete cascade,
  row_number integer not null,
  raw_data jsonb not null,
  mapped_data jsonb null,
  action text null check (action in ('create', 'update', 'skip')),
  validation_status text not null check (validation_status in ('pending', 'valid', 'invalid')) default 'pending',
  validation_errors text[] not null default '{}',
  target_entity text null,
  target_entity_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, row_number)
);

create index if not exists idx_hermanos_celula_id on public.hermanos(celula_id);
create index if not exists idx_procesos_hermano_id on public.procesos(hermano_id);
create index if not exists idx_observaciones_hermano_id on public.observaciones(hermano_id);
create index if not exists idx_observaciones_autor_id on public.observaciones(autor_id);
create index if not exists idx_eventos_tipo_contenido on public.eventos(tipo_contenido);
create index if not exists idx_eventos_fecha_realizacion on public.eventos(fecha_realizacion);
create index if not exists idx_evento_participantes_evento_id on public.evento_participantes(evento_id);
create index if not exists idx_evento_participantes_hermano_id on public.evento_participantes(hermano_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_import_batches_status on public.import_batches(status);
create index if not exists idx_import_rows_batch_id on public.import_rows(batch_id);
create index if not exists idx_import_rows_validation on public.import_rows(validation_status);

drop trigger if exists trg_usuarios_updated_at on public.usuarios;
create trigger trg_usuarios_updated_at
before update on public.usuarios
for each row execute function public.set_updated_at();

drop trigger if exists trg_celulas_updated_at on public.celulas;
create trigger trg_celulas_updated_at
before update on public.celulas
for each row execute function public.set_updated_at();

drop trigger if exists trg_hermanos_updated_at on public.hermanos;
create trigger trg_hermanos_updated_at
before update on public.hermanos
for each row execute function public.set_updated_at();

drop trigger if exists trg_procesos_updated_at on public.procesos;
create trigger trg_procesos_updated_at
before update on public.procesos
for each row execute function public.set_updated_at();

drop trigger if exists trg_observaciones_updated_at on public.observaciones;
create trigger trg_observaciones_updated_at
before update on public.observaciones
for each row execute function public.set_updated_at();

drop trigger if exists trg_discipulado_updated_at on public.discipulado;
create trigger trg_discipulado_updated_at
before update on public.discipulado
for each row execute function public.set_updated_at();

drop trigger if exists trg_eventos_updated_at on public.eventos;
create trigger trg_eventos_updated_at
before update on public.eventos
for each row execute function public.set_updated_at();

drop trigger if exists trg_evento_participantes_updated_at on public.evento_participantes;
create trigger trg_evento_participantes_updated_at
before update on public.evento_participantes
for each row execute function public.set_updated_at();

drop trigger if exists trg_eddi_notas_updated_at on public.eddi_notas;
create trigger trg_eddi_notas_updated_at
before update on public.eddi_notas
for each row execute function public.set_updated_at();

drop trigger if exists trg_adoracion_perfiles_updated_at on public.adoracion_perfiles;
create trigger trg_adoracion_perfiles_updated_at
before update on public.adoracion_perfiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_adoracion_horarios_updated_at on public.adoracion_horarios;
create trigger trg_adoracion_horarios_updated_at
before update on public.adoracion_horarios
for each row execute function public.set_updated_at();

drop trigger if exists trg_multimedia_perfiles_updated_at on public.multimedia_perfiles;
create trigger trg_multimedia_perfiles_updated_at
before update on public.multimedia_perfiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_multimedia_horarios_updated_at on public.multimedia_horarios;
create trigger trg_multimedia_horarios_updated_at
before update on public.multimedia_horarios
for each row execute function public.set_updated_at();

drop trigger if exists trg_multimedia_equipos_updated_at on public.multimedia_equipos;
create trigger trg_multimedia_equipos_updated_at
before update on public.multimedia_equipos
for each row execute function public.set_updated_at();

drop trigger if exists trg_misericordia_perfiles_updated_at on public.misericordia_perfiles;
create trigger trg_misericordia_perfiles_updated_at
before update on public.misericordia_perfiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_misericordia_horarios_updated_at on public.misericordia_horarios;
create trigger trg_misericordia_horarios_updated_at
before update on public.misericordia_horarios
for each row execute function public.set_updated_at();

drop trigger if exists trg_import_batches_updated_at on public.import_batches;
create trigger trg_import_batches_updated_at
before update on public.import_batches
for each row execute function public.set_updated_at();

drop trigger if exists trg_import_rows_updated_at on public.import_rows;
create trigger trg_import_rows_updated_at
before update on public.import_rows
for each row execute function public.set_updated_at();
