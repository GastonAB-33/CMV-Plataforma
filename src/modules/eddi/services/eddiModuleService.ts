import { Proceso } from '../../../types';
import { BrotherId } from '../../hermanos/types';
import { InMemoryEddiRepository } from '../repositories/inMemoryEddiRepository';
import {
  EDDIGeneralStatus,
  EDDIGradeEntry,
  EDDIGradeStatus,
  EDDIGradesByMateria,
  EDDIGradesByModulo,
  EDDIRepository,
  EDDIResolvedGradeEntry,
  EDDISummary,
  EDDITrackingProjection,
} from '../types';

const resolveGradeStatus = (grade: EDDIGradeEntry): EDDIGradeStatus => {
  if (grade.estado) {
    return grade.estado;
  }
  return grade.nota >= 7 ? 'APROBADO' : 'REPROBADO';
};

const toResolvedGrade = (grade: EDDIGradeEntry): EDDIResolvedGradeEntry => ({
  ...grade,
  resolvedStatus: resolveGradeStatus(grade),
});

const getGeneralStatus = (
  currentProcess: Proceso,
  hasStartDate: boolean,
  hasEndDate: boolean,
  totalGrades: number
): EDDIGeneralStatus => {
  if (currentProcess === Proceso.DISCIPULO || hasEndDate) {
    return 'COMPLETADO';
  }

  if (currentProcess === Proceso.EDDI || hasStartDate || totalGrades > 0) {
    return 'EN_CURSO';
  }

  return 'SIN_INICIAR';
};

const getAverageGrade = (grades: EDDIResolvedGradeEntry[]): number | null => {
  if (grades.length === 0) {
    return null;
  }
  const sum = grades.reduce((accumulator, grade) => accumulator + grade.nota, 0);
  return Number((sum / grades.length).toFixed(2));
};

const groupByMateria = (grades: EDDIResolvedGradeEntry[]): EDDIGradesByMateria[] => {
  const buckets = new Map<string, EDDIResolvedGradeEntry[]>();

  for (const grade of grades) {
    const key = grade.materia || 'Sin materia';
    const current = buckets.get(key) ?? [];
    current.push(grade);
    buckets.set(key, current);
  }

  return Array.from(buckets.entries()).map(([materia, materiaGrades]) => ({
    materia,
    averageGrade: getAverageGrade(materiaGrades),
    grades: materiaGrades.map((entry) => ({ ...entry })),
  }));
};

const groupByModulo = (grades: EDDIResolvedGradeEntry[]): EDDIGradesByModulo[] => {
  const buckets = new Map<string, EDDIResolvedGradeEntry[]>();

  for (const grade of grades) {
    const key = grade.modulo || 'Sin modulo';
    const current = buckets.get(key) ?? [];
    current.push(grade);
    buckets.set(key, current);
  }

  return Array.from(buckets.entries()).map(([modulo, moduloGrades]) => ({
    modulo,
    averageGrade: getAverageGrade(moduloGrades),
    grades: moduloGrades.map((entry) => ({ ...entry })),
  }));
};

export class EddiModuleService {
  constructor(private readonly repository: EDDIRepository) {}

  listGradesByBrotherId(brotherId: BrotherId): EDDIResolvedGradeEntry[] {
    const snapshot = this.repository.findStageSnapshotByBrotherId(brotherId);
    if (!snapshot) {
      return [];
    }
    return snapshot.grades.map(toResolvedGrade);
  }

  getSummaryByBrotherId(brotherId: BrotherId): EDDISummary {
    const snapshot = this.repository.findStageSnapshotByBrotherId(brotherId);
    const grades = snapshot ? snapshot.grades.map(toResolvedGrade) : [];

    const approvedCount = grades.filter((grade) => grade.resolvedStatus === 'APROBADO').length;
    const failedCount = grades.filter((grade) => grade.resolvedStatus === 'REPROBADO').length;
    const inProgressCount = grades.filter((grade) => grade.resolvedStatus === 'EN_CURSO').length;
    const averageGrade = getAverageGrade(grades);

    return {
      totalGrades: grades.length,
      approvedCount,
      failedCount,
      inProgressCount,
      averageGrade,
      generalStatus: getGeneralStatus(
        snapshot?.currentProcess ?? Proceso.ALTAR,
        Boolean(snapshot?.fechaInicio),
        Boolean(snapshot?.fechaFin),
        grades.length
      ),
    };
  }

  getGradesGroupedByMateria(brotherId: BrotherId): EDDIGradesByMateria[] {
    return groupByMateria(this.listGradesByBrotherId(brotherId));
  }

  getGradesGroupedByModulo(brotherId: BrotherId): EDDIGradesByModulo[] {
    return groupByModulo(this.listGradesByBrotherId(brotherId));
  }

  getBrotherEddiTracking(brotherId: BrotherId): EDDITrackingProjection {
    const snapshot = this.repository.findStageSnapshotByBrotherId(brotherId);
    const grades = snapshot ? snapshot.grades.map(toResolvedGrade) : [];

    return {
      brotherId,
      stageDates: {
        startDate: snapshot?.fechaInicio,
        endDate: snapshot?.fechaFin,
      },
      grades: grades.map((grade) => ({ ...grade })),
      summary: this.getSummaryByBrotherId(brotherId),
      groupedByMateria: groupByMateria(grades),
      groupedByModulo: groupByModulo(grades),
    };
  }

  async listGradesByBrotherIdAsync(brotherId: BrotherId): Promise<EDDIResolvedGradeEntry[]> {
    return this.listGradesByBrotherId(brotherId);
  }

  async getSummaryByBrotherIdAsync(brotherId: BrotherId): Promise<EDDISummary> {
    return this.getSummaryByBrotherId(brotherId);
  }

  async getBrotherEddiTrackingAsync(brotherId: BrotherId): Promise<EDDITrackingProjection> {
    return this.getBrotherEddiTracking(brotherId);
  }
}

const eddiRepository = new InMemoryEddiRepository();

export const eddiModuleService = new EddiModuleService(eddiRepository);
