# CMV Plataforma

Aplicacion interna para seguimiento de congregacion. El proyecto principal que hoy se puede ejecutar y compilar es el frontend en Vite + React + TypeScript. Tambien hay un backend liviano en `server/` para servir como proxy de observaciones hacia Apps Script.

## Estructura actual

- `src/`: frontend principal en Vite con React Router.
- `server/`: API Express sencilla para observaciones.
- `src/app/`, `src/lib/`, `next.config.ts`, `middleware.ts`: migracion a Next.js en progreso. Se conserva en el repo, pero hoy no forma parte del build principal.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Frontend

```bash
npm install
npm run dev
```

App local:

- `http://localhost:5173`

Build de produccion:

```bash
npm run build
```

## Backend opcional

```bash
cd server
npm install
npm run dev
```

O desde la raiz:

```bash
npm run dev:server
```

API local:

- `http://localhost:3001`

## Variables de entorno

Hoy el frontend Vite no requiere variables para arrancar. El archivo `.env.example` se mantiene como referencia para la migracion a Next.js y futuras integraciones con Google Sheets.

## Estado del repositorio

- El repo ya esta preparado para subirse a GitHub sin `node_modules`, `dist`, `.next` ni archivos `.zip`.
- Los archivos de exportacion local quedaron excluidos del control de versiones.
- La migracion a Next.js sigue presente como trabajo en progreso y no bloquea el build principal.
