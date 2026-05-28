# CMV Plataforma Frontend Context

## Product purpose

CMV Plataforma is an internal congregational management system focused on pastoral follow-up, spiritual process tracking, ministry operations, events/news, and user/permission management.

The current production UI is a Vite + React + TypeScript SPA with React Router.

## Main app shell

- Authentication-based app with protected routes.
- Desktop layout:
  - Left sidebar navigation.
  - User profile control at bottom-left with logout.
- Mobile layout:
  - Bottom navigation for primary sections.
  - Secondary menu modal for additional modules and logout.
- Theme toggle supports light/dark mode.

## Current routes

- `/login`
- `/`
  - Dashboard
- `/hermanos`
  - Brother list
- `/hermanos/:id`
  - Brother full pastoral profile
- `/tracking`
  - Follow-up / process management
- `/events`
  - Events and news
- `/escuela-eddi`
  - EDDI school
- `/ministerio-adoracion`
- `/ministerio-multimedia`
- `/ministerio-misericordia`
- `/configuracion/usuarios`
  - User admin and permissions
- `/importador`
  - Bulk importer

## Core domain

### Brothers

Each brother profile includes:

- Full name
- Photo
- Current process
- Cell assignment
- Mentoring chain:
  - disciple / senior brother
  - cell leader
  - pastor
  - apostle
- Process timeline:
  - Altar
  - Grupo
  - Experiencia
  - EDDI
  - Discípulo
- Observations by process
- Service/ministry talents
- Birth date storage
- Derived current age for display

### Spiritual processes

The process pipeline is:

1. Altar
2. Grupo
3. Experiencia
4. EDDI
5. Discípulo

Each process can contain:

- Start date
- End date or realization date
- Observations
- Optional extra structured data

EDDI also includes grades and subjects.

Discípulo includes altar tracking of people mentored by that disciple.

## Main modules

### Dashboard

Purpose:

- Executive overview for the current logged-in user.
- Shows visible brothers, process distribution, agenda, critical alerts, and operational shortcuts.

Behavior:

- Data shown is filtered by role and cell visibility.
- Editing shortcuts depend on permissions.

### Hermanos

Brother list:

- Searchable list.
- Filter by spiritual stage.
- Responsive card/table presentation.
- “Nuevo hermano” modal supports manual creation.

Brother detail:

- Full pastoral profile.
- Large stage-based UI by process.
- Read/write observations.
- Photo handling.
- Service/ministry tags.
- Disciple-stage altar tracking modal.

### Seguimiento

Purpose:

- Operational process tracking across brothers.
- Follow-up progression and stage state visibility.

### Eventos / Noticias

Purpose:

- Internal event/news creation and visibility.
- Supports internal and public publication concepts.

### Escuela EDDI

Purpose:

- EDDI cohorts, teaching, grades, and visibility by responsible users.

### Ministry modules

- Adoración
- Multimedia
- Misericordia

These modules manage ministry-specific planning, assignments, schedules, talent tags, and operational workflows.

### Configuración de usuarios

Purpose:

- Manage users, roles, active state, and feature permissions.

Capabilities:

- Provision auth users in Supabase.
- Update role-based permissions.
- Add user-specific permission overrides.

### Importador

Purpose:

- Bulk import brother-related data with pre-validation before committing real records.

Current behavior:

- Accepts `.csv`, `.xls`, and `.xlsx`.
- Uses a downloadable static XLS template from `public/plantilla_importador_hermanos.xls`.
- Reads `.xlsx` through the `xlsx` package.
- Reads `.csv` and tab-delimited `.xls` as text imports.
- Lets the operator map incoming columns to target fields.

Current import target fields:

- `nombres`
- `apellidos`
- `telefono`
- `fecha_nacimiento`
- `celula`
- `estado_proceso`
- `fecha_ingreso`

Current required fields in bulk import:

- `nombres`
- `apellidos`
- `celula`

Optional but validated if present:

- `fecha_nacimiento`
  - expected date string
- `estado_proceso`
  - valid values:
    - Altar
    - Grupo
    - Experiencia
    - EDDI
    - Discípulo

## Authentication and permissions

Authentication is handled through Supabase auth.

The app resolves the signed-in email to an application user profile and then loads:

- role
- visible scope
- feature permissions
- user overrides

Roles currently modeled:

- SUPERADMIN
- APOSTOL
- PASTOR
- LIDER_RED_CELULAS
- LIDER_CELULA
- DISCIPULO
- HERMANO_MAYOR
- HERMANO_NUEVO

Permissions are feature-based and include levels such as:

- `none`
- `view`
- `edit`
- `manage`

Visible modules are filtered from the sidebar based on these permissions.

## Data sources

### Current frontend runtime

The Vite frontend can operate with:

- local in-memory/mock data
- Supabase-backed data when configured

### Supabase-backed services

Main service areas:

- congregation data
- users
- role permissions
- user permissions
- import batches and rows
- audit log

Important brother storage concepts in Supabase:

- `hermanos`
- `procesos`
- `observaciones`
- `celulas`

Recent direction:

- birth date is the source of truth for age display
- age should be computed in the app from stored birth date

## UI patterns worth preserving

- Quiet operational interface, not marketing-style.
- Rounded but dense cards and panels.
- Gold accent color as the primary signal.
- Strong uppercase micro-labels for metadata and sections.
- Mobile-first modal and card ergonomics.
- Dark/light support already baked into most pages.

## Known frontend-specific details

- The disciple altar modal has two modes:
  - list of mentored altar cases
  - summary view of a selected brother
- Summary view includes:
  - compact identity card
  - “Ver ficha completa” CTA
  - process history cards
- Modal stability matters because nested scrolling has caused visual flicker in Chromium-based browsers.

## Current technical stack

- React 19
- React Router 7
- TypeScript
- Vite 8
- Tailwind-based utility styling
- Lucide icons
- Supabase JS client
- `xlsx` for Excel parsing

## Backend split intention

Planned working model from here:

- This repository can continue focusing on backend/data behaviors and integration.
- Another system can continue or rebuild the frontend using this document as product/UI context.

If the frontend is rebuilt elsewhere, the new implementation should preserve:

- route structure and mental model
- role-based visibility
- brother process pipeline
- disciple altar tracking workflow
- ministry modules and user admin
- import workflow and template semantics
