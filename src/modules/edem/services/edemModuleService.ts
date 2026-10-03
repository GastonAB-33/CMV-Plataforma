import { Proceso } from '../../../types';
import { BrotherId } from '../../hermanos/types';
import { InMemoryEdemRepository } from '../repositories/inMemoryEdemRepository';
import {
  EDEMGeneralStatus,
  EDEMGradeEntry,
  EDEMGradeStatus,
  EDEMGradesByMateria,
  EDEMGradesByModulo,
  EDEMRepository,
  EDEMResolvedGradeEntry,
  EDEMSummary,
  EDEMTrackingProjection,
} from '../types';

const resolveGradeStatus = (grade: EDEMGradeEntry): EDEMGradeStatus => {
  if (grade.estado) {
    return grade.estado;
  }
  return grade.nota >= 7 ? 'APROBADO' : 'REPROBADO';
};

const toResolvedGrade = (grade: EDEMGradeEntry): EDEMResolvedGradeEntry => ({
  ...grade,
  resolvedStatus: resolveGradeStatus(grade),
});

const getGeneralStatus = (
  currentProcess: Proceso,
  hasStartDate: boolean,
  hasEndDate: boolean,
  totalGrades: number
): EDEMGeneralStatus => {
  if (hasEndDate) {
    return 'COMPLETADO';
  }

  if (currentProcess === Proceso.EDEM || hasStartDate || totalGrades > 0) {
    return 'EN_CURSO';
  }

  return 'SIN_INICIAR';
};

const getAverageGrade = (grades: EDEMResolvedGradeEntry[]): number | null => {
  if (grades.length === 0) {
    return null;
  }
  const sum = grades.reduce((accumulator, grade) => accumulator + grade.nota, 0);
  return Number((sum / grades.length).toFixed(2));
};

const groupByMateria = (grades: EDEMResolvedGradeEntry[]): EDEMGradesByMateria[] => {
  const buckets = new Map<string, EDEMResolvedGradeEntry[]>();

  for (const grade of grades) {
    const key = grade.materia || 'Sin materia';
    const current = buckets.get(key) ?? [];
    current.push(grade);
    buckets.set(key, current);
  }

  return Array.from(buckets.entries()).map(([materia, entries]) => ({
    materia,
    averageGrade: getAverageGrade(entries),
    grades: entries,
  }));
};

const groupByModulo = (grades: EDEMResolvedGradeEntry[]): EDEMGradesByModulo[] => {
  const buckets = new Map<string, EDEMResolvedGradeEntry[]>();

  for (const grade of grades) {
    const key = grade.modulo || 'Sin módulo';
    const current = buckets.get(key) ?? [];
    current.push(grade);
    buckets.set(key, current);
  }

  return Array.from(buckets.entries()).map(([modulo, entries]) => ({
    modulo,
    averageGrade: getAverageGrade(entries),
    grades: entries,
  }));
};

export class EdemModuleService {
  constructor(private readonly repository: EDEMRepository) {}

  listGradesByBrotherId(brotherId: BrotherId): EDEMResolvedGradeEntry[] {
    const snapshot = this.repository.findStageSnapshotByBrotherId(brotherId);
    if (!snapshot) {
      return [];
    }
    return snapshot.grades.map(toResolvedGrade);
  }

  getSummaryByBrotherId(brotherId: BrotherId): EDEMSummary {
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

  getGradesGroupedByMateria(brotherId: BrotherId): EDEMGradesByMateria[] {
    return groupByMateria(this.listGradesByBrotherId(brotherId));
  }

  getGradesGroupedByModulo(brotherId: BrotherId): EDEMGradesByModulo[] {
    return groupByModulo(this.listGradesByBrotherId(brotherId));
  }

  getBrotherEdemTracking(brotherId: BrotherId): EDEMTrackingProjection {
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

  async listGradesByBrotherIdAsync(brotherId: BrotherId): Promise<EDEMResolvedGradeEntry[]> {
    return this.listGradesByBrotherId(brotherId);
  }

  async getSummaryByBrotherIdAsync(brotherId: BrotherId): Promise<EDEMSummary> {
    return this.getSummaryByBrotherId(brotherId);
  }

  async getBrotherEdemTrackingAsync(brotherId: BrotherId): Promise<EDEMTrackingProjection> {
    return this.getBrotherEdemTracking(brotherId);
  }
}

const edemRepository = new InMemoryEdemRepository();

export const edemModuleService = new EdemModuleService(edemRepository);
