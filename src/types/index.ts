export enum Role {
  APOSTOL = 'APOSTOL',
  PASTOR = 'PASTOR',
  LIDER_CELULA = 'LIDER_CELULA',
  DISCIPULO = 'DISCIPULO',
  HERMANO_MAYOR = 'HERMANO_MAYOR',
  HERMANO_NUEVO = 'HERMANO_NUEVO'
}

export enum EventType {
  CELULA = 'Célula',
  RED = 'Red',
  JOVENES = 'Jóvenes'
}

export enum Proceso {
  ALTAR = 'Altar',
  GRUPO = 'Grupo',
  EXPERIENCIA = 'Experiencia',
  EDDI = 'EDDI',
  DISCIPULO = 'Discípulo'
}

export type Cell = 'Vida' | 'Nissi' | 'Zaeta' | 'Sion' | 'Maranata' | 'Alpha y Omega' | 'Red Apostólica';
export type ObservationAuthorRole = 'pastor' | 'lider' | 'discipulo';

export interface ProcessObservation {
  text: string;
  author: {
    name: string;
    role: ObservationAuthorRole;
  };
  createdAt: string;
}

export interface AltarStage {
  realizadoPor?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: ProcessObservation[];
}

export interface GrupoStage {
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: ProcessObservation[];
}

export interface ExperienciaStage {
  fechaRealizacion?: string;
  observaciones?: ProcessObservation[];
}

export interface EDDIExamGrade {
  id: string;
  materia: string;
  modulo?: string;
  fecha?: string;
  nota: number;
  estado?: 'APROBADO' | 'REPROBADO' | 'EN_CURSO';
  observacion?: string;
}

export interface EDDIStage {
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: ProcessObservation[];
  notasExamenes?: EDDIExamGrade[];
}

export interface DiscipuloStage {
  fechaInicio?: string;
  observaciones?: ProcessObservation[];
}

export interface Acompanamiento {
  acompananteName?: string;
  liderCelulaName?: string;
  pastorName?: string;
  apostolName?: string;
  celulaName: Cell;
}

export interface Observation {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Brother {
  id: string;
  name: string;
  fotoUrl?: string;
  role: Role;
  procesoActual: Proceso;
  acompanamiento: Acompanamiento;
  altar?: AltarStage;
  grupo?: GrupoStage;
  experiencia?: ExperienciaStage;
  eddi?: EDDIStage;
  discipulo?: DiscipuloStage;
  observations: Observation[];
  disciples?: string[];
}

export interface BrotherPhotoDraft {
  brotherId: string;
  file: File;
  previewUrl: string;
  source: 'camera' | 'gallery';
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  cell: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
}

