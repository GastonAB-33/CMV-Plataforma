import { EdemCohort, EdemSchoolRepository, EdemStudentProgress, EdemUpcomingClass } from '../types';

const COHORTS: EdemCohort[] = [
  {
    id: 'edem-cohort-2026-a',
    name: 'Cohorte Ministerial 2026 A',
    startDate: '2026-03-10',
    endDate: '2026-08-20',
    status: 'EN_CURSO',
    totalStudents: 16,
  },
  {
    id: 'edem-cohort-2026-b',
    name: 'Cohorte Ministerial 2026 B',
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    status: 'PLANIFICADO',
    totalStudents: 12,
  },
  {
    id: 'edem-cohort-2025-a',
    name: 'Cohorte Ministerial 2025',
    startDate: '2025-04-05',
    endDate: '2025-11-28',
    status: 'CERRADO',
    totalStudents: 14,
  },
];

const STUDENT_PROGRESS: EdemStudentProgress[] = [
  { id: 'edem-s-1', name: 'Marcos Benitez', cell: 'Vida', level: 'Modulo Pastoral 2', attendanceRate: 95, averageGrade: 9.2 },
  { id: 'edem-s-2', name: 'Claudia Morales', cell: 'Zaeta', level: 'Modulo Pastoral 2', attendanceRate: 98, averageGrade: 9.5 },
  { id: 'edem-s-3', name: 'Roberto Sanchez', cell: 'Sion', level: 'Modulo Pastoral 1', attendanceRate: 91, averageGrade: 8.7 },
  { id: 'edem-s-4', name: 'Miriam Gomez', cell: 'Nissi', level: 'Modulo Pastoral 1', attendanceRate: 94, averageGrade: 9.0 },
];

const UPCOMING_CLASSES: EdemUpcomingClass[] = [
  { id: 'edem-c-1', title: 'Homiletica y Predicacion Eficaz', date: '2026-04-25', hour: '19:30', teacher: 'Apostol Principal' },
  { id: 'edem-c-2', title: 'Teologia Pastoral y Cuidado del Rebano', date: '2026-05-02', hour: '20:00', teacher: 'Pastor Carlos' },
  { id: 'edem-c-3', title: 'Gobierno de la Iglesia y Cinco Ministerios', date: '2026-05-09', hour: '19:00', teacher: 'Apostol Principal' },
];

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }));

export class InMemoryEdemSchoolRepository implements EdemSchoolRepository {
  listCohorts(): EdemCohort[] {
    return clone(COHORTS);
  }

  listStudentProgress(): EdemStudentProgress[] {
    return clone(STUDENT_PROGRESS);
  }

  listUpcomingClasses(): EdemUpcomingClass[] {
    return clone(UPCOMING_CLASSES);
  }
}
