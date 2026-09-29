import { Proceso } from '../../types';
import { BrotherId } from '../hermanos/types';

export type EDEMGradeStatus = 'APROBADO' | 'REPROBADO' | 'EN_CURSO';
export type EDEMGeneralStatus = 'SIN_INICIAR' | 'EN_CURSO' | 'COMPLETADO';

export interface EDEMGradeEntry {
  id: string;
  brotherId: BrotherId;
  materia: string;
  modulo?: string;
  fecha?: string;
  nota: number;
  estado?: EDEMGradeStatus;
  observacion?: string;
}

export interface EDEMResolvedGradeEntry extends EDEMGradeEntry {
  resolvedStatus: EDEMGradeStatus;
}

export interface EDEMStageSnapshot {
  brotherId: BrotherId;
  currentProcess: Proceso;
  fechaInicio?: string;
  fechaFin?: string;
  grades: EDEMGradeEntry[];
}

export interface EDEMSummary {
  totalGrades: number;
  approvedCount: number;
  failedCount: number;
  inProgressCount: number;
  averageGrade: number | null;
  generalStatus: EDEMGeneralStatus;
}

export interface EDEMGradesByMateria {
  materia: string;
  averageGrade: number | null;
  grades: EDEMResolvedGradeEntry[];
}

export interface EDEMGradesByModulo {
  modulo: string;
  averageGrade: number | null;
  grades: EDEMResolvedGradeEntry[];
}

export interface EDEMTrackingProjection {
  brotherId: BrotherId;
  stageDates: {
    startDate?: string;
    endDate?: string;
  };
  grades: EDEMResolvedGradeEntry[];
  summary: EDEMSummary;
  groupedByMateria: EDEMGradesByMateria[];
  groupedByModulo: EDEMGradesByModulo[];
}

export interface EDEMRepository {
  listStageSnapshots(): EDEMStageSnapshot[];
  findStageSnapshotByBrotherId(brotherId: BrotherId): EDEMStageSnapshot | undefined;
}
