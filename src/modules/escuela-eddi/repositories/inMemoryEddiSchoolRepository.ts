import { EddiCohort, EddiSchoolRepository, EddiStudentProgress, EddiUpcomingClass } from '../types';

const COHORTS: EddiCohort[] = [
  {
    id: 'cohort-2026-a',
    name: 'Cohorte 2026 A',
    startDate: '2026-03-01',
    endDate: '2026-07-15',
    status: 'EN_CURSO',
    totalStudents: 24,
  },
  {
    id: 'cohort-2026-b',
    name: 'Cohorte 2026 B',
    startDate: '2026-08-05',
    endDate: '2026-12-10',
    status: 'PLANIFICADO',
    totalStudents: 18,
  },
  {
    id: 'cohort-2025-c',
    name: 'Cohorte 2025 C',
    startDate: '2025-08-02',
    endDate: '2025-12-05',
    status: 'CERRADO',
    totalStudents: 21,
  },
];

const STUDENT_PROGRESS: EddiStudentProgress[] = [
  { id: 's-1', name: 'Luis Rodriguez', cell: 'Zaeta', level: 'Modulo 2', attendanceRate: 93, averageGrade: 8.9 },
  { id: 's-2', name: 'Elena Fernandez', cell: 'Sion', level: 'Modulo 2', attendanceRate: 96, averageGrade: 9.1 },
  { id: 's-3', name: 'Javier Mendoza', cell: 'Maranata', level: 'Modulo 1', attendanceRate: 88, averageGrade: 7.8 },
  { id: 's-4', name: 'Sofia Lopez', cell: 'Alpha y Omega', level: 'Modulo 1', attendanceRate: 90, averageGrade: 8.2 },
];

const UPCOMING_CLASSES: EddiUpcomingClass[] = [
  { id: 'c-1', title: 'Doctrina basica', date: '2026-04-24', hour: '20:00', teacher: 'Pastor Carlos' },
  { id: 'c-2', title: 'Fundamentos pastorales', date: '2026-04-29', hour: '20:00', teacher: 'Pastora Ana' },
  { id: 'c-3', title: 'Liderazgo de servicio', date: '2026-05-03', hour: '19:30', teacher: 'Pastor Carlos' },
];

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }));

export class InMemoryEddiSchoolRepository implements EddiSchoolRepository {
  listCohorts(): EddiCohort[] {
    return clone(COHORTS);
  }

  listStudentProgress(): EddiStudentProgress[] {
    return clone(STUDENT_PROGRESS);
  }

  listUpcomingClasses(): EddiUpcomingClass[] {
    return clone(UPCOMING_CLASSES);
  }
}

