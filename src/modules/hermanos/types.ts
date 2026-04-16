import { Cell, EDDIExamGrade, Proceso, Role } from '../../types';

export type BrotherId = string;
export type BrotherObservationAuthorRole = 'pastor' | 'lider' | 'discipulo';

export interface BrotherTimelineObservation {
  text: string;
  author: {
    name: string;
    role: BrotherObservationAuthorRole;
  };
  createdAt: string;
}

export interface BrotherLegacyObservation {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface BrotherAcompanamiento {
  acompananteName?: string;
  liderCelulaName?: string;
  pastorName?: string;
  apostolName?: string;
  celulaName: Cell;
}

export interface BrotherAltarStage {
  realizadoPor?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: BrotherTimelineObservation[];
}

export interface BrotherGrupoStage {
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: BrotherTimelineObservation[];
}

export interface BrotherExperienciaStage {
  fechaRealizacion?: string;
  observaciones?: BrotherTimelineObservation[];
}

export interface BrotherEDDIStage {
  fechaInicio?: string;
  fechaFin?: string;
  observaciones?: BrotherTimelineObservation[];
  notasExamenes?: EDDIExamGrade[];
}

export interface BrotherDiscipuloStage {
  fechaInicio?: string;
  observaciones?: BrotherTimelineObservation[];
}

export interface BrotherProfile {
  id: BrotherId;
  name: string;
  fotoUrl?: string;
  role: Role;
  procesoActual: Proceso;
  acompanamiento: BrotherAcompanamiento;
  altar?: BrotherAltarStage;
  grupo?: BrotherGrupoStage;
  experiencia?: BrotherExperienciaStage;
  eddi?: BrotherEDDIStage;
  discipulo?: BrotherDiscipuloStage;
  observations: BrotherLegacyObservation[];
  disciples?: string[];
}

export interface BrotherListItem {
  id: BrotherId;
  name: string;
  fotoUrl?: string;
  procesoActual: Proceso;
  cellName: Cell;
  acompananteName?: string;
}

export interface BrotherDataAudit {
  brotherId: BrotherId;
  missingFields: string[];
}

export interface BrotherPersistenceSnapshot {
  id: BrotherId;
  name: string;
  photoUrl: string | null;
  role: Role;
  currentProcess: Proceso;
  mentoring: {
    cellName: Cell;
    acompananteName: string | null;
    liderCelulaName: string | null;
    pastorName: string | null;
    apostolName: string | null;
  };
  stages: {
    altar: BrotherAltarStage | null;
    grupo: BrotherGrupoStage | null;
    experiencia: BrotherExperienciaStage | null;
    eddi: BrotherEDDIStage | null;
    discipulo: BrotherDiscipuloStage | null;
  };
  observations: BrotherLegacyObservation[];
  disciples: string[];
}

export interface BrothersRepository {
  list(): BrotherProfile[];
  findById(id: BrotherId): BrotherProfile | undefined;
  listCells(): Cell[];
}
