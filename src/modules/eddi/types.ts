import { Proceso } from '../../types';
import { BrotherId } from '../hermanos/types';

export type EDDIGradeStatus = 'APROBADO' | 'REPROBADO' | 'EN_CURSO';
export type EDDIGeneralStatus = 'SIN_INICIAR' | 'EN_CURSO' | 'COMPLETADO';

export interface EDDIGradeEntry {
  id: string;
  brotherId: BrotherId;
  materia: string;
  modulo?: string;
  fecha?: string;
  nota: number;
  estado?: EDDIGradeStatus;
  observacion?: string;
}

export interface EDDIResolvedGradeEntry extends EDDIGradeEntry {
  resolvedStatus: EDDIGradeStatus;
}

export interface EDDIStageSnapshot {
  brotherId: BrotherId;
  currentProcess: Proceso;
  fechaInicio?: string;
  fechaFin?: string;
  grades: EDDIGradeEntry[];
}

export interface EDDISummary {
  totalGrades: number;
  approvedCount: number;
  failedCount: number;
  inProgressCount: number;
  averageGrade: number | null;
  generalStatus: EDDIGeneralStatus;
}

export interface EDDIGradesByMateria {
  materia: string;
  averageGrade: number | null;
  grades: EDDIResolvedGradeEntry[];
}

export interface EDDIGradesByModulo {
  modulo: string;
  averageGrade: number | null;
  grades: EDDIResolvedGradeEntry[];
}

export interface EDDITrackingProjection {
  brotherId: BrotherId;
  stageDates: {
    startDate?: string;
    endDate?: string;
  };
  grades: EDDIResolvedGradeEntry[];
  summary: EDDISummary;
  groupedByMateria: EDDIGradesByMateria[];
  groupedByModulo: EDDIGradesByModulo[];
}

export interface EDDIRepository {
  listStageSnapshots(): EDDIStageSnapshot[];
  findStageSnapshotByBrotherId(brotherId: BrotherId): EDDIStageSnapshot | undefined;
}
