export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  celulaId?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Celula {
  id: string;
  nombre: string;
  liderId: string;
  descripcion?: string;
  activa: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Hermano {
  id: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  celulaId?: string;
  estado?: string;
  fechaIngreso?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface Proceso {
  id: string;
  hermanoId: string;
  tipo: string;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  notas?: string;
}

export interface Observacion {
  id: string;
  hermanoId: string;
  autorId?: string;
  fecha: string;
  detalle: string;
  comentario?: string;
  tipo?: string;
}

export interface Discipulado {
  id: string;
  hermanoId: string;
  discipuladorId?: string;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
  notas?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  tipo: 'grupal' | 'individual';
  celulaId?: string;
  fecha: string;
  hora?: string;
  creadorId?: string;
  descripcion?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface EventoParticipante {
  id: string;
  eventoId: string;
  hermanoId: string;
  estadoAsistencia?: string;
  observacion?: string;
}

export type SheetEntityMap = {
  Usuarios: Usuario;
  Celulas: Celula;
  Hermanos: Hermano;
  Procesos: Proceso;
  Observaciones: Observacion;
  Discipulado: Discipulado;
  Eventos: Evento;
  EventoParticipantes: EventoParticipante;
};

export type SheetName = keyof SheetEntityMap;
