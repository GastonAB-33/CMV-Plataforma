import type { SheetName } from '@/lib/sheets/types';

export const REQUIRED_SHEETS: SheetName[] = [
  'Usuarios',
  'Celulas',
  'Hermanos',
  'Procesos',
  'Observaciones',
  'Discipulado',
  'Eventos',
  'EventoParticipantes',
];

export const MIN_REQUIRED_COLUMNS: Record<SheetName, string[]> = {
  Usuarios: ['id', 'nombre', 'email', 'rol', 'activo', 'celulaId'],
  Celulas: ['id', 'nombre', 'liderId', 'activa'],
  Hermanos: ['id', 'nombres', 'apellidos', 'celulaId', 'estado', 'fechaIngreso'],
  Procesos: ['id', 'hermanoId', 'tipo', 'estado'],
  Observaciones: ['id', 'hermanoId', 'autorId', 'fecha', 'comentario'],
  Discipulado: ['id', 'hermanoId', 'discipuladorId', 'estado'],
  Eventos: ['id', 'titulo', 'tipo', 'celulaId', 'fecha', 'hora', 'creadorId'],
  EventoParticipantes: ['id', 'eventoId', 'hermanoId'],
};
